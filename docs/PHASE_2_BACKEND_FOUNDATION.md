# Phase 2 Backend Foundation

Phase 2 moves LK Student Space from prototype-only local data toward production backend foundations without removing the local demo path, destabilizing Phase 1 UX work, or fully migrating production traffic.

## Goals

- Establish Supabase Postgres as the future durable database.
- Prepare Supabase Auth as an optional auth mode while local demo login remains available.
- Establish Cloudflare R2 as the future media object store, with Supabase storing metadata.
- Make `academy_id` the production tenant boundary for every durable record.
- Add repository interfaces so UI code does not couple directly to Supabase.
- Keep the app bootable and usable when Supabase or R2 env vars are missing.

## Architecture

- Next.js app remains the product shell and owns trusted API routes.
- Local demo data remains the default fallback for development and pilots without production services.
- Supabase Postgres stores academies, profiles, roles, shop, attendance, gallery and media metadata.
- Supabase Auth is enabled only when `AUTH_MODE=supabase` and public Supabase env vars are present.
- Cloudflare R2 stores originals and thumbnails. API routes issue signed upload URLs; clients never receive R2 secrets.
- Repositories under `lib/repositories/` choose between `local_demo` and `supabase` mode.
- `lib/security/academy-scope.ts` defines the academy-scoped calling contract and Super Admin escape hatch.

## Migration Order

1. Document the backend foundation and rollback expectations.
2. Add safe Supabase client helpers and generated-compatible database types.
3. Create local SQL migrations for production-shaped tables, RLS enablement and seed data.
4. Add academy scope helpers and repository interfaces.
5. Add optional Supabase Auth mode and a branded academy login route.
6. Add R2 config helpers, signed upload contracts and media API route foundations.
7. Update docs and run lint, typecheck and build.
8. Later phases can connect selected UI surfaces to repositories one domain at a time.

## Risks

- Prematurely wiring UI to Supabase could break local demo flows.
- Weak RLS policies could leak cross-academy data once a live project is connected.
- Service role or R2 secrets could be accidentally exposed if imported into client components.
- Media upload flows need strict permission checks before production enablement.
- Existing `studioId` naming must be mapped carefully to production `academy_id`.

## Required Env Vars

Supabase:

```text
AUTH_MODE=local_demo | supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Cloudflare R2:

```text
CLOUDFLARE_R2_ACCOUNT_ID=
CLOUDFLARE_R2_ACCESS_KEY_ID=
CLOUDFLARE_R2_SECRET_ACCESS_KEY=
CLOUDFLARE_R2_BUCKET=academy-media
CLOUDFLARE_R2_PUBLIC_BASE_URL=
```

Only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` may reach browser code. Service role and R2 credentials are server-only.

## Supabase Schema Plan

Initial production tables:

- `academies`
- `academy_branding`
- `users_profile`
- `user_roles`
- `age_groups`
- `dance_styles`
- `groups`
- `classes`
- `attendance_records`
- `tasks`
- `messages`
- `notifications`
- `shop_products`
- `shop_orders`
- `private_lesson_requests`
- `teacher_availability`
- `media_items`
- `gallery_collections`
- `events`
- `achievements`
- `feature_flags`
- `audit_logs`

Every tenant-scoped table includes `academy_id`, timestamps, and `status` where lifecycle state matters. RLS is enabled in migrations with conservative placeholder policies. Production policy rollout must be reviewed against actual roles before remote application.

Seed data:

- Academy: `LK Studio by Liat Kaplinski`, slug `lk-studio`, location `כפר ויתקין, ישראל`, timezone `Asia/Jerusalem`, status `active`.
- Super Admin profile/role: Alon Baliti / אלון בליטי, platform role `super_admin`.
- No passwords or secret values are seeded.

## R2 Media Plan

- Clients request `/api/media/create-upload-url` with academy, user and file metadata.
- Server validates academy scope, actor identity and upload intent.
- Server returns a signed PUT URL only when R2 is configured.
- Client uploads directly to R2 using the signed URL.
- Client calls `/api/media/complete-upload`.
- Server creates a `media_items` metadata row through the repository.
- `/api/media/list` reads academy-scoped media metadata.
- Missing R2 or Supabase returns demo-only responses without crashing.

## Auth Plan

- `AUTH_MODE=local_demo` keeps the current login flow.
- `AUTH_MODE=supabase` enables Supabase email/password first.
- Phone auth is deferred until role, guardian and adult-student flows are stable.
- Supabase user lookup resolves `auth.users.id` to `users_profile`.
- Roles and permissions come from `users_profile` and `user_roles`, never user-editable metadata.
- `/academy/[slug]/login` loads academy branding and defaults to `lk-studio` when slug data is unavailable.

## Rollback And Fallback Plan

- Leave local demo mode as the default safe behavior.
- If Supabase env vars are missing or invalid, repositories return local demo results or explicit demo-mode errors.
- If R2 env vars are missing, upload APIs return a demo response and do not attempt object writes.
- Existing UI surfaces keep using current local data until a domain is intentionally migrated.
- No remote Supabase project is modified in Phase 2.

## QA Checklist

- `npm run lint`
- `npm run typecheck`
- `npm run build`
- App loads without Supabase env vars.
- App loads without R2 env vars.
- Local demo login still works.
- `/academy/lk-studio/login` loads with LK Studio branding.
- Super Admin/dev-only notices are not shown to normal production users.
- No service role, R2 secret, payment secret or password appears in client code or docs.
- Media upload APIs gracefully handle missing R2/Supabase.
- Repository layer exists and does not force UI migration.
