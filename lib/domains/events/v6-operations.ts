import type { V6User } from "@/lib/v6/types";
import { v6Allowed, v6Denied } from "../core/v6";
import { canV6ManageEvents } from "./guards";

export function buildV6EventModeOperation(actor: V6User, eventId: string) {
  return canV6ManageEvents(actor) ? v6Allowed({ eventId }) : v6Denied("אין הרשאה לניהול אירוע");
}
