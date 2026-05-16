import type { V6Database, V6User } from "@/lib/v6/types";

export function selectV6NotificationsForActor(db: V6Database, actor: V6User) {
  return db.notifications.filter((item) => item.userIds.includes(actor.id));
}

export function selectV6UnreadCount(db: V6Database, actor: V6User) {
  return selectV6NotificationsForActor(db, actor).filter((item) => !item.readBy.includes(actor.id)).length;
}

export function selectV6MessagesForActor(db: V6Database, actor: V6User) {
  if (actor.role === "super_admin" || actor.role === "management") return db.messages;
  return db.messages.filter((item) => !item.groupId || actor.groupIds.includes(item.groupId));
}
