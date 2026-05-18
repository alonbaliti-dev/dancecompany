import {
  createV6ManagementTimetableEditSession,
  selectV6ManagementTimetableConflictSummary,
  selectV6ManagementTimetableEditSessionMeta,
  type V6ManagementLessonOverride,
  type V6ManagementLessonOverrides,
  type V6ManagementTimetableConflictSummary,
  type V6ManagementTimetableEditSession,
  type V6ManagementTimetableEditSessionMeta
} from "@/lib/v6/timetable-editing";
import {
  selectV6TimetableConflictPublishPolicy,
  type V6TimetableConflictKind,
  type V6TimetableConflictMetadata,
  type V6TimetableConflictPublishPolicy
} from "@/lib/v6/timetable-conflicts";
import type { V6TimetableAuditEvent } from "@/lib/v6/timetable-audit";
import type {
  V6TimetableSnapshot,
  V6TimetableSnapshotImportSummary
} from "@/lib/v6/timetable-snapshot";

export const V6_TIMETABLE_PERSISTENCE_CONTRACT_VERSION = "v6-management-timetable-persistence.1" as const;

export type V6TimetablePersistenceContractVersion = typeof V6_TIMETABLE_PERSISTENCE_CONTRACT_VERSION;

export type V6TimetablePersistenceSource = {
  timetableId: string;
  label: string;
  source?: "frontend-local" | "future-supabase" | string;
  versionLabel?: string;
};

export type V6TimetablePersistenceTimestamps = {
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  draftUpdatedAt?: string;
};

export type V6TimetablePersistenceSnapshotMetadata = {
  schemaVersion: V6TimetableSnapshot["schemaVersion"];
  generatedAt: string;
  source: V6TimetableSnapshot["source"];
  summary: V6TimetableSnapshotImportSummary;
};

export type V6TimetablePersistenceAuditSummary = {
  totalEventCount: number;
  firstEventAt?: string;
  lastEventAt?: string;
  countsByAction: Partial<Record<V6TimetableAuditEvent["action"], number>>;
};

export type V6TimetablePersistenceConflictSummary = {
  totalCount: number;
  hasConflicts: boolean;
  countsByKind: Record<V6TimetableConflictKind, number>;
  publishPolicy: V6TimetableConflictPublishPolicy;
  summary: V6ManagementTimetableConflictSummary[];
};

export type V6TimetablePersistencePayload = {
  version: V6TimetablePersistenceContractVersion;
  academyId?: string;
  source: V6TimetablePersistenceSource;
  timestamps: V6TimetablePersistenceTimestamps;
  published: {
    overrideCount: number;
    baseOverrides: V6ManagementLessonOverrides;
  };
  draft: {
    isDirty: boolean;
    currentOverrideCount: number;
    currentOverrides: V6ManagementLessonOverrides;
    sessionMeta: V6ManagementTimetableEditSessionMeta;
    history: {
      past: V6ManagementLessonOverrides[];
      future: V6ManagementLessonOverrides[];
    };
  };
  audit: {
    summary: V6TimetablePersistenceAuditSummary;
    events: V6TimetableAuditEvent[];
  };
  snapshot?: V6TimetablePersistenceSnapshotMetadata;
  conflicts?: V6TimetablePersistenceConflictSummary & {
    metadata: V6TimetableConflictMetadata;
  };
};

export type CreateTimetablePersistencePayloadInput = {
  academyId?: string;
  timetableId: string;
  sourceLabel: string;
  source?: V6TimetablePersistenceSource["source"];
  versionLabel?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  draftUpdatedAt?: string;
  session: V6ManagementTimetableEditSession;
  auditEvents?: V6TimetableAuditEvent[];
  conflictMetadata?: V6TimetableConflictMetadata;
  snapshot?: V6TimetableSnapshot;
};

export type HydrateTimetableSessionFromPersistenceResult = {
  academyId?: string;
  source: V6TimetablePersistenceSource;
  timestamps: V6TimetablePersistenceTimestamps;
  session: V6ManagementTimetableEditSession;
  auditEvents: V6TimetableAuditEvent[];
  snapshot?: V6TimetablePersistenceSnapshotMetadata;
  conflicts?: V6TimetablePersistencePayload["conflicts"];
};

export type ValidateTimetablePersistencePayloadResult =
  | {
    ok: true;
    payload: V6TimetablePersistencePayload;
  }
  | {
    ok: false;
    error: string;
  };

const expectedOverrideKeys: Array<keyof V6ManagementLessonOverride> = [
  "displayTitle",
  "room",
  "teacherId",
  "teacherName",
  "durationMinutes",
  "status"
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isTimestampText(value: unknown): value is string {
  return isNonEmptyText(value) && !Number.isNaN(Date.parse(value));
}

function cloneLessonOverrides(overrides: V6ManagementLessonOverrides): V6ManagementLessonOverrides {
  return Object.fromEntries(
    Object.entries(overrides)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([lessonId, override]) => [lessonId, { ...override }])
  );
}

function cloneLessonOverrideHistory(history: V6ManagementLessonOverrides[]) {
  return history.map((overrides) => cloneLessonOverrides(overrides));
}

function cloneAuditEvents(events: V6TimetableAuditEvent[]) {
  return events.map((event) => ({
    ...event,
    actor: { ...event.actor },
    metadata: {
      ...event.metadata,
      lesson: event.metadata.lesson ? { ...event.metadata.lesson } : undefined,
      changedFields: event.metadata.changedFields?.map((field) => ({ ...field })),
      conflicts: event.metadata.conflicts
        ? {
          ...event.metadata.conflicts,
          countsByKind: { ...event.metadata.conflicts.countsByKind },
          blockingCountsByKind: event.metadata.conflicts.blockingCountsByKind
            ? { ...event.metadata.conflicts.blockingCountsByKind }
            : undefined
        }
        : undefined,
      session: event.metadata.session ? { ...event.metadata.session } : undefined
    }
  }));
}

function selectAuditSummary(events: V6TimetableAuditEvent[]): V6TimetablePersistenceAuditSummary {
  const sortedEvents = [...events].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
  return {
    totalEventCount: events.length,
    firstEventAt: sortedEvents[0]?.occurredAt,
    lastEventAt: sortedEvents.at(-1)?.occurredAt,
    countsByAction: events.reduce<V6TimetablePersistenceAuditSummary["countsByAction"]>(
      (counts, event) => ({
        ...counts,
        [event.action]: (counts[event.action] ?? 0) + 1
      }),
      {}
    )
  };
}

function selectSnapshotMetadata(snapshot: V6TimetableSnapshot): V6TimetablePersistenceSnapshotMetadata {
  return {
    schemaVersion: snapshot.schemaVersion,
    generatedAt: snapshot.generatedAt,
    source: { ...snapshot.source },
    summary: {
      generatedAt: snapshot.generatedAt,
      sourceLabel: snapshot.source.label,
      versionLabel: snapshot.source.versionLabel,
      lessonCount: snapshot.published.lessonCount,
      dayCount: snapshot.published.dayCount,
      roomCount: snapshot.published.roomCount,
      overrideCount: snapshot.published.overrideCount
    }
  };
}

function selectConflictPersistenceSummary(metadata: V6TimetableConflictMetadata): V6TimetablePersistencePayload["conflicts"] {
  const publishPolicy = selectV6TimetableConflictPublishPolicy(metadata);
  return {
    totalCount: metadata.conflicts.length,
    hasConflicts: metadata.hasConflicts,
    countsByKind: { ...metadata.countsByKind },
    publishPolicy,
    summary: selectV6ManagementTimetableConflictSummary(metadata),
    metadata
  };
}

function parseOverride(lessonId: string, value: unknown): V6ManagementLessonOverride | string {
  if (!isRecord(value)) return `Timetable override ${lessonId} is not an object.`;
  const extraKey = Object.keys(value).find((key) => !expectedOverrideKeys.includes(key as keyof V6ManagementLessonOverride));
  if (extraKey) return `Timetable override ${lessonId} has unsupported field: ${extraKey}.`;

  if (!isNonEmptyText(value.displayTitle)) return `Timetable override ${lessonId} is missing displayTitle.`;
  if (!isNonEmptyText(value.room)) return `Timetable override ${lessonId} is missing room.`;
  if (typeof value.teacherId !== "string") return `Timetable override ${lessonId} is missing teacherId.`;
  if (typeof value.teacherName !== "string") return `Timetable override ${lessonId} is missing teacherName.`;
  if (typeof value.status !== "string" || !value.status.trim()) return `Timetable override ${lessonId} is missing status.`;
  if (typeof value.durationMinutes !== "number" || !Number.isInteger(value.durationMinutes) || value.durationMinutes <= 0 || value.durationMinutes > 360) {
    return `Timetable override ${lessonId} has invalid durationMinutes.`;
  }

  return {
    displayTitle: value.displayTitle.trim(),
    room: value.room.trim(),
    teacherId: value.teacherId.trim(),
    teacherName: value.teacherName.trim(),
    durationMinutes: value.durationMinutes,
    status: value.status.trim()
  };
}

function parseOverrides(value: unknown, label: string): V6ManagementLessonOverrides | string {
  if (!isRecord(value)) return `${label} overrides are not an object.`;

  const overrides: V6ManagementLessonOverrides = {};
  for (const [lessonId, overrideValue] of Object.entries(value)) {
    const safeLessonId = lessonId.trim();
    if (!safeLessonId) return `${label} overrides include an empty lesson id.`;

    const override = parseOverride(safeLessonId, overrideValue);
    if (typeof override === "string") return override;
    overrides[safeLessonId] = override;
  }

  return cloneLessonOverrides(overrides);
}

function parseOverrideHistory(value: unknown, label: string): V6ManagementLessonOverrides[] | string {
  if (!Array.isArray(value)) return `${label} history is not an array.`;

  const history: V6ManagementLessonOverrides[] = [];
  for (const item of value) {
    const overrides = parseOverrides(item, label);
    if (typeof overrides === "string") return overrides;
    history.push(overrides);
  }

  return history;
}

export function isSupportedTimetablePersistenceVersion(version: unknown): version is V6TimetablePersistenceContractVersion {
  return version === V6_TIMETABLE_PERSISTENCE_CONTRACT_VERSION;
}

export function createTimetablePersistencePayload(input: CreateTimetablePersistencePayloadInput): V6TimetablePersistencePayload {
  const baseOverrides = cloneLessonOverrides(input.session.baseOverrides);
  const currentOverrides = cloneLessonOverrides(input.session.currentOverrides);
  const sessionMeta = selectV6ManagementTimetableEditSessionMeta(input.session);
  const auditEvents = cloneAuditEvents(input.auditEvents ?? []);

  return {
    version: V6_TIMETABLE_PERSISTENCE_CONTRACT_VERSION,
    academyId: input.academyId,
    source: {
      timetableId: input.timetableId,
      label: input.sourceLabel,
      source: input.source ?? "frontend-local",
      versionLabel: input.versionLabel
    },
    timestamps: {
      createdAt: input.createdAt,
      updatedAt: input.updatedAt,
      publishedAt: input.publishedAt,
      draftUpdatedAt: input.draftUpdatedAt
    },
    published: {
      overrideCount: Object.keys(baseOverrides).length,
      baseOverrides
    },
    draft: {
      isDirty: sessionMeta.isDirty,
      currentOverrideCount: Object.keys(currentOverrides).length,
      currentOverrides,
      sessionMeta,
      history: {
        past: cloneLessonOverrideHistory(input.session.past),
        future: cloneLessonOverrideHistory(input.session.future)
      }
    },
    audit: {
      summary: selectAuditSummary(auditEvents),
      events: auditEvents
    },
    snapshot: input.snapshot ? selectSnapshotMetadata(input.snapshot) : undefined,
    conflicts: input.conflictMetadata ? selectConflictPersistenceSummary(input.conflictMetadata) : undefined
  };
}

export function hydrateTimetableSessionFromPersistence(payload: V6TimetablePersistencePayload): HydrateTimetableSessionFromPersistenceResult {
  return {
    academyId: payload.academyId,
    source: { ...payload.source },
    timestamps: { ...payload.timestamps },
    session: {
      baseOverrides: cloneLessonOverrides(payload.published.baseOverrides),
      currentOverrides: cloneLessonOverrides(payload.draft.currentOverrides),
      past: cloneLessonOverrideHistory(payload.draft.history.past),
      future: cloneLessonOverrideHistory(payload.draft.history.future)
    },
    auditEvents: cloneAuditEvents(payload.audit.events),
    snapshot: payload.snapshot
      ? {
        ...payload.snapshot,
        source: { ...payload.snapshot.source },
        summary: { ...payload.snapshot.summary }
      }
      : undefined,
    conflicts: payload.conflicts
  };
}

export function hydratePublishedTimetableSessionFromPersistence(payload: V6TimetablePersistencePayload): V6ManagementTimetableEditSession {
  return createV6ManagementTimetableEditSession(payload.published.baseOverrides);
}

export function validateTimetablePersistencePayload(value: unknown): ValidateTimetablePersistencePayloadResult {
  if (!isRecord(value)) return { ok: false, error: "Timetable persistence payload is not an object." };
  if (!isSupportedTimetablePersistenceVersion(value.version)) return { ok: false, error: "Timetable persistence version is not supported." };

  const source = value.source;
  if (!isRecord(source) || !isNonEmptyText(source.timetableId) || !isNonEmptyText(source.label)) {
    return { ok: false, error: "Timetable persistence payload is missing source metadata." };
  }

  const timestamps = value.timestamps;
  if (!isRecord(timestamps) || !isTimestampText(timestamps.createdAt) || !isTimestampText(timestamps.updatedAt)) {
    return { ok: false, error: "Timetable persistence payload is missing valid timestamps." };
  }

  const published = value.published;
  if (!isRecord(published) || typeof published.overrideCount !== "number" || !Number.isInteger(published.overrideCount) || published.overrideCount < 0) {
    return { ok: false, error: "Timetable persistence payload is missing published metadata." };
  }
  const baseOverrides = parseOverrides(published.baseOverrides, "Published");
  if (typeof baseOverrides === "string") return { ok: false, error: baseOverrides };
  if (Object.keys(baseOverrides).length !== published.overrideCount) {
    return { ok: false, error: "Published override count does not match published overrides." };
  }

  const draft = value.draft;
  if (!isRecord(draft) || typeof draft.isDirty !== "boolean" || typeof draft.currentOverrideCount !== "number" || !Number.isInteger(draft.currentOverrideCount) || draft.currentOverrideCount < 0) {
    return { ok: false, error: "Timetable persistence payload is missing draft metadata." };
  }
  const currentOverrides = parseOverrides(draft.currentOverrides, "Draft");
  if (typeof currentOverrides === "string") return { ok: false, error: currentOverrides };
  if (Object.keys(currentOverrides).length !== draft.currentOverrideCount) {
    return { ok: false, error: "Draft override count does not match draft overrides." };
  }

  const history = draft.history;
  if (!isRecord(history)) return { ok: false, error: "Timetable persistence payload is missing draft history." };
  const past = parseOverrideHistory(history.past, "Past draft");
  if (typeof past === "string") return { ok: false, error: past };
  const future = parseOverrideHistory(history.future, "Future draft");
  if (typeof future === "string") return { ok: false, error: future };

  const audit = value.audit;
  if (!isRecord(audit) || !Array.isArray(audit.events)) return { ok: false, error: "Timetable persistence payload is missing audit events." };

  return {
    ok: true,
    payload: {
      version: value.version,
      academyId: typeof value.academyId === "string" ? value.academyId : undefined,
      source: {
        timetableId: source.timetableId.trim(),
        label: source.label.trim(),
        source: typeof source.source === "string" ? source.source : undefined,
        versionLabel: typeof source.versionLabel === "string" ? source.versionLabel : undefined
      },
      timestamps: {
        createdAt: timestamps.createdAt,
        updatedAt: timestamps.updatedAt,
        publishedAt: typeof timestamps.publishedAt === "string" ? timestamps.publishedAt : undefined,
        draftUpdatedAt: typeof timestamps.draftUpdatedAt === "string" ? timestamps.draftUpdatedAt : undefined
      },
      published: {
        overrideCount: Object.keys(baseOverrides).length,
        baseOverrides
      },
      draft: {
        isDirty: draft.isDirty,
        currentOverrideCount: Object.keys(currentOverrides).length,
        currentOverrides,
        sessionMeta: selectV6ManagementTimetableEditSessionMeta({
          baseOverrides,
          currentOverrides,
          past,
          future
        }),
        history: {
          past,
          future
        }
      },
      audit: {
        summary: selectAuditSummary(audit.events as V6TimetableAuditEvent[]),
        events: cloneAuditEvents(audit.events as V6TimetableAuditEvent[])
      },
      snapshot: isRecord(value.snapshot) ? value.snapshot as V6TimetablePersistenceSnapshotMetadata : undefined,
      conflicts: isRecord(value.conflicts) ? value.conflicts as V6TimetablePersistencePayload["conflicts"] : undefined
    }
  };
}
