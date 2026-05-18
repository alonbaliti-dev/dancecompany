export type V6TimetableConflictKind = "teacher_double_booking" | "room_conflict" | "group_overlap";

export type V6TimetableConflictSeverity = "warning" | "blocking";

export type V6TimetableConflictEntity = {
  id?: string;
  name?: string;
};

export type V6TimetableConflictTimeRange = {
  startMinutes: number;
  endMinutes: number;
  startTime: string;
  endTime: string;
};

export type V6TimetableConflictInput = {
  lessonId: string;
  day: string;
  startTime?: string;
  endTime?: string;
  durationMinutes?: number;
  title?: string;
  group?: V6TimetableConflictEntity;
  room?: V6TimetableConflictEntity;
  teachers?: V6TimetableConflictEntity[];
};

export type V6TimetableConflictLesson = {
  lessonId: string;
  title?: string;
  day: string;
  timeRange: V6TimetableConflictTimeRange;
  group?: V6TimetableConflictEntity;
  room?: V6TimetableConflictEntity;
  teachers: V6TimetableConflictEntity[];
};

export type V6TimetableConflict = {
  id: string;
  kind: V6TimetableConflictKind;
  severity: V6TimetableConflictSeverity;
  day: string;
  timeRange: V6TimetableConflictTimeRange;
  involvedLessonIds: string[];
  lessons: [V6TimetableConflictLesson, V6TimetableConflictLesson];
  resource?: V6TimetableConflictEntity;
};

export type V6TimetableConflictMetadata = {
  conflicts: V6TimetableConflict[];
  conflictsByLessonId: Record<string, V6TimetableConflict[]>;
  countsByKind: Record<V6TimetableConflictKind, number>;
  hasConflicts: boolean;
};

export type V6TimetableConflictPublishPolicy = {
  blockingConflicts: V6TimetableConflict[];
  warningConflicts: V6TimetableConflict[];
  blockingCount: number;
  warningCount: number;
  blockingCountsByKind: Record<V6TimetableConflictKind, number>;
  hasBlockingConflicts: boolean;
};

type NormalizedV6TimetableConflictRow = V6TimetableConflictLesson & {
  teacherKeys: Array<{ key: string; teacher: V6TimetableConflictEntity }>;
  roomKey?: string;
  groupKey?: string;
};

const emptyCountsByKind: Record<V6TimetableConflictKind, number> = {
  teacher_double_booking: 0,
  room_conflict: 0,
  group_overlap: 0
};

function createEmptyCountsByKind(): Record<V6TimetableConflictKind, number> {
  return { ...emptyCountsByKind };
}

function normalizeConflictText(value?: string) {
  return (value ?? "").trim();
}

function normalizeConflictDay(value?: string) {
  return normalizeConflictText(value).replace(/^יום\s+/, "");
}

function normalizeConflictKey(value?: string) {
  return normalizeConflictText(value).toLocaleLowerCase();
}

function entityKey(entity?: V6TimetableConflictEntity) {
  return normalizeConflictKey(entity?.id || entity?.name);
}

export function parseV6TimetableTimeToMinutes(time?: string) {
  const match = normalizeConflictText(time).match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return undefined;

  const hour = Number.parseInt(match[1], 10);
  const minute = Number.parseInt(match[2], 10);
  if (!Number.isInteger(hour) || !Number.isInteger(minute)) return undefined;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return undefined;

  return hour * 60 + minute;
}

export function formatV6TimetableMinutesAsTime(minutes: number) {
  const safeMinutes = Math.max(0, Math.round(minutes));
  const hour = Math.floor(safeMinutes / 60) % 24;
  const minute = safeMinutes % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function selectV6TimetableTimeRange(input: Pick<V6TimetableConflictInput, "startTime" | "endTime" | "durationMinutes">) {
  const startMinutes = parseV6TimetableTimeToMinutes(input.startTime);
  if (startMinutes === undefined) return undefined;

  const parsedEndMinutes = parseV6TimetableTimeToMinutes(input.endTime);
  const durationEndMinutes = typeof input.durationMinutes === "number" && input.durationMinutes > 0
    ? startMinutes + input.durationMinutes
    : undefined;
  const endMinutes = parsedEndMinutes !== undefined && parsedEndMinutes > startMinutes
    ? parsedEndMinutes
    : durationEndMinutes;

  if (endMinutes === undefined || endMinutes <= startMinutes) return undefined;

  return {
    startMinutes,
    endMinutes,
    startTime: formatV6TimetableMinutesAsTime(startMinutes),
    endTime: formatV6TimetableMinutesAsTime(endMinutes)
  };
}

export function doV6TimetableTimeRangesOverlap(a: Pick<V6TimetableConflictTimeRange, "startMinutes" | "endMinutes">, b: Pick<V6TimetableConflictTimeRange, "startMinutes" | "endMinutes">) {
  return a.startMinutes < b.endMinutes && b.startMinutes < a.endMinutes;
}

function selectConflictOverlapRange(a: V6TimetableConflictTimeRange, b: V6TimetableConflictTimeRange): V6TimetableConflictTimeRange {
  const startMinutes = Math.max(a.startMinutes, b.startMinutes);
  const endMinutes = Math.min(a.endMinutes, b.endMinutes);
  return {
    startMinutes,
    endMinutes,
    startTime: formatV6TimetableMinutesAsTime(startMinutes),
    endTime: formatV6TimetableMinutesAsTime(endMinutes)
  };
}

function normalizeConflictEntities(entities?: V6TimetableConflictEntity[]) {
  const seen = new Set<string>();
  return (entities ?? [])
    .map((entity) => ({
      id: normalizeConflictText(entity.id) || undefined,
      name: normalizeConflictText(entity.name) || undefined
    }))
    .filter((entity) => entity.id || entity.name)
    .filter((entity) => {
      const key = entityKey(entity);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function normalizeConflictRow(row: V6TimetableConflictInput): NormalizedV6TimetableConflictRow | undefined {
  const lessonId = normalizeConflictText(row.lessonId);
  const day = normalizeConflictDay(row.day);
  const timeRange = selectV6TimetableTimeRange(row);
  if (!lessonId || !day || !timeRange) return undefined;

  const room = row.room && (normalizeConflictText(row.room.id) || normalizeConflictText(row.room.name))
    ? { id: normalizeConflictText(row.room.id) || undefined, name: normalizeConflictText(row.room.name) || undefined }
    : undefined;
  const group = row.group && (normalizeConflictText(row.group.id) || normalizeConflictText(row.group.name))
    ? { id: normalizeConflictText(row.group.id) || undefined, name: normalizeConflictText(row.group.name) || undefined }
    : undefined;
  const teachers = normalizeConflictEntities(row.teachers);

  return {
    lessonId,
    title: normalizeConflictText(row.title) || undefined,
    day,
    timeRange,
    group,
    room,
    teachers,
    teacherKeys: teachers.map((teacher) => ({ key: entityKey(teacher), teacher })).filter((item) => item.key),
    roomKey: entityKey(room) || undefined,
    groupKey: entityKey(group) || undefined
  };
}

function conflictLesson(row: NormalizedV6TimetableConflictRow): V6TimetableConflictLesson {
  return {
    lessonId: row.lessonId,
    title: row.title,
    day: row.day,
    timeRange: row.timeRange,
    group: row.group,
    room: row.room,
    teachers: row.teachers
  };
}

function makeConflict(input: {
  kind: V6TimetableConflictKind;
  day: string;
  resource?: V6TimetableConflictEntity;
  a: NormalizedV6TimetableConflictRow;
  b: NormalizedV6TimetableConflictRow;
}): V6TimetableConflict {
  const involvedLessonIds = [input.a.lessonId, input.b.lessonId].sort();
  const resourceKey = entityKey(input.resource) || "slot";
  return {
    id: `${input.kind}:${input.day}:${resourceKey}:${involvedLessonIds.join(":")}`,
    kind: input.kind,
    severity: "blocking",
    day: input.day,
    timeRange: selectConflictOverlapRange(input.a.timeRange, input.b.timeRange),
    involvedLessonIds,
    lessons: [conflictLesson(input.a), conflictLesson(input.b)],
    resource: input.resource
  };
}

function addConflictByLessonId(conflictsByLessonId: Record<string, V6TimetableConflict[]>, conflict: V6TimetableConflict) {
  for (const lessonId of conflict.involvedLessonIds) {
    conflictsByLessonId[lessonId] = [...(conflictsByLessonId[lessonId] ?? []), conflict];
  }
}

export function selectV6TimetableConflictMetadata(rows: V6TimetableConflictInput[]): V6TimetableConflictMetadata {
  const normalizedRows = rows.map(normalizeConflictRow).filter((row): row is NormalizedV6TimetableConflictRow => Boolean(row));
  const conflicts: V6TimetableConflict[] = [];
  const seenConflictIds = new Set<string>();

  for (let index = 0; index < normalizedRows.length; index += 1) {
    const a = normalizedRows[index];
    for (let nextIndex = index + 1; nextIndex < normalizedRows.length; nextIndex += 1) {
      const b = normalizedRows[nextIndex];
      if (a.lessonId === b.lessonId || a.day !== b.day || !doV6TimetableTimeRangesOverlap(a.timeRange, b.timeRange)) continue;

      for (const teacher of a.teacherKeys) {
        const matchingTeacher = b.teacherKeys.find((item) => item.key === teacher.key);
        if (!matchingTeacher) continue;
        const conflict = makeConflict({ kind: "teacher_double_booking", day: a.day, resource: teacher.teacher, a, b });
        if (!seenConflictIds.has(conflict.id)) {
          seenConflictIds.add(conflict.id);
          conflicts.push(conflict);
        }
      }

      if (a.roomKey && a.roomKey === b.roomKey) {
        const conflict = makeConflict({ kind: "room_conflict", day: a.day, resource: a.room, a, b });
        if (!seenConflictIds.has(conflict.id)) {
          seenConflictIds.add(conflict.id);
          conflicts.push(conflict);
        }
      }

      if (a.groupKey && a.groupKey === b.groupKey) {
        const conflict = makeConflict({ kind: "group_overlap", day: a.day, resource: a.group, a, b });
        if (!seenConflictIds.has(conflict.id)) {
          seenConflictIds.add(conflict.id);
          conflicts.push(conflict);
        }
      }
    }
  }

  const countsByKind = conflicts.reduce<Record<V6TimetableConflictKind, number>>(
    (counts, conflict) => ({ ...counts, [conflict.kind]: counts[conflict.kind] + 1 }),
    { ...emptyCountsByKind }
  );
  const conflictsByLessonId: Record<string, V6TimetableConflict[]> = {};
  conflicts.forEach((conflict) => addConflictByLessonId(conflictsByLessonId, conflict));

  return {
    conflicts,
    conflictsByLessonId,
    countsByKind,
    hasConflicts: conflicts.length > 0
  };
}

export function isV6TimetableConflictBlocking(conflict: V6TimetableConflict) {
  return conflict.severity === "blocking";
}

export function selectV6TimetableConflictPublishPolicy(metadata: V6TimetableConflictMetadata): V6TimetableConflictPublishPolicy {
  const blockingConflicts = metadata.conflicts.filter(isV6TimetableConflictBlocking);
  const warningConflicts = metadata.conflicts.filter((conflict) => !isV6TimetableConflictBlocking(conflict));
  const blockingCountsByKind = blockingConflicts.reduce<Record<V6TimetableConflictKind, number>>(
    (counts, conflict) => ({ ...counts, [conflict.kind]: counts[conflict.kind] + 1 }),
    createEmptyCountsByKind()
  );

  return {
    blockingConflicts,
    warningConflicts,
    blockingCount: blockingConflicts.length,
    warningCount: warningConflicts.length,
    blockingCountsByKind,
    hasBlockingConflicts: blockingConflicts.length > 0
  };
}
