import type {
  AttendanceRecord,
  AttendanceStatus,
  Group,
  GroupId,
  LessonOccurrence,
  Student,
  StudentId,
  StudioRoom,
  StudioRoomId,
  Teacher,
  TeacherId,
  WeekdayKey,
  WeeklyGroupSchedule,
  WeeklyGroupScheduleId
} from "@/lib/domains/core/domain-types";
import type { V6AttendanceRecord, V6AttendanceStatus, V6Database, V6Group, V6Lesson, V6User } from "@/lib/v6/types";

const V6_ADAPTER_DATE = "1970-01-01";
const V6_ADAPTER_TIMESTAMP = "1970-01-01T00:00:00.000Z";

const HEBREW_WEEKDAY_TO_KEY: Record<string, WeekdayKey> = {
  "ראשון": "sun",
  "שני": "mon",
  "שלישי": "tue",
  "רביעי": "wed",
  "חמישי": "thu",
  "שישי": "fri",
  "שבת": "sat"
};

export const WEEKDAY_LABEL_BY_KEY: Record<WeekdayKey, string> = {
  sun: "ראשון",
  mon: "שני",
  tue: "שלישי",
  wed: "רביעי",
  thu: "חמישי",
  fri: "שישי",
  sat: "שבת"
};

export type V6NormalizedDomainView = {
  students: Student[];
  groups: Group[];
  teachers: Teacher[];
  rooms: StudioRoom[];
  weeklySchedules: WeeklyGroupSchedule[];
  lessonOccurrences: LessonOccurrence[];
  attendanceRecords: AttendanceRecord[];
  studentsById: Map<StudentId, Student>;
  groupsById: Map<GroupId, Group>;
  teachersById: Map<TeacherId, Teacher>;
  roomsById: Map<StudioRoomId, StudioRoom>;
  weeklySchedulesByLessonId: Map<string, WeeklyGroupSchedule>;
};

export type V6GroupRosterStudentView = {
  student: Student;
  user: V6User;
};

export type V6GroupRosterView = {
  group: Group;
  v6Group?: V6Group;
  studentIds: StudentId[];
  students: V6GroupRosterStudentView[];
  rosterSize: number;
};

export type V6AttendanceSummary = {
  totalStudents: number;
  markedCount: number;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  excusedCount: number;
  missingCount: number;
  remainingCount: number;
  complete: boolean;
  needsAction: boolean;
};

export type V6WeeklyScheduleView = {
  lesson: V6Lesson;
  group?: V6Group;
  schedule: WeeklyGroupSchedule;
  room?: StudioRoom;
  teacherIds: TeacherId[];
  teacherNames: string;
  studentIds: string[];
  dayLabel: string;
  roomName: string;
};

function normalizeHebrewWeekday(value: string) {
  return value.replace(/^יום\s+/, "").trim();
}

function weekdayKeyFromV6(value: string): WeekdayKey {
  return HEBREW_WEEKDAY_TO_KEY[normalizeHebrewWeekday(value)] ?? "sun";
}

function scopedFallback(db: V6Database, studioId?: string, academyId?: string) {
  const studio = db.studios.find((item) => item.id === studioId || item.id === academyId) ?? db.studios[0];
  return {
    studioId: studioId ?? studio?.id ?? "studio",
    academyId,
    createdAt: studio?.createdAt ?? V6_ADAPTER_TIMESTAMP,
    updatedAt: studio?.updatedAt
  };
}

function uniqueById<T extends { id: string }>(items: T[]) {
  return Array.from(new Map(items.map((item) => [item.id, item])).values());
}

function uniqueText(values: Array<string | undefined>) {
  return Array.from(new Set(values.map((value) => value?.trim()).filter(Boolean) as string[]));
}

function sortByDisplayName<T extends { displayName: string }>(items: T[]) {
  return [...items].sort((a, b) => a.displayName.localeCompare(b.displayName, "he", { numeric: true }));
}

function sortRosterStudents(items: V6GroupRosterStudentView[]) {
  return [...items].sort((a, b) => a.student.displayName.localeCompare(b.student.displayName, "he", { numeric: true }));
}

export function v6RoomIdFromName(roomName: string): StudioRoomId {
  return `v6-room:${encodeURIComponent(roomName.trim())}`;
}

function weeklyScheduleIdFromLesson(lessonId: string): WeeklyGroupScheduleId {
  return `v6-weekly-schedule:${lessonId}`;
}

function dateTimeFromDateAndTime(date: string, time?: string) {
  return `${date}T${time && /^\d{1,2}:\d{2}$/.test(time) ? time.padStart(5, "0") : "00:00"}:00.000Z`;
}

function statusFromV6User(user: V6User) {
  return user.status ?? (user.active ? "active" : "inactive");
}

export const V6_ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, string> = {
  present: "נוכחת",
  absent: "חוסר",
  late: "איחור",
  excused: "מוצדק",
  missing: "חוסר"
};

export function v6AttendanceStatusToDomainStatus(status: V6AttendanceStatus): AttendanceStatus {
  return status;
}

export function v6AttendanceStatusLabel(status: AttendanceStatus) {
  return V6_ATTENDANCE_STATUS_LABELS[status];
}

export function selectNormalizedV6Students(db: V6Database): Student[] {
  return sortByDisplayName(uniqueById(
    db.users
      .filter((user) => user.role === "student")
      .map((user) => {
        const groupIds = uniqueText([
          ...user.groupIds,
          ...db.groups.filter((group) => group.studentIds.includes(user.id)).map((group) => group.id)
        ]);
        const parentIds = uniqueText([
          ...(user.linkedParentIds ?? []),
          ...db.users.filter((parent) => parent.role === "parent" && parent.linkedStudentIds.includes(user.id)).map((parent) => parent.id)
        ]);
        const primaryTeacherIds = uniqueText(
          db.groups
            .filter((group) => groupIds.includes(group.id))
            .flatMap((group) => group.teacherIds)
        );

        return {
          id: user.id,
          userId: user.id,
          displayName: user.name,
          status: statusFromV6User(user),
          parentIds,
          groupIds,
          primaryTeacherIds,
          ageGroupId: user.ageGroup,
          danceStyleIds: user.danceStyleIds ?? [],
          communicationMode: db.groups.find((group) => groupIds.includes(group.id))?.communicationMode,
          ...scopedFallback(db, user.studioId, user.academyId)
        };
      })
  ));
}

export function selectNormalizedV6Teachers(db: V6Database): Teacher[] {
  return uniqueById(
    db.users
      .filter((user) => user.role === "teacher")
      .map((user) => {
        const groupIds = uniqueText([
          ...user.groupIds,
          ...db.groups.filter((group) => group.teacherIds.includes(user.id)).map((group) => group.id)
        ]);

        return {
          id: user.id,
          userId: user.id,
          displayName: user.name,
          status: statusFromV6User(user),
          groupIds,
          danceStyleIds: user.danceStyleIds ?? [],
          privateLessonEnabled: user.privateLessonEnabled,
          responsibility: user.responsibility,
          ...scopedFallback(db, user.studioId, user.academyId)
        };
      })
  );
}

export function selectNormalizedV6Rooms(db: V6Database): StudioRoom[] {
  return uniqueText([
    ...db.lessons.map((lesson) => lesson.room),
    ...db.groups.map((group) => group.location)
  ]).map((roomName) => ({
    id: v6RoomIdFromName(roomName),
    name: roomName,
    active: true,
    ...scopedFallback(db, db.lessons.find((lesson) => lesson.room === roomName)?.studioId ?? db.groups.find((group) => group.location === roomName)?.studioId)
  }));
}

export function selectNormalizedV6WeeklySchedules(db: V6Database): WeeklyGroupSchedule[] {
  return uniqueById(
    db.lessons.map((lesson) => ({
      id: weeklyScheduleIdFromLesson(lesson.id),
      groupId: lesson.groupId,
      weekday: weekdayKeyFromV6(lesson.weekday),
      startTime: lesson.time,
      roomId: v6RoomIdFromName(lesson.room),
      teacherIds: db.groups.find((group) => group.id === lesson.groupId)?.teacherIds ?? [],
      status: "active",
      label: lesson.title,
      ...scopedFallback(db, lesson.studioId, lesson.academyId)
    }))
  );
}

export function selectNormalizedV6Groups(db: V6Database): Group[] {
  const lessonsByGroupId = new Map<string, V6Lesson[]>();
  db.lessons.forEach((lesson) => {
    lessonsByGroupId.set(lesson.groupId, [...(lessonsByGroupId.get(lesson.groupId) ?? []), lesson]);
  });

  return uniqueById(
    db.groups.map((group) => {
      const lessons = lessonsByGroupId.get(group.id) ?? [];
      const defaultRoomName = group.location ?? lessons[0]?.room;
      const teacherIds = uniqueText([
        ...group.teacherIds,
        ...db.users.filter((user) => user.role === "teacher" && user.groupIds.includes(group.id)).map((user) => user.id)
      ]);
      const studentIds = uniqueText([
        ...group.studentIds,
        ...db.users.filter((user) => user.role === "student" && user.groupIds.includes(group.id)).map((user) => user.id)
      ]);

      return {
        id: group.id,
        name: group.name,
        status: "active",
        ageGroupId: group.ageGroupId,
        danceStyleId: group.danceStyleId,
        teacherIds,
        studentIds,
        defaultRoomId: defaultRoomName ? v6RoomIdFromName(defaultRoomName) : undefined,
        weeklyScheduleIds: lessons.map((lesson) => weeklyScheduleIdFromLesson(lesson.id)),
        communicationMode: group.communicationMode ?? "mixed",
        parentVisible: group.parentVisibility ?? true,
        notes: group.notes,
        ...scopedFallback(db, group.studioId, group.academyId)
      };
    })
  );
}

export function selectNormalizedV6LessonOccurrences(db: V6Database): LessonOccurrence[] {
  return uniqueById(
    db.lessons.map((lesson) => ({
      id: lesson.id,
      groupId: lesson.groupId,
      weeklyScheduleId: weeklyScheduleIdFromLesson(lesson.id),
      date: V6_ADAPTER_DATE,
      startAt: dateTimeFromDateAndTime(V6_ADAPTER_DATE, lesson.time),
      roomId: v6RoomIdFromName(lesson.room),
      teacherIds: db.groups.find((group) => group.id === lesson.groupId)?.teacherIds ?? [],
      status: "scheduled",
      source: "weekly_schedule",
      ...scopedFallback(db, lesson.studioId, lesson.academyId)
    }))
  );
}

export function selectNormalizedV6AttendanceRecords(db: V6Database): AttendanceRecord[] {
  return uniqueById(
    db.attendance
      .filter((record) => Boolean(record.groupId))
      .map((record) => ({
        id: record.id,
        lessonOccurrenceId: record.lessonId,
        studentId: record.studentId,
        groupId: record.groupId as GroupId,
        status: v6AttendanceStatusToDomainStatus(record.status),
        note: record.note,
        markedByUserId: record.markedByUserId,
        markedAt: record.savedAt ?? record.updatedAt ?? record.createdAt,
        ...scopedFallback(db, record.studioId, record.academyId),
        createdAt: record.createdAt,
        updatedAt: record.updatedAt
      }))
  );
}

export function buildV6DomainView(db: V6Database): V6NormalizedDomainView {
  const students = selectNormalizedV6Students(db);
  const groups = selectNormalizedV6Groups(db);
  const teachers = selectNormalizedV6Teachers(db);
  const rooms = selectNormalizedV6Rooms(db);
  const weeklySchedules = selectNormalizedV6WeeklySchedules(db);
  const lessonOccurrences = selectNormalizedV6LessonOccurrences(db);
  const attendanceRecords = selectNormalizedV6AttendanceRecords(db);

  return {
    students,
    groups,
    teachers,
    rooms,
    weeklySchedules,
    lessonOccurrences,
    attendanceRecords,
    studentsById: new Map(students.map((student) => [student.id, student])),
    groupsById: new Map(groups.map((group) => [group.id, group])),
    teachersById: new Map(teachers.map((teacher) => [teacher.id, teacher])),
    roomsById: new Map(rooms.map((room) => [room.id, room])),
    weeklySchedulesByLessonId: new Map(weeklySchedules.map((schedule) => [schedule.id.replace("v6-weekly-schedule:", ""), schedule]))
  };
}

export function selectV6GroupRosterView(db: V6Database, groupId: GroupId, domainView: V6NormalizedDomainView = buildV6DomainView(db)): V6GroupRosterView | undefined {
  const group = domainView.groupsById.get(groupId);
  if (!group) return undefined;

  const v6Group = db.groups.find((item) => item.id === group.id);
  const rosterStudentIds = uniqueText([
    ...group.studentIds,
    ...domainView.students.filter((student) => student.groupIds.includes(group.id)).map((student) => student.id)
  ]);
  const usersById = new Map(db.users.map((user) => [user.id, user]));
  const students = sortRosterStudents(
    rosterStudentIds.flatMap((studentId) => {
      const student = domainView.studentsById.get(studentId);
      const user = usersById.get(studentId);
      return student && user?.role === "student" ? [{ student, user }] : [];
    })
  );

  return {
    group,
    v6Group,
    studentIds: students.map((item) => item.student.id),
    students,
    rosterSize: students.length
  };
}

export function selectV6GroupRosterViews(db: V6Database, groupIds?: Iterable<GroupId>, domainView: V6NormalizedDomainView = buildV6DomainView(db)): V6GroupRosterView[] {
  const allowedGroupIds = groupIds ? new Set(groupIds) : undefined;
  return domainView.groups
    .filter((group) => !allowedGroupIds || allowedGroupIds.has(group.id))
    .flatMap((group) => selectV6GroupRosterView(db, group.id, domainView) ?? []);
}

export function selectV6RosterStudentsForGroupIds(db: V6Database, groupIds: Iterable<GroupId>, domainView: V6NormalizedDomainView = buildV6DomainView(db)): V6GroupRosterStudentView[] {
  const studentsById = new Map<StudentId, V6GroupRosterStudentView>();
  selectV6GroupRosterViews(db, groupIds, domainView)
    .flatMap((roster) => roster.students)
    .forEach((student) => {
      if (!studentsById.has(student.student.id)) studentsById.set(student.student.id, student);
    });

  return sortRosterStudents(Array.from(studentsById.values()));
}

export function selectV6AttendanceRecordsForLessonGroup(domainView: V6NormalizedDomainView, lessonOccurrenceId: string, groupId: GroupId) {
  return domainView.attendanceRecords.filter((record) => record.lessonOccurrenceId === lessonOccurrenceId && record.groupId === groupId);
}

export function selectV6AttendanceRecordsForGroupIds(domainView: V6NormalizedDomainView, groupIds: Iterable<GroupId>) {
  const allowedGroupIds = new Set(groupIds);
  return domainView.attendanceRecords.filter((record) => allowedGroupIds.has(record.groupId));
}

export function selectV6AttendanceRecordsForStudent(domainView: V6NormalizedDomainView, studentId: StudentId) {
  return domainView.attendanceRecords.filter((record) => record.studentId === studentId);
}

export function summarizeV6AttendanceRecords(records: AttendanceRecord[], totalStudents: number): V6AttendanceSummary {
  const markedCount = records.length;
  const presentCount = records.filter((record) => record.status === "present").length;
  const lateCount = records.filter((record) => record.status === "late").length;
  const absentCount = records.filter((record) => record.status === "absent").length;
  const excusedCount = records.filter((record) => record.status === "excused").length;
  const missingCount = records.filter((record) => record.status === "missing").length;
  const remainingCount = Math.max(totalStudents - Math.min(markedCount, totalStudents), 0);

  return {
    totalStudents,
    markedCount,
    presentCount,
    lateCount,
    absentCount,
    excusedCount,
    missingCount,
    remainingCount,
    complete: totalStudents > 0 && remainingCount === 0,
    needsAction: totalStudents === 0 || remainingCount > 0
  };
}

export function selectV6LessonAttendanceSummary(db: V6Database, domainView: V6NormalizedDomainView, lessonOccurrenceId: string, groupId: GroupId): V6AttendanceSummary {
  const roster = selectV6GroupRosterView(db, groupId, domainView);
  return summarizeV6AttendanceRecords(selectV6AttendanceRecordsForLessonGroup(domainView, lessonOccurrenceId, groupId), roster?.rosterSize ?? 0);
}

export function selectV6AttendanceRateFromRecords(records: AttendanceRecord[]) {
  const counted = records.filter((record) => record.status !== "excused");
  return counted.length ? Math.round((counted.filter((record) => record.status === "present" || record.status === "late").length / counted.length) * 100) : 0;
}

export function selectV6TeacherGroupIds(domainView: V6NormalizedDomainView, teacher: V6User): Set<GroupId> {
  const normalizedTeacher = domainView.teachersById.get(teacher.id);
  if (normalizedTeacher) return new Set(normalizedTeacher.groupIds);

  return new Set(
    domainView.groups
      .filter((group) => teacher.groupIds.includes(group.id) || group.teacherIds.includes(teacher.id))
      .map((group) => group.id)
  );
}

export function selectV6WeeklyScheduleViews(db: V6Database, lessons: V6Lesson[] = db.lessons): V6WeeklyScheduleView[] {
  const domainView = buildV6DomainView(db);

  return lessons.flatMap((lesson) => {
    const schedule = domainView.weeklySchedulesByLessonId.get(lesson.id);
    if (!schedule) return [];

    const group = db.groups.find((item) => item.id === lesson.groupId);
    const normalizedGroup = domainView.groupsById.get(lesson.groupId);
    const room = domainView.roomsById.get(schedule.roomId);
    const teacherNames = (normalizedGroup?.teacherIds ?? group?.teacherIds ?? [])
      .map((teacherId) => domainView.teachersById.get(teacherId)?.displayName ?? db.users.find((user) => user.id === teacherId)?.name)
      .filter(Boolean)
      .join(", ");

    return [{
      lesson,
      group,
      schedule,
      room,
      teacherIds: normalizedGroup?.teacherIds ?? group?.teacherIds ?? [],
      teacherNames,
      studentIds: normalizedGroup?.studentIds ?? group?.studentIds ?? [],
      dayLabel: WEEKDAY_LABEL_BY_KEY[schedule.weekday],
      roomName: room?.name ?? lesson.room
    }];
  });
}

export function groupV6AttendanceByLesson(attendanceRecords: V6AttendanceRecord[]) {
  return attendanceRecords.reduce<Record<string, V6AttendanceRecord[]>>((groups, record) => {
    const key = `${record.lessonId}:${record.groupId ?? ""}`;
    groups[key] = [...(groups[key] ?? []), record];
    return groups;
  }, {});
}
