import { buildV6DomainView, selectV6LessonAttendanceSummary, selectV6TeacherGroupIds } from "@/lib/domains/core/domain-adapters";
import { selectV6LessonsForActor } from "@/lib/domains/attendance/selectors";
import { selectV6UpcomingEvents } from "@/lib/domains/events/selectors";
import type { V6Tone } from "@/components/v6/design-system/tokens";
import type { V6Database, V6User } from "@/lib/v6/types";
import type { V6ActivityItem } from "./types";

function normalizeV6Weekday(value: string) {
  return value.replace(/^יום\s+/, "").trim();
}

function currentV6HebrewWeekday() {
  return normalizeV6Weekday(new Intl.DateTimeFormat("he-IL", { weekday: "long" }).format(new Date()));
}

function selectV6StudentStatusLabel(status: V6User["status"]) {
  if (status === "paused") return "בהפסקה";
  if (status === "pending") return "ממתין לאישור";
  if (status === "inactive") return "לא פעיל";
  return "פעיל";
}

function selectV6AttendanceProgress(marked: number, total: number): {
  statusLabel: string;
  tone: V6Tone;
  complete: boolean;
  needsAction: boolean;
} {
  const safeTotal = Math.max(total, 0);
  if (!safeTotal) return { statusLabel: "חסר רוסטר", tone: "urgent", complete: false, needsAction: true };
  const safeMarked = Math.min(Math.max(marked, 0), safeTotal);
  const remaining = Math.max(safeTotal - safeMarked, 0);
  if (remaining === 0) return { statusLabel: "הושלם", tone: "success", complete: true, needsAction: false };
  if (safeMarked > 0) return { statusLabel: `${remaining} נשארו`, tone: "urgent", complete: false, needsAction: true };
  return { statusLabel: "טרם סומן", tone: "studio", complete: false, needsAction: true };
}
import { mapV6DerivedActivityItem } from "./mappers";

export function selectV6RoleDerivedActivityItems(db: V6Database, actor: V6User): V6ActivityItem[] {
  if (actor.role === "student" || actor.role === "parent") return selectV6StudentDerivedActivityItems(db, actor);
  if (actor.role === "teacher") return selectV6TeacherDerivedActivityItems(db, actor);
  if (actor.role === "management" || actor.role === "super_admin") return selectV6ManagementDerivedActivityItems(db, actor);
  return [];
}

function selectV6StudentDerivedActivityItems(db: V6Database, actor: V6User): V6ActivityItem[] {
  const lessons = selectV6LessonsForActor(db, actor);
  const next = lessons[0];
  const today = currentV6HebrewWeekday();
  const items: V6ActivityItem[] = [];

  if (next && normalizeV6Weekday(next.weekday) === today) {
    const group = db.groups.find((entry) => entry.id === next.groupId);
    items.push(
      mapV6DerivedActivityItem({
        id: `activity:derived:student-next:${next.id}`,
        sourceKind: "derived",
        sourceId: next.id,
        category: "class",
        severity: "notice",
        title: "השיעור הבא שלך היום",
        body: `${group?.name ?? next.title} · ${next.time} · ${next.room}`,
        meta: today,
        createdAt: new Date().toISOString(),
        isRead: true,
        targetTab: "lessons",
        tone: "classic"
      })
    );
  }

  const openTasks = db.tasks.filter((task) => actor.groupIds.includes(task.groupId) && !task.doneByUserIds.includes(actor.id));
  if (openTasks[0]) {
    items.push(
      mapV6DerivedActivityItem({
        id: `activity:derived:student-task:${openTasks[0].id}`,
        sourceKind: "derived",
        sourceId: openTasks[0].id,
        category: "class",
        severity: "notice",
        title: "משימה פתוחה",
        body: openTasks[0].title,
        meta: "לפני השיעור",
        createdAt: new Date().toISOString(),
        isRead: false,
        targetTab: "lessons",
        tone: "repertoire"
      })
    );
  }

  return items;
}

function selectV6TeacherDerivedActivityItems(db: V6Database, actor: V6User): V6ActivityItem[] {
  const domainView = buildV6DomainView(db);
  const teacherGroupIds = selectV6TeacherGroupIds(domainView, actor);
  const teacherGroupIdList = Array.from(teacherGroupIds);
  const lessons = selectV6LessonsForActor(db, { ...actor, groupIds: teacherGroupIdList });
  const items: V6ActivityItem[] = [];
  const today = currentV6HebrewWeekday();

  let openAttendanceCount = 0;
  lessons
    .filter((lesson) => normalizeV6Weekday(lesson.weekday) === today)
    .slice(0, 6)
    .forEach((lesson) => {
      const summary = selectV6LessonAttendanceSummary(db, domainView, lesson.id, lesson.groupId);
      const progress = selectV6AttendanceProgress(summary.markedCount, summary.totalStudents);
      if (!progress.needsAction) return;
      openAttendanceCount += 1;
      const group = db.groups.find((entry) => entry.id === lesson.groupId);
      items.push(
        mapV6DerivedActivityItem({
          id: `activity:derived:teacher-attendance:${lesson.id}`,
          sourceKind: "derived",
          sourceId: lesson.id,
          category: "attendance",
          severity: progress.complete ? "info" : "important",
          title: group?.name ?? lesson.title,
          body: `${lesson.time} · ${lesson.room} · ${progress.statusLabel}`,
          meta: "לסימון נוכחות",
          createdAt: new Date().toISOString(),
          isRead: false,
          targetTab: "lessons",
          tone: progress.tone
        })
      );
    });

  if (openAttendanceCount > 1) {
    items.unshift(
      mapV6DerivedActivityItem({
        id: `activity:derived:teacher-attendance-summary`,
        sourceKind: "derived",
        sourceId: "attendance-summary",
        category: "attendance",
        severity: "important",
        title: `${openAttendanceCount} רוסטרים ממתינים`,
        body: "אפשר לסמן נוכחות ישירות מהשיעורים של היום",
        meta: "תזכורת",
        createdAt: new Date().toISOString(),
        isRead: false,
        targetTab: "lessons",
        tone: "urgent"
      })
    );
  }

  const next = lessons[0];
  if (next) {
    const group = db.groups.find((entry) => entry.id === next.groupId);
    items.push(
      mapV6DerivedActivityItem({
        id: `activity:derived:teacher-next:${next.id}`,
        sourceKind: "derived",
        sourceId: next.id,
        category: "class",
        severity: "notice",
        title: "השיעור הבא לסימון",
        body: `${group?.name ?? next.title} · ${next.time}`,
        meta: next.room,
        createdAt: new Date().toISOString(),
        isRead: true,
        targetTab: "lessons",
        tone: "studio"
      })
    );
  }

  return items;
}

function selectV6ManagementDerivedActivityItems(db: V6Database, actor: V6User): V6ActivityItem[] {
  const domainView = buildV6DomainView(db);
  const usersById = new Map(db.users.map((user) => [user.id, user]));
  const groupsById = domainView.groupsById;
  const events = selectV6UpcomingEvents(db, actor);
  const attendance = domainView.attendanceRecords;
  const items: V6ActivityItem[] = [];

  events
    .filter((event) => event.status === "needs_attention")
    .slice(0, 2)
    .forEach((event) => {
      items.push(
        mapV6DerivedActivityItem({
          id: `activity:derived:management-event:${event.id}`,
          sourceKind: "derived",
          sourceId: event.id,
          category: "event",
          severity: "important",
          title: event.title,
          body: event.location ?? "אירוע דורש בדיקה",
          meta: event.startTime ?? event.date,
          createdAt: event.date,
          isRead: false,
          targetScreen: "calendar",
          tone: "urgent"
        })
      );
    });

  db.users
    .filter((user) => user.role === "student" && user.status && user.status !== "active")
    .slice(0, 2)
    .forEach((student) => {
      items.push(
        mapV6DerivedActivityItem({
          id: `activity:derived:management-student:${student.id}`,
          sourceKind: "derived",
          sourceId: student.id,
          category: "system",
          severity: "important",
          title: student.name,
          body: selectV6StudentStatusLabel(student.status),
          meta: "תלמידה",
          createdAt: new Date().toISOString(),
          isRead: false,
          targetScreen: "users",
          tone: "urgent"
        })
      );
    });

  attendance
    .filter((record) => record.status === "absent" || record.status === "late" || record.status === "missing")
    .slice(0, 2)
    .forEach((record) => {
      const student = usersById.get(record.studentId);
      const group = groupsById.get(record.groupId);
      items.push(
        mapV6DerivedActivityItem({
          id: `activity:derived:management-attendance:${record.id}`,
          sourceKind: "derived",
          sourceId: record.id,
          category: "attendance",
          severity: "important",
          title: student?.name ?? "סימון נוכחות",
          body: group?.name ?? "רוסטר",
          meta: record.status,
          createdAt: new Date().toISOString(),
          isRead: false,
          targetTab: "lessons",
          tone: "urgent"
        })
      );
    });

  return items;
}
