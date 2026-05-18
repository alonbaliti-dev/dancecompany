import type { V6TimetableAuditEvent } from "@/lib/v6/timetable-audit";
import {
  validateTimetablePersistencePayload,
  type V6TimetablePersistencePayload
} from "@/lib/v6/timetable-persistence";

export type V6TimetablePersistenceAdapterMode = "memory" | "noop" | string;

export type V6TimetablePersistenceOperation =
  | "load"
  | "save_draft"
  | "publish"
  | "append_audit"
  | "create_snapshot"
  | "load_snapshot_for_restore";

export type V6TimetablePersistenceAdapterErrorCode =
  | "invalid_payload"
  | "not_found"
  | "read_failed"
  | "write_failed"
  | "publish_failed"
  | "audit_failed"
  | "snapshot_failed";

export type V6TimetablePersistenceAdapterError = {
  code: V6TimetablePersistenceAdapterErrorCode;
  message: string;
  operation: V6TimetablePersistenceOperation;
  cause?: unknown;
};

export type V6TimetablePersistenceAdapterResult<T> =
  | {
    ok: true;
    value: T;
  }
  | {
    ok: false;
    error: V6TimetablePersistenceAdapterError;
  };

export type V6TimetablePersistenceContext = {
  academyId: string;
  timetableId: string;
  actorId?: string;
  requestId?: string;
  source?: string;
};

export type V6TimetablePersistenceLoadInput = V6TimetablePersistenceContext;

export type V6TimetablePersistenceSaveDraftInput = V6TimetablePersistenceContext & {
  payload: V6TimetablePersistencePayload;
};

export type V6TimetablePersistencePublishInput = V6TimetablePersistenceContext & {
  payload: V6TimetablePersistencePayload;
};

export type V6TimetablePersistenceAppendAuditEventInput = V6TimetablePersistenceContext & {
  event: V6TimetableAuditEvent;
};

export type V6TimetablePersistenceWriteReceipt = {
  academyId: string;
  timetableId: string;
  mode: V6TimetablePersistenceAdapterMode;
  operation: Extract<V6TimetablePersistenceOperation, "save_draft" | "publish">;
  payloadVersion: V6TimetablePersistencePayload["version"];
  updatedAt: string;
  requestId?: string;
};

export type V6TimetablePersistenceAuditReceipt = {
  academyId: string;
  timetableId: string;
  mode: V6TimetablePersistenceAdapterMode;
  operation: "append_audit";
  eventId: string;
  totalEventCount?: number;
  updatedAt: string;
  requestId?: string;
};

export type V6TimetablePersistenceAdapter = {
  mode: V6TimetablePersistenceAdapterMode;
  loadTimetable(input: V6TimetablePersistenceLoadInput): Promise<V6TimetablePersistenceAdapterResult<V6TimetablePersistencePayload | null>>;
  saveDraft(input: V6TimetablePersistenceSaveDraftInput): Promise<V6TimetablePersistenceAdapterResult<V6TimetablePersistenceWriteReceipt>>;
  publishTimetable(input: V6TimetablePersistencePublishInput): Promise<V6TimetablePersistenceAdapterResult<V6TimetablePersistenceWriteReceipt>>;
  appendAuditEvent(input: V6TimetablePersistenceAppendAuditEventInput): Promise<V6TimetablePersistenceAdapterResult<V6TimetablePersistenceAuditReceipt>>;
};

type StoredTimetablePersistencePayloads = Map<string, V6TimetablePersistencePayload>;

function createAdapterError(input: {
  code: V6TimetablePersistenceAdapterErrorCode;
  message: string;
  operation: V6TimetablePersistenceOperation;
  cause?: unknown;
}): V6TimetablePersistenceAdapterResult<never> {
  return {
    ok: false,
    error: {
      code: input.code,
      message: input.message,
      operation: input.operation,
      cause: input.cause
    }
  };
}

function createAdapterSuccess<T>(value: T): V6TimetablePersistenceAdapterResult<T> {
  return { ok: true, value };
}

function createStorageKey(input: V6TimetablePersistenceContext) {
  return `${input.academyId}:${input.timetableId}`;
}

function cloneJsonValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function clonePersistencePayload(
  payload: V6TimetablePersistencePayload,
  operation: V6TimetablePersistenceOperation
): V6TimetablePersistenceAdapterResult<V6TimetablePersistencePayload> {
  const validation = validateTimetablePersistencePayload(cloneJsonValue(payload));
  if (validation.ok === false) {
    return createAdapterError({
      code: "invalid_payload",
      message: validation.error,
      operation
    });
  }

  return createAdapterSuccess(validation.payload);
}

function cloneAuditEvent(event: V6TimetableAuditEvent) {
  return cloneJsonValue(event);
}

function selectAuditSummaryAfterAppend(
  payload: V6TimetablePersistencePayload,
  event: V6TimetableAuditEvent
): V6TimetablePersistencePayload["audit"]["summary"] {
  const events = [...payload.audit.events, event].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
  return {
    totalEventCount: events.length,
    firstEventAt: events[0]?.occurredAt,
    lastEventAt: events.at(-1)?.occurredAt,
    countsByAction: events.reduce<V6TimetablePersistencePayload["audit"]["summary"]["countsByAction"]>(
      (counts, auditEvent) => ({
        ...counts,
        [auditEvent.action]: (counts[auditEvent.action] ?? 0) + 1
      }),
      {}
    )
  };
}

function createWriteReceipt(input: {
  context: V6TimetablePersistenceContext;
  mode: V6TimetablePersistenceAdapterMode;
  operation: V6TimetablePersistenceWriteReceipt["operation"];
  payload: V6TimetablePersistencePayload;
}): V6TimetablePersistenceWriteReceipt {
  return {
    academyId: input.context.academyId,
    timetableId: input.context.timetableId,
    mode: input.mode,
    operation: input.operation,
    payloadVersion: input.payload.version,
    updatedAt: input.payload.timestamps.updatedAt,
    requestId: input.context.requestId
  };
}

function createAuditReceipt(input: {
  context: V6TimetablePersistenceContext;
  mode: V6TimetablePersistenceAdapterMode;
  event: V6TimetableAuditEvent;
  totalEventCount?: number;
}): V6TimetablePersistenceAuditReceipt {
  return {
    academyId: input.context.academyId,
    timetableId: input.context.timetableId,
    mode: input.mode,
    operation: "append_audit",
    eventId: input.event.id,
    totalEventCount: input.totalEventCount,
    updatedAt: input.event.occurredAt,
    requestId: input.context.requestId
  };
}

export function createV6InMemoryTimetablePersistenceAdapter(initialPayloads?: V6TimetablePersistencePayload[]): V6TimetablePersistenceAdapter {
  const mode = "memory";
  const payloads: StoredTimetablePersistencePayloads = new Map();

  for (const payload of initialPayloads ?? []) {
    const cloned = clonePersistencePayload(payload, "save_draft");
    if (cloned.ok === true) {
      payloads.set(createStorageKey({
        academyId: cloned.value.academyId ?? "",
        timetableId: cloned.value.source.timetableId
      }), cloned.value);
    }
  }

  return {
    mode,
    async loadTimetable(input) {
      try {
        const payload = payloads.get(createStorageKey(input));
        if (!payload) return createAdapterSuccess(null);
        return clonePersistencePayload(payload, "load");
      } catch (error) {
        return createAdapterError({
          code: "read_failed",
          message: "Failed to load timetable from the in-memory adapter.",
          operation: "load",
          cause: error
        });
      }
    },
    async saveDraft(input) {
      try {
        const cloned = clonePersistencePayload(input.payload, "save_draft");
        if (cloned.ok === false) return cloned;

        payloads.set(createStorageKey(input), cloned.value);
        return createAdapterSuccess(createWriteReceipt({
          context: input,
          mode,
          operation: "save_draft",
          payload: cloned.value
        }));
      } catch (error) {
        return createAdapterError({
          code: "write_failed",
          message: "Failed to save draft timetable in the in-memory adapter.",
          operation: "save_draft",
          cause: error
        });
      }
    },
    async publishTimetable(input) {
      try {
        const cloned = clonePersistencePayload(input.payload, "publish");
        if (cloned.ok === false) return cloned;

        payloads.set(createStorageKey(input), cloned.value);
        return createAdapterSuccess(createWriteReceipt({
          context: input,
          mode,
          operation: "publish",
          payload: cloned.value
        }));
      } catch (error) {
        return createAdapterError({
          code: "publish_failed",
          message: "Failed to publish timetable in the in-memory adapter.",
          operation: "publish",
          cause: error
        });
      }
    },
    async appendAuditEvent(input) {
      try {
        const existing = payloads.get(createStorageKey(input));
        if (!existing) {
          return createAdapterError({
            code: "not_found",
            message: "Cannot append an audit event before a timetable payload has been saved.",
            operation: "append_audit"
          });
        }

        const event = cloneAuditEvent(input.event);
        const updatedPayload: V6TimetablePersistencePayload = {
          ...existing,
          timestamps: {
            ...existing.timestamps,
            updatedAt: event.occurredAt
          },
          audit: {
            summary: selectAuditSummaryAfterAppend(existing, event),
            events: [...existing.audit.events, event]
          }
        };

        const cloned = clonePersistencePayload(updatedPayload, "append_audit");
        if (cloned.ok === false) return cloned;

        payloads.set(createStorageKey(input), cloned.value);
        return createAdapterSuccess(createAuditReceipt({
          context: input,
          mode,
          event,
          totalEventCount: cloned.value.audit.summary.totalEventCount
        }));
      } catch (error) {
        return createAdapterError({
          code: "audit_failed",
          message: "Failed to append audit event in the in-memory adapter.",
          operation: "append_audit",
          cause: error
        });
      }
    }
  };
}

export function createV6NoopTimetablePersistenceAdapter(): V6TimetablePersistenceAdapter {
  const mode = "noop";

  return {
    mode,
    async loadTimetable() {
      return createAdapterSuccess(null);
    },
    async saveDraft(input) {
      const cloned = clonePersistencePayload(input.payload, "save_draft");
      if (cloned.ok === false) return cloned;

      return createAdapterSuccess(createWriteReceipt({
        context: input,
        mode,
        operation: "save_draft",
        payload: cloned.value
      }));
    },
    async publishTimetable(input) {
      const cloned = clonePersistencePayload(input.payload, "publish");
      if (cloned.ok === false) return cloned;

      return createAdapterSuccess(createWriteReceipt({
        context: input,
        mode,
        operation: "publish",
        payload: cloned.value
      }));
    },
    async appendAuditEvent(input) {
      return createAdapterSuccess(createAuditReceipt({
        context: input,
        mode,
        event: cloneAuditEvent(input.event)
      }));
    }
  };
}
