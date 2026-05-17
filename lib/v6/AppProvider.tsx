"use client";

import { createContext, useContext, useEffect, useMemo, useReducer, useState, type ReactNode } from "react";
import { cloneV6Database } from "./seed";
import { mergeV6Database, normalizeV6Database } from "./dedupe";
import { buildV6SaveProductOperation } from "@/lib/domains/shop/operations";
import { buildV6SaveAttendanceOperation } from "@/lib/domains/attendance/operations";
import { buildV6ResetPasswordOperation, buildV6UpsertUserOperation } from "@/lib/domains/users/v6-operations";
import type { V6AttendanceRecord, V6AuditEntry, V6Credential, V6Database, V6MediaItem, V6Notification, V6PrivateLesson, V6Product, V6Session, V6User } from "./types";

const DB_KEY = "lk-v6-database";
const SESSION_KEY = "lk-v6-session";

type State = {
  db: V6Database;
  session: V6Session;
  sync: "instant" | "local" | "recovered";
};

type Action =
  | { type: "replace_db"; db: V6Database }
  | { type: "login"; userId: string }
  | { type: "logout" }
  | { type: "upsert_user"; actor: V6User; user: V6User; credential?: V6Credential }
  | { type: "reset_password"; actor: V6User; userId: string; password: string }
  | { type: "request_private_lesson"; actor: V6User; studentId: string; teacherId: string; duration: 30 | 45 }
  | { type: "suggest_private_lesson"; actor: V6User; requestId: string; slot: string }
  | { type: "select_private_lesson"; actor: V6User; requestId: string; slot: string }
  | { type: "open_private_lesson_payment"; actor: V6User; requestId: string }
  | { type: "mark_private_lesson_paid"; actor: V6User; requestId: string }
  | { type: "shop_order"; actor: V6User; productId: string }
  | { type: "save_product"; actor: V6User; product: V6Product }
  | { type: "save_media"; actor: V6User; media: V6MediaItem }
  | { type: "save_attendance"; actor: V6User; lessonId: string; groupId: string; classDate: string; records: V6AttendanceRecord[] }
  | { type: "mark_notification_read"; userId: string; notificationId: string }
  | { type: "mark_all_read"; userId: string }
  | { type: "update_text"; actor: V6User; key: string; value: string }
  | { type: "update_flags"; actor: V6User; flags: Record<string, boolean> }
  | { type: "audit"; entry: V6AuditEntry };

type Context = State & {
  user: V6User | null;
  login: (phone: string, password: string) => { ok: true } | { ok: false; reason: string };
  logout: () => void;
  dispatch: React.Dispatch<Action>;
  exportDatabase: () => void;
  importDatabase: (file: File) => Promise<{ ok: true } | { ok: false; reason: string }>;
  audit: (actor: V6User, action: string, target: string) => void;
};

const V6Context = createContext<Context | null>(null);

function now() {
  return new Date().toISOString();
}

function id(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function auditEntry(actor: V6User, action: string, target: string): V6AuditEntry {
  return { id: id("audit"), studioId: actor.studioId, actorUserId: actor.id, actorName: actor.name, action, target, createdAt: now() };
}

function withAudit(db: V6Database, entry: V6AuditEntry): V6Database {
  return normalizeV6Database({ ...db, auditLog: [entry, ...db.auditLog].slice(0, 300) });
}

function notify(db: V6Database, input: Omit<V6Notification, "id" | "createdAt" | "readBy">): V6Database {
  const notification: V6Notification = { ...input, id: id("ntf"), readBy: [], createdAt: now() };
  return normalizeV6Database({ ...db, notifications: [notification, ...db.notifications].slice(0, 250) });
}

function managementIds(db: V6Database, studioId: string) {
  return db.users.filter((u) => u.studioId === studioId && (u.role === "management" || u.role === "super_admin")).map((u) => u.id);
}

function familyIds(db: V6Database, studentId: string) {
  const student = db.users.find((u) => u.id === studentId);
  if (!student) return [];
  return [student.id, ...db.users.filter((u) => u.role === "parent" && (u.linkedStudentIds.includes(student.id) || student.linkedParentIds?.includes(u.id))).map((u) => u.id)];
}

function syncGroupsWithUsers(db: V6Database, users: V6User[]): V6Database {
  const parentIdsByStudent = new Map<string, string[]>();
  users
    .filter((user) => user.role === "parent")
    .forEach((parent) => {
      parent.linkedStudentIds.forEach((studentId) => {
        parentIdsByStudent.set(studentId, [...(parentIdsByStudent.get(studentId) ?? []), parent.id]);
      });
    });
  const normalizedUsers = users.map((user) => {
    const groupIds = [...new Set(user.groupIds)];
    const linkedStudentIds = [...new Set(user.linkedStudentIds)];
    if (user.role === "student") return { ...user, groupIds, linkedStudentIds: [], linkedParentIds: [...new Set([...(user.linkedParentIds ?? []), ...(parentIdsByStudent.get(user.id) ?? [])])], status: user.status ?? (user.active ? "active" : "inactive") };
    if (user.role === "parent") return { ...user, groupIds: [], linkedStudentIds, linkedParentIds: [], status: user.status ?? (user.active ? "active" : "inactive") };
    return { ...user, groupIds, linkedStudentIds: [], linkedParentIds: [], status: user.status ?? (user.active ? "active" : "inactive") };
  });
  return {
    ...db,
    users: normalizedUsers,
    groups: db.groups.map((group) => ({
      ...group,
      teacherIds: normalizedUsers.filter((user) => (user.role === "teacher" || user.role === "management") && user.groupIds.includes(group.id)).map((user) => user.id),
      studentIds: normalizedUsers.filter((user) => user.role === "student" && user.groupIds.includes(group.id)).map((user) => user.id)
    }))
  };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "replace_db":
      return { ...state, db: normalizeV6Database(action.db), sync: "local" };
    case "login":
      return { ...state, session: { userId: action.userId } };
    case "logout":
      return { ...state, session: null };
    case "audit":
      return { ...state, db: withAudit(state.db, action.entry) };
    case "upsert_user": {
      const operation = buildV6UpsertUserOperation(state.db, action.actor, action.user, action.credential);
      if (!operation.allowed || !operation.payload) return state;
      const { user, credential, exists } = operation.payload;
      const previous = state.db.users.find((u) => u.id === user.id);
      const users = exists ? state.db.users.map((u) => (u.id === user.id ? user : u)) : [user, ...state.db.users];
      const credentials = credential
        ? [credential, ...state.db.credentials.filter((c) => c.userId !== credential.userId)]
        : previous && previous.phone !== user.phone
          ? state.db.credentials.map((c) => (c.userId === user.id ? { ...c, phone: user.phone } : c))
          : state.db.credentials;
      let db: V6Database = {
        ...state.db,
        credentials
      };
      db = syncGroupsWithUsers(db, users);
      db = notify(db, { studioId: user.studioId, userIds: [user.id], title: exists ? "הפרטים שלך עודכנו" : "נוצר לך חשבון", body: "אפשר להתחבר עם הטלפון והסיסמה שנשמרו.", type: "user", screen: "users" });
      db = notify(db, { studioId: user.studioId, userIds: managementIds(db, user.studioId), title: exists ? "משתמש עודכן" : "משתמש חדש", body: user.name, type: "user", screen: "users" });
      return { ...state, db: withAudit(normalizeV6Database(db), auditEntry(action.actor, exists ? "עדכון משתמש" : "יצירת משתמש", user.id)) };
    }
    case "reset_password": {
      const target = state.db.users.find((u) => u.id === action.userId);
      if (!target) return state;
      const operation = buildV6ResetPasswordOperation(action.actor, target, action.password);
      if (!operation.allowed || !operation.payload) return state;
      const credential = { userId: target.id, phone: target.phone, password: operation.payload.password };
      let db: V6Database = {
        ...state.db,
        credentials: [credential, ...state.db.credentials.filter((c) => c.userId !== target.id)]
      };
      db = notify(db, { studioId: target.studioId, userIds: [target.id], title: "הסיסמה עודכנה", body: "ההנהלה עדכנה את פרטי ההתחברות שלך.", type: "user", screen: "users" });
      return { ...state, db: withAudit(normalizeV6Database(db), auditEntry(action.actor, "איפוס סיסמה", action.userId)) };
    }
    case "request_private_lesson": {
      const request: V6PrivateLesson = {
        id: id("pl"),
        studioId: action.actor.studioId,
        studentId: action.studentId,
        teacherId: action.teacherId,
        requestedByUserId: action.actor.id,
        duration: action.duration,
        price: action.duration === 30 ? 150 : 225,
        status: "requested",
        suggestedSlots: [],
        createdAt: now()
      };
      let db: V6Database = normalizeV6Database({ ...state.db, privateLessons: [request, ...state.db.privateLessons] });
      db = notify(db, { studioId: action.actor.studioId, userIds: [action.teacherId, ...managementIds(db, action.actor.studioId)], title: "בקשת שיעור פרטי", body: `${action.duration} דקות`, type: "private_lesson", screen: "private_lessons" });
      return { ...state, db: withAudit(db, auditEntry(action.actor, "בקשת שיעור פרטי", request.id)) };
    }
    case "suggest_private_lesson": {
      const db = state.db.privateLessons.reduce<V6Database>((acc, item) => {
        if (item.id !== action.requestId) return acc;
        const updated = { ...item, status: "teacher_suggested" as const, suggestedSlots: [...item.suggestedSlots, action.slot] };
        return notify({ ...acc, privateLessons: acc.privateLessons.map((r) => (r.id === item.id ? updated : r)) }, { studioId: item.studioId, userIds: familyIds(acc, item.studentId), title: "מועד הוצע לשיעור פרטי", body: action.slot, type: "private_lesson", screen: "private_lessons" });
      }, state.db);
      return { ...state, db: withAudit(db, auditEntry(action.actor, "הצעת מועד", action.requestId)) };
    }
    case "select_private_lesson":
    case "open_private_lesson_payment":
    case "mark_private_lesson_paid": {
      const status = action.type === "select_private_lesson" ? "slot_selected" : action.type === "open_private_lesson_payment" ? "payment_open" : "paid";
      const db = withAudit(
        { ...state.db, privateLessons: state.db.privateLessons.map((r) => (r.id === action.requestId ? { ...r, status, selectedSlot: "slot" in action ? action.slot : r.selectedSlot } : r)) },
        auditEntry(action.actor, action.type === "mark_private_lesson_paid" ? "סימון שיעור פרטי שולם" : "עדכון שיעור פרטי", action.requestId)
      );
      return { ...state, db };
    }
    case "shop_order": {
      const product = state.db.products.find((p) => p.id === action.productId);
      if (!product) return state;
      const db = notify(state.db, { studioId: action.actor.studioId, userIds: [...managementIds(state.db, action.actor.studioId), action.actor.id], title: "הזמנה חדשה בחנות", body: product.title, type: "shop", tab: "shop" });
      return { ...state, db: withAudit(db, auditEntry(action.actor, "יצירת הזמנה", product.id)) };
    }
    case "save_product": {
      const operation = buildV6SaveProductOperation(state.db, action.actor, action.product);
      if (!operation.allowed || !operation.payload) return state;
      const { product, exists } = operation.payload;
      let db: V6Database = {
        ...state.db,
        products: exists ? state.db.products.map((p) => (p.id === product.id ? product : p)) : [product, ...state.db.products]
      };
      db = notify(db, { studioId: product.studioId, userIds: managementIds(db, product.studioId), title: exists ? "מוצר עודכן" : "מוצר חדש בחנות", body: product.title, type: "shop", tab: "shop" });
      return { ...state, db: withAudit(normalizeV6Database(db), auditEntry(action.actor, exists ? "עדכון מוצר" : "יצירת מוצר", product.id)) };
    }
    case "save_media": {
      let db: V6Database = normalizeV6Database({ ...state.db, media: [action.media, ...state.db.media.filter((m) => m.id !== action.media.id)] });
      db = notify(db, { studioId: action.actor.studioId, userIds: managementIds(db, action.actor.studioId), title: "מדיה חדשה", body: action.media.title, type: "media", screen: "media" });
      return { ...state, db: withAudit(db, auditEntry(action.actor, "שמירת מדיה", action.media.id)) };
    }
    case "save_attendance": {
      const operation = buildV6SaveAttendanceOperation(state.db, action.actor, action);
      if (!operation.allowed || !operation.payload) return state;
      const savedRecords = operation.payload.records;
      const savedKeys = new Set(savedRecords.map((record) => `${record.lessonId}:${record.groupId}:${record.classDate}:${record.studentId}`));
      let db: V6Database = {
        ...state.db,
        attendance: [
          ...savedRecords,
          ...state.db.attendance.filter((record) => !savedKeys.has(`${record.lessonId}:${record.groupId}:${record.classDate}:${record.studentId}`))
        ]
      };
      savedRecords
        .filter((record) => record.status === "absent" || record.status === "missing")
        .forEach((record) => {
          const student = db.users.find((item) => item.id === record.studentId);
          if (!student) return;
          db = notify(db, { studioId: action.actor.studioId, userIds: [...new Set([...familyIds(db, student.id), ...managementIds(db, action.actor.studioId)])], title: "היעדרות נרשמה", body: `${student.name} · ${record.note || "ללא הערה"}`, type: "system", tab: "lessons" });
        });
      return { ...state, db: withAudit(normalizeV6Database(db), auditEntry(action.actor, "שמירת נוכחות", `${action.lessonId}:${action.classDate}`)) };
    }
    case "mark_notification_read":
      return { ...state, db: normalizeV6Database({ ...state.db, notifications: state.db.notifications.map((n) => (n.id === action.notificationId ? { ...n, readBy: [...new Set([...n.readBy, action.userId])] } : n)) }) };
    case "mark_all_read":
      return { ...state, db: normalizeV6Database({ ...state.db, notifications: state.db.notifications.map((n) => (n.userIds.includes(action.userId) ? { ...n, readBy: [...new Set([...n.readBy, action.userId])] } : n)) }) };
    case "update_text":
      return { ...state, db: withAudit({ ...state.db, editableTexts: { ...state.db.editableTexts, [action.key]: action.value } }, auditEntry(action.actor, "עדכון טקסט", action.key)) };
    case "update_flags":
      return { ...state, db: withAudit({ ...state.db, featureFlags: { ...state.db.featureFlags, ...action.flags } }, auditEntry(action.actor, "עדכון פיצ׳רים", "feature_flags")) };
    default:
      return state;
  }
}

function initialState(): State {
  return { db: cloneV6Database(), session: null, sync: "instant" };
}

export function V6AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const [hydrated, setHydrated] = useState(false);
  const user = useMemo(() => state.db.users.find((u) => u.id === state.session?.userId) ?? null, [state.db.users, state.session]);

  useEffect(() => {
    try {
      const savedDb = localStorage.getItem(DB_KEY);
      const savedSession = localStorage.getItem(SESSION_KEY);
      if (savedDb) dispatch({ type: "replace_db", db: mergeV6Database(cloneV6Database(), { ...JSON.parse(savedDb), version: 6 } as V6Database) });
      if (savedSession) {
        const parsed = JSON.parse(savedSession) as V6Session;
        if (parsed?.userId) dispatch({ type: "login", userId: parsed.userId });
      }
    } catch {
      // Safe initial DB already keeps the app usable if local state is corrupted.
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(DB_KEY, JSON.stringify(state.db));
    localStorage.setItem(SESSION_KEY, JSON.stringify(state.session));
  }, [hydrated, state.db, state.session]);

  function login(phone: string, password: string) {
    const credential = state.db.credentials.find((c) => c.phone === phone && c.password === password);
    const target = credential ? state.db.users.find((u) => u.id === credential.userId && u.active) : null;
    if (!credential || !target) return { ok: false as const, reason: "טלפון או סיסמה לא נכונים" };
    dispatch({ type: "login", userId: target.id });
    return { ok: true as const };
  }

  function logout() {
    dispatch({ type: "logout" });
  }

  function exportDatabase() {
    const blob = new Blob([`${JSON.stringify(state.db, null, 2)}\n`], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `lk-v6-database-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function importDatabase(file: File) {
    try {
      const parsed = JSON.parse(await file.text()) as V6Database;
      if (!parsed || !Array.isArray(parsed.users)) return { ok: false as const, reason: "קובץ מסד לא תקין" };
      dispatch({ type: "replace_db", db: mergeV6Database(cloneV6Database(), { ...parsed, version: 6 }) });
      return { ok: true as const };
    } catch {
      return { ok: false as const, reason: "לא ניתן לקרוא את הקובץ" };
    }
  }

  function audit(actor: V6User, action: string, target: string) {
    dispatch({ type: "audit", entry: auditEntry(actor, action, target) });
  }

  return <V6Context.Provider value={{ ...state, user, login, logout, dispatch, exportDatabase, importDatabase, audit }}>{children}</V6Context.Provider>;
}

export function useV6() {
  const ctx = useContext(V6Context);
  if (!ctx) throw new Error("useV6 must be used inside V6AppProvider");
  return ctx;
}
