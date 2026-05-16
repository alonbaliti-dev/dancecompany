import type { V6User } from "@/lib/v6/types";
import { v6SameStudio } from "../core/v6";

export function canV6ManageUsers(actor: V6User, target?: V6User) {
  if (!actor.permissions.manageUsers && actor.role !== "super_admin") return false;
  return target ? v6SameStudio(actor, target.studioId) : true;
}

export function canV6EditCredentials(actor: V6User, target?: V6User) {
  if (!actor.permissions.editCredentials && actor.role !== "super_admin") return false;
  return target ? v6SameStudio(actor, target.studioId) : true;
}
