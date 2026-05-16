import type { V6User } from "@/lib/v6/types";

export function canV6BuyFromShop(actor: V6User) {
  return actor.active;
}

export function canV6ManageShop(actor: V6User) {
  return actor.role === "super_admin" || actor.permissions.manageShop;
}
