import type { V6User } from "@/lib/v6/types";

export function canV6ManageEvents(actor: V6User) {
  return actor.role === "super_admin" || actor.role === "management" || actor.permissions.manageStudio;
}
