import type { V6User } from "@/lib/v6/types";

export function v6AuthAudit(actor: V6User, target: string, action = "פעולת התחברות") {
  return { studioId: actor.studioId, actorUserId: actor.id, actorName: actor.name, action, target };
}
