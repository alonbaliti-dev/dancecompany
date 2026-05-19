import { selectV6LessonsForActor } from "@/lib/domains/attendance/selectors";
import { buildV6DomainView, selectV6AttendanceRateFromRecords, selectV6AttendanceRecordsForGroupIds, selectV6AttendanceRecordsForStudent, selectV6GroupRosterViews, selectV6LessonAttendanceSummary, selectV6RosterStudentsForGroupIds, selectV6TeacherGroupIds, selectV6WeeklyScheduleViews, v6AttendanceStatusLabel, type V6GroupRosterStudentView, type V6GroupRosterView, type V6NormalizedDomainView } from "@/lib/domains/core/domain-adapters";
import { selectV6UpcomingEvents } from "@/lib/domains/events/selectors";
import { selectV6MessagesForActor, selectV6NotificationsForActor, selectV6UnreadCount } from "@/lib/domains/messages/selectors";
import { selectV6ShopProductsForActor } from "@/lib/domains/shop/selectors";
import { modulesForRole } from "@/lib/v6/ui-composition";
import type { V6CalendarEvent, V6Database, V6Group, V6Lesson, V6Product, V6User } from "@/lib/v6/types";
import type { V6Tone } from "@/components/v6/design-system/tokens";

export const V6_HEBREW_WEEKDAYS = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"] as const;

type V6LessonWithTiming = V6Lesson & {
  durationMinutes?: number;
  duration?: number;
  endTime?: string;
};

export type V6EntityIndexes = {
  usersById: Map<string, V6User>;
  groupsById: Map<string, V6Group>;
  lessonsById: Map<string, V6Lesson>;
};

export type V6ActorHomeContext = {
  domainView: V6NormalizedDomainView;
  indexes: V6EntityIndexes;
  lessons: V6Lesson[];
  notifications: ReturnType<typeof selectV6NotificationsForActor>;
  messages: ReturnType<typeof selectV6MessagesForActor>;
  events: V6CalendarEvent[];
  nextEvent?: V6CalendarEvent;
  unread: number;
  homeModuleIds: Set<string>;
};

export type V6AttendanceProgress = {
  label: string;
  statusLabel: string;
  remaining: number;
  tone: V6Tone;
  complete: boolean;
  needsAction: boolean;
};

export type V6StudentFeedRow = {
  kind: "notification" | "message" | "event";
  id: string;
  title: string;
  body: string;
  meta: string;
  tone: V6Tone;
};

export type V6StudentWeekRow = {
  kind: "lesson" | "event";
  id: string;
  title: string;
  subtitle: string;
  meta?: string;
  tone: V6Tone;
};

export type V6StudentGroupRow = {
  group: V6Group;
  teacherNames: string;
};

export type V6StudentTodayLessonRow = {
  id: string;
  title: string;
  time: string;
  room: string;
  groupName?: string;
  danceStyle?: string;
  isNext: boolean;
  tone: V6Tone;
};

export type V6StudentHomeViewModel = V6ActorHomeContext & {
  todayWeekday: string;
  next?: V6Lesson;
  attendance: ReturnType<typeof selectV6AttendanceRecordsForStudent>;
  attendanceRate: number;
  studentGroupRosters: V6GroupRosterView[];
  studentGroups: V6Group[];
  studentGroupRows: V6StudentGroupRow[];
  primaryGroup?: V6Group;
  primaryTeachers: string;
  groupTasks: V6Database["tasks"];
  visibleProducts: V6Product[];
  completedTasks: number;
  membershipStatusLabel: string;
  membershipTone: V6Tone;
  feed: V6StudentFeedRow[];
  weekItems: V6StudentWeekRow[];
  todaySchedule: V6StudentTodayLessonRow[];
};

export type V6TeacherGroupRow = {
  lesson: V6Lesson;
  group?: V6Group;
  rosterSize: number;
  marked: number;
  progress: V6AttendanceProgress;
};

export type V6TeacherAttentionStudent = {
  student: V6User;
  group?: V6Group;
  absenceCount: number;
  lateCount: number;
  subtitle: string;
  meta: string;
};

export type V6TeacherGroupMessage = {
  kind: "notification" | "message";
  id: string;
  title: string;
  body: string;
  meta: string;
  tone: V6Tone;
};

export type V6TeacherHomeViewModel = V6ActorHomeContext & {
  domainView: V6NormalizedDomainView;
  teacherGroupIds: Set<string>;
  teacherGroupIdList: string[];
  teacherGroupRosters: V6GroupRosterView[];
  teacherGroups: V6Group[];
  teacherRosterByGroupId: Map<string, V6GroupRosterView>;
  next?: V6Lesson;
  nextGroup?: V6Group;
  teacherStudents: V6GroupRosterStudentView[];
  attendance: ReturnType<typeof selectV6AttendanceRecordsForGroupIds>;
  nextAttendance: ReturnType<typeof selectV6AttendanceRecordsForGroupIds>;
  nextAttendanceSummary?: ReturnType<typeof selectV6LessonAttendanceSummary>;
  nextAttendanceProgress: V6AttendanceProgress;
  nextTransition?: V6Lesson;
  nextTransitionGroup?: V6Group;
  nextTransitionTitle: string;
  nextTransitionSubtitle: string;
  nextTransitionMeta?: string;
  groupTasks: V6Database["tasks"];
  groupRows: V6TeacherGroupRow[];
  openAttendanceCount: number;
  completeAttendanceCount: number;
  attentionStudents: V6TeacherAttentionStudent[];
  groupMessages: V6TeacherGroupMessage[];
};

export type V6ManagementScheduleLessonRow = {
  lesson: V6Lesson;
  group?: V6Group;
  day: string;
  danceStyle: string;
  teacherNames: string;
  durationMinutes: number;
  endTime: string;
  tone: V6Tone;
  studentCount: number;
  status: string;
  roomName: string;
};

export type V6ManagementScheduleDay = {
  day: string;
  rows: V6ManagementScheduleLessonRow[];
  rooms: string[];
  totalStudents: number;
  isToday: boolean;
  densityLabel: string;
};

export type V6ManagementDaySummary = {
  day: string;
  lessonCount: number;
  isToday: boolean;
  firstTime?: string;
};

export type V6ManagementAttentionItem =
  | { kind: "event"; id: string; title: string; subtitle: string; meta?: string; tone: V6Tone }
  | { kind: "student"; id: string; title: string; subtitle: string; meta: string; tone: V6Tone }
  | { kind: "attendance"; id: string; title: string; subtitle: string; meta: string; tone: V6Tone }
  | { kind: "task"; id: string; title: string; subtitle: string; meta: string; tone: V6Tone };

export type V6ManagementSystemRow = {
  kind: "notification" | "message";
  id: string;
  title: string;
  subtitle: string;
  meta: string;
  tone: V6Tone;
};

export type V6ManagementRoomLoad = {
  room: string;
  lessons: V6Lesson[];
  groupCount: number;
  next?: V6Lesson;
};

export type V6ManagementActiveGroupRow = {
  group: V6Group;
  teacherNames: string;
  rosterSize: number;
};

export type V6ManagementTeachingStaffRow = {
  teacher: V6NormalizedDomainView["teachers"][number];
  subtitle: string;
  meta: string;
};

export type V6ManagementHomeViewModel = V6ActorHomeContext & {
  today: string;
  todayLessons: V6Lesson[];
  liveLesson?: V6Lesson;
  liveGroup?: V6Group;
  liveLessonTeacherNames: string;
  liveLessonSummary: string;
  liveActivitySummary: string;
  activeGroupRosters: V6GroupRosterView[];
  activeGroups: V6Group[];
  activeGroupRows: V6ManagementActiveGroupRow[];
  rosterByGroupId: Map<string, V6GroupRosterView>;
  activeGroupIds: Set<string>;
  teachers: V6NormalizedDomainView["teachers"];
  teachingStaffRows: V6ManagementTeachingStaffRow[];
  rooms: string[];
  scheduleLessonRows: V6ManagementScheduleLessonRow[];
  daySummaries: V6ManagementDaySummary[];
  scheduleDays: V6ManagementScheduleDay[];
  roomLoads: V6ManagementRoomLoad[];
  products: V6Product[];
  paidProducts: V6Product[];
  privateLessonProducts: V6Product[];
  openTasks: V6Database["tasks"];
  pendingStudents: V6User[];
  paymentsEnabled: boolean;
  attentionItems: V6ManagementAttentionItem[];
  systemRows: V6ManagementSystemRow[];
};

export function normalizeV6Weekday(value: string) {
  return value.replace(/^יום\s+/, "").trim();
}

export function currentV6HebrewWeekday() {
  return normalizeV6Weekday(new Intl.DateTimeFormat("he-IL", { weekday: "long" }).format(new Date()));
}

function timeToMinutes(time?: string) {
  const [hour, minute] = (time ?? "").split(":").map((part) => Number.parseInt(part, 10));
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return undefined;
  return hour * 60 + minute;
}

export function compareV6LessonsByWeekTime(a: V6Lesson, b: V6Lesson) {
  const dayA = V6_HEBREW_WEEKDAYS.indexOf(normalizeV6Weekday(a.weekday) as (typeof V6_HEBREW_WEEKDAYS)[number]);
  const dayB = V6_HEBREW_WEEKDAYS.indexOf(normalizeV6Weekday(b.weekday) as (typeof V6_HEBREW_WEEKDAYS)[number]);
  if (dayA !== dayB) return (dayA === -1 ? 99 : dayA) - (dayB === -1 ? 99 : dayB);
  return (timeToMinutes(a.time) ?? 0) - (timeToMinutes(b.time) ?? 0);
}

function lessonDurationMinutes(lesson: V6Lesson) {
  const timed = lesson as V6LessonWithTiming;
  if (typeof timed.durationMinutes === "number" && timed.durationMinutes > 0) return timed.durationMinutes;
  if (typeof timed.duration === "number" && timed.duration > 0) return timed.duration;

  const start = timeToMinutes(timed.time);
  const end = timeToMinutes(timed.endTime);
  if (start !== undefined && end !== undefined && end > start) return end - start;

  return 60;
}

export function formatV6LessonDuration(minutes: number) {
  if (minutes < 60) return `${minutes} דק׳`;
  if (minutes === 60) return "שעה";
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}:${String(rest).padStart(2, "0")} שעות` : `${hours} שעות`;
}

function minutesToTime(minutes: number) {
  const hour = Math.floor(minutes / 60) % 24;
  const minute = minutes % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function lessonEndTime(lesson: V6Lesson, durationMinutes: number) {
  const timed = lesson as V6LessonWithTiming;
  if (timed.endTime) return timed.endTime;
  const start = timeToMinutes(lesson.time);
  if (start === undefined) return "—";
  return minutesToTime(start + durationMinutes);
}

function estimatedLessonDurationMinutes(lesson: V6Lesson, group?: V6Group) {
  const explicitDuration = lessonDurationMinutes(lesson);
  const timed = lesson as V6LessonWithTiming;
  if (timed.durationMinutes || timed.duration || timed.endTime) return explicitDuration;

  const style = `${group?.danceStyle ?? group?.style ?? lesson.title} ${group?.ageGroup ?? ""}`;
  if (style.includes("גיל הרך")) return 45;
  if (style.includes("פלמנקו") || style.includes("רפרטואר")) return 90;
  if (style.includes("קלאסי") || style.includes("פוינט")) return 75;
  if (style.includes("תיכון") || style.includes("מבוגרים")) return 90;
  return 60;
}

function toneForDanceStyle(style?: string): V6Tone {
  if (!style) return "management";
  if (style.includes("פלמנקו")) return "flamenco";
  if (style.includes("היפ")) return "hiphop";
  if (style.includes("מודרני")) return "modern";
  if (style.includes("קלאסי")) return "classic";
  if (style.includes("פוינט")) return "pointe";
  if (style.includes("רפרטואר")) return "repertoire";
  return "studio";
}

function lessonOperationalStatus(input: { isToday: boolean; teacherNames: string; rosterSize: number }) {
  const { isToday, teacherNames, rosterSize } = input;
  if (!teacherNames) return "חסר צוות";
  if (!rosterSize) return "חסר רוסטר";
  if (isToday) return "היום";
  return "הכנה לעריכה";
}

export function v6LessonStatusTone(status: string): V6Tone {
  if (status === "חסר צוות" || status === "חסר רוסטר") return "urgent";
  if (status === "היום") return "success";
  return "management";
}

export function isNonEmptyV6Text(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function compactV6Text(values: Array<string | null | undefined>, separator = " · ") {
  return values.filter(isNonEmptyV6Text).map((value) => value.trim()).join(separator);
}

export function uniqueV6Text(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.filter(isNonEmptyV6Text).map((value) => value.trim())));
}

export function selectV6EntityIndexes(db: V6Database): V6EntityIndexes {
  return {
    usersById: new Map(db.users.map((user) => [user.id, user])),
    groupsById: new Map(db.groups.map((group) => [group.id, group])),
    lessonsById: new Map(db.lessons.map((lesson) => [lesson.id, lesson]))
  };
}

export function selectV6ActorHomeContext(db: V6Database, actor: V6User, lessons: V6Lesson[] = selectV6LessonsForActor(db, actor)): V6ActorHomeContext {
  const domainView = buildV6DomainView(db);
  const events = selectV6UpcomingEvents(db, actor);

  return {
    domainView,
    indexes: selectV6EntityIndexes(db),
    lessons,
    notifications: selectV6NotificationsForActor(db, actor),
    messages: selectV6MessagesForActor(db, actor),
    events,
    nextEvent: events[0],
    unread: selectV6UnreadCount(db, actor),
    homeModuleIds: new Set(modulesForRole(actor.role).map((module) => module.id))
  };
}

export function selectV6TeacherNamesForGroup(dbUsers: V6User[], teacherIds: string[]) {
  const teacherIdSet = new Set((Array.isArray(teacherIds) ? teacherIds : []).filter(isNonEmptyV6Text));
  if (!teacherIdSet.size) return "";

  return (Array.isArray(dbUsers) ? dbUsers : [])
    .filter((teacher) => teacherIdSet.has(teacher.id))
    .map((teacher) => teacher.name)
    .filter(isNonEmptyV6Text)
    .join(", ");
}

export function selectV6TeachersForGroup(dbUsers: V6User[], teacherIds: string[]) {
  return selectV6TeacherNamesForGroup(dbUsers, teacherIds);
}

export function selectV6StudentStatusLabel(status: V6User["status"]) {
  if (status === "paused") return "בהפסקה";
  if (status === "pending") return "ממתין לאישור";
  if (status === "inactive") return "לא פעיל";
  return "פעילה";
}

function compactV6GroupSchedule(group?: V6Group, lesson?: V6Lesson) {
  return compactV6Text([lesson?.weekday ?? group?.schedule, lesson?.time, lesson?.room ?? group?.location]);
}

function selectV6TeacherAttentionMeta(input: { status?: V6User["status"]; absenceCount: number; lateCount: number }) {
  const { status, absenceCount, lateCount } = input;
  if (status && status !== "active") return selectV6StudentStatusLabel(status);
  if (absenceCount) return `${absenceCount} חיסורים`;
  if (lateCount) return `${lateCount} איחורים`;
  return "לבדיקה";
}

export function selectV6AttendanceProgress(marked: number, total: number): V6AttendanceProgress {
  const safeTotal = Math.max(total, 0);
  if (!safeTotal) {
    return { label: "אין רוסטר", statusLabel: "חסר רוסטר", remaining: 0, tone: "urgent", complete: false, needsAction: true };
  }

  const safeMarked = Math.min(Math.max(marked, 0), safeTotal);
  const remaining = Math.max(safeTotal - safeMarked, 0);

  if (remaining === 0) {
    return { label: `${safeMarked}/${safeTotal}`, statusLabel: "הושלם", remaining, tone: "success", complete: true, needsAction: false };
  }

  if (safeMarked > 0) {
    return { label: `${safeMarked}/${safeTotal}`, statusLabel: `${remaining} נשארו`, remaining, tone: "urgent", complete: false, needsAction: true };
  }

  return { label: `0/${safeTotal}`, statusLabel: "טרם סומן", remaining, tone: "studio", complete: false, needsAction: true };
}

export function selectV6ProductPriceLabel(product: V6Product) {
  if (product.priceMode === "free") return "ללא עלות";
  if (product.priceMode === "request") return "לפי עדכון הסטודיו";
  return `${product.price} ₪`;
}

export function selectV6PaymentModeLabel(product: V6Product) {
  if (product.priceMode === "free") return "ללא גבייה";
  if (product.priceMode === "request") return "לפי בקשה";
  return `${product.price} ₪`;
}

export function selectV6StudentHomeViewModel(db: V6Database, user: V6User): V6StudentHomeViewModel {
  const lessons = selectV6LessonsForActor(db, user);
  const context = selectV6ActorHomeContext(db, user, lessons);
  const { domainView, notifications, messages, events, homeModuleIds } = context;
  const next = lessons[0];
  const attendance = selectV6AttendanceRecordsForStudent(domainView, user.id);
  const attendanceRate = selectV6AttendanceRateFromRecords(attendance);
  const studentGroupRosters = selectV6GroupRosterViews(db, user.groupIds, domainView);
  const studentGroups = studentGroupRosters.flatMap((roster) => roster.v6Group ?? []);
  const studentGroupRows = studentGroups.map((group) => ({ group, teacherNames: selectV6TeacherNamesForGroup(db.users, group.teacherIds) }));
  const primaryGroup = next ? studentGroups.find((group) => group.id === next.groupId) : studentGroups[0];
  const primaryTeachers = primaryGroup ? selectV6TeacherNamesForGroup(db.users, primaryGroup.teacherIds) : "";
  const groupTasks = db.tasks.filter((task) => user.groupIds.includes(task.groupId));
  const visibleProducts = homeModuleIds.has("shop") && db.featureFlags.shop !== false
    ? selectV6ShopProductsForActor(db, user, "הכול").filter((product) => product.type !== "private_lesson" && !product.category.includes("שיעורים")).slice(0, 2)
    : [];
  const completedTasks = groupTasks.filter((task) => task.doneByUserIds.includes(user.id)).length;
  const membershipStatusLabel = selectV6StudentStatusLabel(user.status);
  const membershipTone: V6Tone = user.status === "paused" || user.status === "inactive" ? "urgent" : "studio";
  const feed: V6StudentFeedRow[] = [
    ...notifications.slice(0, 2).map((item) => ({ kind: "notification" as const, id: item.id, title: item.title, body: item.body, meta: item.readBy.includes(user.id) ? "נקרא" : "חדש", tone: item.readBy.includes(user.id) ? "studio" as V6Tone : "urgent" as V6Tone })),
    ...messages.slice(0, 2).map((item) => ({ kind: "message" as const, id: item.id, title: item.title, body: item.body, meta: "סטודיו", tone: "modern" as V6Tone })),
    ...events.slice(0, 1).map((item) => ({ kind: "event" as const, id: item.id, title: item.title, body: item.parentInstructions ?? item.adultInstructions ?? item.location ?? "בלוח הסטודיו.", meta: item.startTime ?? item.date, tone: item.status === "needs_attention" ? "urgent" as V6Tone : "management" as V6Tone }))
  ].slice(0, 4);
  const todayWeekday = currentV6HebrewWeekday();
  const todaySchedule: V6StudentTodayLessonRow[] = lessons
    .filter((lesson) => normalizeV6Weekday(lesson.weekday) === todayWeekday)
    .map((lesson) => {
      const group = studentGroups.find((item) => item.id === lesson.groupId);
      return {
        id: lesson.id,
        title: group?.name ?? lesson.title,
        time: lesson.time,
        room: lesson.room,
        groupName: group?.name,
        danceStyle: group?.danceStyle ?? group?.style,
        isNext: next?.id === lesson.id,
        tone: "classic" as V6Tone
      };
    });
  const weekItems: V6StudentWeekRow[] = [
    ...lessons
      .filter((lesson) => normalizeV6Weekday(lesson.weekday) !== todayWeekday)
      .slice(0, 4)
      .map((lesson) => {
      const group = studentGroups.find((item) => item.id === lesson.groupId);
      return {
        kind: "lesson" as const,
        id: lesson.id,
        title: lesson.title,
        subtitle: `${lesson.weekday} · ${lesson.room}${group?.schedule ? ` · ${group.schedule}` : ""}`,
        meta: lesson.time,
        tone: "hiphop" as V6Tone
      };
    }),
    ...events.slice(0, 2).map((event) => ({
      kind: "event" as const,
      id: event.id,
      title: event.title,
      subtitle: event.location ?? "בלוח הסטודיו",
      meta: event.startTime ?? event.date,
      tone: event.status === "needs_attention" ? "urgent" as V6Tone : "management" as V6Tone
    }))
  ].slice(0, 5);

  return {
    ...context,
    todayWeekday,
    next,
    attendance,
    attendanceRate,
    studentGroupRosters,
    studentGroups,
    studentGroupRows,
    primaryGroup,
    primaryTeachers,
    groupTasks,
    visibleProducts,
    completedTasks,
    membershipStatusLabel,
    membershipTone,
    feed,
    weekItems,
    todaySchedule
  };
}

export function selectV6TeacherHomeViewModel(db: V6Database, user: V6User): V6TeacherHomeViewModel {
  const domainView = buildV6DomainView(db);
  const teacherGroupIds = selectV6TeacherGroupIds(domainView, user);
  const teacherGroupIdList = Array.from(teacherGroupIds);
  const lessons = selectV6LessonsForActor(db, { ...user, groupIds: teacherGroupIdList });
  const context = selectV6ActorHomeContext(db, user, lessons);
  const { notifications, messages } = context;
  const teacherGroupRosters = selectV6GroupRosterViews(db, teacherGroupIdList, domainView);
  const teacherGroups = teacherGroupRosters.flatMap((roster) => roster.v6Group ?? []);
  const teacherRosterByGroupId = new Map(teacherGroupRosters.map((roster) => [roster.group.id, roster]));
  const next = lessons[0];
  const nextGroup = next ? teacherGroups.find((group) => group.id === next.groupId) : undefined;
  const teacherStudents = selectV6RosterStudentsForGroupIds(db, teacherGroupIdList, domainView);
  const attendance = selectV6AttendanceRecordsForGroupIds(domainView, teacherGroupIds);
  const nextAttendance = next ? attendance.filter((record) => record.lessonOccurrenceId === next.id && record.groupId === next.groupId) : [];
  const nextAttendanceSummary = next ? selectV6LessonAttendanceSummary(db, domainView, next.id, next.groupId) : undefined;
  const nextAttendanceProgress = selectV6AttendanceProgress(nextAttendance.length, nextAttendanceSummary?.totalStudents ?? 0);
  const nextTransition = next && lessons.length > 1 ? lessons[1] : undefined;
  const nextTransitionGroup = nextTransition ? db.groups.find((group) => group.id === nextTransition.groupId) : undefined;
  const nextTransitionTitle = nextTransition ? nextTransition.title : next ? "להישאר באולפן" : "אין שיעור קרוב";
  const nextTransitionSubtitle = nextTransition ? compactV6GroupSchedule(nextTransitionGroup, nextTransition) : next ? `${next.room} · ${next.time}` : "כשיהיה שיעור נוסף, המעבר יופיע כאן";
  const nextTransitionMeta = nextTransitionGroup?.location ?? nextTransition?.room ?? next?.room;
  const groupTasks = db.tasks.filter((task) => teacherGroupIds.has(task.groupId));
  const groupRows = lessons.slice(0, 4).map((lesson) => {
    const group = teacherGroups.find((item) => item.id === lesson.groupId);
    const summary = selectV6LessonAttendanceSummary(db, domainView, lesson.id, lesson.groupId);
    const rosterSize = teacherRosterByGroupId.get(lesson.groupId)?.rosterSize ?? summary.totalStudents;
    const marked = summary.markedCount;
    return { lesson, group, rosterSize, marked, progress: selectV6AttendanceProgress(marked, rosterSize) };
  });
  const openAttendanceCount = groupRows.filter((item) => item.progress.needsAction).length;
  const completeAttendanceCount = groupRows.filter((item) => item.progress.complete).length;
  const attentionStudents = teacherStudents
    .map(({ student, user: studentUser }) => {
      const studentAttendance = attendance.filter((record) => record.studentId === student.id);
      const absenceCount = studentAttendance.filter((record) => record.status === "absent" || record.status === "missing").length;
      const lateCount = studentAttendance.filter((record) => record.status === "late").length;
      const group = teacherGroups.find((item) => student.groupIds.includes(item.id));
      const needsAttention = student.status === "paused" || student.status === "inactive" || student.status === "pending" || absenceCount > 0 || lateCount > 0;
      const subtitle = [group?.name, studentUser.status && studentUser.status !== "active" ? selectV6StudentStatusLabel(studentUser.status) : undefined].filter(Boolean).join(" · ");
      const meta = selectV6TeacherAttentionMeta({ status: studentUser.status, absenceCount, lateCount });
      return { student: studentUser, group, absenceCount, lateCount, needsAttention, subtitle, meta };
    })
    .filter((item) => item.needsAttention)
    .slice(0, 3);
  const groupMessages: V6TeacherGroupMessage[] = [
    ...notifications.slice(0, 2).map((item) => ({ kind: "notification" as const, id: item.id, title: item.title, body: item.body, meta: item.readBy.includes(user.id) ? "נקרא" : "חדש", tone: item.readBy.includes(user.id) ? "studio" as V6Tone : "urgent" as V6Tone })),
    ...messages.slice(0, 2).map((item) => {
      const group = item.groupId ? teacherGroups.find((groupItem) => groupItem.id === item.groupId) : undefined;
      return { kind: "message" as const, id: item.id, title: item.title, body: item.body, meta: group?.name ?? "כללי", tone: "modern" as V6Tone };
    })
  ].slice(0, 4);

  return {
    ...context,
    domainView,
    teacherGroupIds,
    teacherGroupIdList,
    teacherGroupRosters,
    teacherGroups,
    teacherRosterByGroupId,
    next,
    nextGroup,
    teacherStudents,
    attendance,
    nextAttendance,
    nextAttendanceSummary,
    nextAttendanceProgress,
    nextTransition,
    nextTransitionGroup,
    nextTransitionTitle,
    nextTransitionSubtitle,
    nextTransitionMeta,
    groupTasks,
    groupRows,
    openAttendanceCount,
    completeAttendanceCount,
    attentionStudents,
    groupMessages
  };
}

export function selectV6ManagementHomeViewModel(db: V6Database, user: V6User, today: string): V6ManagementHomeViewModel {
  const lessons = [...selectV6LessonsForActor(db, user)].sort(compareV6LessonsByWeekTime);
  const context = selectV6ActorHomeContext(db, user, lessons);
  const { domainView, indexes, notifications, messages, events } = context;
  const { groupsById, usersById } = indexes;
  const attendance = domainView.attendanceRecords;
  const todayLessons = lessons.filter((lesson) => normalizeV6Weekday(lesson.weekday) === today);
  const liveLesson = todayLessons[0] ?? lessons[0];
  const liveGroup = liveLesson ? groupsById.get(liveLesson.groupId) : undefined;
  const liveLessonTeacherNames = liveGroup ? selectV6TeacherNamesForGroup(db.users, liveGroup.teacherIds) : "";
  const liveLessonSummary = liveLesson ? compactV6Text([liveLesson.weekday, liveLesson.room, liveLessonTeacherNames]) : "";
  const liveActivitySummary = liveLesson ? compactV6Text([liveLesson.title, liveLessonTeacherNames]) : "";
  const activeGroupRosters = selectV6GroupRosterViews(db, undefined, domainView).filter((roster) => roster.rosterSize || lessons.some((lesson) => lesson.groupId === roster.group.id));
  const activeGroups = activeGroupRosters.flatMap((roster) => roster.v6Group ?? []);
  const rosterByGroupId = new Map(activeGroupRosters.map((roster) => [roster.group.id, roster]));
  const activeGroupIds = new Set(activeGroupRosters.map((roster) => roster.group.id));
  const activeGroupRows = activeGroups.map((group) => ({
    group,
    teacherNames: selectV6TeacherNamesForGroup(db.users, group.teacherIds),
    rosterSize: rosterByGroupId.get(group.id)?.rosterSize ?? group.studentIds.length
  }));
  const teacherIds = new Set(activeGroups.flatMap((group) => group.teacherIds));
  const teachers = domainView.teachers.filter((item) => teacherIds.has(item.id));
  const teachingStaffRows = teachers.map((teacher) => {
    const teacherGroups = activeGroups.filter((group) => group.teacherIds.includes(teacher.id));
    const teacherRooms = uniqueV6Text(teacherGroups.map((group) => group.location));
    return {
      teacher,
      subtitle: teacher.responsibility ?? compactV6Text(teacherGroups.map((group) => group.name).slice(0, 2)),
      meta: teacherRooms[0] ?? `${teacherGroups.length} קבוצות`
    };
  });
  const rooms = domainView.rooms.map((room) => room.name);
  const weeklyScheduleViewsByLessonId = new Map(selectV6WeeklyScheduleViews(db, lessons).map((view) => [view.lesson.id, view]));
  const scheduleLessonRows = lessons.map((lesson): V6ManagementScheduleLessonRow => {
    const scheduleView = weeklyScheduleViewsByLessonId.get(lesson.id);
    const group = scheduleView?.group ?? groupsById.get(lesson.groupId);
    const danceStyle = group?.danceStyle ?? group?.style ?? scheduleView?.schedule.label ?? lesson.title;
    const teacherNames = scheduleView?.teacherNames ?? selectV6TeacherNamesForGroup(db.users, group?.teacherIds ?? []);
    const durationMinutes = estimatedLessonDurationMinutes(lesson, group);
    const day = scheduleView?.dayLabel ?? normalizeV6Weekday(lesson.weekday);
    const studentCount = scheduleView?.studentIds.length ?? rosterByGroupId.get(lesson.groupId)?.rosterSize ?? group?.studentIds.length ?? 0;

    return {
      lesson,
      group,
      day,
      danceStyle,
      teacherNames,
      durationMinutes,
      endTime: lessonEndTime(lesson, durationMinutes),
      tone: toneForDanceStyle(danceStyle),
      studentCount,
      status: lessonOperationalStatus({ isToday: day === today, teacherNames, rosterSize: studentCount }),
      roomName: scheduleView?.roomName ?? lesson.room
    };
  });
  const daySummaries = V6_HEBREW_WEEKDAYS.map((day) => {
    const dayRows = scheduleLessonRows.filter((row) => row.day === day);
    return {
      day,
      lessonCount: dayRows.length,
      isToday: day === today,
      firstTime: dayRows[0]?.lesson.time
    };
  }).filter((day) => day.lessonCount > 0 || day.isToday);
  const scheduleDays = V6_HEBREW_WEEKDAYS
    .map((day) => {
      const dayRows = scheduleLessonRows.filter((row) => row.day === day);
      const dayRooms = uniqueV6Text(dayRows.map((row) => row.roomName)).map((room) => {
        const roomLessonCount = dayRows.filter((row) => row.roomName === room).length;
        return roomLessonCount > 1 ? `${room} · ${roomLessonCount}` : room;
      });
      const totalStudents = dayRows.reduce((sum, row) => sum + row.studentCount, 0);
      const timeBuckets = dayRows.reduce<Record<string, number>>((buckets, row) => {
        const key = `${row.lesson.time}-${row.lesson.room}`;
        buckets[key] = (buckets[key] ?? 0) + 1;
        return buckets;
      }, {});
      const denseSlotCount = Object.values(timeBuckets).filter((count) => count > 1).length;
      const densityLabel = dayRows.length > 5
        ? "יום צפוף"
        : denseSlotCount
          ? "שעות חופפות"
          : "זרימה רגועה";
      return { day, rows: dayRows, rooms: dayRooms, totalStudents, isToday: day === today, densityLabel };
    })
    .filter((day) => day.rows.length > 0);
  const roomLoads = rooms.map((room) => {
    const roomLessons = lessons.filter((lesson) => lesson.room === room || groupsById.get(lesson.groupId)?.location === room);
    const roomGroups = new Set(roomLessons.map((lesson) => lesson.groupId));
    const nextRoomLesson = todayLessons.find((lesson) => lesson.room === room) ?? roomLessons[0];
    return { room, lessons: roomLessons, groupCount: roomGroups.size, next: nextRoomLesson };
  });
  const products = selectV6ShopProductsForActor(db, user, "הכול");
  const paidProducts = products.filter((product) => product.priceMode !== "free" && product.type !== "private_lesson");
  const privateLessonProducts = products.filter((product) => product.type === "private_lesson" || product.category.includes("שיעורים"));
  const openTasks = db.tasks.filter((task) => activeGroupIds.has(task.groupId) && task.doneByUserIds.length < (rosterByGroupId.get(task.groupId)?.rosterSize ?? groupsById.get(task.groupId)?.studentIds.length ?? 1));
  const pendingStudents = db.users.filter((item) => item.role === "student" && item.status && item.status !== "active");
  const paymentsEnabled = db.featureFlags.payments === true;
  const attendanceIssues = attendance.filter((record) => record.status === "absent" || record.status === "late" || record.status === "missing");
  const attentionEvents = events.filter((event) => event.status === "needs_attention");
  const attentionItems: V6ManagementAttentionItem[] = [
    ...attentionEvents.slice(0, 2).map((event) => ({ kind: "event" as const, id: event.id, title: event.title, subtitle: event.location ?? "אירוע דורש בדיקה", meta: event.startTime ?? event.date, tone: "urgent" as const })),
    ...pendingStudents.slice(0, 2).map((student) => ({ kind: "student" as const, id: student.id, title: student.name, subtitle: selectV6StudentStatusLabel(student.status), meta: "תלמידה", tone: "urgent" as const })),
    ...attendanceIssues.slice(0, 2).map((record) => {
      const student = usersById.get(record.studentId);
      const group = groupsById.get(record.groupId);
      return { kind: "attendance" as const, id: record.id, title: student?.name ?? "סימון נוכחות", subtitle: group?.name ?? "רוסטר", meta: v6AttendanceStatusLabel(record.status), tone: "urgent" as const };
    }),
    ...openTasks.slice(0, 2).map((task) => ({ kind: "task" as const, id: task.id, title: task.title, subtitle: groupsById.get(task.groupId)?.name ?? "משימה", meta: "פתוח", tone: "repertoire" as const }))
  ].slice(0, 5);
  const systemRows: V6ManagementSystemRow[] = [
    ...notifications.slice(0, 2).map((item) => ({ kind: "notification" as const, id: item.id, title: item.title, subtitle: item.body, meta: item.readBy.includes(user.id) ? "נקרא" : "חדש", tone: item.readBy.includes(user.id) ? "studio" as const : "urgent" as const })),
    ...messages.slice(0, 3).map((item) => ({ kind: "message" as const, id: item.id, title: item.title, subtitle: item.body, meta: item.groupId ? groupsById.get(item.groupId)?.name ?? "קבוצה" : "כללי", tone: "modern" as const }))
  ].slice(0, 5);

  return {
    ...context,
    today,
    todayLessons,
    liveLesson,
    liveGroup,
    liveLessonTeacherNames,
    liveLessonSummary,
    liveActivitySummary,
    activeGroupRosters,
    activeGroups,
    activeGroupRows,
    rosterByGroupId,
    activeGroupIds,
    teachers,
    teachingStaffRows,
    rooms,
    scheduleLessonRows,
    daySummaries,
    scheduleDays,
    roomLoads,
    products,
    paidProducts,
    privateLessonProducts,
    openTasks,
    pendingStudents,
    paymentsEnabled,
    attentionItems,
    systemRows
  };
}
