import type { V6User } from "@/lib/v6/types";
import type { V6MessageChannel } from "./types";

export function canV6SendMessage(actor: V6User, channel: V6MessageChannel, groupId?: string) {
  if (actor.role === "super_admin" || actor.role === "management") return true;
  if (actor.role === "teacher") return channel === "group" && (!groupId || actor.groupIds.includes(groupId));
  return channel === "direct";
}

export function canV6SendUrgentMessage(actor: V6User) {
  return actor.role === "super_admin" || actor.role === "management" || actor.permissions.manageStudio;
}
