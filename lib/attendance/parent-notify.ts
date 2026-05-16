import { riskLabel, trendLabel } from "@/lib/attendance-intelligence/logic";
import { getDirectoryUsers } from "@/lib/directory-store";
import type { AttendanceMark, SendStudioUpdatePayload, StudentAttendanceSummary } from "@/lib/types";

export type ParentNotifyResult =
  | { ok: true; recipientCount: number; notificationId: string }
  | { ok: false; reason: string };

export function parentIdsForStudent(studentId: string): string[] {
  return getDirectoryUsers()
    .filter((u) => (u.type === "parent" || u.isParent) && u.linkedStudentIds?.includes(studentId))
    .map((u) => u.id);
}

export function buildAttendanceParentUpdatePayload(
  summary: StudentAttendanceSummary,
  schoolYearLabel: string
): SendStudioUpdatePayload {
  const parentIds = parentIdsForStudent(summary.studentId);
  const lines = [
    `שנת לימודים ${schoolYearLabel}`,
    `נוכחות: ${summary.attendancePct}%`,
    `חיסורים (4 שבועות): ${summary.absencesLast4Weeks}`,
    `מגמה: ${trendLabel(summary.trend)}`,
    `סטטוס: ${riskLabel(summary.riskLevel)}`
  ];
  if (summary.lastAbsence) {
    lines.push(`חיסור אחרון: ${summary.lastAbsence.classDate} — ${summary.lastAbsence.classTitle}`);
  }
  return {
    targetType: "students",
    targetUserIds: parentIds,
    title: `עדכון נוכחות — ${summary.studentName}`,
    body: lines.join("\n"),
    priority: summary.riskLevel === "at_risk" ? "urgent" : "normal"
  };
}

const markLabelHe: Record<AttendanceMark, string> = {
  present: "נוכח/ת",
  late: "איחור",
  absent: "חיסור"
};

export function buildSessionParentUpdatePayload(input: {
  studentId: string;
  studentName: string;
  classTitle: string;
  groupName: string;
  date: string;
  mark: AttendanceMark;
}): SendStudioUpdatePayload {
  const parentIds = parentIdsForStudent(input.studentId);
  return {
    targetType: "students",
    targetUserIds: parentIds,
    title: `נוכחות בשיעור — ${input.studentName}`,
    body: [
      `שיעור: ${input.classTitle}`,
      `קבוצה: ${input.groupName}`,
      `תאריך: ${input.date}`,
      `סטטוס: ${markLabelHe[input.mark]}`
    ].join("\n"),
    priority: input.mark === "absent" ? "urgent" : "normal"
  };
}
