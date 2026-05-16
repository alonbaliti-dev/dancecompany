import type { V6AuditEntry, V6Database, V6Notification, V6User } from "@/lib/v6/types";

export type V6DomainResult<TPayload = unknown> = {
  allowed: boolean;
  reason?: string;
  payload?: TPayload;
  audit?: Omit<V6AuditEntry, "id" | "createdAt">;
  notifications?: Array<Omit<V6Notification, "id" | "createdAt" | "readBy">>;
};

export function v6Allowed<TPayload>(payload?: TPayload): V6DomainResult<TPayload> {
  return { allowed: true, payload };
}

export function v6Denied(reason: string): V6DomainResult {
  return { allowed: false, reason };
}

export function v6ManagementUserIds(db: V6Database, studioId: string) {
  return db.users.filter((user) => user.studioId === studioId && (user.role === "management" || user.role === "super_admin")).map((user) => user.id);
}

export function v6FamilyUserIds(db: V6Database, studentId: string) {
  const student = db.users.find((user) => user.id === studentId);
  if (!student) return [];
  return [student.id, ...db.users.filter((user) => user.role === "parent" && user.linkedStudentIds.includes(student.id)).map((user) => user.id)];
}

export function v6SameStudio(actor: V6User, studioId: string) {
  return actor.role === "super_admin" || actor.studioId === studioId;
}
