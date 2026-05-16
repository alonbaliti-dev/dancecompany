import type { V6AuditEntry, V6User } from "@/lib/v6/types";

export function createV6AuditEntry(actor: V6User, action: string, target: string): Omit<V6AuditEntry, "id" | "createdAt"> {
  return { studioId: actor.studioId, actorUserId: actor.id, actorName: actor.name, action, target };
}

export function summarizeV6Audit(entries: V6AuditEntry[]) {
  return {
    total: entries.length,
    latest: entries[0],
    sensitive: entries.filter((entry) => /סיסמה|ייבוא|הרשאה|מדיה|חירום|מחיקה/.test(entry.action)).length
  };
}
