import { getDirectoryUsers } from "@/lib/directory-store";
import { GROUP_TEACHERS } from "@/lib/attendance-intelligence/group-teachers";
import { groupNameToId } from "@/lib/studio-roster";
import type {
  AttendanceRecord,
  AttendanceRiskLevel,
  AttendanceStatus,
  AttendanceTrend,
  GroupAttendanceSummary,
  StudentAttendanceSummary,
  UserProfile
} from "@/lib/types";
import { getSchoolYearBounds, weeksAgoIso } from "./school-year";

export { GROUP_TEACHERS } from "@/lib/attendance-intelligence/group-teachers";

export function riskLevelFromPct(pct: number): AttendanceRiskLevel {
  if (pct >= 90) return "ok";
  if (pct >= 80) return "watch";
  return "at_risk";
}

export function riskLabel(level: AttendanceRiskLevel): string {
  if (level === "ok") return "תקין";
  if (level === "watch") return "לשים לב";
  return "בסיכון";
}

export function trendLabel(t: AttendanceTrend): string {
  if (t === "improving") return "משתפר";
  if (t === "declining") return "יורד";
  return "יציב";
}

export function statusLabelHe(s: AttendanceStatus): string {
  const map: Record<AttendanceStatus, string> = {
    present: "נוכח/ת",
    late: "איחור",
    absent: "חיסור",
    excused: "מוצדק"
  };
  return map[s];
}

function isAttended(status: AttendanceStatus): boolean {
  return status === "present" || status === "late" || status === "excused";
}

function computeStreak(sortedDesc: AttendanceRecord[]): number {
  let streak = 0;
  for (const r of sortedDesc) {
    if (r.status === "absent") streak++;
    else break;
  }
  return streak;
}

function computeTrend(records: AttendanceRecord[], asOf: Date): AttendanceTrend {
  const fourWeeksAgo = weeksAgoIso(4, asOf);
  const eightWeeksAgo = weeksAgoIso(8, asOf);
  const recent = records.filter((r) => r.classDate >= fourWeeksAgo);
  const prior = records.filter((r) => r.classDate >= eightWeeksAgo && r.classDate < fourWeeksAgo);
  if (!recent.length || !prior.length) return "stable";
  const recentPct = recent.filter((r) => isAttended(r.status)).length / recent.length;
  const priorPct = prior.filter((r) => isAttended(r.status)).length / prior.length;
  const delta = recentPct - priorPct;
  if (delta > 0.08) return "improving";
  if (delta < -0.08) return "declining";
  return "stable";
}

export function buildStudentSummaries(
  records: AttendanceRecord[],
  asOf = new Date()
): StudentAttendanceSummary[] {
  const { start } = getSchoolYearBounds(asOf);
  const startIso = start.toISOString().slice(0, 10);
  const fourWeeksAgo = weeksAgoIso(4, asOf);
  const inYear = records.filter((r) => r.classDate >= startIso && r.classDate <= asOf.toISOString().slice(0, 10));

  const byStudent = new Map<string, AttendanceRecord[]>();
  for (const r of inYear) {
    const list = byStudent.get(r.studentId) ?? [];
    list.push(r);
    byStudent.set(r.studentId, list);
  }

  const summaries: StudentAttendanceSummary[] = [];
  for (const [studentId, list] of byStudent) {
    const sorted = [...list].sort((a, b) => b.classDate.localeCompare(a.classDate));
    const sample = sorted[0]!;
    const presentCount = list.filter((r) => r.status === "present").length;
    const lateCount = list.filter((r) => r.status === "late").length;
    const absentCount = list.filter((r) => r.status === "absent").length;
    const excusedCount = list.filter((r) => r.status === "excused").length;
    const attendedCount = presentCount + lateCount + excusedCount;
    const totalScheduled = list.length;
    const attendancePct = totalScheduled ? Math.round((attendedCount / totalScheduled) * 100) : 100;
    const absencesLast4Weeks = list.filter((r) => r.classDate >= fourWeeksAgo && r.status === "absent").length;
    const missedDates = list.filter((r) => r.status === "absent").map((r) => r.classDate);
    const lastAbsence = sorted.find((r) => r.status === "absent");
    const lastAttended = sorted.find((r) => isAttended(r.status));

    summaries.push({
      studentId,
      studentName: sample.studentName,
      groupId: sample.groupId,
      groupName: sample.groupName,
      teacherId: sample.teacherId,
      teacherName: sample.teacherName,
      totalScheduled,
      presentCount,
      lateCount,
      absentCount,
      excusedCount,
      attendedCount,
      attendancePct,
      currentStreak: computeStreak(sorted),
      absencesLast4Weeks,
      missedDates,
      trend: computeTrend(list, asOf),
      riskLevel: riskLevelFromPct(attendancePct),
      lastAbsence,
      lastAttendedDate: lastAttended?.classDate,
      flaggedForReview: false
    });
  }

  return summaries.sort((a, b) => a.attendancePct - b.attendancePct);
}

export function buildGroupSummaries(summaries: StudentAttendanceSummary[]): GroupAttendanceSummary[] {
  const map = new Map<string, StudentAttendanceSummary[]>();
  for (const s of summaries) {
    const list = map.get(s.groupId) ?? [];
    list.push(s);
    map.set(s.groupId, list);
  }
  return [...map.entries()].map(([groupId, students]) => ({
    groupId,
    groupName: students[0]!.groupName,
    teacherName: students[0]!.teacherName,
    studentCount: students.length,
    averageAttendancePct: Math.round(students.reduce((a, s) => a + s.attendancePct, 0) / students.length),
    atRiskCount: students.filter((s) => s.riskLevel === "at_risk" || s.currentStreak >= 2).length
  }));
}

export function linkedStudentIdsForAttendance(
  user: Pick<UserProfile, "linkedStudentIds" | "isParent" | "type">,
  studioId: string
): string[] {
  if (user.linkedStudentIds?.length) return user.linkedStudentIds;
  if (user.isParent || user.type === "parent") {
    return getDirectoryUsers()
      .filter((u) => u.type === "student" && u.studioId === studioId)
      .slice(0, 2)
      .map((u) => u.id);
  }
  return [];
}

export function filterRecordsForUser(
  records: AttendanceRecord[],
  user: UserProfile,
  studioId: string
): AttendanceRecord[] {
  const scoped = records.filter((r) => r.studioId === studioId);
  if (user.permissions.isSuperAdmin) return scoped;
  if (user.permissions.isManagement) return scoped;
  if (user.permissions.isTeacher) {
    const groupIds = new Set(user.assignedGroups.map((n) => groupNameToId(n)).filter(Boolean) as string[]);
    return scoped.filter((r) => groupIds.has(r.groupId) || r.teacherId === user.id);
  }
  if (user.isParent || user.type === "parent") {
    const childIds = new Set(linkedStudentIdsForAttendance(user, studioId));
    return scoped.filter((r) => childIds.has(r.studentId));
  }
  if (user.permissions.isStudent) {
    return scoped.filter((r) => r.studentId === user.id);
  }
  return [];
}

export function overviewFromSummaries(summaries: StudentAttendanceSummary[]) {
  const avg =
    summaries.length > 0
      ? Math.round(summaries.reduce((a, s) => a + s.attendancePct, 0) / summaries.length)
      : 0;
  const atRisk = summaries.filter((s) => s.riskLevel === "at_risk").length;
  const absences4w = summaries.reduce((a, s) => a + s.absencesLast4Weeks, 0);
  const streakAlerts = summaries.filter((s) => s.currentStreak >= 2).length;
  return { avg, atRisk, absences4w, streakAlerts };
}
