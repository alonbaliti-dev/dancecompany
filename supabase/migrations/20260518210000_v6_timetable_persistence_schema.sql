-- V6 management timetable persistence schema.
-- Additive draft for future service-role/server integration; no client runtime wiring yet.

create extension if not exists pgcrypto;

create table if not exists public.v6_timetable_snapshots (
  id uuid primary key default gen_random_uuid(),
  academy_id text not null references public.academies(id) on delete cascade,
  timetable_id text not null,
  contract_version text not null default 'v6-management-timetable-persistence.1',
  snapshot_schema_version text not null default 'v6-management-weekly-timetable-snapshot.1',
  snapshot_label text not null,
  source text,
  version_label text,
  snapshot_payload jsonb not null,
  persistence_payload jsonb,
  restored_from_snapshot_id uuid references public.v6_timetable_snapshots(id) on delete set null,
  created_by_user_id text references public.users_profile(id) on delete set null,
  updated_by_user_id text references public.users_profile(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint v6_timetable_snapshots_snapshot_payload_object_chk
    check (jsonb_typeof(snapshot_payload) = 'object'),
  constraint v6_timetable_snapshots_persistence_payload_object_chk
    check (persistence_payload is null or jsonb_typeof(persistence_payload) = 'object'),
  constraint v6_timetable_snapshots_contract_version_chk
    check (
      persistence_payload is null
      or (
        persistence_payload ? 'version'
        and persistence_payload->>'version' = contract_version
      )
    )
);

create table if not exists public.v6_timetable_states (
  id uuid primary key default gen_random_uuid(),
  academy_id text not null references public.academies(id) on delete cascade,
  timetable_id text not null,
  contract_version text not null default 'v6-management-timetable-persistence.1',
  source_label text not null,
  source text,
  version_label text,
  payload jsonb not null,
  published_overrides jsonb not null default '{}'::jsonb,
  draft_overrides jsonb,
  conflict_summary jsonb,
  snapshot_metadata jsonb,
  audit_summary jsonb,
  published_at timestamptz,
  draft_updated_at timestamptz,
  restored_from_snapshot_id uuid references public.v6_timetable_snapshots(id) on delete set null,
  created_by_user_id text references public.users_profile(id) on delete set null,
  updated_by_user_id text references public.users_profile(id) on delete set null,
  published_by_user_id text references public.users_profile(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint v6_timetable_states_payload_object_chk
    check (jsonb_typeof(payload) = 'object'),
  constraint v6_timetable_states_contract_version_chk
    check (
      payload ? 'version'
      and payload->>'version' = contract_version
    ),
  constraint v6_timetable_states_timetable_id_chk
    check (payload #>> '{source,timetableId}' = timetable_id),
  constraint v6_timetable_states_published_overrides_object_chk
    check (jsonb_typeof(published_overrides) = 'object'),
  constraint v6_timetable_states_draft_overrides_object_chk
    check (draft_overrides is null or jsonb_typeof(draft_overrides) = 'object'),
  constraint v6_timetable_states_conflict_summary_object_chk
    check (conflict_summary is null or jsonb_typeof(conflict_summary) = 'object'),
  constraint v6_timetable_states_snapshot_metadata_object_chk
    check (snapshot_metadata is null or jsonb_typeof(snapshot_metadata) = 'object'),
  constraint v6_timetable_states_audit_summary_object_chk
    check (audit_summary is null or jsonb_typeof(audit_summary) = 'object'),
  unique (academy_id, timetable_id)
);

create table if not exists public.v6_timetable_audit_events (
  id text primary key,
  academy_id text not null references public.academies(id) on delete cascade,
  timetable_id text not null,
  action text not null,
  source text not null,
  actor_user_id text references public.users_profile(id) on delete set null,
  actor_snapshot jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  payload jsonb not null,
  occurred_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint v6_timetable_audit_events_actor_snapshot_object_chk
    check (jsonb_typeof(actor_snapshot) = 'object'),
  constraint v6_timetable_audit_events_metadata_object_chk
    check (jsonb_typeof(metadata) = 'object'),
  constraint v6_timetable_audit_events_payload_object_chk
    check (jsonb_typeof(payload) = 'object'),
  constraint v6_timetable_audit_events_payload_id_chk
    check (payload ? 'id' and payload->>'id' = id),
  constraint v6_timetable_audit_events_payload_action_chk
    check (payload ? 'action' and payload->>'action' = action),
  constraint v6_timetable_audit_events_payload_source_chk
    check (payload ? 'source' and payload->>'source' = source)
);

create index if not exists v6_timetable_snapshots_academy_timetable_idx
  on public.v6_timetable_snapshots (academy_id, timetable_id, created_at desc);

create index if not exists v6_timetable_snapshots_version_idx
  on public.v6_timetable_snapshots (academy_id, contract_version, snapshot_schema_version);

create index if not exists v6_timetable_snapshots_restored_from_idx
  on public.v6_timetable_snapshots (restored_from_snapshot_id);

create index if not exists v6_timetable_states_academy_timetable_idx
  on public.v6_timetable_states (academy_id, timetable_id);

create index if not exists v6_timetable_states_updated_at_idx
  on public.v6_timetable_states (updated_at desc);

create index if not exists v6_timetable_states_version_idx
  on public.v6_timetable_states (academy_id, contract_version);

create index if not exists v6_timetable_states_published_at_idx
  on public.v6_timetable_states (academy_id, published_at desc)
  where published_at is not null;

create index if not exists v6_timetable_audit_events_academy_timetable_time_idx
  on public.v6_timetable_audit_events (academy_id, timetable_id, occurred_at desc);

create index if not exists v6_timetable_audit_events_action_time_idx
  on public.v6_timetable_audit_events (academy_id, action, occurred_at desc);

create index if not exists v6_timetable_audit_events_actor_time_idx
  on public.v6_timetable_audit_events (actor_user_id, occurred_at desc)
  where actor_user_id is not null;

drop trigger if exists v6_timetable_snapshots_set_updated_at on public.v6_timetable_snapshots;
create trigger v6_timetable_snapshots_set_updated_at
before update on public.v6_timetable_snapshots
for each row execute function public.set_updated_at();

drop trigger if exists v6_timetable_states_set_updated_at on public.v6_timetable_states;
create trigger v6_timetable_states_set_updated_at
before update on public.v6_timetable_states
for each row execute function public.set_updated_at();

drop trigger if exists v6_timetable_audit_events_set_updated_at on public.v6_timetable_audit_events;
create trigger v6_timetable_audit_events_set_updated_at
before update on public.v6_timetable_audit_events
for each row execute function public.set_updated_at();

alter table public.v6_timetable_snapshots enable row level security;
alter table public.v6_timetable_states enable row level security;
alter table public.v6_timetable_audit_events enable row level security;

comment on table public.v6_timetable_states is
  'Current v6 management timetable persistence payload per academy/timetable. RLS intentionally has no public policies; use reviewed server/service-role paths for future integration.';
comment on table public.v6_timetable_audit_events is
  'Append-oriented v6 management timetable audit events extracted from the persistence contract. RLS intentionally locked down pending academy-aware policies.';
comment on table public.v6_timetable_snapshots is
  'Restorable v6 management timetable snapshots/backups, optionally including the matching persistence payload. RLS intentionally locked down pending academy-aware policies.';

comment on column public.v6_timetable_states.payload is
  'Full V6TimetablePersistencePayload JSON. contract_version mirrors payload.version for indexed compatibility checks.';
comment on column public.v6_timetable_states.published_overrides is
  'Copy of payload.published.baseOverrides for targeted future server-side reads without unpacking the full payload.';
comment on column public.v6_timetable_states.draft_overrides is
  'Optional copy of payload.draft.currentOverrides for future draft restore flows.';
comment on column public.v6_timetable_audit_events.payload is
  'Full V6TimetableAuditEvent JSON. id/action/source columns mirror payload fields for indexing.';
comment on column public.v6_timetable_snapshots.snapshot_payload is
  'Full V6TimetableSnapshot JSON export used for future restore and backup flows.';
