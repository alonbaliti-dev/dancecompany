import type { V6MediaItem, V6User } from "@/lib/v6/types";

export function canV6UploadMedia(actor: V6User) {
  return actor.role === "super_admin" || actor.permissions.manageMedia || actor.role === "teacher";
}

export function canV6ManageMedia(actor: V6User, item?: V6MediaItem) {
  if (actor.role === "super_admin") return true;
  if (item && actor.studioId !== item.studioId) return false;
  if (actor.permissions.manageMedia) return true;
  return Boolean(item && actor.role === "teacher" && item.uploadedByUserId === actor.id);
}

export function canV6ViewMedia(actor: V6User, item: V6MediaItem) {
  if (actor.role === "super_admin") return true;
  if (actor.studioId !== item.studioId) return false;
  if (actor.permissions.manageMedia || item.visibility === "management") return actor.role === "management" || actor.permissions.manageMedia;
  if (item.visibility === "staff") return actor.role === "teacher" || actor.role === "management";
  if (item.visibility === "group") return Boolean(item.linkedGroupId && actor.groupIds.includes(item.linkedGroupId));
  if (item.visibility === "event" || item.visibility === "archive") return actor.role !== "parent" || Boolean(item.linkedGroupId);
  return item.visibility === "shop";
}
