import type { EntityId, IsoDateString } from "@/lib/types/base";
import type {
  AttendanceSummary,
  AttendanceTrend,
  CalendarEvent,
  CalendarFilter,
  EngagementRiskLevel,
  ManagementIssue,
  OperationalOrder,
  PracticeCompletion,
  PracticeStreak,
  PracticeTask,
  PrivateLessonRequest
} from "@/lib/domains/operations/types";

function dateOnly(value: string) {
  return value.slice(0, 10);
}

function includesAny(values: EntityId[], filters?: EntityId[]) {
  return !filters?.length || values.some((value) => filters.includes(value));
}

function severityFromCount(count: number): EngagementRiskLevel {
  if (count >= 5) return "critical";
  if (count >= 3) return "high";
  if (count >= 1) return "medium";
  return "low";
}

export function selectCalendarEventsByFilter(events: CalendarEvent[], filters: CalendarFilter): CalendarEvent[] {
  return events
    .filter((event) => event.academyId === filters.academyId)
    .filter((event) => !filters.schoolYearId || event.schoolYearId === filters.schoolYearId)
    .filter((event) => !filters.from || dateOnly(event.startsAt) >= filters.from)
    .filter((event) => !filters.to || dateOnly(event.startsAt) <= filters.to)
    .filter((event) => !filters.eventTypes?.length || filters.eventTypes.includes(event.type))
    .filter((event) => includesAny(event.groupIds, filters.groupIds))
    .filter((event) => includesAny(event.danceStyleIds, filters.danceStyleIds))
    .filter((event) => includesAny(event.teacherIds, filters.teacherIds))
    .filter((event) => includesAny(event.studentIds, filters.studentIds))
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

export function selectDailyPracticeTasks(options: {
  academyId: string;
  tasks: PracticeTask[];
  completions: PracticeCompletion[];
  studentId: EntityId;
  day: IsoDateString;
}) {
  const completedTaskIds = new Set(
    options.completions
      .filter((completion) => completion.academyId === options.academyId)
      .filter((completion) => completion.studentId === options.studentId)
      .filter((completion) => completion.completedOn === options.day)
      .filter((completion) => completion.status === "done")
      .map((completion) => completion.taskId)
  );

  return options.tasks
    .filter((task) => task.academyId === options.academyId)
    .filter((task) => task.status === "active" || task.status === "assigned")
    .map((task) => ({
      task,
      completed: completedTaskIds.has(task.id)
    }));
}

export function computePracticeStreak(options: {
  academyId: string;
  studentId: EntityId;
  completions: PracticeCompletion[];
  expectedPracticeDays?: IsoDateString[];
}): PracticeStreak {
  const completedDays = new Set(
    options.completions
      .filter((completion) => completion.academyId === options.academyId)
      .filter((completion) => completion.studentId === options.studentId)
      .filter((completion) => completion.status === "done")
      .map((completion) => completion.completedOn)
  );
  const orderedDays = [...completedDays].sort();
  let longestStreakDays = 0;
  let runningStreak = 0;
  let previousTime = 0;

  for (const day of orderedDays) {
    const time = Date.parse(`${day}T00:00:00.000Z`);
    runningStreak = previousTime && time - previousTime === 86_400_000 ? runningStreak + 1 : 1;
    longestStreakDays = Math.max(longestStreakDays, runningStreak);
    previousTime = time;
  }

  const today = new Date().toISOString().slice(0, 10);
  const currentStreakDays = orderedDays.includes(today) ? runningStreak : 0;
  const expectedCount = options.expectedPracticeDays?.length ?? orderedDays.length;

  return {
    academyId: options.academyId,
    studentId: options.studentId,
    currentStreakDays,
    longestStreakDays,
    completionRatePercent: expectedCount ? Math.round((completedDays.size / expectedCount) * 100) : 0,
    lastCompletedOn: orderedDays.at(-1)
  };
}

export function computeAttendanceSummary(options: {
  academyId: string;
  studentId?: EntityId;
  groupId?: EntityId;
  statuses: Array<"present" | "absent" | "late" | "excused" | "missing_record">;
}): AttendanceSummary {
  const presentCount = options.statuses.filter((status) => status === "present").length;
  const absentCount = options.statuses.filter((status) => status === "absent").length;
  const lateCount = options.statuses.filter((status) => status === "late").length;
  const excusedCount = options.statuses.filter((status) => status === "excused").length;
  const missingRecordCount = options.statuses.filter((status) => status === "missing_record").length;
  const counted = presentCount + absentCount + lateCount;

  return {
    academyId: options.academyId,
    studentId: options.studentId,
    groupId: options.groupId,
    presentCount,
    absentCount,
    lateCount,
    excusedCount,
    missingRecordCount,
    attendanceRatePercent: counted ? Math.round(((presentCount + lateCount) / counted) * 100) : 0
  };
}

export function selectRepeatedAttendanceTrends(trends: AttendanceTrend[], minimumCount = 2): AttendanceTrend[] {
  return trends
    .filter((trend) => trend.count >= minimumCount)
    .sort((a, b) => b.count - a.count || b.riskLevel.localeCompare(a.riskLevel));
}

export function selectOrdersNeedingAttention(orders: OperationalOrder[]): OperationalOrder[] {
  return orders
    .filter((order) => order.orderStatus !== "cancelled" && order.orderStatus !== "refunded")
    .filter((order) => order.paymentStatus === "pending" || order.paymentStatus === "manual_office_pending" || order.paymentStatus === "failed")
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function buildManagementIssues(options: {
  academyId: string;
  missingAttendanceCount: number;
  unresolvedIssueCount: number;
  inactiveStudentIds: EntityId[];
  missingRehearsalEventIds: EntityId[];
  unpaidOrders: OperationalOrder[];
  pendingPrivateLessons: PrivateLessonRequest[];
  eventReadinessIssues: Array<{ eventId: EntityId; title: string; severity: EngagementRiskLevel }>;
  now: string;
}): ManagementIssue[] {
  const issues: ManagementIssue[] = [];

  if (options.missingAttendanceCount > 0) {
    issues.push({
      academyId: options.academyId,
      kind: "missing_attendance",
      title: "Attendance needs completion",
      severity: severityFromCount(options.missingAttendanceCount),
      entityType: "attendance",
      entityId: "missing_attendance",
      nextAction: "Ask teachers to complete today's attendance before sending parent summaries.",
      createdAt: options.now
    });
  }

  if (options.unresolvedIssueCount > 0) {
    issues.push({
      academyId: options.academyId,
      kind: "unresolved_issue",
      title: "Open operational issues",
      severity: severityFromCount(options.unresolvedIssueCount),
      entityType: "operations",
      entityId: "unresolved_issues",
      nextAction: "Review the oldest open issues and assign a clear owner.",
      createdAt: options.now
    });
  }

  for (const studentId of options.inactiveStudentIds) {
    issues.push({
      academyId: options.academyId,
      kind: "inactive_student",
      title: "Student may need attention",
      severity: "medium",
      entityType: "student",
      entityId: studentId,
      studentIds: [studentId],
      nextAction: "Check attendance and practice context before contacting the family.",
      createdAt: options.now
    });
  }

  for (const eventId of options.missingRehearsalEventIds) {
    issues.push({
      academyId: options.academyId,
      kind: "missing_rehearsal",
      title: "Event is missing rehearsal structure",
      severity: "medium",
      entityType: "event",
      entityId: eventId,
      nextAction: "Add rehearsal dates, linked groups, teachers and reminders.",
      createdAt: options.now
    });
  }

  for (const order of options.unpaidOrders) {
    issues.push({
      academyId: options.academyId,
      kind: "unpaid_order",
      title: "Order payment is not settled",
      severity: order.paymentStatus === "failed" ? "high" : "medium",
      entityType: "order",
      entityId: order.id,
      studentIds: order.studentId ? [order.studentId] : undefined,
      nextAction: "Confirm whether this is an office payment before sending a reminder.",
      createdAt: options.now
    });
  }

  for (const request of options.pendingPrivateLessons) {
    issues.push({
      academyId: options.academyId,
      kind: "pending_private_lesson",
      title: "Private lesson request is waiting",
      severity: "medium",
      entityType: "private_lesson_request",
      entityId: request.id,
      studentIds: [request.studentId],
      teacherIds: request.teacherId ? [request.teacherId] : undefined,
      nextAction: "Approve, suggest a slot, or clarify availability.",
      createdAt: options.now
    });
  }

  for (const readiness of options.eventReadinessIssues) {
    issues.push({
      academyId: options.academyId,
      kind: "event_readiness",
      title: readiness.title,
      severity: readiness.severity,
      entityType: "event",
      entityId: readiness.eventId,
      nextAction: "Resolve the highest-risk readiness blocker before publishing updates.",
      createdAt: options.now
    });
  }

  return issues.sort((a, b) => b.severity.localeCompare(a.severity) || a.createdAt.localeCompare(b.createdAt));
}
