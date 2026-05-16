import type { V6Group, V6User } from "@/lib/v6/types";

export function canV6ManageAttendance(actor: V6User, group?: V6Group) {
  if (actor.role === "super_admin" || actor.permissions.manageAttendance) return true;
  return actor.role === "teacher" && (!group || group.teacherIds.includes(actor.id));
}
