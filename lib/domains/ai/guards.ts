import type { V6User } from "@/lib/v6/types";

export function canV6UseAI(actor: V6User) {
  return actor.active;
}

export function v6AIOutputRequiresApproval() {
  return true;
}
