import type { V6AttendanceRecord, V6Database, V6Group, V6User } from "@/lib/v6/types";
import { v6Allowed, v6Denied, type V6DomainResult } from "../core/v6";
import { canV6ManageAttendance } from "./guards";

export function buildV6OpenAttendanceOperation(actor: V6User, group?: V6Group) {
  return canV6ManageAttendance(actor, group) ? v6Allowed({ groupId: group?.id }) : v6Denied("אין הרשאה לסימון נוכחות");
}

export function buildV6SaveAttendanceOperation(
  db: V6Database,
  actor: V6User,
  input: { lessonId: string; groupId: string; classDate: string; records: V6AttendanceRecord[] }
): V6DomainResult<{ lessonId: string; groupId: string; classDate: string; records: V6AttendanceRecord[] }> {
  const group = db.groups.find((item) => item.id === input.groupId);
  const lesson = db.lessons.find((item) => item.id === input.lessonId && item.groupId === input.groupId);
  if (!group || !lesson) return v6Denied("חובה לבחור קבוצה ושיעור תקינים");
  if (!canV6ManageAttendance(actor, group)) return v6Denied("אין הרשאה לסימון נוכחות בקבוצה הזו");
  if (!input.classDate) return v6Denied("חובה לבחור תאריך שיעור");
  const validStatuses = new Set(["present", "absent", "late", "excused", "missing"]);
  const studentIds = new Set(group.studentIds);
  const invalidRecord = input.records.find((record) => !studentIds.has(record.studentId) || !validStatuses.has(record.status));
  if (invalidRecord) return v6Denied("סטטוס נוכחות או תלמיד/ה לא תקינים");
  return v6Allowed({ ...input, records: input.records });
}
