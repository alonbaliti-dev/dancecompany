-- Phone/password academy auth credentials.
-- Additive only. Use service-role server routes; no browser/client reads.

create table if not exists public.auth_credentials (
  id uuid primary key default gen_random_uuid(),
  academy_id text not null references public.academies(id) on delete cascade,
  user_profile_id text not null references public.users_profile(id) on delete cascade,
  phone_normalized text not null,
  password_hash text not null,
  temporary_password_flag boolean not null default false,
  must_change_password boolean not null default false,
  status public.record_status not null default 'active',
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists auth_credentials_academy_phone_uidx
  on public.auth_credentials (academy_id, phone_normalized)
  where status <> 'archived';

create unique index if not exists auth_credentials_academy_user_uidx
  on public.auth_credentials (academy_id, user_profile_id);

create index if not exists auth_credentials_user_profile_idx
  on public.auth_credentials (user_profile_id);

drop trigger if exists auth_credentials_set_updated_at on public.auth_credentials;
create trigger auth_credentials_set_updated_at
before update on public.auth_credentials
for each row execute function public.set_updated_at();

alter table public.auth_credentials enable row level security;

comment on table public.auth_credentials is
  'Academy phone/password credential hashes for trusted server-side login only. RLS intentionally has no public policies; use service-role routes.';
comment on column public.auth_credentials.password_hash is
  'Server-side password hash. Never store or expose plain passwords in production.';
