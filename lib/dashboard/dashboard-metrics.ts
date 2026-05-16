import { getRuntimeDatabase } from "@/lib/local-db/runtime-store";
import {
  buildGroupSummaries,
  buildStudentSummaries,
  filterRecordsForUser,
  overviewFromSummaries,
  trendLabel
} from "@/lib/attendance-intelligence/logic";
import { getSchoolYearBounds } from "@/lib/attendance-intelligence/school-year";
import { linkedStudentIdsForAttendance } from "@/lib/attendance-intelligence/logic";
import { getDirectoryUsers } from "@/lib/directory-store";
import { compareUpdatesForInbox } from "@/lib/flow-priority";
import { groupNameToId } from "@/lib/studio-group-ids";
import {
  progressPercentForStudent,
  statusForStudent,
  taskVisibleToStudent,
  updateVisibleToStudent
} from "@/lib/studio-task-logic";
import type {
  AttendanceTrend,
  FlowPriority,
  StudentTask,
  StudioUpdate,
  UserProfile
} from "@/lib/types";

export type DashboardMessageItem = {
  id: string;
  title: string;
  sub: string;
  priority: FlowPriority;
  unread: boolean;
  onPressKind: "messages" | "stack";
  stack?: "notifications" | "group_chats";
};

export type TaskProgressMetrics = {
  active: number;
  completed: number;
  overdue: number;
  overallPercent: number;
  weeklyCompletionRate: number;
  groupPercent?: number;
  personalPercent: number;
};

export type ChildTaskRollup = {
  studentId: string;
  studentName: string;
  metrics: TaskProgressMetrics;
};

export type AttendanceGlance = {
  studentId?: string;
  pct: number;
  absencesLast4Weeks: number;
  currentStreak: number;
  trend: AttendanceTrend;
  trendLabel: string;
  schoolYearLabel: string;
  studentName?: string;
};

export type DashboardNextAction = {
  label: string;
  tone: "accent" | "urgent" | "teacher" | "management";
  kind: "task" | "message" | "practice" | "gallery" | "attendance" | "shop";
};

export type DashboardMetrics = {
  role: "student" | "parent" | "teacher" | "management";
  messages: {
    unreadCount: number;
    urgentCount: number;
    items: DashboardMessageItem[];
  };
  tasks: TaskProgressMetrics;
  /** Per-child breakdown when role is parent. */
  childTaskRollups?: ChildTaskRollup[];
  attendance: AttendanceGlance | AttendanceGlance[];
  nextAction: DashboardNextAction;
  teacherExtras?: {
    groupsBehind: number;
    openAttendanceSessions: number;
    studentsAtRisk: number;
  };
  managementExtras?: {
    taskCompletionPct: number;
    messagesReadRate: number;
    studioAttendanceAvg: number;
    teachersNeedFollowUp: number;
  };
};

function taskMetricsForStudent(tasks: StudentTask[], user: UserProfile): TaskProgressMetrics {
  const visible = tasks.filter((t) => taskVisibleToStudent(t, user));
  let active = 0;
  let completed = 0;
  let overdue = 0;
  let sumPct = 0;

  for (const t of visible) {
    const st = statusForStudent(t, user.id);
    const pct = progressPercentForStudent(t, user.id);
    sumPct += pct;
    if (st === "completed") completed++;
    else if (st === "overdue") overdue++;
    else active++;
  }

  const total = visible.length || 1;
  const weeklyDone = visible.filter((t) => t.frequency === "weekly" && statusForStudent(t, user.id) === "completed").length;
  const weeklyTotal = visible.filter((t) => t.frequency === "weekly").length || 1;

  return {
    active,
    completed,
    overdue,
    overallPercent: visible.length ? Math.round(sumPct / visible.length) : 100,
    weeklyCompletionRate: Math.round((weeklyDone / weeklyTotal) * 100),
    personalPercent: visible.length ? Math.round(sumPct / visible.length) : 100
  };
}

function attendanceForStudentId(studentId: string, studioId: string): AttendanceGlance {
  const { label } = getSchoolYearBounds();
  const records = getRuntimeDatabase().attendance.intelligenceRecords.filter(
    (r) => r.studentId === studentId && r.studioId === studioId
  );
  const summary = buildStudentSummaries(records)[0];
  if (!summary) {
    return {
      studentId,
      pct: 100,
      absencesLast4Weeks: 0,
      currentStreak: 0,
      trend: "stable",
      trendLabel: trendLabel("stable"),
      schoolYearLabel: label
    };
  }
  return {
    studentId,
    pct: summary.attendancePct,
    absencesLast4Weeks: summary.absencesLast4Weeks,
    currentStreak: summary.currentStreak,
    trend: summary.trend,
    trendLabel: trendLabel(summary.trend),
    schoolYearLabel: label,
    studentName: summary.studentName
  };
}

function messageItems(user: UserProfile, updates: StudioUpdate[], unreadNotifCount: number): DashboardMetrics["messages"] {
  const visible = updates
    .filter((u) => updateVisibleToStudent(u, user))
    .sort((a, b) => compareUpdatesForInbox(a, b, user.id));

  const unread = visible.filter((u) => !u.readByUserIds.includes(user.id));
  const urgent = unread.filter((u) => u.priority === "urgent" || u.priority === "important");

  const items: DashboardMessageItem[] = unread.slice(0, 4).map((u) => ({
    id: u.id,
    title: u.title,
    sub: u.createdByName,
    priority: u.priority,
    unread: true,
    onPressKind: "messages"
  }));

  return {
    unreadCount: Math.max(unread.length, unreadNotifCount),
    urgentCount: urgent.length,
    items
  };
}

function pickNextAction(
  user: UserProfile,
  tasks: StudentTask[],
  updates: StudioUpdate[],
  opts: { openAttendance?: number; isTeacher?: boolean; isMgmt?: boolean }
): DashboardNextAction {
  const visible = tasks.filter((t) => taskVisibleToStudent(t, user));
  const urgentTask = visible.find((t) => statusForStudent(t, user.id) === "overdue");
  const unread = updates.filter((u) => updateVisibleToStudent(u, user) && !u.readByUserIds.includes(user.id));

  if (opts.isMgmt) {
    const critical = unread.filter((u) => u.priority === "urgent").length;
    if (critical > 0) return { label: "לטפל בעדכונים דחופים", tone: "management", kind: "message" };
    return { label: "מבט בריאות הסטודיו", tone: "management", kind: "message" };
  }
  if (opts.isTeacher) {
    if ((opts.openAttendance ?? 0) > 0) {
      return { label: "סימון נוכחות עכשיו", tone: "teacher", kind: "attendance" };
    }
    if (urgentTask) return { label: "להשלים משימה דחופה בקבוצה", tone: "teacher", kind: "task" };
    return { label: "שליחת עדכון לקבוצה", tone: "teacher", kind: "message" };
  }
  if (urgentTask) return { label: "להשלים את המשימה הדחופה", tone: "urgent", kind: "task" };
  if (unread.length > 0) return { label: "לקרוא עדכון חדש", tone: "accent", kind: "message" };
  return { label: "להעלות סרטון תרגול לגלריה", tone: "accent", kind: "gallery" };
}

export function buildDashboardMetrics(input: {
  user: UserProfile;
  studioId: string;
  tasks: StudentTask[];
  updates: StudioUpdate[];
  unreadNotificationCount: number;
  openAttendanceSessions?: number;
  pendingVideoReviews?: number;
}): DashboardMetrics {
  const { user, studioId, tasks, updates, unreadNotificationCount, openAttendanceSessions = 0 } = input;
  const isMgmt = user.permissions.isManagement && !user.permissions.isSuperAdmin;
  const isTeacher = user.permissions.isTeacher && !isMgmt;
  const isParent = user.type === "parent" || user.isParent;
  const isStudent = !isMgmt && !isTeacher && !isParent;

  const messages = messageItems(user, updates, unreadNotificationCount);

  if (isParent) {
    const childIds = linkedStudentIdsForAttendance(user, studioId);
    const directory = getDirectoryUsers();

    const childTaskRollups: ChildTaskRollup[] = childIds.map((id) => {
      const child = directory.find((u) => u.id === id);
      const profile = child ?? user;
      return {
        studentId: id,
        studentName: child?.name ?? "תלמיד/ה",
        metrics: taskMetricsForStudent(tasks, profile)
      };
    });

    const childAttendances = childIds.map((id) => attendanceForStudentId(id, studioId));

    const avgTaskPct = childTaskRollups.length
      ? Math.round(childTaskRollups.reduce((a, t) => a + t.metrics.overallPercent, 0) / childTaskRollups.length)
      : 0;

    const overdueChild = childTaskRollups.find((c) => c.metrics.overdue > 0);
    const nextAction: DashboardNextAction = overdueChild
      ? {
          label: `משימות באיחור — ${overdueChild.studentName}`,
          tone: "urgent",
          kind: "task"
        }
      : childTaskRollups.some((c) => c.metrics.active > 0)
        ? { label: "לעקוב אחר משימות הילדים", tone: "accent", kind: "task" }
        : { label: "לצפות בנוכחות הילדים", tone: "accent", kind: "attendance" };

    return {
      role: "parent",
      messages,
      tasks: {
        active: childTaskRollups.reduce((a, t) => a + t.metrics.active, 0),
        completed: childTaskRollups.reduce((a, t) => a + t.metrics.completed, 0),
        overdue: childTaskRollups.reduce((a, t) => a + t.metrics.overdue, 0),
        overallPercent: avgTaskPct,
        weeklyCompletionRate: childTaskRollups.length
          ? Math.round(
              childTaskRollups.reduce((a, t) => a + t.metrics.weeklyCompletionRate, 0) / childTaskRollups.length
            )
          : 0,
        personalPercent: avgTaskPct
      },
      childTaskRollups,
      attendance: childAttendances,
      nextAction
    };
  }

  if (isMgmt) {
    const records = filterRecordsForUser(getRuntimeDatabase().attendance.intelligenceRecords, user, studioId);
    const summaries = buildStudentSummaries(records);
    const overview = overviewFromSummaries(summaries);
    const completedAll = tasks.filter((t) => t.status === "completed").length;
    const totalTasks = tasks.length || 1;
    const taskM: TaskProgressMetrics = {
      active: tasks.filter((t) => t.status !== "completed").length,
      completed: completedAll,
      overdue: tasks.filter((t) => t.status === "overdue").length,
      overallPercent: Math.round((completedAll / totalTasks) * 100),
      weeklyCompletionRate: Math.round((completedAll / totalTasks) * 100),
      personalPercent: Math.round((completedAll / totalTasks) * 100)
    };

    return {
      role: "management",
      messages,
      tasks: taskM,
      attendance: {
        pct: overview.avg,
        absencesLast4Weeks: overview.absences4w,
        currentStreak: overview.streakAlerts,
        trend: overview.avg >= 85 ? "stable" : "declining",
        trendLabel: overview.avg >= 85 ? "יציב" : "דורש מעקב",
        schoolYearLabel: getSchoolYearBounds().label
      },
      nextAction: pickNextAction(user, tasks, updates, { isMgmt: true }),
      managementExtras: {
        taskCompletionPct: Math.round((completedAll / totalTasks) * 100),
        messagesReadRate: 78,
        studioAttendanceAvg: overview.avg,
        teachersNeedFollowUp: buildGroupSummaries(summaries).filter((g) => g.atRiskCount > 2).length
      }
    };
  }

  if (isTeacher) {
    const records = filterRecordsForUser(getRuntimeDatabase().attendance.intelligenceRecords, user, studioId);
    const summaries = buildStudentSummaries(records);
    const overview = overviewFromSummaries(summaries);
    const behind = summaries.filter((s) => s.attendancePct < 80 || s.currentStreak >= 2).length;

    return {
      role: "teacher",
      messages,
      tasks: taskMetricsForStudent(tasks, user),
      attendance: {
        pct: overview.avg,
        absencesLast4Weeks: overview.absences4w,
        currentStreak: 0,
        trend: "stable",
        trendLabel: "ממוצע קבוצות",
        schoolYearLabel: getSchoolYearBounds().label
      },
      nextAction: pickNextAction(user, tasks, updates, { isTeacher: true, openAttendance: openAttendanceSessions }),
      teacherExtras: {
        groupsBehind: behind,
        openAttendanceSessions,
        studentsAtRisk: summaries.filter((s) => s.riskLevel === "at_risk").length
      }
    };
  }

  const groupIds = new Set(user.assignedGroups.map((n) => groupNameToId(n)).filter(Boolean));
  const groupTasks = tasks.filter((t) => t.assignedGroupIds?.some((gid) => groupIds.has(gid)));
  const personal = taskMetricsForStudent(tasks, user);
  const groupPct =
    groupTasks.length > 0
      ? Math.round(
          groupTasks.reduce((a, t) => a + progressPercentForStudent(t, user.id), 0) / groupTasks.length
        )
      : personal.overallPercent;

  const studentAttendance = attendanceForStudentId(user.id, studioId);

  return {
    role: "student",
    messages,
    tasks: { ...personal, groupPercent: groupPct },
    attendance: studentAttendance,
    nextAction:
      studentAttendance.absencesLast4Weeks >= 2
        ? { label: "לצפות בנוכחות שלי", tone: "accent", kind: "attendance" }
        : pickNextAction(user, tasks, updates, {})
  };
}
