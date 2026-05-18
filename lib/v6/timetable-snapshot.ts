import type { V6ManagementScheduleLessonRow } from "@/lib/v6/view-models";
import {
  applyV6ManagementLessonOverride,
  selectV6ManagementTimetableConflictCountsByDay,
  selectV6ManagementTimetableConflictSummary,
  selectV6ManagementTimetableConflicts,
  selectV6ManagementTimetableEditSessionMeta,
  type V6ManagementLessonOverride,
  type V6ManagementLessonOverrides,
  type V6ManagementTimetableEditSession
} from "@/lib/v6/timetable-editing";
import { selectV6TimetableConflictPublishPolicy, type V6TimetableConflictKind } from "@/lib/v6/timetable-conflicts";
import type { V6TimetableAuditEvent } from "@/lib/v6/timetable-audit";
import {
  createTimetablePersistencePayload,
  validateTimetablePersistencePayload,
  type V6TimetablePersistencePayload,
  type V6TimetablePersistenceSource
} from "@/lib/v6/timetable-persistence";

export const V6_TIMETABLE_SNAPSHOT_SCHEMA_VERSION = "v6-management-weekly-timetable-snapshot.1" as const;

export type V6TimetableSnapshotAuditEventSummary = {
  id: string;
  action: V6TimetableAuditEvent["action"];
  occurredAt: string;
  source: V6TimetableAuditEvent["source"];
  actor?: V6TimetableAuditEvent["actor"];
  lesson?: V6TimetableAuditEvent["metadata"]["lesson"];
  changedFields?: V6TimetableAuditEvent["metadata"]["changedFields"];
  conflictCount?: number;
  blockingConflictCount?: number;
  unsavedEditCount?: number;
  note?: string;
};

export type V6TimetableSnapshotLesson = {
  lessonId: string;
  title: string;
  day: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  group?: {
    id?: string;
    name?: string;
    ageGroup?: string;
  };
  danceStyle: string;
  teacherName: string;
  room: string;
  status: string;
  studentCount: number;
  hasPublishedOverride: boolean;
};

export type V6TimetableSnapshotDay = {
  day: string;
  lessonCount: number;
  roomCount: number;
  rooms: string[];
  studentCount: number;
  conflictCount: number;
  lessons: V6TimetableSnapshotLesson[];
};

export type V6TimetableSnapshot = {
  schemaVersion: typeof V6_TIMETABLE_SNAPSHOT_SCHEMA_VERSION;
  generatedAt: string;
  source: {
    label: string;
    versionLabel: string;
    state: "published";
    persistence: "download-only";
  };
  published: {
    lessonCount: number;
    dayCount: number;
    roomCount: number;
    overrideCount: number;
    overrides: V6ManagementLessonOverrides;
    days: V6TimetableSnapshotDay[];
  };
  draft: {
    isDirty: boolean;
    unsavedEditCount: number;
    currentOverrideCount: number;
  };
  conflicts: {
    totalCount: number;
    hasConflicts: boolean;
    countsByKind: Record<V6TimetableConflictKind, number>;
    blockingCount: number;
    warningCount: number;
    blockingCountsByKind: Record<V6TimetableConflictKind, number>;
    hasBlockingConflicts: boolean;
    byDay: Record<string, number>;
    summary: ReturnType<typeof selectV6ManagementTimetableConflictSummary>;
  };
  audit: {
    totalKnownEventCount: number;
    includedRecentEventCount: number;
    recentEvents: V6TimetableSnapshotAuditEventSummary[];
  };
  persistence?: V6TimetablePersistencePayload;
};

export type CreateV6TimetableSnapshotPersistenceInput = {
  academyId?: string;
  timetableId: string;
  source?: V6TimetablePersistenceSource["source"];
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  draftUpdatedAt?: string;
};

export type CreateV6TimetableSnapshotInput = {
  generatedAt: string;
  sourceLabel: string;
  versionLabel?: string;
  scheduleLessonRows: V6ManagementScheduleLessonRow[];
  session: V6ManagementTimetableEditSession;
  auditEvents?: V6TimetableAuditEvent[];
  recentAuditLimit?: number;
  persistence?: CreateV6TimetableSnapshotPersistenceInput;
};

export type V6TimetableSnapshotImportSummary = {
  generatedAt: string;
  sourceLabel: string;
  versionLabel: string;
  lessonCount: number;
  dayCount: number;
  roomCount: number;
  overrideCount: number;
};

export type ParseV6TimetableSnapshotImportInput = {
  knownLessonIds?: readonly string[];
};

export type ParseV6TimetableSnapshotImportResult =
  | {
    ok: true;
    overrides: V6ManagementLessonOverrides;
    summary: V6TimetableSnapshotImportSummary;
  }
  | {
    ok: false;
    error: string;
  };

function clonePublishedOverrides(overrides: V6ManagementLessonOverrides): V6ManagementLessonOverrides {
  return Object.fromEntries(
    Object.entries(overrides)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([lessonId, override]) => [lessonId, { ...override }])
  );
}

function isSnapshotRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFiniteSnapshotCount(value: unknown) {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

function parseSnapshotTextField(value: unknown, options?: { required?: boolean }) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (options?.required && !trimmed) return undefined;
  return trimmed;
}

function parseSnapshotOverride(lessonId: string, value: unknown): V6ManagementLessonOverride | string {
  if (!isSnapshotRecord(value)) return `השיעור ${lessonId} לא כולל מבנה override תקין.`;

  const expectedKeys: Array<keyof V6ManagementLessonOverride> = [
    "displayTitle",
    "room",
    "teacherId",
    "teacherName",
    "durationMinutes",
    "status"
  ];
  const extraKey = Object.keys(value).find((key) => !expectedKeys.includes(key as keyof V6ManagementLessonOverride));
  if (extraKey) return `השיעור ${lessonId} כולל שדה לא נתמך: ${extraKey}.`;

  const displayTitle = parseSnapshotTextField(value.displayTitle, { required: true });
  const room = parseSnapshotTextField(value.room, { required: true });
  const teacherId = parseSnapshotTextField(value.teacherId) ?? "";
  const teacherName = parseSnapshotTextField(value.teacherName) ?? "";
  const status = parseSnapshotTextField(value.status, { required: true });
  const durationMinutes = value.durationMinutes;

  if (!displayTitle || !room || !status) return `השיעור ${lessonId} חסר שם, חלל או סטטוס תקינים.`;
  if (typeof durationMinutes !== "number" || !Number.isInteger(durationMinutes) || durationMinutes <= 0 || durationMinutes > 360) {
    return `השיעור ${lessonId} כולל משך שיעור לא תקין.`;
  }

  return {
    displayTitle,
    room,
    teacherId,
    teacherName,
    durationMinutes,
    status
  };
}

function validateSnapshotLesson(value: unknown, day: string) {
  if (!isSnapshotRecord(value)) return "ה-Snapshot כולל שיעור ללא מבנה תקין.";
  const lessonId = parseSnapshotTextField(value.lessonId, { required: true });
  const title = parseSnapshotTextField(value.title, { required: true });
  const lessonDay = parseSnapshotTextField(value.day, { required: true });
  const startTime = parseSnapshotTextField(value.startTime, { required: true });
  const endTime = parseSnapshotTextField(value.endTime, { required: true });
  const danceStyle = parseSnapshotTextField(value.danceStyle, { required: true });
  const teacherName = parseSnapshotTextField(value.teacherName);
  const room = parseSnapshotTextField(value.room, { required: true });
  const status = parseSnapshotTextField(value.status, { required: true });
  if (!lessonId || !title || !lessonDay || !startTime || !endTime || !danceStyle || teacherName === undefined || !room || !status || lessonDay !== day) {
    return `ה-Snapshot כולל שיעור לא תקין ביום ${day}.`;
  }
  if (typeof value.durationMinutes !== "number" || !Number.isInteger(value.durationMinutes) || value.durationMinutes <= 0 || value.durationMinutes > 360) {
    return `ה-Snapshot כולל משך שיעור לא תקין ביום ${day}.`;
  }
  if (!isFiniteSnapshotCount(value.studentCount) || typeof value.hasPublishedOverride !== "boolean") {
    return `ה-Snapshot כולל סיכום שיעור לא תקין ביום ${day}.`;
  }
  if (value.group !== undefined) {
    if (!isSnapshotRecord(value.group)) return `ה-Snapshot כולל קבוצת שיעור לא תקינה ביום ${day}.`;
    const groupValues = [value.group.id, value.group.name, value.group.ageGroup].filter((item) => item !== undefined);
    if (!groupValues.every((item) => typeof item === "string")) return `ה-Snapshot כולל פרטי קבוצה לא תקינים ביום ${day}.`;
  }

  return undefined;
}

function validateSnapshotPublishedDays(days: unknown[]) {
  for (const dayValue of days) {
    if (!isSnapshotRecord(dayValue)) return "ה-Snapshot כולל יום ללא מבנה תקין.";
    const day = parseSnapshotTextField(dayValue.day, { required: true });
    if (!day) return "ה-Snapshot כולל יום ללא שם תקין.";
    if (!isFiniteSnapshotCount(dayValue.lessonCount) || !isFiniteSnapshotCount(dayValue.roomCount) || !isFiniteSnapshotCount(dayValue.studentCount) || !isFiniteSnapshotCount(dayValue.conflictCount)) {
      return `ה-Snapshot כולל סיכום יום לא תקין עבור ${day}.`;
    }
    if (!Array.isArray(dayValue.rooms) || !dayValue.rooms.every((room) => typeof room === "string")) {
      return `ה-Snapshot כולל רשימת חללים לא תקינה עבור ${day}.`;
    }
    if (!Array.isArray(dayValue.lessons)) return `ה-Snapshot חסר שיעורים תקינים עבור ${day}.`;
    if (dayValue.lessonCount !== dayValue.lessons.length || dayValue.roomCount !== dayValue.rooms.length) {
      return `ה-Snapshot כולל ספירת יום שאינה תואמת לתוכן עבור ${day}.`;
    }

    for (const lesson of dayValue.lessons) {
      const lessonError = validateSnapshotLesson(lesson, day);
      if (lessonError) return lessonError;
    }
  }

  return undefined;
}

export function parseV6TimetableSnapshotImport(
  value: unknown,
  input: ParseV6TimetableSnapshotImportInput = {}
): ParseV6TimetableSnapshotImportResult {
  if (!isSnapshotRecord(value)) return { ok: false, error: "קובץ ה-JSON אינו Snapshot תקין." };
  if (value.schemaVersion !== V6_TIMETABLE_SNAPSHOT_SCHEMA_VERSION) return { ok: false, error: "גרסת ה-Snapshot אינה נתמכת במסך הזה." };

  const source = value.source;
  if (!isSnapshotRecord(source)) return { ok: false, error: "ה-Snapshot חסר פרטי מקור תקינים." };
  const sourceLabel = parseSnapshotTextField(source.label, { required: true });
  const versionLabel = parseSnapshotTextField(source.versionLabel, { required: true });
  if (!sourceLabel || !versionLabel || source.state !== "published" || source.persistence !== "download-only") {
    return { ok: false, error: "ה-Snapshot אינו ייצוא מקומי של מערכת מפורסמת." };
  }

  const generatedAt = parseSnapshotTextField(value.generatedAt, { required: true });
  if (!generatedAt || Number.isNaN(Date.parse(generatedAt))) return { ok: false, error: "ה-Snapshot חסר זמן יצירה תקין." };

  const published = value.published;
  if (!isSnapshotRecord(published)) return { ok: false, error: "ה-Snapshot חסר מערכת מפורסמת לשחזור." };
  if (!isFiniteSnapshotCount(published.lessonCount) || !isFiniteSnapshotCount(published.dayCount) || !isFiniteSnapshotCount(published.roomCount) || !isFiniteSnapshotCount(published.overrideCount)) {
    return { ok: false, error: "נתוני הסיכום של ה-Snapshot אינם תקינים." };
  }
  if (!Array.isArray(published.days)) return { ok: false, error: "ה-Snapshot חסר פירוט ימים תקין." };
  const daysError = validateSnapshotPublishedDays(published.days);
  if (daysError) return { ok: false, error: daysError };
  if (!isSnapshotRecord(published.overrides)) return { ok: false, error: "ה-Snapshot חסר overrides תקינים." };
  const lessonCount = published.lessonCount as number;
  const dayCount = published.dayCount as number;
  const roomCount = published.roomCount as number;
  const expectedOverrideCount = published.overrideCount as number;
  const actualLessonCount = published.days.reduce((count, dayValue) => {
    if (!isSnapshotRecord(dayValue) || !Array.isArray(dayValue.lessons)) return count;
    return count + dayValue.lessons.length;
  }, 0);
  const actualRoomCount = new Set(
    published.days.flatMap((dayValue) => isSnapshotRecord(dayValue) && Array.isArray(dayValue.rooms) ? dayValue.rooms : [])
  ).size;
  if (dayCount !== published.days.length || lessonCount !== actualLessonCount || roomCount !== actualRoomCount) {
    return { ok: false, error: "סיכומי ה-Snapshot אינם תואמים לתוכן הימים והשיעורים." };
  }

  const knownLessonIds = input.knownLessonIds ? new Set(input.knownLessonIds) : undefined;
  const overrides: V6ManagementLessonOverrides = {};
  for (const [lessonId, overrideValue] of Object.entries(published.overrides)) {
    const safeLessonId = lessonId.trim();
    if (!safeLessonId) return { ok: false, error: "ה-Snapshot כולל מזהה שיעור ריק." };
    if (knownLessonIds && !knownLessonIds.has(safeLessonId)) {
      return { ok: false, error: `ה-Snapshot כולל שיעור שאינו קיים במערכת הנוכחית: ${safeLessonId}.` };
    }

    const override = parseSnapshotOverride(safeLessonId, overrideValue);
    if (typeof override === "string") return { ok: false, error: override };
    overrides[safeLessonId] = override;
  }

  const overrideCount = Object.keys(overrides).length;
  if (expectedOverrideCount !== overrideCount) return { ok: false, error: "מספר ה-overrides בקובץ אינו תואם לתוכן הקובץ." };

  if (value.persistence !== undefined) {
    const persistenceResult = validateTimetablePersistencePayload(value.persistence);
    if (persistenceResult.ok === false) return { ok: false, error: `Payload התמדה לא תקין: ${persistenceResult.error}` };
    if (persistenceResult.payload.published.overrideCount !== overrideCount) {
      return { ok: false, error: "Payload ההתמדה אינו תואם למספר ה-overrides ב-Snapshot." };
    }
  }

  return {
    ok: true,
    overrides: clonePublishedOverrides(overrides),
    summary: {
      generatedAt,
      sourceLabel,
      versionLabel,
      lessonCount,
      dayCount,
      roomCount,
      overrideCount
    }
  };
}

export function parseV6TimetableSnapshotJsonImport(
  json: string,
  input: ParseV6TimetableSnapshotImportInput = {}
): ParseV6TimetableSnapshotImportResult {
  try {
    return parseV6TimetableSnapshotImport(JSON.parse(json) as unknown, input);
  } catch {
    return { ok: false, error: "לא הצלחנו לקרוא את קובץ ה-JSON." };
  }
}

function uniqueSnapshotValues(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function selectSnapshotLesson(row: V6ManagementScheduleLessonRow, publishedOverrides: V6ManagementLessonOverrides): V6TimetableSnapshotLesson {
  return {
    lessonId: row.lesson.id,
    title: row.group?.name ?? row.lesson.title,
    day: row.day,
    startTime: row.lesson.time,
    endTime: row.endTime,
    durationMinutes: row.durationMinutes,
    group: row.group
      ? {
        id: row.group.id,
        name: row.group.name,
        ageGroup: row.group.ageGroup
      }
      : row.lesson.groupId
        ? { id: row.lesson.groupId }
        : undefined,
    danceStyle: row.danceStyle,
    teacherName: row.teacherNames,
    room: row.roomName,
    status: row.status,
    studentCount: row.studentCount,
    hasPublishedOverride: Boolean(publishedOverrides[row.lesson.id])
  };
}

function selectSnapshotDays(input: {
  publishedRows: V6ManagementScheduleLessonRow[];
  publishedOverrides: V6ManagementLessonOverrides;
  conflictsByDay: Record<string, number>;
}): V6TimetableSnapshotDay[] {
  const days = new Map<string, V6TimetableSnapshotLesson[]>();
  for (const row of input.publishedRows) {
    days.set(row.day, [...(days.get(row.day) ?? []), selectSnapshotLesson(row, input.publishedOverrides)]);
  }

  return Array.from(days.entries()).map(([day, lessons]) => {
    const rooms = uniqueSnapshotValues(lessons.map((lesson) => lesson.room));
    return {
      day,
      lessonCount: lessons.length,
      roomCount: rooms.length,
      rooms,
      studentCount: lessons.reduce((sum, lesson) => sum + lesson.studentCount, 0),
      conflictCount: input.conflictsByDay[day] ?? 0,
      lessons
    };
  });
}

function selectRecentAuditEventSummary(events: V6TimetableAuditEvent[], limit: number): V6TimetableSnapshotAuditEventSummary[] {
  return [...events]
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
    .slice(0, Math.max(0, limit))
    .map((event) => ({
      id: event.id,
      action: event.action,
      occurredAt: event.occurredAt,
      source: event.source,
      actor: event.actor,
      lesson: event.metadata.lesson,
      changedFields: event.metadata.changedFields,
      conflictCount: event.metadata.conflicts?.totalCount,
      blockingConflictCount: event.metadata.conflicts?.blockingCount,
      unsavedEditCount: event.metadata.session?.unsavedEditCountAfter ?? event.metadata.session?.unsavedEditCount,
      note: event.metadata.note
    }));
}

export function createV6TimetableSnapshot(input: CreateV6TimetableSnapshotInput): V6TimetableSnapshot {
  const publishedOverrides = clonePublishedOverrides(input.session.baseOverrides);
  const publishedRows = input.scheduleLessonRows.map((row) => applyV6ManagementLessonOverride(row, publishedOverrides[row.lesson.id]));
  const conflictMetadata = selectV6ManagementTimetableConflicts({
    localScheduleLessonRows: publishedRows,
    lessonOverrides: publishedOverrides
  });
  const conflictPolicy = selectV6TimetableConflictPublishPolicy(conflictMetadata);
  const conflictsByDay = selectV6ManagementTimetableConflictCountsByDay(conflictMetadata);
  const days = selectSnapshotDays({ publishedRows, publishedOverrides, conflictsByDay });
  const sessionMeta = selectV6ManagementTimetableEditSessionMeta(input.session);
  const recentAuditLimit = input.recentAuditLimit ?? 5;

  const snapshot: V6TimetableSnapshot = {
    schemaVersion: V6_TIMETABLE_SNAPSHOT_SCHEMA_VERSION,
    generatedAt: input.generatedAt,
    source: {
      label: input.sourceLabel,
      versionLabel: input.versionLabel ?? "v6-management-weekly-local",
      state: "published",
      persistence: "download-only"
    },
    published: {
      lessonCount: publishedRows.length,
      dayCount: days.length,
      roomCount: uniqueSnapshotValues(publishedRows.map((row) => row.roomName)).length,
      overrideCount: Object.keys(publishedOverrides).length,
      overrides: publishedOverrides,
      days
    },
    draft: {
      isDirty: sessionMeta.isDirty,
      unsavedEditCount: sessionMeta.unsavedEditCount,
      currentOverrideCount: Object.keys(input.session.currentOverrides).length
    },
    conflicts: {
      totalCount: conflictMetadata.conflicts.length,
      hasConflicts: conflictMetadata.hasConflicts,
      countsByKind: { ...conflictMetadata.countsByKind },
      blockingCount: conflictPolicy.blockingCount,
      warningCount: conflictPolicy.warningCount,
      blockingCountsByKind: { ...conflictPolicy.blockingCountsByKind },
      hasBlockingConflicts: conflictPolicy.hasBlockingConflicts,
      byDay: conflictsByDay,
      summary: selectV6ManagementTimetableConflictSummary(conflictMetadata)
    },
    audit: {
      totalKnownEventCount: input.auditEvents?.length ?? 0,
      includedRecentEventCount: Math.min(input.auditEvents?.length ?? 0, Math.max(0, recentAuditLimit)),
      recentEvents: selectRecentAuditEventSummary(input.auditEvents ?? [], recentAuditLimit)
    }
  };

  if (!input.persistence) return snapshot;

  return {
    ...snapshot,
    persistence: createTimetablePersistencePayload({
      academyId: input.persistence.academyId,
      timetableId: input.persistence.timetableId,
      sourceLabel: input.sourceLabel,
      source: input.persistence.source,
      versionLabel: input.versionLabel ?? snapshot.source.versionLabel,
      createdAt: input.persistence.createdAt ?? input.generatedAt,
      updatedAt: input.persistence.updatedAt ?? input.generatedAt,
      publishedAt: input.persistence.publishedAt ?? input.generatedAt,
      draftUpdatedAt: input.persistence.draftUpdatedAt,
      session: input.session,
      auditEvents: input.auditEvents,
      conflictMetadata,
      snapshot
    })
  };
}

export function serializeV6TimetableSnapshot(snapshot: V6TimetableSnapshot) {
  return JSON.stringify(snapshot, null, 2);
}

export function createV6TimetableSnapshotFilename(generatedAt: string) {
  const safeTimestamp = generatedAt.replace(/[:.]/g, "-");
  return `v6-management-timetable-snapshot-${safeTimestamp}.json`;
}
