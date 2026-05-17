# Execution Consolidation

This is a production execution backlog, not a new roadmap phase. The current priority is to stabilize the existing platform surface, connect real persistence and media flows, and avoid future-feature expansion until core operations are trustworthy.

## Working Now

- V6 shell runs from the embedded/local V6 database with role-aware navigation, bottom navigation, RTL direction, safe-area handling, sheet portals, and recent clipping/readability safeguards.
- Local operational flows exist for login, user management, attendance save, shop product editing, notifications read state, calendar/event viewing, gallery viewing, import/export, and audit logging.
- Supabase server/browser clients are environment-gated and avoid exposing service-role credentials to the browser.
- Product auth direction changed again: normal users log in through academy-facing phone + SMS OTP, validated server-side against Supabase-backed academy context; Supabase remains backend database infrastructure, not a user-facing login concept.
- Academy login now shows a mobile-first Hebrew phone/code flow with no user-facing Supabase email/password wording. Successful OTP verification issues a signed app-session cookie, loads `users_profile`, roles, permissions context, and academy scope.
- Legacy Supabase Auth session support is still present for internal/admin continuity; verified sessions now accept either the academy app-session cookie or the older Supabase token cookies while clearing both on logout/invalid sessions.
- Production route hardening now resolves academy/user/role context before allowing registered production routes.
- Local Supabase project structure exists: `supabase/config.toml`, the Phase 2 migration, and `supabase/seed.sql`.
- Initial Supabase migration defines academy-aware core tables, media metadata, shop products, attendance records, events, notifications, audit logs, indexes, triggers, seed academy data, and RLS enabled by default.
- A non-destructive phone auth migration adds `auth_credentials` with academy/user references, normalized phone, server password hash, temporary-password flags, status, last login, indexes, updated-at trigger, RLS enabled, and no public policies.
- SMS code login now uses Supabase Auth OTP (`signInWithOtp` / `verifyOtp`) and does not store OTP codes in application tables. The earlier custom OTP challenge table is removed by a cleanup migration.
- The `auth_credentials` prerequisite table has been applied to the connected Supabase project for the retained phone/password login method.
- `supabase/seed.sql` safely seeds LK Studio and the Alon Baliti Super Admin profile without passwords or secrets; initial phone credentials must be created/reset through a server-side hash flow, and any Supabase Auth UUID binding remains an internal/manual continuity step.
- Real Supabase project verification confirmed the expected public tables exist, RLS is enabled, LK Studio is active, and the Alon Baliti Super Admin profile/role rows exist.
- Alon Baliti's Super Admin profile is bound to the Supabase Auth UUID. The Auth user exists, the profile resolves to `super_admin`, LK Studio academy context loads, and academy isolation checks pass in the Next.js runtime.
- A follow-up local migration hardens the shared `set_updated_at()` trigger function with a fixed `search_path`.
- Repository scaffolding exists for academy login branding, users, attendance, shop products, and media metadata with local seed fallback when Supabase is not configured.
- Attendance has the first repository-backed write slice: `/api/attendance/save` requires a verified academy session in production, writes `attendance_records` through trusted server code, and records an audit row.
- Users and shop products now have guarded server API slices for repository-backed Supabase reads/writes.
- Cloudflare R2 signed-upload APIs now validate academy scope, permissions, file type/size, signed PUT creation, completion metadata, renderable list URLs, audit logging, and explicit missing-config fallback.
- Live local R2 API smoke with configured R2 env now creates signed upload URLs and successfully PUTs gallery image, gallery video, and product image objects to the real R2 bucket; each uploaded object returned through the configured public render base.
- Integration health API can report Supabase, R2, payments, push, email, SMS, WhatsApp, and operational health states in a Super Admin/dev-gated route.

## Still Demo, Local, Or Placeholder

- V6 app state still persists through `localStorage` via `lib/v6/AppProvider.tsx`; most production screens do not read/write through Supabase repositories.
- Real academy SMS OTP auth exists at the academy login/server-route boundary through Supabase Auth. The main V6 shell still restores local demo users and does not consume the verified app session yet.
- Browser OTP login, session refresh/logout/re-login still need direct browser QA with Supabase phone auth enabled and a real user phone.
- User management, attendance saves, shop product mutations, notifications read state, calendar/events, daily stretch tasks, and audit writes are still local database operations in the main UI.
- Attendance persistence is implemented as a guarded API/repository slice, but the V6 attendance sheet is not yet wired to call it.
- Media upload service still has a legacy Supabase Storage metadata helper, but the V6 shop product image path and media gallery upload path now call the R2 create-upload/complete-upload/list APIs.
- R2 complete-upload records Supabase `media_items` metadata only after a verified Supabase session and complete R2 config are present; local demo can show temporary previews but is explicitly not treated as persistent.
- Product image persistence is wired through the existing product editor save path: save product, upload image to R2, create `media_items`, attach media to the product, and refresh local V6 state from the returned render URL.
- Gallery listing can read Supabase media metadata through `/api/media/list`, includes renderable public/signed URL fields, and has focused group/uploader/date filters in the V6 media screen.
- Push notifications have subscription persistence scaffolding and a test endpoint, but no live send path.
- Payment routes remain sandbox/provider-gated; they are not preview-ready checkout evidence.
- Webhook routes for media and notifications are placeholders.
- Local R2 env and Supabase/Auth runtime env are present in `.env.local`; Next.js loads `.env.local`, `AUTH_MODE=supabase` enables the real academy login form, Supabase server/browser clients initialize, and service-role usage remains server-side only by source scan and built client asset scan.
- With no browser Supabase Auth cookies accessible to this worker, `/api/media/complete-upload` correctly rejects unauthenticated requests with `production_auth_required`; the Next.js runtime can read `media_items` for LK Studio, currently with no persisted rows from this verification pass. Verified media writes, gallery refresh persistence, and product image persistence still require browser-session verification.
- R2 live QA previously proved signed object upload. Authenticated browser gallery/product refresh persistence and Supabase metadata verification are now blocked by unavailable browser-cookie automation, not by missing runtime env or R2 object upload.

## P0 Blockers

- Bind every sensitive production write to verified Supabase Auth and academy scope before preview. The shared production gate is now real, but each route still needs domain-specific authorization review.
- Complete academy phone-auth UX after login: safe logout in the app shell, session refresh, V6 shell profile hydration, and clear production/local mode separation.
- Verify live Supabase SMS OTP delivery with an approved test phone, browser session refresh/logout/re-login, and then retest authenticated media metadata writes plus gallery/product refresh persistence.
- Review security advisor findings: most domain tables intentionally have RLS enabled with no policies yet, meaning server/service-role routes are required until academy-aware policies are designed; apply the `set_updated_at()` hardening migration before the next advisor run.
- Finish authenticated browser QA for the V6 R2 path once the signed-in browser session is automation-accessible: image/video upload, refresh persistence, product image persistence, `media_items` metadata, and gallery visibility with real R2 credentials.
- Move core write flows for users, attendance UI, shop products, notifications, events/calendar, daily stretch tasks, and audit logs off browser-only persistence or clearly keep them dev-only.
- Validate and apply the Supabase migration in a local Supabase stack, then review RLS policies before any remote database use. Static foundation checks pass, but local CLI/database execution has not run in this environment.
- Run mobile QA for clipping, RTL, sheets, navigation, keyboard behavior, and readable Hebrew content on Safari/PWA-sized viewports.

## P1 Blockers

- Add repository write methods and route handlers for user management, attendance, shop products, tasks, notifications, events, and audit logs.
- Replace default academy fallback for production reads with explicit academy/session resolution.
- Add deeper media metadata joins for gallery collections and event media once the verified R2 path is manually proven with real credentials.
- Add operational error states in UI when Supabase/R2 are missing instead of silently presenting production completion.
- Reduce lint warning volume enough that new warnings are visible during consolidation.
- Add focused tests for repository mode, academy scoping, R2 key building, and production route gates.

## P2 Blockers

- Normalize older V2/local service comments and mock labels so QA can distinguish legacy/demo areas from V6 execution paths.
- Add admin-facing integration health display only after session binding is real.
- Add thumbnail/transcoding queue strategy after the upload path itself is proven.
- Add payment and webhook operational QA after core Supabase/R2 flows pass.

## Next 10 Disciplined Tasks

1. Apply the SMS OTP cleanup migration, verify Supabase phone OTP delivery, then verify browser refresh/logout/re-login and confirm the V6 shell hydration work item can consume the verified session.
2. Apply the `set_updated_at()` hardening migration, then rerun Supabase security advisors.
3. Run authenticated app-client repository/session checks in `AUTH_MODE=supabase`: invalid session, academy mismatch, verified Super Admin context, and media metadata persistence.
4. Hydrate the V6 shell from the verified Supabase academy session so production login does not fall back to local users.
5. Wire the V6 attendance sheet to `/api/attendance/save` behind clear saving/error states while keeping local demo fallback.
6. Add repository write methods and an authenticated API route for user create/update, including role rows and audit.
7. Expand domain-specific route authorization on top of the shared verified session gate.
8. Add focused API/repository tests for Supabase missing-env behavior, academy mismatch rejection, and verified repository writes.
9. Review RLS with local advisors before remote database use.
10. With the signed-in browser session accessible, run browser QA for product image upload, group lesson media upload, video upload, refresh persistence, and missing-config fallback.

## QA Gate Before Preview

- `npm run lint`, `npm run typecheck`, and `npm run build` pass.
- Login works with real academy phone + SMS OTP for at least Super Admin, management, teacher, parent, and student test users.
- User management creates/updates a persisted user and writes an audit record.
- Attendance save persists, reloads after refresh, and respects teacher/management permissions.
- Media upload performs real R2 PUT, records metadata, reloads in gallery, and respects academy visibility.
- Shop products persist and can display persisted product media.
- Daily stretch tasks persist completion state and reload after refresh.
- Notifications persist preferences/read state; live send remains disabled unless explicitly configured and tested.
- Events/calendar data persists and reloads from Supabase.
- Mobile QA confirms no clipped primary actions, stable bottom nav, scrollable sheets, correct RTL, safe keyboard behavior, and readable Hebrew text.

## What Not To Do

- Do not create new roadmap phase docs.
- Do not expand the vision or add future features.
- Do not launch, deploy, commit, or push until explicitly requested.
- Do not remove local fallback yet; tighten labels and gates while production persistence is being connected.
- Do not implement broad redesign waves or giant rewrites.
- Do not present demo/local flows as production complete.
