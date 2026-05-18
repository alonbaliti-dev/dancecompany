import type { V6ManagementDaySummary, V6ManagementScheduleDay, V6ManagementScheduleLessonRow } from "@/lib/v6/view-models";
import { selectV6TimetableConflictMetadata, selectV6TimetableConflictPublishPolicy, type V6TimetableConflict, type V6TimetableConflictInput, type V6TimetableConflictKind, type V6TimetableConflictMetadata, type V6TimetableConflictPublishPolicy } from "@/lib/v6/timetable-conflicts";

export type V6ManagementLessonOverride = {
  displayTitle: string;
  room: string;
  teacherId: string;
  teacherName: string;
  durationMinutes: number;
  status: string;
};

export type V6ManagementLessonDraft = V6ManagementLessonOverride;

export type V6ManagementLessonOverrides = Record<string, V6ManagementLessonOverride>;

export type V6ManagementTimetableEditSession = {
  baseOverrides: V6ManagementLessonOverrides;
  currentOverrides: V6ManagementLessonOverrides;
  past: V6ManagementLessonOverrides[];
  future: V6ManagementLessonOverrides[];
};

export type V6ManagementTimetableEditSessionMeta = {
  isDirty: boolean;
  canUndo: boolean;
  canRedo: boolean;
  unsavedEditCount: number;
};

export type V6ManagementTimetableEditSessionTransition = Pick<V6ManagementTimetableEditSessionMeta, "isDirty" | "canUndo" | "canRedo"> & {
  unsavedEditCountBefore: number;
  unsavedEditCountAfter: number;
};

export type V6ManagementTimetablePublishPhase = "published" | "draft_dirty" | "ready_to_publish" | "blocked_by_conflicts";

export type V6ManagementTimetablePublishState = {
  phase: V6ManagementTimetablePublishPhase;
  label: string;
  description: string;
  canPublish: boolean;
  canDiscard: boolean;
  conflictPolicy: V6TimetableConflictPublishPolicy;
};

export type V6ManagementTimetableConflictIndicator = {
  id: string;
  kind: V6TimetableConflictKind;
  label: string;
  compactLabel: string;
  description: string;
  overlapLabel: string;
  actionLabel: string;
};

export type V6ManagementTimetableConflictSummary = {
  kind: V6TimetableConflictKind;
  label: string;
  compactLabel: string;
  count: number;
};

const managementTimetableConflictCopy: Record<V6TimetableConflictKind, { label: string; compactLabel: string; actionLabel: string; priority: number }> = {
  teacher_double_booking: { label: "התנגשות מורה", compactLabel: "מורה", actionLabel: "בדיקת צוות", priority: 1 },
  room_conflict: { label: "התנגשות חלל", compactLabel: "חלל", actionLabel: "בדיקת חלל", priority: 2 },
  group_overlap: { label: "חפיפת קבוצה", compactLabel: "חפיפה", actionLabel: "בדיקת חפיפה", priority: 3 }
};

export function selectV6ManagementLessonDisplayTitle(row: V6ManagementScheduleLessonRow) {
  return row.group?.name ?? row.lesson.title;
}

function parseV6TimeToMinutes(time?: string) {
  const [hour, minute] = (time ?? "").split(":").map((part) => Number.parseInt(part, 10));
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return undefined;
  return hour * 60 + minute;
}

function formatV6TimeFromMinutes(minutes: number) {
  const hour = Math.floor(minutes / 60) % 24;
  const minute = minutes % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function selectV6ManagementLessonEndTime(row: V6ManagementScheduleLessonRow, durationMinutes: number) {
  const start = parseV6TimeToMinutes(row.lesson.time);
  if (start === undefined) return row.endTime;
  return formatV6TimeFromMinutes(start + durationMinutes);
}

export function uniqueV6ManagementOptions(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function normalizeV6ManagementLessonOverride(override: V6ManagementLessonOverride) {
  return {
    displayTitle: override.displayTitle.trim(),
    room: override.room.trim(),
    teacherId: override.teacherId.trim(),
    teacherName: override.teacherName.trim(),
    durationMinutes: override.durationMinutes,
    status: override.status.trim()
  };
}

function normalizeV6ManagementLessonOverrides(overrides: V6ManagementLessonOverrides) {
  const entries = Object.entries(overrides)
    .map(([lessonId, override]): [string, V6ManagementLessonOverride] => [lessonId, normalizeV6ManagementLessonOverride(override)])
    .sort(([a], [b]) => a.localeCompare(b));

  return Object.fromEntries(entries) as V6ManagementLessonOverrides;
}

function areV6ManagementLessonOverridesEqual(a: V6ManagementLessonOverrides, b: V6ManagementLessonOverrides) {
  const normalizedA = normalizeV6ManagementLessonOverrides(a);
  const normalizedB = normalizeV6ManagementLessonOverrides(b);
  const aKeys = Object.keys(normalizedA);
  const bKeys = Object.keys(normalizedB);
  if (aKeys.length !== bKeys.length) return false;

  return aKeys.every((key) => {
    const aOverride = normalizedA[key];
    const bOverride = normalizedB[key];
    return Boolean(bOverride)
      && aOverride.displayTitle === bOverride.displayTitle
      && aOverride.room === bOverride.room
      && aOverride.teacherId === bOverride.teacherId
      && aOverride.teacherName === bOverride.teacherName
      && aOverride.durationMinutes === bOverride.durationMinutes
      && aOverride.status === bOverride.status;
  });
}

function cloneV6ManagementLessonOverrides(overrides: V6ManagementLessonOverrides): V6ManagementLessonOverrides {
  return Object.fromEntries(Object.entries(overrides).map(([lessonId, override]) => [lessonId, { ...override }]));
}

function countV6ManagementChangedLessonOverrides(a: V6ManagementLessonOverrides, b: V6ManagementLessonOverrides) {
  const lessonIds = new Set([...Object.keys(a), ...Object.keys(b)]);
  return Array.from(lessonIds).filter((lessonId) => {
    const aOverride = a[lessonId];
    const bOverride = b[lessonId];
    if (!aOverride || !bOverride) return true;
    return !areV6ManagementLessonOverridesEqual({ [lessonId]: aOverride }, { [lessonId]: bOverride });
  }).length;
}

export function createV6ManagementTimetableEditSession(initialOverrides: V6ManagementLessonOverrides = {}): V6ManagementTimetableEditSession {
  const baseOverrides = cloneV6ManagementLessonOverrides(initialOverrides);
  return {
    baseOverrides,
    currentOverrides: cloneV6ManagementLessonOverrides(baseOverrides),
    past: [],
    future: []
  };
}

export function restoreV6ManagementTimetablePublishedOverrides(importedOverrides: V6ManagementLessonOverrides): V6ManagementTimetableEditSession {
  return createV6ManagementTimetableEditSession(importedOverrides);
}

export function selectV6ManagementTimetableEditSessionMeta(session: V6ManagementTimetableEditSession): V6ManagementTimetableEditSessionMeta {
  const isDirty = !areV6ManagementLessonOverridesEqual(session.currentOverrides, session.baseOverrides);
  return {
    isDirty,
    canUndo: session.past.length > 0,
    canRedo: session.future.length > 0,
    unsavedEditCount: isDirty ? countV6ManagementChangedLessonOverrides(session.currentOverrides, session.baseOverrides) : 0
  };
}

export function selectV6ManagementTimetableEditSessionTransition(input: {
  previousMeta: V6ManagementTimetableEditSessionMeta;
  nextSession: V6ManagementTimetableEditSession;
}): V6ManagementTimetableEditSessionTransition {
  const nextMeta = selectV6ManagementTimetableEditSessionMeta(input.nextSession);
  return {
    unsavedEditCountBefore: input.previousMeta.unsavedEditCount,
    unsavedEditCountAfter: nextMeta.unsavedEditCount,
    isDirty: nextMeta.isDirty,
    canUndo: nextMeta.canUndo,
    canRedo: nextMeta.canRedo
  };
}

export function applyV6ManagementTimetableEditSessionOverrides(
  session: V6ManagementTimetableEditSession,
  nextOverrides: V6ManagementLessonOverrides
): V6ManagementTimetableEditSession {
  if (areV6ManagementLessonOverridesEqual(session.currentOverrides, nextOverrides)) return session;

  return {
    ...session,
    currentOverrides: cloneV6ManagementLessonOverrides(nextOverrides),
    past: [...session.past, cloneV6ManagementLessonOverrides(session.currentOverrides)],
    future: []
  };
}

export function undoV6ManagementTimetableEditSession(session: V6ManagementTimetableEditSession): V6ManagementTimetableEditSession {
  const previousOverrides = session.past.at(-1);
  if (!previousOverrides) return session;

  return {
    ...session,
    currentOverrides: cloneV6ManagementLessonOverrides(previousOverrides),
    past: session.past.slice(0, -1),
    future: [cloneV6ManagementLessonOverrides(session.currentOverrides), ...session.future]
  };
}

export function redoV6ManagementTimetableEditSession(session: V6ManagementTimetableEditSession): V6ManagementTimetableEditSession {
  const nextOverrides = session.future[0];
  if (!nextOverrides) return session;

  return {
    ...session,
    currentOverrides: cloneV6ManagementLessonOverrides(nextOverrides),
    past: [...session.past, cloneV6ManagementLessonOverrides(session.currentOverrides)],
    future: session.future.slice(1)
  };
}

export function resetV6ManagementTimetableEditSession(session: V6ManagementTimetableEditSession): V6ManagementTimetableEditSession {
  return {
    ...session,
    currentOverrides: cloneV6ManagementLessonOverrides(session.baseOverrides),
    past: [],
    future: []
  };
}

export function publishV6ManagementTimetableEditSession(session: V6ManagementTimetableEditSession): V6ManagementTimetableEditSession {
  return createV6ManagementTimetableEditSession(session.currentOverrides);
}

export function discardV6ManagementTimetableEditSessionDraft(session: V6ManagementTimetableEditSession): V6ManagementTimetableEditSession {
  return resetV6ManagementTimetableEditSession(session);
}

export function selectV6ManagementTimetablePublishState(input: {
  session: V6ManagementTimetableEditSession;
  conflictMetadata: V6TimetableConflictMetadata;
}): V6ManagementTimetablePublishState {
  const sessionMeta = selectV6ManagementTimetableEditSessionMeta(input.session);
  const conflictPolicy = selectV6TimetableConflictPublishPolicy(input.conflictMetadata);
  const canPublish = sessionMeta.isDirty && !conflictPolicy.hasBlockingConflicts;
  const warningSuffix = conflictPolicy.warningCount ? ` · ${conflictPolicy.warningCount} אזהרות נשארות לבדיקה` : "";

  if (!sessionMeta.isDirty) {
    return {
      phase: "published",
      label: "מערכת מפורסמת",
      description: "אין טיוטה פתוחה. העריכות הבאות יישמרו קודם כטיוטה מקומית.",
      canPublish: false,
      canDiscard: false,
      conflictPolicy
    };
  }

  if (conflictPolicy.hasBlockingConflicts) {
    return {
      phase: "blocked_by_conflicts",
      label: "פרסום חסום",
      description: `${conflictPolicy.blockingCount} התנגשויות חוסמות לפני פרסום${warningSuffix}`,
      canPublish: false,
      canDiscard: true,
      conflictPolicy
    };
  }

  if (conflictPolicy.warningCount) {
    return {
      phase: "draft_dirty",
      label: "טיוטה עם אזהרות",
      description: `${sessionMeta.unsavedEditCount} שינויים בטיוטה המקומית${warningSuffix}`,
      canPublish,
      canDiscard: true,
      conflictPolicy
    };
  }

  return {
    phase: "ready_to_publish",
    label: "טיוטה מוכנה לפרסום",
    description: `${sessionMeta.unsavedEditCount} שינויים בטיוטה המקומית`,
    canPublish,
    canDiscard: true,
    conflictPolicy
  };
}

function splitV6ManagementTeacherNames(value: string) {
  return value
    .split(/[,/|]+/)
    .map((name) => name.trim())
    .filter(Boolean)
    .map((name) => ({ name }));
}

function selectV6ManagementConflictTeachers(row: V6ManagementScheduleLessonRow, override?: V6ManagementLessonOverride) {
  if (override) {
    const teacherId = override.teacherId.trim();
    const teacherName = override.teacherName.trim();
    return teacherId || teacherName ? [{ id: teacherId || undefined, name: teacherName || undefined }] : [];
  }

  const teacherIds = row.group?.teacherIds ?? [];
  if (teacherIds.length) {
    return teacherIds.map((id) => ({ id, name: row.teacherNames || undefined }));
  }

  return splitV6ManagementTeacherNames(row.teacherNames);
}

export function selectV6ManagementTimetableConflictInputs(input: {
  localScheduleLessonRows: V6ManagementScheduleLessonRow[];
  lessonOverrides: V6ManagementLessonOverrides;
}): V6TimetableConflictInput[] {
  const { localScheduleLessonRows, lessonOverrides } = input;
  return localScheduleLessonRows.map((row) => ({
    lessonId: row.lesson.id,
    day: row.day,
    startTime: row.lesson.time,
    endTime: row.endTime,
    durationMinutes: row.durationMinutes,
    title: selectV6ManagementLessonDisplayTitle(row),
    group: row.group ? { id: row.group.id, name: row.group.name } : { id: row.lesson.groupId },
    room: { name: row.roomName || row.lesson.room },
    teachers: selectV6ManagementConflictTeachers(row, lessonOverrides[row.lesson.id])
  }));
}

export function selectV6ManagementTimetableConflicts(input: {
  localScheduleLessonRows: V6ManagementScheduleLessonRow[];
  lessonOverrides: V6ManagementLessonOverrides;
}) {
  return selectV6TimetableConflictMetadata(selectV6ManagementTimetableConflictInputs(input));
}

function selectV6ManagementConflictResourceLabel(conflict: V6TimetableConflict) {
  return conflict.resource?.name ?? conflict.resource?.id;
}

function selectV6ManagementConflictPeerLabel(conflict: V6TimetableConflict, lessonId: string) {
  const peer = conflict.lessons.find((lesson) => lesson.lessonId !== lessonId) ?? conflict.lessons[0];
  return peer.title ?? peer.group?.name ?? peer.room?.name ?? peer.timeRange.startTime;
}

function compareV6ManagementConflicts(a: V6TimetableConflict, b: V6TimetableConflict) {
  const priorityDelta = managementTimetableConflictCopy[a.kind].priority - managementTimetableConflictCopy[b.kind].priority;
  if (priorityDelta !== 0) return priorityDelta;
  return a.timeRange.startMinutes - b.timeRange.startMinutes;
}

export function selectV6ManagementTimetableConflictSummary(metadata: V6TimetableConflictMetadata): V6ManagementTimetableConflictSummary[] {
  return (Object.keys(managementTimetableConflictCopy) as V6TimetableConflictKind[])
    .map((kind) => ({
      kind,
      label: managementTimetableConflictCopy[kind].label,
      compactLabel: managementTimetableConflictCopy[kind].compactLabel,
      count: metadata.countsByKind[kind]
    }))
    .filter((item) => item.count > 0);
}

export function selectV6ManagementTimetableConflictCountsByDay(metadata: V6TimetableConflictMetadata) {
  return metadata.conflicts.reduce<Record<string, number>>((counts, conflict) => ({
    ...counts,
    [conflict.day]: (counts[conflict.day] ?? 0) + 1
  }), {});
}

export function selectV6ManagementTimetableConflictIndicators(metadata: V6TimetableConflictMetadata): Record<string, V6ManagementTimetableConflictIndicator[]> {
  return Object.fromEntries(
    Object.entries(metadata.conflictsByLessonId).map(([lessonId, conflicts]) => [
      lessonId,
      [...conflicts].sort(compareV6ManagementConflicts).map((conflict) => {
        const copy = managementTimetableConflictCopy[conflict.kind];
        const resource = selectV6ManagementConflictResourceLabel(conflict);
        const peer = selectV6ManagementConflictPeerLabel(conflict, lessonId);
        const overlapLabel = `${conflict.timeRange.startTime}-${conflict.timeRange.endTime}`;
        const context = [resource, overlapLabel, peer ? `מול ${peer}` : undefined].filter(Boolean).join(" · ");

        return {
          id: conflict.id,
          kind: conflict.kind,
          label: copy.label,
          compactLabel: copy.compactLabel,
          description: context ? `${copy.label}: ${context}` : copy.label,
          overlapLabel,
          actionLabel: copy.actionLabel
        };
      })
    ])
  );
}

export function createV6ManagementLessonDraft(row: V6ManagementScheduleLessonRow): V6ManagementLessonDraft {
  return {
    displayTitle: selectV6ManagementLessonDisplayTitle(row),
    room: row.roomName || row.lesson.room,
    teacherId: "",
    teacherName: row.teacherNames,
    durationMinutes: row.durationMinutes,
    status: row.status
  };
}

export function applyV6ManagementLessonOverride(row: V6ManagementScheduleLessonRow, override?: V6ManagementLessonOverride): V6ManagementScheduleLessonRow {
  if (!override) return row;
  return {
    ...row,
    group: row.group ? { ...row.group, name: override.displayTitle } : row.group,
    teacherNames: override.teacherName,
    durationMinutes: override.durationMinutes,
    endTime: selectV6ManagementLessonEndTime(row, override.durationMinutes),
    status: override.status,
    roomName: override.room,
    lesson: {
      ...row.lesson,
      title: override.displayTitle,
      room: override.room
    }
  };
}

export function updateV6ManagementLessonDraft(
  current: V6ManagementLessonDraft | null,
  patch: Partial<V6ManagementLessonDraft>
) {
  return current ? { ...current, ...patch } : current;
}

export function saveV6ManagementLessonDraft(input: {
  currentOverrides: V6ManagementLessonOverrides;
  lessonId: string;
  draft: V6ManagementLessonDraft;
  fallbackTitle: string;
}): V6ManagementLessonOverrides {
  const { currentOverrides, lessonId, draft, fallbackTitle } = input;
  return {
    ...currentOverrides,
    [lessonId]: {
      ...draft,
      displayTitle: draft.displayTitle.trim() || fallbackTitle
    }
  };
}

function selectLocalDaySummaries(input: {
  daySummaries: V6ManagementDaySummary[];
  localScheduleLessonRows: V6ManagementScheduleLessonRow[];
}) {
  const { daySummaries, localScheduleLessonRows } = input;
  return daySummaries.map((day) => {
    const localRows = localScheduleLessonRows.filter((row) => row.day === day.day);
    return {
      ...day,
      lessonCount: localRows.length,
      firstTime: localRows[0]?.lesson.time ?? day.firstTime
    };
  });
}

function selectLocalScheduleDays(input: {
  scheduleDays: V6ManagementScheduleDay[];
  localScheduleLessonRows: V6ManagementScheduleLessonRow[];
}) {
  const { scheduleDays, localScheduleLessonRows } = input;
  return scheduleDays.map((day) => {
    const localRows = localScheduleLessonRows.filter((row) => row.day === day.day);
    const localRooms = uniqueV6ManagementOptions(localRows.map((row) => row.roomName)).map((room) => {
      const roomLessonCount = localRows.filter((row) => row.roomName === room).length;
      return roomLessonCount > 1 ? `${room} · ${roomLessonCount}` : room;
    });
    return {
      ...day,
      rows: localRows,
      rooms: localRooms,
      totalStudents: localRows.reduce((sum, row) => sum + row.studentCount, 0)
    };
  });
}

export function selectV6ManagementTimetableEditingViewModel(input: {
  scheduleLessonRows: V6ManagementScheduleLessonRow[];
  daySummaries: V6ManagementDaySummary[];
  scheduleDays: V6ManagementScheduleDay[];
  rooms: string[];
  lessonOverrides: V6ManagementLessonOverrides;
  lessonDraft: V6ManagementLessonDraft | null;
  selectedScheduleDay: string;
  selectedLessonId: string | null;
  today: string;
}) {
  const {
    scheduleLessonRows,
    daySummaries,
    scheduleDays,
    rooms,
    lessonOverrides,
    lessonDraft,
    selectedScheduleDay,
    selectedLessonId,
    today
  } = input;
  const locallyEditedCount = Object.keys(lessonOverrides).length;
  const localScheduleLessonRows = scheduleLessonRows.map((row) => applyV6ManagementLessonOverride(row, lessonOverrides[row.lesson.id]));
  const timetableConflictMetadata = selectV6ManagementTimetableConflicts({ localScheduleLessonRows, lessonOverrides });
  const localDaySummaries = selectLocalDaySummaries({ daySummaries, localScheduleLessonRows });
  const localScheduleDays = selectLocalScheduleDays({ scheduleDays, localScheduleLessonRows });
  const timetableConflictSummary = selectV6ManagementTimetableConflictSummary(timetableConflictMetadata);
  const timetableConflictCountsByDay = selectV6ManagementTimetableConflictCountsByDay(timetableConflictMetadata);
  const timetableConflictIndicatorsByLessonId = selectV6ManagementTimetableConflictIndicators(timetableConflictMetadata);
  const selectedDay = localDaySummaries.some((day) => day.day === selectedScheduleDay && day.lessonCount > 0)
    ? selectedScheduleDay
    : localDaySummaries.find((day) => day.lessonCount > 0)?.day ?? today;
  const visibleScheduleDays = localScheduleDays.filter((day) => day.day === selectedDay);
  const selectedLesson = selectedLessonId ? localScheduleLessonRows.find((row) => row.lesson.id === selectedLessonId) : undefined;
  const roomOptions = uniqueV6ManagementOptions([...rooms, ...localScheduleLessonRows.map((row) => row.roomName)]);
  const statusOptions = uniqueV6ManagementOptions([...scheduleLessonRows.map((row) => row.status), lessonDraft?.status ?? ""]);
  const durationOptions = Array.from(new Set([45, 60, 75, 90, 120, lessonDraft?.durationMinutes].filter((value): value is number => typeof value === "number"))).sort((a, b) => a - b);

  return {
    locallyEditedCount,
    localScheduleLessonRows,
    localDaySummaries,
    selectedDay,
    visibleScheduleDays,
    selectedLesson,
    roomOptions,
    statusOptions,
    durationOptions,
    timetableConflictMetadata,
    timetableConflicts: timetableConflictMetadata.conflicts,
    timetableConflictsByLessonId: timetableConflictMetadata.conflictsByLessonId,
    timetableConflictSummary,
    timetableConflictCountsByDay,
    timetableConflictIndicatorsByLessonId
  };
}
