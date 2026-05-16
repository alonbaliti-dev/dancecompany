import type { V6Group, V6User } from "@/lib/v6/types";
import { v6Allowed, v6Denied } from "../core/v6";
import { canV6ManageAttendance } from "./guards";

export function buildV6OpenAttendanceOperation(actor: V6User, group?: V6Group) {
  return canV6ManageAttendance(actor, group) ? v6Allowed({ groupId: group?.id }) : v6Denied("אין הרשאה לסימון נוכחות");
}
