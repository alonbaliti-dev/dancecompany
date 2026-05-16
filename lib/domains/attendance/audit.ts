import type { V6User } from "@/lib/v6/types";

export function v6AttendanceAudit(actor: V6User, target: string, action = "עדכון נוכחות") {
  return { studioId: actor.studioId, actorUserId: actor.id, actorName: actor.name, action, target };
}
