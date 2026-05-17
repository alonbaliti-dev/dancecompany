import type { V6User } from "@/lib/v6/types";
import { v6Allowed, v6Denied } from "../core/v6";
import { canV6RunDangerousSystemAction, canV6ViewSystemHealth } from "./guards";

export function buildV6SystemHealthOperation(actor: V6User) {
  return canV6ViewSystemHealth(actor) ? v6Allowed({ scope: actor.role === "super_admin" ? "platform" : "studio" }) : v6Denied("אין הרשאה לראות את מצב האפליקציה");
}

export function buildV6DangerousSystemOperation(actor: V6User, confirmation: string) {
  return canV6RunDangerousSystemAction(actor) && confirmation.trim().length > 0 ? v6Allowed({ confirmation }) : v6Denied("נדרש Super Admin ואישור מפורש");
}
