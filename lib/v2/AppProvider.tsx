"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode
} from "react";
import { validateV2Database } from "./db-validator";
import { cloneSafeInitialDatabase } from "./safe-initial-database";
import { privateLessonPrice } from "./selectors";
import {
  markAllNotificationsRead,
  markNotificationRead,
  notifyManagement,
  notifyParentStudentLinks,
  notifyTeacher,
  notifyUsers
} from "@/lib/services/notification-service";
import { mediaAudienceUserIds } from "@/lib/services/media-service";
import type { MediaItem } from "@/lib/media/media-types";
import type {
  V2AuditEntry,
  V2Credential,
  V2Database,
  V2FeatureFlags,
  V2PermissionKey,
  V2PrivateLessonDuration,
  V2PrivateLessonRequest,
  V2Product,
  V2Role,
  V2Session,
  V2User
} from "./types";

const DB_STORAGE_KEY = "lk-v2-database";
const SESSION_STORAGE_KEY = "lk-v2-session";

type V2State = {
  db: V2Database;
  session: V2Session | null;
  bootSource: "safe" | "local";
  syncStatus: "ready" | "synced" | "recovered";
  validationWarnings: string[];
};

type V2Action =
  | { type: "replace_db"; db: V2Database; warnings?: string[]; syncStatus?: V2State["syncStatus"] }
  | { type: "login"; userId: string }
  | { type: "logout" }
  | { type: "audit"; entry: V2AuditEntry }
  | { type: "upsert_user"; user: V2User; credential?: V2Credential; actor: V2User }
  | { type: "update_user_permissions"; userId: string; permissions: Partial<Record<V2PermissionKey, boolean>>; actor: V2User }
  | { type: "update_credential"; userId: string; phone: string; password: string; actor: V2User }
  | { type: "update_text"; key: string; value: string; actor: V2User }
  | { type: "update_flags"; flags: Partial<V2FeatureFlags>; actor: V2User }
  | { type: "mark_notification_read"; notificationId: string; userId: string }
  | { type: "mark_all_notifications_read"; userId: string }
  | { type: "shop_order_created"; actor: V2User; productId: string }
  | { type: "shop_order_paid"; actor: V2User; productId: string }
  | { type: "task_assigned"; actor: V2User; groupId: string; taskTitle: string }
  | { type: "media_saved"; actor: V2User; item: MediaItem }
  | { type: "media_updated"; actor: V2User; item: MediaItem }
  | { type: "media_archived"; actor: V2User; mediaId: string }
  | { type: "upsert_product"; actor: V2User; product: V2Product }
  | { type: "archive_product"; actor: V2User; productId: string }
  | {
      type: "request_private_lesson";
      actor: V2User;
      studentId: string;
      teacherId: string;
      duration: V2PrivateLessonDuration;
      note?: string;
    }
  | { type: "suggest_lesson_slot"; actor: V2User; requestId: string; slot: string }
  | { type: "mark_teacher_unavailable"; actor: V2User; requestId: string }
  | { type: "select_lesson_slot"; actor: V2User; requestId: string; slot: string }
  | { type: "open_lesson_payment"; actor: V2User; requestId: string }
  | { type: "mark_lesson_paid"; actor: V2User; requestId: string };

function now() {
  return new Date().toISOString();
}

function newId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function audit(actor: V2User, action: string, targetType: string, targetId?: string): V2AuditEntry {
  return {
    id: newId("audit"),
    studioId: actor.studioId,
    actorUserId: actor.id,
    actorName: actor.name,
    action,
    targetType,
    targetId,
    createdAt: now()
  };
}

function withAudit(db: V2Database, entry: V2AuditEntry): V2Database {
  return { ...db, auditLog: [entry, ...db.auditLog].slice(0, 250) };
}

function managementAndSuperAdminIds(db: V2Database, studioId: string): string[] {
  return db.users.filter((u) => u.studioId === studioId && (u.role === "management" || u.role === "super_admin")).map((u) => u.id);
}

function linkedFamilyIds(db: V2Database, studentId: string): string[] {
  const student = db.users.find((u) => u.id === studentId);
  if (!student) return [];
  const parents = db.users
    .filter((u) => u.studioId === student.studioId && u.role === "parent" && u.linkedStudentIds.includes(studentId))
    .map((u) => u.id);
  return [student.id, ...parents];
}

function displayPrivateLessonName(db: V2Database, userId: string): string {
  return db.users.find((u) => u.id === userId)?.name ?? "תלמיד/ה";
}

function reducer(state: V2State, action: V2Action): V2State {
  switch (action.type) {
    case "replace_db":
      return {
        ...state,
        db: action.db,
        bootSource: "local",
        syncStatus: action.syncStatus ?? "synced",
        validationWarnings: action.warnings ?? []
      };
    case "login":
      return { ...state, session: { userId: action.userId } };
    case "logout":
      return { ...state, session: null };
    case "audit":
      return { ...state, db: withAudit(state.db, action.entry) };
    case "mark_notification_read":
      return { ...state, db: markNotificationRead(state.db, action.notificationId, action.userId) };
    case "mark_all_notifications_read":
      return { ...state, db: markAllNotificationsRead(state.db, action.userId) };
    case "upsert_user": {
      const exists = state.db.users.some((u) => u.id === action.user.id);
      const users = exists
        ? state.db.users.map((u) => (u.id === action.user.id ? { ...action.user, updatedAt: now() } : u))
        : [{ ...action.user, createdAt: now(), updatedAt: now() }, ...state.db.users];
      const credentials = action.credential
        ? [
            { ...action.credential, updatedAt: now() },
            ...state.db.credentials.filter((c) => c.userId !== action.credential?.userId)
          ]
        : state.db.credentials;
      let db = withAudit({ ...state.db, users, credentials }, audit(action.actor, exists ? "עודכן משתמש" : "נוצר משתמש", "user", action.user.id));
      db = notifyManagement(db, action.user.studioId, {
        title: exists ? "משתמש עודכן" : "משתמש חדש נוצר",
        body: `${action.user.name} · ${action.user.phone}`,
        priority: "important",
        relatedType: "user",
        relatedId: action.user.id,
        screen: "users"
      });
      db = notifyUsers(db, {
        studioId: action.user.studioId,
        userIds: [action.user.id],
        title: exists ? "הפרטים שלך עודכנו" : "החשבון שלך נוצר",
        body: "אפשר להתחבר עם מספר הטלפון והסיסמה שנשמרו במערכת.",
        priority: "normal",
        relatedType: "user",
        relatedId: action.user.id,
        screen: "users"
      });
      return {
        ...state,
        db
      };
    }
    case "update_user_permissions": {
      const users = state.db.users.map((u) =>
        u.id === action.userId ? { ...u, permissions: { ...u.permissions, ...action.permissions }, updatedAt: now() } : u
      );
      let db = withAudit({ ...state.db, users }, audit(action.actor, "עודכנו הרשאות משתמש", "user", action.userId));
      const target = db.users.find((u) => u.id === action.userId);
      if (target?.role === "teacher") {
        db = notifyTeacher(db, target.id, {
          title: "הרשאות המורה עודכנו",
          body: "ההרשאות שלך ב־LK Space עודכנו.",
          priority: "important",
          relatedType: "user",
          relatedId: target.id,
          screen: "users"
        });
      }
      return {
        ...state,
        db
      };
    }
    case "update_credential": {
      const credentials = [
        { userId: action.userId, phone: action.phone, password: action.password, updatedAt: now() },
        ...state.db.credentials.filter((c) => c.userId !== action.userId)
      ];
      const users = state.db.users.map((u) => (u.id === action.userId ? { ...u, phone: action.phone, updatedAt: now() } : u));
      let db = withAudit({ ...state.db, users, credentials }, audit(action.actor, "עודכנו פרטי התחברות", "credential", action.userId));
      const target = db.users.find((u) => u.id === action.userId);
      if (target) {
        db = notifyUsers(db, {
          studioId: target.studioId,
          userIds: [target.id],
          title: "פרטי ההתחברות עודכנו",
          body: "מספר הטלפון או הסיסמה עודכנו על ידי ההנהלה.",
          priority: "important",
          relatedType: "user",
          relatedId: target.id,
          screen: "users"
        });
      }
      return {
        ...state,
        db
      };
    }
    case "update_text": {
      const exists = state.db.editableTexts.some((item) => item.key === action.key);
      const editableTexts = exists
        ? state.db.editableTexts.map((item) => (item.key === action.key ? { ...item, value: action.value } : item))
        : [...state.db.editableTexts, { key: action.key, value: action.value }];
      return {
        ...state,
        db: withAudit({ ...state.db, editableTexts }, audit(action.actor, "עודכן טקסט", "editable_text", action.key))
      };
    }
    case "update_flags":
      return {
        ...state,
        db: withAudit(
          { ...state.db, featureFlags: { ...state.db.featureFlags, ...action.flags } },
          audit(action.actor, "עודכנו פיצ׳רים", "feature_flags")
        )
      };
    case "request_private_lesson": {
      const request: V2PrivateLessonRequest = {
        id: newId("plr"),
        studioId: action.actor.studioId,
        studentId: action.studentId,
        requestedByUserId: action.actor.id,
        teacherId: action.teacherId,
        duration: action.duration,
        price: privateLessonPrice(action.duration),
        status: "requested",
        studentNote: action.note,
        suggestedSlots: [],
        createdAt: now(),
        updatedAt: now()
      };
      let db = withAudit(
        { ...state.db, privateLessonRequests: [request, ...state.db.privateLessonRequests] },
        audit(action.actor, "נשלחה בקשת שיעור פרטי", "private_lesson_request", request.id)
      );
      db = notifyTeacher(db, action.teacherId, {
        title: "בקשה חדשה לשיעור פרטי",
        body: `${action.actor.name} ביקש/ה שיעור של ${action.duration} דקות.`,
        priority: "important",
        relatedType: "private_lesson",
        relatedId: request.id,
        screen: "private_lessons"
      });
      db = notifyManagement(db, action.actor.studioId, {
        title: "בקשת שיעור פרטי נפתחה",
        body: `${action.actor.name} · ${action.duration} דקות · ₪${request.price}`,
        priority: "normal",
        relatedType: "private_lesson",
        relatedId: request.id,
        screen: "private_lessons"
      });
      return {
        ...state,
        db
      };
    }
    case "suggest_lesson_slot":
    case "mark_teacher_unavailable":
    case "select_lesson_slot":
    case "open_lesson_payment":
    case "mark_lesson_paid": {
      const previous = state.db.privateLessonRequests.find((r) => r.id === action.requestId);
      const privateLessonRequests = state.db.privateLessonRequests.map((r) => {
        if (r.id !== action.requestId) return r;
        if (action.type === "suggest_lesson_slot") {
          return { ...r, status: "teacher_suggested" as const, suggestedSlots: [...r.suggestedSlots, action.slot], updatedAt: now() };
        }
        if (action.type === "mark_teacher_unavailable") {
          return { ...r, status: "teacher_unavailable" as const, updatedAt: now() };
        }
        if (action.type === "select_lesson_slot") {
          return { ...r, status: "slot_selected" as const, selectedSlot: action.slot, updatedAt: now() };
        }
        if (action.type === "open_lesson_payment") {
          return { ...r, status: "payment_pending" as const, updatedAt: now() };
        }
        return { ...r, status: "paid" as const, updatedAt: now() };
      });
      const labels = {
        suggest_lesson_slot: "מורה הציע מועד",
        mark_teacher_unavailable: "מורה סימן שאין זמינות",
        select_lesson_slot: "נבחר מועד לשיעור פרטי",
        open_lesson_payment: "נפתח תשלום לשיעור פרטי",
        mark_lesson_paid: "שיעור פרטי סומן כשולם"
      };
      let db = withAudit(
        { ...state.db, privateLessonRequests },
        audit(action.actor, labels[action.type], "private_lesson_request", action.requestId)
      );
      const request = db.privateLessonRequests.find((r) => r.id === action.requestId) ?? previous;
      if (request) {
        if (action.type === "suggest_lesson_slot") {
          db = notifyUsers(db, {
            studioId: request.studioId,
            userIds: linkedFamilyIds(db, request.studentId).filter((id) => id === request.requestedByUserId || id !== action.actor.id),
            title: "המורה הציע מועד",
            body: `נוסף מועד אפשרי: ${action.slot}`,
            priority: "important",
            relatedType: "private_lesson",
            relatedId: request.id,
            screen: "private_lessons"
          });
        }
        if (action.type === "mark_teacher_unavailable") {
          db = notifyUsers(db, {
            studioId: request.studioId,
            userIds: linkedFamilyIds(db, request.studentId),
            title: "אין זמינות מהמורה כרגע",
            body: "ננסה למצוא מועד חלופי או מורה מתאים אחר.",
            priority: "important",
            relatedType: "private_lesson",
            relatedId: request.id,
            screen: "private_lessons"
          });
          db = notifyManagement(db, request.studioId, {
            title: "ביקוש ללא זמינות",
            body: `${displayPrivateLessonName(db, request.studentId)} ממתין/ה למועד חלופי.`,
            priority: "important",
            relatedType: "private_lesson",
            relatedId: request.id,
            screen: "private_lessons"
          });
        }
        if (action.type === "select_lesson_slot") {
          db = notifyTeacher(db, request.teacherId, {
            title: "נבחר מועד לשיעור פרטי",
            body: `${action.slot} נבחר על ידי ${action.actor.name}.`,
            priority: "important",
            relatedType: "private_lesson",
            relatedId: request.id,
            screen: "private_lessons"
          });
          db = notifyManagement(db, request.studioId, {
            title: "תיאום שיעור פרטי",
            body: `${displayPrivateLessonName(db, request.studentId)} בחר/ה מועד.`,
            priority: "normal",
            relatedType: "private_lesson",
            relatedId: request.id,
            screen: "private_lessons"
          });
        }
        if (action.type === "open_lesson_payment") {
          db = notifyUsers(db, {
            studioId: request.studioId,
            userIds: [request.requestedByUserId],
            title: "התשלום לשיעור הפרטי מוכן",
            body: `לתשלום: ₪${request.price}.`,
            priority: "important",
            relatedType: "private_lesson",
            relatedId: request.id,
            screen: "private_lessons"
          });
        }
        if (action.type === "mark_lesson_paid") {
          db = notifyUsers(db, {
            studioId: request.studioId,
            userIds: [...linkedFamilyIds(db, request.studentId), request.teacherId, ...managementAndSuperAdminIds(db, request.studioId)],
            title: "שיעור פרטי אושר",
            body: `${request.duration} דקות · ₪${request.price} · התשלום סומן.`,
            priority: "important",
            relatedType: "private_lesson",
            relatedId: request.id,
            screen: "private_lessons"
          });
        }
      }
      return {
        ...state,
        db
      };
    }
    case "shop_order_created": {
      const product = state.db.products.find((p) => p.id === action.productId);
      let db = notifyUsers(state.db, {
        studioId: action.actor.studioId,
        userIds: [action.actor.id],
        title: "ההזמנה נוצרה",
        body: product ? `${product.title} · ₪${product.price}` : "הפריט נוסף להזמנה.",
        priority: "normal",
        relatedType: "shop",
        relatedId: action.productId,
        tab: "shop"
      });
      db = notifyManagement(db, action.actor.studioId, {
        title: "הזמנה חדשה בחנות",
        body: product ? `${action.actor.name} · ${product.title} · ₪${product.price}` : action.actor.name,
        priority: "normal",
        relatedType: "shop",
        relatedId: action.productId,
        tab: "shop"
      });
      return { ...state, db: withAudit(db, audit(action.actor, "נוצרה הזמנה בחנות", "shop", action.productId)) };
    }
    case "shop_order_paid": {
      const product = state.db.products.find((p) => p.id === action.productId);
      let db = notifyUsers(state.db, {
        studioId: action.actor.studioId,
        userIds: [action.actor.id, ...managementAndSuperAdminIds(state.db, action.actor.studioId)],
        title: "התשלום אושר",
        body: product ? `${product.title} · ₪${product.price}` : "הזמנה אושרה.",
        priority: "important",
        relatedType: "shop",
        relatedId: action.productId,
        tab: "shop"
      });
      return { ...state, db: withAudit(db, audit(action.actor, "תשלום חנות אושר", "shop", action.productId)) };
    }
    case "task_assigned": {
      const group = state.db.groups.find((g) => g.id === action.groupId);
      const studentIds = state.db.users.filter((u) => u.groupIds.includes(action.groupId) && u.role === "student").map((u) => u.id);
      const parentIds = state.db.users.filter((u) => u.role === "parent" && u.linkedStudentIds.some((sid) => studentIds.includes(sid))).map((u) => u.id);
      const db = notifyUsers(state.db, {
        studioId: action.actor.studioId,
        userIds: [...studentIds, ...parentIds, ...(group?.teacherIds ?? [])],
        title: "משימה חדשה",
        body: `${action.taskTitle}${group ? ` · ${group.name}` : ""}`,
        priority: "important",
        relatedType: "task",
        tab: "lessons"
      });
      return { ...state, db: withAudit(db, audit(action.actor, "משימה נשלחה לקבוצה", "task")) };
    }
    case "media_saved": {
      let db: V2Database = {
        ...state.db,
        mediaItems: [action.item, ...state.db.mediaItems.filter((item) => item.id !== action.item.id)]
      };
      const audience = mediaAudienceUserIds(db, action.item);
      if (audience.length) {
        db = notifyUsers(db, {
          studioId: action.item.studioId,
          userIds: audience,
          title: action.item.linkedProductId ? "תמונה חדשה במוצר" : "מדיה חדשה זמינה",
          body: action.item.title,
          priority: "normal",
          relatedType: "media",
          relatedId: action.item.id,
          screen: action.item.linkedProductId ? undefined : "media_library",
          tab: action.item.linkedProductId ? "shop" : undefined
        });
      }
      if (action.item.linkedProductId) {
        db = {
          ...db,
          products: db.products.map((product) =>
            product.id === action.item.linkedProductId
              ? {
                  ...product,
                  imageMediaIds: [...new Set([...(product.imageMediaIds ?? []), action.item.id])],
                  featuredImageMediaId: product.featuredImageMediaId ?? action.item.id
                }
              : product
          )
        };
      }
      db = withAudit(db, audit(action.actor, "מדיה נשמרה", "media", action.item.id));
      return { ...state, db };
    }
    case "media_updated": {
      const db = withAudit(
        { ...state.db, mediaItems: state.db.mediaItems.map((item) => (item.id === action.item.id ? action.item : item)) },
        audit(action.actor, "מדיה עודכנה", "media", action.item.id)
      );
      return { ...state, db };
    }
    case "media_archived": {
      const db = withAudit(
        { ...state.db, mediaItems: state.db.mediaItems.filter((item) => item.id !== action.mediaId) },
        audit(action.actor, "מדיה אורכבה", "media", action.mediaId)
      );
      return { ...state, db };
    }
    case "upsert_product": {
      const exists = state.db.products.some((product) => product.id === action.product.id);
      let db: V2Database = {
        ...state.db,
        products: exists
          ? state.db.products.map((product) => (product.id === action.product.id ? action.product : product))
          : [action.product, ...state.db.products]
      };
      if (action.product.isActive) {
        db = notifyManagement(db, action.product.studioId, {
          title: exists ? "מוצר עודכן" : "מוצר חדש נוסף",
          body: `${action.product.title} · ₪${action.product.price}`,
          priority: "normal",
          relatedType: "shop",
          relatedId: action.product.id,
          tab: "shop"
        });
      }
      return { ...state, db: withAudit(db, audit(action.actor, exists ? "מוצר עודכן" : "מוצר נוסף", "product", action.product.id)) };
    }
    case "archive_product": {
      const db = withAudit(
        {
          ...state.db,
          products: state.db.products.map((product) =>
            product.id === action.productId ? { ...product, isActive: false, archivedAt: now() } : product
          )
        },
        audit(action.actor, "מוצר אורכב", "product", action.productId)
      );
      return { ...state, db };
    }
    default:
      return state;
  }
}

type V2ContextValue = V2State & {
  user: V2User | null;
  login: (phone: string, password: string) => { ok: true } | { ok: false; reason: string };
  logout: () => void;
  dispatch: React.Dispatch<V2Action>;
  appendAudit: (actor: V2User, action: string, targetType: string, targetId?: string) => void;
  exportDatabase: () => void;
  importDatabase: (file: File) => Promise<{ ok: true; warnings: string[] } | { ok: false; reason: string }>;
};

const V2AppContext = createContext<V2ContextValue | null>(null);

function initialState(): V2State {
  return {
    db: cloneSafeInitialDatabase(),
    session: null,
    bootSource: "safe",
    syncStatus: "ready",
    validationWarnings: []
  };
}

export function V2AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    try {
      const storedDb = window.localStorage.getItem(DB_STORAGE_KEY);
      if (storedDb) {
        const parsed = JSON.parse(storedDb);
        const { db, report } = validateV2Database(parsed);
        dispatch({ type: "replace_db", db, warnings: report.warnings, syncStatus: report.ok ? "synced" : "recovered" });
      }
      const storedSession = window.localStorage.getItem(SESSION_STORAGE_KEY);
      if (storedSession) {
        const session = JSON.parse(storedSession) as V2Session;
        if (session?.userId) dispatch({ type: "login", userId: session.userId });
      }
    } catch {
      dispatch({ type: "replace_db", db: cloneSafeInitialDatabase(), warnings: ["Local cache recovered"], syncStatus: "recovered" });
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(state.db));
  }, [hydrated, state.db]);

  useEffect(() => {
    if (!hydrated) return;
    if (state.session) {
      window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(state.session));
    } else {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }, [hydrated, state.session]);

  const user = useMemo(
    () => (state.session ? state.db.users.find((u) => u.id === state.session?.userId && u.isActive) ?? null : null),
    [state.db.users, state.session]
  );

  const login = useCallback(
    (phone: string, password: string) => {
      const normalized = phone.replace(/\D/g, "");
      const credential = state.db.credentials.find((c) => c.phone.replace(/\D/g, "") === normalized && c.password === password);
      if (!credential) return { ok: false as const, reason: "טלפון או סיסמה לא נכונים" };
      const loginUser = state.db.users.find((u) => u.id === credential.userId && u.isActive);
      if (!loginUser) return { ok: false as const, reason: "המשתמש אינו פעיל" };
      dispatch({ type: "login", userId: loginUser.id });
      dispatch({ type: "audit", entry: audit(loginUser, "התחברות", "session", loginUser.id) });
      return { ok: true as const };
    },
    [state.db.credentials, state.db.users]
  );

  const logout = useCallback(() => {
    if (user) dispatch({ type: "audit", entry: audit(user, "התנתקות", "session", user.id) });
    dispatch({ type: "logout" });
  }, [user]);

  const appendAudit = useCallback((actor: V2User, action: string, targetType: string, targetId?: string) => {
    dispatch({ type: "audit", entry: audit(actor, action, targetType, targetId) });
  }, []);

  const exportDatabase = useCallback(() => {
    const blob = new Blob([`${JSON.stringify(state.db, null, 2)}\n`], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lk-student-space-v2-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [state.db]);

  const importDatabase = useCallback(async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const { db, report } = validateV2Database(parsed);
      dispatch({ type: "replace_db", db, warnings: report.warnings, syncStatus: report.ok ? "synced" : "recovered" });
      return { ok: true as const, warnings: report.warnings };
    } catch {
      return { ok: false as const, reason: "הקובץ לא תקין" };
    }
  }, []);

  const value = useMemo<V2ContextValue>(
    () => ({ ...state, user, login, logout, dispatch, appendAudit, exportDatabase, importDatabase }),
    [state, user, login, logout, appendAudit, exportDatabase, importDatabase]
  );

  return <V2AppContext.Provider value={value}>{children}</V2AppContext.Provider>;
}

export function useV2App() {
  const ctx = useContext(V2AppContext);
  if (!ctx) throw new Error("useV2App must be used inside V2AppProvider");
  return ctx;
}
