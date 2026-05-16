import type { V6User } from "@/lib/v6/types";
import { v6Allowed, v6Denied } from "../core/v6";
import { canV6SendMessage, canV6SendUrgentMessage } from "./guards";
import type { V6MessageChannel } from "./types";

export function buildV6MessageDraftOperation(actor: V6User, channel: V6MessageChannel, groupId?: string) {
  if (channel === "urgent" && !canV6SendUrgentMessage(actor)) return v6Denied("אין הרשאה לשליחת הודעה דחופה");
  return canV6SendMessage(actor, channel, groupId) ? v6Allowed({ channel, groupId, requiresApproval: true }) : v6Denied("אין הרשאה לערוץ ההודעה");
}
