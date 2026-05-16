import type { V6User } from "@/lib/v6/types";

export function canV6ViewSystemHealth(actor: V6User) {
  return actor.role === "super_admin" || actor.permissions.systemHealth;
}

export function canV6RunDangerousSystemAction(actor: V6User) {
  return actor.role === "super_admin";
}
