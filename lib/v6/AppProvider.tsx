"use client";

import { createContext, useContext, useEffect, useMemo, useReducer, useState, type ReactNode } from "react";
import { cloneV6Database } from "./seed";
import type { V6AuditEntry, V6Credential, V6Database, V6MediaItem, V6Notification, V6PrivateLesson, V6Product, V6Session, V6User } from "./types";

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
  return { ...db, auditLog: [entry, ...db.auditLog].slice(0, 300) };
}

function notify(db: V6Database, input: Omit<V6Notification, "id" | "createdAt" | "readBy">): V6Database {
  const notification: V6Notification = { ...input, id: id("ntf"), readBy: [], createdAt: now() };
  return { ...db, notifications: [notification, ...db.notifications].slice(0, 250) };
}

function managementIds(db: V6Database, studioId: string) {
  return db.users.filter((u) => u.studioId === studioId && (u.role === "management" || u.role === "super_admin")).map((u) => u.id);
}

function familyIds(db: V6Database, studentId: string) {
  const student = db.users.find((u) => u.id === studentId);
  if (!student) return [];
  return [student.id, ...db.users.filter((u) => u.role === "parent" && u.linkedStudentIds.includes(student.id)).map((u) => u.id)];
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "replace_db":
      return { ...state, db: action.db, sync: "local" };
    case "login":
      return { ...state, session: { userId: action.userId } };
    case "logout":
      return { ...state, session: null };
    case "audit":
      return { ...state, db: withAudit(state.db, action.entry) };
    case "upsert_user": {
      const exists = state.db.users.some((u) => u.id === action.user.id);
      let db: V6Database = {
        ...state.db,
        users: exists ? state.db.users.map((u) => (u.id === action.user.id ? action.user : u)) : [action.user, ...state.db.users],
        credentials: action.credential ? [action.credential, ...state.db.credentials.filter((c) => c.userId !== action.credential?.userId)] : state.db.credentials
      };
      db = notify(db, { studioId: action.user.studioId, userIds: [action.user.id], title: exists ? "הפרטים שלך עודכנו" : "נוצר לך חשבון", body: "אפשר להתחבר עם הטלפון והסיסמה שנשמרו.", type: "user", screen: "users" });
      db = notify(db, { studioId: action.user.studioId, userIds: managementIds(db, action.user.studioId), title: exists ? "משתמש עודכן" : "משתמש חדש", body: action.user.name, type: "user", screen: "users" });
      return { ...state, db: withAudit(db, auditEntry(action.actor, exists ? "עדכון משתמש" : "יצירת משתמש", action.user.id)) };
    }
    case "reset_password": {
      const target = state.db.users.find((u) => u.id === action.userId);
      let db: V6Database = {
        ...state.db,
        credentials: state.db.credentials.map((c) => (c.userId === action.userId ? { ...c, password: action.password } : c))
      };
      if (target) db = notify(db, { studioId: target.studioId, userIds: [target.id], title: "הסיסמה עודכנה", body: "ההנהלה עדכנה את פרטי ההתחברות שלך.", type: "user", screen: "users" });
      return { ...state, db: withAudit(db, auditEntry(action.actor, "איפוס סיסמה", action.userId)) };
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
      let db: V6Database = { ...state.db, privateLessons: [request, ...state.db.privateLessons] };
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
      let db = notify(state.db, { studioId: action.actor.studioId, userIds: [...managementIds(state.db, action.actor.studioId), action.actor.id], title: "הזמנה חדשה בחנות", body: product.title, type: "shop", tab: "shop" });
      return { ...state, db: withAudit(db, auditEntry(action.actor, "יצירת הזמנה", product.id)) };
    }
    case "save_product":
      return { ...state, db: withAudit({ ...state.db, products: state.db.products.some((p) => p.id === action.product.id) ? state.db.products.map((p) => (p.id === action.product.id ? action.product : p)) : [action.product, ...state.db.products] }, auditEntry(action.actor, "שמירת מוצר", action.product.id)) };
    case "save_media": {
      let db: V6Database = { ...state.db, media: [action.media, ...state.db.media.filter((m) => m.id !== action.media.id)] };
      db = notify(db, { studioId: action.actor.studioId, userIds: managementIds(db, action.actor.studioId), title: "מדיה חדשה", body: action.media.title, type: "media", screen: "media" });
      return { ...state, db: withAudit(db, auditEntry(action.actor, "שמירת מדיה", action.media.id)) };
    }
    case "mark_notification_read":
      return { ...state, db: { ...state.db, notifications: state.db.notifications.map((n) => (n.id === action.notificationId ? { ...n, readBy: [...new Set([...n.readBy, action.userId])] } : n)) } };
    case "mark_all_read":
      return { ...state, db: { ...state.db, notifications: state.db.notifications.map((n) => (n.userIds.includes(action.userId) ? { ...n, readBy: [...new Set([...n.readBy, action.userId])] } : n)) } };
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
      if (savedDb) dispatch({ type: "replace_db", db: { ...cloneV6Database(), ...JSON.parse(savedDb), version: 6 } as V6Database });
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
      dispatch({ type: "replace_db", db: { ...cloneV6Database(), ...parsed, version: 6 } });
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
