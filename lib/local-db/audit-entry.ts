import type { AuditLogEntry, UserProfile } from "@/lib/types";
import type { LocalDatabase } from "./db-types";

export function createAuditEntry(
  user: Pick<UserProfile, "id" | "name" | "studioId" | "permissions">,
  input: Omit<AuditLogEntry, "id" | "timestamp" | "actorUserId" | "actorName">
): AuditLogEntry {
  return {
    ...input,
    id: `aud_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    studioId: input.studioId || user.studioId,
    actorUserId: user.id,
    actorName: user.name,
    timestamp: new Date().toISOString()
  };
}

/** Immutable append — use inside setDb updater. */
export function appendAuditToDb(
  db: LocalDatabase,
  user: Pick<UserProfile, "id" | "name" | "studioId" | "permissions">,
  input: Omit<AuditLogEntry, "id" | "timestamp" | "actorUserId" | "actorName">
): LocalDatabase {
  const entry = createAuditEntry(user, input);
  return { ...db, auditLog: [entry, ...db.auditLog] };
}
