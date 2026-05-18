import type { V6Role } from "@/lib/v6/types";
import type { V6ManagementLessonOverride, V6ManagementTimetableEditSessionMeta } from "@/lib/v6/timetable-editing";
import type { V6TimetableConflictKind, V6TimetableConflictMetadata, V6TimetableConflictPublishPolicy } from "@/lib/v6/timetable-conflicts";

export type V6TimetableAuditAction =
  | "slot_edited"
  | "undo"
  | "redo"
  | "draft_discarded"
  | "publish_attempted"
  | "publish_blocked_by_conflicts"
  | "publish_succeeded"
  | "snapshot_restored";

export type V6TimetableAuditSource = "frontend-local";

export type V6TimetableAuditActor = {
  actorId?: string;
  displayName?: string;
  role?: V6Role;
};

export type V6TimetableAuditLessonRef = {
  lessonId: string;
  title?: string;
  groupId?: string;
  groupName?: string;
  day?: string;
  startTime?: string;
  endTime?: string;
  room?: string;
  teacherName?: string;
};

export type V6TimetableAuditChangedField = {
  field: keyof V6ManagementLessonOverride;
  before?: string | number;
  after?: string | number;
};

export type V6TimetableAuditConflictSummary = {
  totalCount: number;
  countsByKind: Record<V6TimetableConflictKind, number>;
  blockingCount?: number;
  warningCount?: number;
  blockingCountsByKind?: Record<V6TimetableConflictKind, number>;
  hasBlockingConflicts?: boolean;
};

export type V6TimetableAuditSessionSnapshot = Partial<Pick<V6ManagementTimetableEditSessionMeta, "isDirty" | "canUndo" | "canRedo" | "unsavedEditCount">> & {
  unsavedEditCountBefore?: number;
  unsavedEditCountAfter?: number;
};

export type V6TimetableAuditMetadata = {
  lesson?: V6TimetableAuditLessonRef;
  changedFields?: V6TimetableAuditChangedField[];
  conflicts?: V6TimetableAuditConflictSummary;
  session?: V6TimetableAuditSessionSnapshot;
  note?: string;
};

export type V6TimetableAuditEvent = {
  id: string;
  action: V6TimetableAuditAction;
  occurredAt: string;
  source: V6TimetableAuditSource;
  actor: V6TimetableAuditActor;
  metadata: V6TimetableAuditMetadata;
};

const auditedLessonFields: Array<keyof V6ManagementLessonOverride> = [
  "displayTitle",
  "room",
  "teacherId",
  "teacherName",
  "durationMinutes",
  "status"
];

function createAuditId(action: V6TimetableAuditAction, occurredAt: string) {
  const randomId = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
  return `v6-timetable:${action}:${occurredAt}:${randomId}`;
}

function createV6TimetableAuditEvent(input: {
  action: V6TimetableAuditAction;
  actor?: V6TimetableAuditActor;
  metadata?: V6TimetableAuditMetadata;
  occurredAt?: string;
}): V6TimetableAuditEvent {
  const occurredAt = input.occurredAt ?? new Date().toISOString();
  return {
    id: createAuditId(input.action, occurredAt),
    action: input.action,
    occurredAt,
    source: "frontend-local",
    actor: input.actor ?? {},
    metadata: input.metadata ?? {}
  };
}

export function selectV6TimetableAuditActor(input?: { id?: string; name?: string; role?: V6Role }): V6TimetableAuditActor {
  return {
    actorId: input?.id,
    displayName: input?.name,
    role: input?.role
  };
}

export function selectV6TimetableAuditChangedFields(input: {
  before?: V6ManagementLessonOverride;
  after: V6ManagementLessonOverride;
}): V6TimetableAuditChangedField[] {
  return auditedLessonFields
    .filter((field) => input.before?.[field] !== input.after[field])
    .map((field) => ({
      field,
      before: input.before?.[field],
      after: input.after[field]
    }));
}

export function selectV6TimetableAuditConflictSummary(input: {
  metadata: V6TimetableConflictMetadata;
  policy?: V6TimetableConflictPublishPolicy;
}): V6TimetableAuditConflictSummary {
  return {
    totalCount: input.metadata.conflicts.length,
    countsByKind: { ...input.metadata.countsByKind },
    blockingCount: input.policy?.blockingCount,
    warningCount: input.policy?.warningCount,
    blockingCountsByKind: input.policy ? { ...input.policy.blockingCountsByKind } : undefined,
    hasBlockingConflicts: input.policy?.hasBlockingConflicts
  };
}

export function createV6TimetableSlotEditedAuditEvent(input: {
  actor?: V6TimetableAuditActor;
  lesson: V6TimetableAuditLessonRef;
  before?: V6ManagementLessonOverride;
  after: V6ManagementLessonOverride;
  session?: V6TimetableAuditSessionSnapshot;
  conflicts?: V6TimetableAuditConflictSummary;
}) {
  return createV6TimetableAuditEvent({
    action: "slot_edited",
    actor: input.actor,
    metadata: {
      lesson: input.lesson,
      changedFields: selectV6TimetableAuditChangedFields({ before: input.before, after: input.after }),
      session: input.session,
      conflicts: input.conflicts
    }
  });
}

export function createV6TimetableUndoAuditEvent(input: {
  actor?: V6TimetableAuditActor;
  session?: V6TimetableAuditSessionSnapshot;
  conflicts?: V6TimetableAuditConflictSummary;
}) {
  return createV6TimetableAuditEvent({
    action: "undo",
    actor: input.actor,
    metadata: { session: input.session, conflicts: input.conflicts }
  });
}

export function createV6TimetableRedoAuditEvent(input: {
  actor?: V6TimetableAuditActor;
  session?: V6TimetableAuditSessionSnapshot;
  conflicts?: V6TimetableAuditConflictSummary;
}) {
  return createV6TimetableAuditEvent({
    action: "redo",
    actor: input.actor,
    metadata: { session: input.session, conflicts: input.conflicts }
  });
}

export function createV6TimetableDraftDiscardedAuditEvent(input: {
  actor?: V6TimetableAuditActor;
  session?: V6TimetableAuditSessionSnapshot;
}) {
  return createV6TimetableAuditEvent({
    action: "draft_discarded",
    actor: input.actor,
    metadata: { session: input.session }
  });
}

export function createV6TimetablePublishAttemptedAuditEvent(input: {
  actor?: V6TimetableAuditActor;
  session?: V6TimetableAuditSessionSnapshot;
  conflicts?: V6TimetableAuditConflictSummary;
}) {
  return createV6TimetableAuditEvent({
    action: "publish_attempted",
    actor: input.actor,
    metadata: { session: input.session, conflicts: input.conflicts }
  });
}

export function createV6TimetablePublishBlockedAuditEvent(input: {
  actor?: V6TimetableAuditActor;
  session?: V6TimetableAuditSessionSnapshot;
  conflicts: V6TimetableAuditConflictSummary;
}) {
  return createV6TimetableAuditEvent({
    action: "publish_blocked_by_conflicts",
    actor: input.actor,
    metadata: { session: input.session, conflicts: input.conflicts }
  });
}

export function createV6TimetablePublishSucceededAuditEvent(input: {
  actor?: V6TimetableAuditActor;
  session?: V6TimetableAuditSessionSnapshot;
  conflicts?: V6TimetableAuditConflictSummary;
}) {
  return createV6TimetableAuditEvent({
    action: "publish_succeeded",
    actor: input.actor,
    metadata: { session: input.session, conflicts: input.conflicts }
  });
}

export function createV6TimetableSnapshotRestoredAuditEvent(input: {
  actor?: V6TimetableAuditActor;
  session?: V6TimetableAuditSessionSnapshot;
  conflicts?: V6TimetableAuditConflictSummary;
  note?: string;
}) {
  return createV6TimetableAuditEvent({
    action: "snapshot_restored",
    actor: input.actor,
    metadata: { session: input.session, conflicts: input.conflicts, note: input.note }
  });
}
