-- Phase 2 Backend Foundation
-- Local migration only. Do not apply to a remote Supabase project until policies are reviewed.

create extension if not exists pgcrypto;

create type public.academy_status as enum ('active', 'inactive', 'archived');
create type public.record_status as enum ('active', 'inactive', 'pending', 'paused', 'archived', 'draft', 'published', 'completed', 'cancelled', 'hidden');
create type public.user_role as enum ('student', 'parent', 'teacher', 'management', 'super_admin');
create type public.platform_role as enum ('super_admin');
create type public.media_visibility as enum ('group', 'group_parents', 'teacher_only', 'staff_only', 'management_only', 'shop_public', 'event_public', 'legacy_public');
create type public.media_status as enum ('pending_upload', 'uploaded', 'processing', 'ready', 'needs_review', 'approved', 'hidden', 'archived', 'failed');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.academies (
  id text primary key,
  name text not null,
  slug text not null unique,
  location text,
  country text not null default 'Israel',
  timezone text not null default 'Asia/Jerusalem',
  status public.academy_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.academy_branding (
  id uuid primary key default gen_random_uuid(),
  academy_id text not null references public.academies(id) on delete cascade,
  display_name text not null,
  logo_url text,
  background_url text,
  primary_color text,
  secondary_color text,
  highlight_color text,
  tagline text,
  metadata jsonb not null default '{}'::jsonb,
  status public.record_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (academy_id)
);

create table public.users_profile (
  id text primary key,
  academy_id text references public.academies(id) on delete restrict,
  auth_user_id uuid unique,
  full_name text not null,
  full_name_he text,
  email text,
  phone text,
  platform_role public.platform_role,
  active_academy_id text references public.academies(id) on delete restrict,
  status public.record_status not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  academy_id text not null references public.academies(id) on delete cascade,
  user_id text not null references public.users_profile(id) on delete cascade,
  role public.user_role not null,
  status public.record_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (academy_id, user_id, role)
);

create table public.age_groups (
  id text primary key,
  academy_id text not null references public.academies(id) on delete cascade,
  name text not null,
  stage text,
  age_range text,
  sort_order integer not null default 0,
  parent_visibility_default boolean not null default true,
  communication_mode text not null default 'mixed',
  status public.record_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.dance_styles (
  id text primary key,
  academy_id text not null references public.academies(id) on delete cascade,
  name text not null,
  category text not null default 'other',
  description text,
  status public.record_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.groups (
  id text primary key,
  academy_id text not null references public.academies(id) on delete cascade,
  name text not null,
  age_group_id text references public.age_groups(id) on delete set null,
  dance_style_id text references public.dance_styles(id) on delete set null,
  schedule text,
  teacher_ids text[] not null default '{}',
  student_ids text[] not null default '{}',
  parent_visibility boolean not null default true,
  communication_mode text not null default 'mixed',
  location text,
  notes text,
  status public.record_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.classes (
  id text primary key,
  academy_id text not null references public.academies(id) on delete cascade,
  group_id text references public.groups(id) on delete set null,
  teacher_id text references public.users_profile(id) on delete set null,
  title text not null,
  class_date date not null,
  start_time time,
  end_time time,
  location text,
  status public.record_status not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.attendance_records (
  id text primary key,
  academy_id text not null references public.academies(id) on delete cascade,
  class_id text references public.classes(id) on delete set null,
  group_id text references public.groups(id) on delete set null,
  student_id text references public.users_profile(id) on delete cascade,
  status text not null,
  note text,
  marked_by_user_id text references public.users_profile(id) on delete set null,
  class_date date,
  saved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tasks (
  id text primary key,
  academy_id text not null references public.academies(id) on delete cascade,
  group_id text references public.groups(id) on delete set null,
  assigned_by_user_id text references public.users_profile(id) on delete set null,
  title text not null,
  kind text,
  due_at timestamptz,
  done_by_user_ids text[] not null default '{}',
  status public.record_status not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.messages (
  id text primary key,
  academy_id text not null references public.academies(id) on delete cascade,
  sender_user_id text references public.users_profile(id) on delete set null,
  recipient_user_ids text[] not null default '{}',
  group_id text references public.groups(id) on delete set null,
  title text,
  body text not null,
  status public.record_status not null default 'published',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notifications (
  id text primary key,
  academy_id text not null references public.academies(id) on delete cascade,
  user_ids text[] not null default '{}',
  title text not null,
  body text not null,
  type text not null default 'system',
  read_by_user_ids text[] not null default '{}',
  status public.record_status not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.shop_products (
  id text primary key,
  academy_id text not null references public.academies(id) on delete cascade,
  title text not null,
  description text,
  category text,
  product_type text,
  price numeric(10,2) not null default 0,
  price_mode text not null default 'paid',
  inventory_status text not null default 'in_stock',
  visibility text not null default 'members',
  image_media_ids text[] not null default '{}',
  featured_image_media_id text,
  status public.record_status not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.shop_orders (
  id text primary key,
  academy_id text not null references public.academies(id) on delete cascade,
  user_id text references public.users_profile(id) on delete set null,
  product_ids text[] not null default '{}',
  total_amount numeric(10,2) not null default 0,
  currency text not null default 'ILS',
  payment_status text not null default 'pending',
  fulfillment_status text not null default 'pending',
  status public.record_status not null default 'pending',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.private_lesson_requests (
  id text primary key,
  academy_id text not null references public.academies(id) on delete cascade,
  student_id text references public.users_profile(id) on delete set null,
  teacher_id text references public.users_profile(id) on delete set null,
  requested_by_user_id text references public.users_profile(id) on delete set null,
  requested_date date,
  requested_time time,
  status public.record_status not null default 'pending',
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.teacher_availability (
  id text primary key,
  academy_id text not null references public.academies(id) on delete cascade,
  teacher_id text not null references public.users_profile(id) on delete cascade,
  weekday integer,
  available_date date,
  start_time time not null,
  end_time time not null,
  status public.record_status not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.media_items (
  id text primary key,
  academy_id text not null references public.academies(id) on delete cascade,
  group_id text references public.groups(id) on delete set null,
  class_id text references public.classes(id) on delete set null,
  event_id text,
  product_id text references public.shop_products(id) on delete set null,
  student_id text references public.users_profile(id) on delete set null,
  uploaded_by_user_id text references public.users_profile(id) on delete set null,
  uploaded_by_name text,
  lesson_date date,
  lesson_time time,
  tags text[] not null default '{}',
  visibility public.media_visibility not null default 'group',
  r2_bucket text not null,
  r2_key text not null,
  thumbnail_key text,
  file_name text not null,
  mime_type text not null,
  file_size bigint not null default 0,
  media_type text not null,
  status public.media_status not null default 'pending_upload',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (r2_bucket, r2_key)
);

create table public.gallery_collections (
  id text primary key,
  academy_id text not null references public.academies(id) on delete cascade,
  title text not null,
  kind text not null,
  school_year text,
  group_ids text[] not null default '{}',
  event_id text,
  dance_style_ids text[] not null default '{}',
  visibility text not null default 'students',
  cover_media_id text references public.media_items(id) on delete set null,
  item_ids text[] not null default '{}',
  status public.record_status not null default 'active',
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.events (
  id text primary key,
  academy_id text not null references public.academies(id) on delete cascade,
  title text not null,
  event_type text not null,
  event_date date not null,
  start_time time,
  end_time time,
  location text,
  school_year text,
  group_ids text[] not null default '{}',
  status public.record_status not null default 'draft',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.media_items
  add constraint media_items_event_id_fk
  foreign key (event_id) references public.events(id) on delete set null;

alter table public.gallery_collections
  add constraint gallery_collections_event_id_fk
  foreign key (event_id) references public.events(id) on delete set null;

create table public.achievements (
  id text primary key,
  academy_id text not null references public.academies(id) on delete cascade,
  title text not null,
  category text not null,
  achievement_date date,
  related_event_id text references public.events(id) on delete set null,
  student_ids text[] not null default '{}',
  group_ids text[] not null default '{}',
  media_ids text[] not null default '{}',
  visibility text not null default 'students',
  status public.record_status not null default 'active',
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.feature_flags (
  id text primary key,
  academy_id text references public.academies(id) on delete cascade,
  flag_key text not null,
  enabled boolean not null default false,
  status public.record_status not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (academy_id, flag_key)
);

create table public.audit_logs (
  id text primary key,
  academy_id text references public.academies(id) on delete set null,
  actor_user_id text references public.users_profile(id) on delete set null,
  actor_name text,
  action text not null,
  target text not null,
  status public.record_status not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index academies_slug_idx on public.academies(slug);
create index users_profile_academy_id_idx on public.users_profile(academy_id);
create index user_roles_academy_user_idx on public.user_roles(academy_id, user_id);
create index groups_academy_id_idx on public.groups(academy_id);
create index classes_academy_date_idx on public.classes(academy_id, class_date);
create index attendance_academy_class_idx on public.attendance_records(academy_id, class_id);
create index media_items_academy_status_idx on public.media_items(academy_id, status);
create index media_items_context_idx on public.media_items(academy_id, group_id, class_id, event_id, product_id, student_id);
create index shop_products_academy_status_idx on public.shop_products(academy_id, status);
create index gallery_collections_academy_idx on public.gallery_collections(academy_id);

create trigger academies_set_updated_at before update on public.academies for each row execute function public.set_updated_at();
create trigger academy_branding_set_updated_at before update on public.academy_branding for each row execute function public.set_updated_at();
create trigger users_profile_set_updated_at before update on public.users_profile for each row execute function public.set_updated_at();
create trigger user_roles_set_updated_at before update on public.user_roles for each row execute function public.set_updated_at();
create trigger age_groups_set_updated_at before update on public.age_groups for each row execute function public.set_updated_at();
create trigger dance_styles_set_updated_at before update on public.dance_styles for each row execute function public.set_updated_at();
create trigger groups_set_updated_at before update on public.groups for each row execute function public.set_updated_at();
create trigger classes_set_updated_at before update on public.classes for each row execute function public.set_updated_at();
create trigger attendance_records_set_updated_at before update on public.attendance_records for each row execute function public.set_updated_at();
create trigger tasks_set_updated_at before update on public.tasks for each row execute function public.set_updated_at();
create trigger messages_set_updated_at before update on public.messages for each row execute function public.set_updated_at();
create trigger notifications_set_updated_at before update on public.notifications for each row execute function public.set_updated_at();
create trigger shop_products_set_updated_at before update on public.shop_products for each row execute function public.set_updated_at();
create trigger shop_orders_set_updated_at before update on public.shop_orders for each row execute function public.set_updated_at();
create trigger private_lesson_requests_set_updated_at before update on public.private_lesson_requests for each row execute function public.set_updated_at();
create trigger teacher_availability_set_updated_at before update on public.teacher_availability for each row execute function public.set_updated_at();
create trigger media_items_set_updated_at before update on public.media_items for each row execute function public.set_updated_at();
create trigger gallery_collections_set_updated_at before update on public.gallery_collections for each row execute function public.set_updated_at();
create trigger events_set_updated_at before update on public.events for each row execute function public.set_updated_at();
create trigger achievements_set_updated_at before update on public.achievements for each row execute function public.set_updated_at();
create trigger feature_flags_set_updated_at before update on public.feature_flags for each row execute function public.set_updated_at();
create trigger audit_logs_set_updated_at before update on public.audit_logs for each row execute function public.set_updated_at();

alter table public.academies enable row level security;
alter table public.academy_branding enable row level security;
alter table public.users_profile enable row level security;
alter table public.user_roles enable row level security;
alter table public.age_groups enable row level security;
alter table public.dance_styles enable row level security;
alter table public.groups enable row level security;
alter table public.classes enable row level security;
alter table public.attendance_records enable row level security;
alter table public.tasks enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.shop_products enable row level security;
alter table public.shop_orders enable row level security;
alter table public.private_lesson_requests enable row level security;
alter table public.teacher_availability enable row level security;
alter table public.media_items enable row level security;
alter table public.gallery_collections enable row level security;
alter table public.events enable row level security;
alter table public.achievements enable row level security;
alter table public.feature_flags enable row level security;
alter table public.audit_logs enable row level security;

create policy "Public can read active academy login shells"
on public.academies
for select
to anon, authenticated
using (status = 'active');

create policy "Public can read active academy branding"
on public.academy_branding
for select
to anon, authenticated
using (
  status = 'active'
  and exists (
    select 1
    from public.academies a
    where a.id = academy_branding.academy_id
      and a.status = 'active'
  )
);

comment on table public.users_profile is 'RLS intentionally locked down until academy-aware policies are reviewed. Use service role only from trusted server code during Phase 2.';
comment on table public.media_items is 'Media metadata for Cloudflare R2 objects. Visibility enum: group, group_parents, teacher_only, staff_only, management_only, shop_public, event_public, legacy_public.';
comment on table public.audit_logs is 'Sensitive write audit log. Super Admin cross-academy access must be implemented in reviewed policies before remote rollout.';

insert into public.academies (id, name, slug, location, country, timezone, status)
values ('lk-studio', 'LK Studio by Liat Kaplinski', 'lk-studio', 'כפר ויתקין, ישראל', 'Israel', 'Asia/Jerusalem', 'active')
on conflict (id) do update set
  name = excluded.name,
  slug = excluded.slug,
  location = excluded.location,
  timezone = excluded.timezone,
  status = excluded.status;

insert into public.academy_branding (
  academy_id,
  display_name,
  primary_color,
  secondary_color,
  highlight_color,
  tagline,
  metadata,
  status
)
values (
  'lk-studio',
  'LK Studio',
  '#D7B56D',
  '#8A6A2D',
  '#F6E6B5',
  'מרחב פרימיום למחול, התקדמות וקהילה',
  '{"backgroundMood":"premium dark luxury with warm stage lighting","pwaAppName":"LK Student Space"}'::jsonb,
  'active'
)
on conflict (academy_id) do update set
  display_name = excluded.display_name,
  primary_color = excluded.primary_color,
  secondary_color = excluded.secondary_color,
  highlight_color = excluded.highlight_color,
  tagline = excluded.tagline,
  metadata = excluded.metadata,
  status = excluded.status;

insert into public.users_profile (
  id,
  academy_id,
  full_name,
  full_name_he,
  platform_role,
  active_academy_id,
  status,
  metadata
)
values (
  'alon',
  'lk-studio',
  'Alon Baliti',
  'אלון בליטי',
  'super_admin',
  'lk-studio',
  'active',
  '{"seededWithoutPassword":true}'::jsonb
)
on conflict (id) do update set
  full_name = excluded.full_name,
  full_name_he = excluded.full_name_he,
  platform_role = excluded.platform_role,
  active_academy_id = excluded.active_academy_id,
  status = excluded.status;

insert into public.user_roles (academy_id, user_id, role, status)
values ('lk-studio', 'alon', 'super_admin', 'active')
on conflict (academy_id, user_id, role) do update set status = excluded.status;
