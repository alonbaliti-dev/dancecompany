import type { V6User } from "@/lib/v6/types";
import { v6Allowed, v6Denied } from "../core/v6";
import { canV6UseAI } from "./guards";

export function buildV6AIDraftOperation(actor: V6User, context: string) {
  return canV6UseAI(actor) ? v6Allowed({ context, requiresApproval: true }) : v6Denied("אין הרשאה לשימוש ב-AI");
}
