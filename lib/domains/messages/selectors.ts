import type { V6Database, V6User } from "@/lib/v6/types";
import { dedupeById, dedupeByCompositeKey } from "@/lib/v6/dedupe";

export function selectV6NotificationsForActor(db: V6Database, actor: V6User) {
  return dedupeByCompositeKey(dedupeById(db.notifications), (item) => `${item.studioId}:${[...new Set(item.userIds)].sort().join(",")}:${item.title}:${item.body}:${item.type}:${item.tab ?? ""}:${item.screen ?? ""}`).filter((item) => item.userIds.includes(actor.id));
}

export function selectV6UnreadCount(db: V6Database, actor: V6User) {
  return selectV6NotificationsForActor(db, actor).filter((item) => !item.readBy.includes(actor.id)).length;
}

export function selectV6MessagesForActor(db: V6Database, actor: V6User) {
  const messages = dedupeById(db.messages);
  if (actor.role === "super_admin" || actor.role === "management") return messages;
  return messages.filter((item) => !item.groupId || actor.groupIds.includes(item.groupId));
}
