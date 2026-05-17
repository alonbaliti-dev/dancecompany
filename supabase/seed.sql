-- Local seed only. This file creates academy/profile rows without passwords or secrets.
-- Product login is academy phone/password through trusted server routes and auth_credentials.
-- Do not seed real passwords here. Create/reset the initial Super Admin credential through
-- the management reset flow or a local-only server script that hashes the password server-side.
--
-- Supabase Auth may still be used for internal/admin continuity. If needed, create the
-- Supabase Auth user locally through Studio/Auth, then bind its UUID with:
--
--   update public.users_profile
--   set auth_user_id = '<local-auth-user-uuid>'::uuid,
--       email = 'alon@example.com'
--   where id = 'alon';
--
-- Do not commit real emails or secrets.

insert into public.academies (id, name, slug, location, country, timezone, status)
values ('lk-studio', 'LK Studio by Liat Kaplinski', 'lk-studio', 'כפר ויתקין, ישראל', 'Israel', 'Asia/Jerusalem', 'active')
on conflict (id) do update set
  name = excluded.name,
  slug = excluded.slug,
  location = excluded.location,
  country = excluded.country,
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
  '{"seededWithoutPassword":true,"authUserBinding":"manual-local-uuid-required"}'::jsonb
)
on conflict (id) do update set
  academy_id = excluded.academy_id,
  full_name = excluded.full_name,
  full_name_he = excluded.full_name_he,
  platform_role = excluded.platform_role,
  active_academy_id = excluded.active_academy_id,
  status = excluded.status,
  metadata = users_profile.metadata || excluded.metadata;

insert into public.user_roles (academy_id, user_id, role, status)
values ('lk-studio', 'alon', 'super_admin', 'active')
on conflict (academy_id, user_id, role) do update set status = excluded.status;
