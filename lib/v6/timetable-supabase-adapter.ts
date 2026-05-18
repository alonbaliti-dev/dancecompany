import type { V6TimetableAuditEvent } from "@/lib/v6/timetable-audit";
import type {
  V6TimetablePersistenceAdapter,
  V6TimetablePersistenceAdapterErrorCode,
  V6TimetablePersistenceAdapterMode,
  V6TimetablePersistenceAdapterResult,
  V6TimetablePersistenceAuditReceipt,
  V6TimetablePersistenceContext,
  V6TimetablePersistenceOperation,
  V6TimetablePersistenceWriteReceipt
} from "@/lib/v6/timetable-persistence-adapter";
import {
  V6_TIMETABLE_PERSISTENCE_CONTRACT_VERSION,
  validateTimetablePersistencePayload,
  type V6TimetablePersistencePayload
} from "@/lib/v6/timetable-persistence";
import {
  V6_TIMETABLE_SNAPSHOT_SCHEMA_VERSION,
  parseV6TimetableSnapshotImport,
  type V6TimetableSnapshot
} from "@/lib/v6/timetable-snapshot";

type SupabaseQueryResult<T> = {
  data: T | null;
  error: unknown;
};

type V6TimetableSupabaseQueryBuilder<T = unknown> = {
  select(columns?: string): V6TimetableSupabaseQueryBuilder<T>;
  insert(values: unknown): V6TimetableSupabaseQueryBuilder<T>;
  update(values: unknown): V6TimetableSupabaseQueryBuilder<T>;
  eq(column: string, value: unknown): V6TimetableSupabaseQueryBuilder<T>;
  maybeSingle(): Promise<SupabaseQueryResult<T | null>>;
  single(): Promise<SupabaseQueryResult<T>>;
};

export type V6TimetableSupabaseClientLike = {
  from(table: string): V6TimetableSupabaseQueryBuilder;
};

export type CreateV6SupabaseTimetablePersistenceAdapterInput = {
  client: V6TimetableSupabaseClientLike;
  mode?: V6TimetablePersistenceAdapterMode;
};

export type V6TimetableSnapshotPersistenceContext = V6TimetablePersistenceContext & {
  snapshotId: string;
};

export type V6TimetableCreateSnapshotInput = V6TimetablePersistenceContext & {
  snapshot: V6TimetableSnapshot;
  restoredFromSnapshotId?: string;
};

export type V6TimetableLoadSnapshotForRestoreInput = V6TimetableSnapshotPersistenceContext;

export type V6TimetableSnapshotReceipt = {
  academyId: string;
  timetableId: string;
  snapshotId: string;
  mode: V6TimetablePersistenceAdapterMode;
  operation: "create_snapshot";
  schemaVersion: V6TimetableSnapshot["schemaVersion"];
  contractVersion: typeof V6_TIMETABLE_PERSISTENCE_CONTRACT_VERSION;
  createdAt: string;
  requestId?: string;
};

export type V6TimetableSnapshotRestorePayload = {
  academyId: string;
  timetableId: string;
  snapshotId: string;
  snapshot: V6TimetableSnapshot;
  persistencePayload?: V6TimetablePersistencePayload;
};

export type V6TimetableSupabaseSnapshotAdapter = {
  createSnapshot(input: V6TimetableCreateSnapshotInput): Promise<V6TimetablePersistenceAdapterResult<V6TimetableSnapshotReceipt>>;
  loadSnapshotForRestore(input: V6TimetableLoadSnapshotForRestoreInput): Promise<V6TimetablePersistenceAdapterResult<V6TimetableSnapshotRestorePayload | null>>;
};

export type V6SupabaseTimetablePersistenceAdapter = V6TimetablePersistenceAdapter & V6TimetableSupabaseSnapshotAdapter;

type V6TimetableStateRow = {
  payload: unknown;
};

type V6TimetableSnapshotRow = {
  id: string;
  snapshot_payload: unknown;
  persistence_payload: unknown | null;
  created_at: string;
};

function fromSupabaseTable(client: V6TimetableSupabaseClientLike, table: string) {
  return client.from(table) as V6TimetableSupabaseQueryBuilder;
}

function createAdapterError<T>(input: {
  code: V6TimetablePersistenceAdapterErrorCode;
  message: string;
  operation: V6TimetablePersistenceOperation;
  cause?: unknown;
}): V6TimetablePersistenceAdapterResult<T> {
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

function isNonEmptyText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "message" in error && typeof error.message === "string") {
    return error.message;
  }
  return "Unknown Supabase error.";
}

function cloneJsonValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function validateScope(
  input: V6TimetablePersistenceContext,
  operation: V6TimetablePersistenceOperation
): V6TimetablePersistenceAdapterResult<null> {
  if (!isNonEmptyText(input.academyId) || !isNonEmptyText(input.timetableId)) {
    return createAdapterError({
      code: operation === "load" || operation === "load_snapshot_for_restore" ? "read_failed" : "write_failed",
      message: "Timetable Supabase adapter requires explicit academyId and timetableId scope.",
      operation
    });
  }

  return createAdapterSuccess(null);
}

function validateScopedPayload(
  input: V6TimetablePersistenceContext & { payload: V6TimetablePersistencePayload },
  operation: Extract<V6TimetablePersistenceOperation, "save_draft" | "publish" | "append_audit">
): V6TimetablePersistenceAdapterResult<V6TimetablePersistencePayload> {
  const validation = validateTimetablePersistencePayload(cloneJsonValue(input.payload));
  if (validation.ok === false) {
    return createAdapterError({
      code: "invalid_payload",
      message: validation.error,
      operation
    });
  }

  if (validation.payload.source.timetableId !== input.timetableId) {
    return createAdapterError({
      code: "invalid_payload",
      message: "Timetable persistence payload timetableId does not match adapter scope.",
      operation
    });
  }

  if (validation.payload.academyId && validation.payload.academyId !== input.academyId) {
    return createAdapterError({
      code: "invalid_payload",
      message: "Timetable persistence payload academyId does not match adapter scope.",
      operation
    });
  }

  return createAdapterSuccess({
    ...validation.payload,
    academyId: validation.payload.academyId ?? input.academyId
  });
}

function validateLoadedPayload(
  input: V6TimetablePersistenceContext,
  value: unknown,
  operation: Extract<V6TimetablePersistenceOperation, "load" | "load_snapshot_for_restore">
): V6TimetablePersistenceAdapterResult<V6TimetablePersistencePayload> {
  const validation = validateTimetablePersistencePayload(cloneJsonValue(value));
  if (validation.ok === false) {
    return createAdapterError({
      code: "invalid_payload",
      message: validation.error,
      operation
    });
  }

  if (
    validation.payload.source.timetableId !== input.timetableId
    || (validation.payload.academyId !== undefined && validation.payload.academyId !== input.academyId)
  ) {
    return createAdapterError({
      code: "invalid_payload",
      message: "Loaded timetable persistence payload does not match adapter scope.",
      operation
    });
  }

  return createAdapterSuccess({
    ...validation.payload,
    academyId: validation.payload.academyId ?? input.academyId
  });
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

function buildStateRow(input: {
  context: V6TimetablePersistenceContext;
  payload: V6TimetablePersistencePayload;
  operation: Extract<V6TimetablePersistenceOperation, "save_draft" | "publish" | "append_audit">;
}) {
  const payload = cloneJsonValue(input.payload);
  return {
    academy_id: input.context.academyId,
    timetable_id: input.context.timetableId,
    contract_version: payload.version,
    source_label: payload.source.label,
    source: payload.source.source ?? null,
    version_label: payload.source.versionLabel ?? null,
    payload,
    published_overrides: cloneJsonValue(payload.published.baseOverrides),
    draft_overrides: cloneJsonValue(payload.draft.currentOverrides),
    conflict_summary: payload.conflicts ? cloneJsonValue(payload.conflicts) : null,
    snapshot_metadata: payload.snapshot ? cloneJsonValue(payload.snapshot) : null,
    audit_summary: cloneJsonValue(payload.audit.summary),
    published_at: payload.timestamps.publishedAt ?? (input.operation === "publish" ? payload.timestamps.updatedAt : null),
    draft_updated_at: payload.timestamps.draftUpdatedAt ?? (input.operation === "save_draft" ? payload.timestamps.updatedAt : null),
    updated_by_user_id: input.context.actorId ?? null
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

async function loadStatePayload(
  client: V6TimetableSupabaseClientLike,
  input: V6TimetablePersistenceContext,
  operation: Extract<V6TimetablePersistenceOperation, "load" | "append_audit">
): Promise<V6TimetablePersistenceAdapterResult<V6TimetablePersistencePayload | null>> {
  const scope = validateScope(input, operation);
  if (scope.ok === false) return scope;

  const { data, error } = await fromSupabaseTable(client, "v6_timetable_states")
    .select("payload")
    .eq("academy_id", input.academyId)
    .eq("timetable_id", input.timetableId)
    .maybeSingle();

  if (error) {
    return createAdapterError({
      code: "read_failed",
      message: `Failed to load timetable state from Supabase: ${getErrorMessage(error)}`,
      operation,
      cause: error
    });
  }

  if (!data) return createAdapterSuccess(null);

  const row = data as V6TimetableStateRow;
  return validateLoadedPayload(input, row.payload, "load");
}

async function writeStatePayload(input: {
  client: V6TimetableSupabaseClientLike;
  context: V6TimetablePersistenceContext;
  mode: V6TimetablePersistenceAdapterMode;
  operation: V6TimetablePersistenceWriteReceipt["operation"] | "append_audit";
  payload: V6TimetablePersistencePayload;
}): Promise<V6TimetablePersistenceAdapterResult<V6TimetablePersistenceWriteReceipt | null>> {
  const row = buildStateRow({
    context: input.context,
    payload: input.payload,
    operation: input.operation
  });

  const existing = await fromSupabaseTable(input.client, "v6_timetable_states")
    .select("id")
    .eq("academy_id", input.context.academyId)
    .eq("timetable_id", input.context.timetableId)
    .maybeSingle();

  if (existing.error) {
    return createAdapterError({
      code: input.operation === "publish" ? "publish_failed" : "write_failed",
      message: `Failed to inspect existing timetable state in Supabase: ${getErrorMessage(existing.error)}`,
      operation: input.operation,
      cause: existing.error
    });
  }

  const table = fromSupabaseTable(input.client, "v6_timetable_states");
  const write = existing.data
    ? table
      .update(input.operation === "publish" ? { ...row, published_by_user_id: input.context.actorId ?? null } : row)
      .eq("academy_id", input.context.academyId)
      .eq("timetable_id", input.context.timetableId)
      .select("id")
      .single()
    : table
      .insert({
        ...row,
        created_by_user_id: input.context.actorId ?? null,
        published_by_user_id: input.operation === "publish" ? input.context.actorId ?? null : null
      })
      .select("id")
      .single();

  const { error } = await write;
  if (error) {
    return createAdapterError({
      code: input.operation === "publish" ? "publish_failed" : "write_failed",
      message: `Failed to write timetable state to Supabase: ${getErrorMessage(error)}`,
      operation: input.operation,
      cause: error
    });
  }

  if (input.operation === "append_audit") return createAdapterSuccess(null);

  return createAdapterSuccess(createWriteReceipt({
    context: input.context,
    mode: input.mode,
    operation: input.operation,
    payload: input.payload
  }));
}

function validateSnapshot(input: V6TimetableCreateSnapshotInput): V6TimetablePersistenceAdapterResult<V6TimetableSnapshot> {
  const snapshot = cloneJsonValue(input.snapshot);
  const parsed = parseV6TimetableSnapshotImport(snapshot);
  if (parsed.ok === false) {
    return createAdapterError({
      code: "snapshot_failed",
      message: parsed.error,
      operation: "create_snapshot"
    });
  }

  if (snapshot.persistence) {
    const persistence = validateLoadedPayload(input, snapshot.persistence, "load_snapshot_for_restore");
    if (persistence.ok === false) return persistence;
  }

  return createAdapterSuccess(snapshot);
}

function createSnapshotReceipt(input: {
  context: V6TimetablePersistenceContext;
  mode: V6TimetablePersistenceAdapterMode;
  row: V6TimetableSnapshotRow;
}): V6TimetableSnapshotReceipt {
  return {
    academyId: input.context.academyId,
    timetableId: input.context.timetableId,
    snapshotId: input.row.id,
    mode: input.mode,
    operation: "create_snapshot",
    schemaVersion: V6_TIMETABLE_SNAPSHOT_SCHEMA_VERSION,
    contractVersion: V6_TIMETABLE_PERSISTENCE_CONTRACT_VERSION,
    createdAt: input.row.created_at,
    requestId: input.context.requestId
  };
}

export function createV6SupabaseTimetablePersistenceAdapter(
  input: CreateV6SupabaseTimetablePersistenceAdapterInput
): V6SupabaseTimetablePersistenceAdapter {
  const mode = input.mode ?? "supabase";

  return {
    mode,
    async loadTimetable(loadInput) {
      try {
        return await loadStatePayload(input.client, loadInput, "load");
      } catch (error) {
        return createAdapterError({
          code: "read_failed",
          message: "Failed to load timetable state from Supabase.",
          operation: "load",
          cause: error
        });
      }
    },
    async saveDraft(saveInput) {
      try {
        const scope = validateScope(saveInput, "save_draft");
        if (scope.ok === false) return scope;

        const payload = validateScopedPayload(saveInput, "save_draft");
        if (payload.ok === false) return payload;

        return await writeStatePayload({
          client: input.client,
          context: saveInput,
          mode,
          operation: "save_draft",
          payload: payload.value
        });
      } catch (error) {
        return createAdapterError({
          code: "write_failed",
          message: "Failed to save draft timetable state to Supabase.",
          operation: "save_draft",
          cause: error
        });
      }
    },
    async publishTimetable(publishInput) {
      try {
        const scope = validateScope(publishInput, "publish");
        if (scope.ok === false) return scope;

        const payload = validateScopedPayload(publishInput, "publish");
        if (payload.ok === false) return payload;

        return await writeStatePayload({
          client: input.client,
          context: publishInput,
          mode,
          operation: "publish",
          payload: payload.value
        });
      } catch (error) {
        return createAdapterError({
          code: "publish_failed",
          message: "Failed to publish timetable state to Supabase.",
          operation: "publish",
          cause: error
        });
      }
    },
    async appendAuditEvent(auditInput) {
      try {
        const existing = await loadStatePayload(input.client, auditInput, "append_audit");
        if (existing.ok === false) return existing;
        if (!existing.value) {
          return createAdapterError({
            code: "not_found",
            message: "Cannot append a Supabase timetable audit event before a timetable payload has been saved.",
            operation: "append_audit"
          });
        }

        const event = cloneJsonValue(auditInput.event);
        const updatedPayload: V6TimetablePersistencePayload = {
          ...existing.value,
          timestamps: {
            ...existing.value.timestamps,
            updatedAt: event.occurredAt
          },
          audit: {
            summary: selectAuditSummaryAfterAppend(existing.value, event),
            events: [...existing.value.audit.events, event]
          }
        };
        const validatedPayload = validateScopedPayload({ ...auditInput, payload: updatedPayload }, "append_audit");
        if (validatedPayload.ok === false) return validatedPayload;

        const { error } = await fromSupabaseTable(input.client, "v6_timetable_audit_events")
          .insert({
            id: event.id,
            academy_id: auditInput.academyId,
            timetable_id: auditInput.timetableId,
            action: event.action,
            source: event.source,
            actor_user_id: auditInput.actorId ?? event.actor.actorId ?? null,
            actor_snapshot: cloneJsonValue(event.actor),
            metadata: cloneJsonValue(event.metadata),
            payload: event,
            occurred_at: event.occurredAt
          })
          .select("id")
          .single();

        if (error) {
          return createAdapterError({
            code: "audit_failed",
            message: `Failed to append timetable audit event to Supabase: ${getErrorMessage(error)}`,
            operation: "append_audit",
            cause: error
          });
        }

        const write = await writeStatePayload({
          client: input.client,
          context: auditInput,
          mode,
          operation: "append_audit",
          payload: validatedPayload.value
        });
        if (write.ok === false) {
          return createAdapterError({
            code: "audit_failed",
            message: write.error.message,
            operation: "append_audit",
            cause: write.error.cause
          });
        }

        return createAdapterSuccess(createAuditReceipt({
          context: auditInput,
          mode,
          event,
          totalEventCount: validatedPayload.value.audit.summary.totalEventCount
        }));
      } catch (error) {
        return createAdapterError({
          code: "audit_failed",
          message: "Failed to append timetable audit event to Supabase.",
          operation: "append_audit",
          cause: error
        });
      }
    },
    async createSnapshot(snapshotInput) {
      try {
        const scope = validateScope(snapshotInput, "create_snapshot");
        if (scope.ok === false) return scope;

        const snapshot = validateSnapshot(snapshotInput);
        if (snapshot.ok === false) return snapshot;

        const persistencePayload = snapshot.value.persistence
          ? validateLoadedPayload(snapshotInput, snapshot.value.persistence, "load_snapshot_for_restore")
          : undefined;
        if (persistencePayload?.ok === false) return persistencePayload;

        const { data, error } = await fromSupabaseTable(input.client, "v6_timetable_snapshots")
          .insert({
            academy_id: snapshotInput.academyId,
            timetable_id: snapshotInput.timetableId,
            contract_version: persistencePayload?.value.version ?? V6_TIMETABLE_PERSISTENCE_CONTRACT_VERSION,
            snapshot_schema_version: snapshot.value.schemaVersion,
            snapshot_label: snapshot.value.source.label,
            source: persistencePayload?.value.source.source ?? snapshot.value.source.persistence,
            version_label: snapshot.value.source.versionLabel,
            snapshot_payload: snapshot.value,
            persistence_payload: persistencePayload?.value ?? null,
            restored_from_snapshot_id: snapshotInput.restoredFromSnapshotId ?? null,
            created_by_user_id: snapshotInput.actorId ?? null,
            updated_by_user_id: snapshotInput.actorId ?? null
          })
          .select("id,snapshot_payload,persistence_payload,created_at")
          .single();

        if (error || !data) {
          return createAdapterError({
            code: "snapshot_failed",
            message: `Failed to create timetable snapshot in Supabase: ${getErrorMessage(error)}`,
            operation: "create_snapshot",
            cause: error
          });
        }

        return createAdapterSuccess(createSnapshotReceipt({
          context: snapshotInput,
          mode,
          row: data as V6TimetableSnapshotRow
        }));
      } catch (error) {
        return createAdapterError({
          code: "snapshot_failed",
          message: "Failed to create timetable snapshot in Supabase.",
          operation: "create_snapshot",
          cause: error
        });
      }
    },
    async loadSnapshotForRestore(snapshotInput) {
      try {
        const scope = validateScope(snapshotInput, "load_snapshot_for_restore");
        if (scope.ok === false) return scope;

        if (!isNonEmptyText(snapshotInput.snapshotId)) {
          return createAdapterError({
            code: "read_failed",
            message: "Timetable Supabase adapter requires an explicit snapshotId for restore loads.",
            operation: "load_snapshot_for_restore"
          });
        }

        const { data, error } = await fromSupabaseTable(input.client, "v6_timetable_snapshots")
          .select("id,snapshot_payload,persistence_payload,created_at")
          .eq("academy_id", snapshotInput.academyId)
          .eq("timetable_id", snapshotInput.timetableId)
          .eq("id", snapshotInput.snapshotId)
          .maybeSingle();

        if (error) {
          return createAdapterError({
            code: "read_failed",
            message: `Failed to load timetable snapshot from Supabase: ${getErrorMessage(error)}`,
            operation: "load_snapshot_for_restore",
            cause: error
          });
        }

        if (!data) return createAdapterSuccess(null);

        const row = data as V6TimetableSnapshotRow;
        const snapshot = cloneJsonValue(row.snapshot_payload) as V6TimetableSnapshot;
        const parsed = parseV6TimetableSnapshotImport(snapshot);
        if (parsed.ok === false) {
          return createAdapterError({
            code: "snapshot_failed",
            message: parsed.error,
            operation: "load_snapshot_for_restore"
          });
        }

        const persistencePayload = row.persistence_payload
          ? validateLoadedPayload(snapshotInput, row.persistence_payload, "load_snapshot_for_restore")
          : undefined;
        if (persistencePayload?.ok === false) return persistencePayload;

        return createAdapterSuccess({
          academyId: snapshotInput.academyId,
          timetableId: snapshotInput.timetableId,
          snapshotId: row.id,
          snapshot,
          persistencePayload: persistencePayload?.value
        });
      } catch (error) {
        return createAdapterError({
          code: "read_failed",
          message: "Failed to load timetable snapshot from Supabase.",
          operation: "load_snapshot_for_restore",
          cause: error
        });
      }
    }
  };
}
