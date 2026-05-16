import { buildStudentSummaries } from "@/lib/attendance-intelligence/logic";
import { getRuntimeDatabase } from "@/lib/local-db/runtime-store";
import { isStudentRole } from "@/lib/studio-roster";
import type { ManagementOverview, UserProfile } from "@/lib/types";

function teacherAttendancePct(teacherId: string, studioId: string): number {
  const db = getRuntimeDatabase();
  const records = db.attendance.intelligenceRecords.filter((r) => r.studioId === studioId && r.teacherId === teacherId);
  if (!records.length) return 0;
  const summaries = buildStudentSummaries(records);
  if (!summaries.length) return 0;
  return Math.round(summaries.reduce((s, x) => s + x.attendancePct, 0) / summaries.length);
}

/** Management dashboard aggregates from `/database` (not hardcoded). */
export function computeManagementOverview(studioId: string, user: UserProfile): ManagementOverview {
  const db = getRuntimeDatabase();
  const users = db.users.filter((u) => u.studioId === studioId);
  const teachers = users.filter((u) => u.permissions.isTeacher || u.permissions.isManagement);
  const students = users.filter((u) => isStudentRole(u.permissions) && !u.isParent);
  const groups = db.groups.filter((g) => g.studioId === studioId && !g.deletedAt);
  const reports = db.productData.reports;
  const sessionsThisWeek = db.classes.filter((c) => c.section === "week" || c.section === "today").length;

  const openTasks = db.tasks.filter((t) => t.studioId === studioId && !t.deletedAt && t.status !== "completed");
  const taskDonePct =
    db.tasks.filter((t) => t.studioId === studioId && !t.deletedAt).length > 0
      ? Math.round(
          (db.tasks.filter((t) => t.studioId === studioId && t.status === "completed").length /
            db.tasks.filter((t) => t.studioId === studioId && !t.deletedAt).length) *
            100
        )
      : reports.taskCompletionPct;

  const studioRecords = db.attendance.intelligenceRecords.filter((r) => r.studioId === studioId);
  const studioSummaries = buildStudentSummaries(studioRecords);
  const avgAtt =
    studioSummaries.length > 0
      ? Math.round(studioSummaries.reduce((s, x) => s + x.attendancePct, 0) / studioSummaries.length)
      : reports.attendanceCompletionPct;

  const teacherCards = teachers.slice(0, 14).map((t) => {
    const att = teacherAttendancePct(t.id, studioId);
    const groupCount = t.assignedGroups.length;
    const atRisk = studioSummaries.filter((s) => t.assignedGroups.includes(s.groupName) && s.riskLevel === "at_risk").length;
    return {
      userId: t.id,
      name: t.name,
      groups: groupCount,
      attendancePct: att || avgAtt,
      taskCompletionPct: taskDonePct,
      studentsAtRisk: atRisk,
      lastAttendanceUpdate: t.lastActiveAt ?? "—",
      engagementScore: Math.min(100, Math.round((att + taskDonePct) / 2))
    };
  });

  return {
    totalTeachers: teachers.length,
    totalGroups: groups.length,
    totalStudents: students.length,
    sessionsThisWeek,
    averageAttendancePct: avgAtt,
    homeTaskCompletionPct: taskDonePct,
    teachers: teacherCards,
    alerts: reports.groupsNeedingAttention.map((g, i) => ({
      id: `al_${i}`,
      kind: "practice" as const,
      title: g.groupName,
      detail: g.reason
    })),
    ranking: [...teacherCards]
      .sort((a, b) => b.engagementScore - a.engagementScore)
      .slice(0, 5)
      .map((t, i) => ({
        rank: i + 1,
        name: t.name,
        score: t.engagementScore,
        note: `${t.attendancePct}% נוכחות · ${t.groups} קבוצות`
      })),
    studioInsight:
      reports.weeklyHebrewInsight ||
      `בסטודיו ${students.length} תלמידים פעילים, ${openTasks.length} משימות פתוחות, ממוצע נוכחות ${avgAtt}%.`
  };
}
