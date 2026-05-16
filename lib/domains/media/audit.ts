import type { V6User } from "@/lib/v6/types";

export function v6MediaAudit(actor: V6User, action: string, target: string) {
  return { studioId: actor.studioId, actorUserId: actor.id, actorName: actor.name, action, target };
}
