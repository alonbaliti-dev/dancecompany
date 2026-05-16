import { cloneSafeInitialDatabase } from "./safe-initial-database";
import type { V2Database } from "./types";

export type V2ValidationReport = {
  ok: boolean;
  warnings: string[];
};

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function validateV2Database(input: unknown): { db: V2Database; report: V2ValidationReport } {
  const fallback = cloneSafeInitialDatabase();
  const warnings: string[] = [];
  if (!isObject(input)) {
    return { db: fallback, report: { ok: false, warnings: ["Imported value is not an object"] } };
  }

  const raw = input as Partial<V2Database>;
  if (raw.version !== 2) warnings.push("Missing V2 version marker");

  const db: V2Database = {
    ...fallback,
    ...raw,
    version: 2,
    studios: Array.isArray(raw.studios) ? raw.studios : fallback.studios,
    users: Array.isArray(raw.users) ? raw.users : fallback.users,
    credentials: Array.isArray(raw.credentials) ? raw.credentials : fallback.credentials,
    groups: Array.isArray(raw.groups) ? raw.groups : fallback.groups,
    classes: Array.isArray(raw.classes) ? raw.classes : fallback.classes,
    tasks: Array.isArray(raw.tasks) ? raw.tasks : fallback.tasks,
    attendance: Array.isArray(raw.attendance) ? raw.attendance : fallback.attendance,
    messages: Array.isArray(raw.messages) ? raw.messages : fallback.messages,
    notifications: Array.isArray(raw.notifications) ? raw.notifications : fallback.notifications,
    products: Array.isArray(raw.products) ? raw.products : fallback.products,
    privateLessonRequests: Array.isArray(raw.privateLessonRequests)
      ? raw.privateLessonRequests
      : fallback.privateLessonRequests,
    mediaItems: Array.isArray(raw.mediaItems) ? raw.mediaItems : fallback.mediaItems,
    editableTexts: Array.isArray(raw.editableTexts) ? raw.editableTexts : fallback.editableTexts,
    auditLog: Array.isArray(raw.auditLog) ? raw.auditLog : fallback.auditLog,
    featureFlags: isObject(raw.featureFlags) ? { ...fallback.featureFlags, ...raw.featureFlags } : fallback.featureFlags
  };

  const userIds = new Set(db.users.map((u) => u.id));
  const orphanCredentials = db.credentials.filter((c) => !userIds.has(c.userId));
  if (orphanCredentials.length) warnings.push(`${orphanCredentials.length} credentials do not match users`);

  const missingCredentials = db.users.filter((u) => !db.credentials.some((c) => c.userId === u.id));
  if (missingCredentials.length) warnings.push(`${missingCredentials.length} users do not have credentials`);

  return { db, report: { ok: warnings.length === 0, warnings } };
}
