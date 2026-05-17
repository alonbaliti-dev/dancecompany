# Supabase Migration Plan

This plan prepares LK Student Space for Supabase without starting a destructive backend rewrite. The current local V6 database remains the MVP source until the migration is intentionally scheduled, tested and rolled out.

## Target Stack

- Frontend: Next.js on Vercel
- Database: Supabase Postgres
- Auth: Supabase Auth
- Realtime: Supabase Realtime later for messages, notifications and live event updates
- Media: Cloudflare R2 for files, Supabase for metadata
- AI: OpenAI and Anthropic server-side with academy-aware context
- Payments: future server-side provider integration
- Backups: Supabase backups plus R2 lifecycle/archive for media

## Migration Principle

Preserve the local MVP while adding production-shaped contracts. Do not rename every `studioId` at once. In production schema, `academy_id` is the canonical tenant key; during transition, existing `studioId` maps to `academyId`.

## Phase 2 Local Foundation

Phase 2 adds local migration files under `supabase/migrations/`, typed clients in `lib/supabase/`, academy-scope helpers in `lib/security/academy-scope.ts`, and repository foundations in `lib/repositories/`. These files are intentionally local-only until a Supabase project is reviewed and migration execution is approved.

`AUTH_MODE=local_demo` keeps the current local login. `AUTH_MODE=supabase` prepares email/password Supabase Auth and profile lookup through `users_profile` and `user_roles`, but it does not remove or replace the existing local login.

## Core Tables

Production tables should include `academy_id` on every tenant-scoped row:

- academies
- academy_branding
- academy_settings
- academy_feature_flags
- users
- academy_memberships
- credentials/auth profile mapping
- permissions
- age_groups
- dance_styles
- groups
- classes/lessons
- attendance
- tasks
- daily_practice_records
- messages
- notifications
- shop_products
- shop_orders
- private_lessons
- media_items
- media_collections
- events
- event_participants
- event_checklists
- achievements
- legacy_entries
- audit_logs
- activity_feed
- ai_prompts
- ai_suggestions
- payments

## Row Level Security

RLS must be enabled on exposed tables. Policies should enforce:

- Super Admin can access all academies.
- Management can access only its academy.
- Teachers can access assigned groups/classes/tasks/media.
- Parents can access only linked children and allowed group/event records.
- Students can access own records, own groups and allowed public/group content.
- Adult students do not require parent-linked access.

Authorization data should live in trusted membership tables or app metadata, not user-editable metadata.

The Phase 2 migration enables RLS on all initial public tables. Only active academy and branding records have public read policies for branded login discovery; tenant tables are locked down pending production policy review.

## Media Metadata

Media metadata lives in Supabase; files live in R2. `media_items` must include academy, context fields, uploader fields, R2 bucket/key, thumbnail key, visibility, moderation/status and searchable tags.

Public media must be approved before receiving public display. Private media uses signed URLs.

## AI Safety

AI suggestions are stored as drafts or recommendations. They never auto-send messages, mutate records, bypass permissions or mix academy contexts.

Suggested AI areas:

- attendance risk
- daily practice reminders
- event readiness
- media captions
- message drafts
- management next-action summaries

## Migration Phases

1. Freeze and validate the V6 local model.
2. Define Supabase schema and migrations with `academy_id` on every scoped table.
3. Create academy membership and RLS policies.
4. Add import tooling from local V6 JSON into Supabase.
5. Wire read-only Supabase adapters behind feature flags.
6. Wire writes through domain operations and server routes.
7. Migrate media metadata and route uploads to R2.
8. Add backups, export/import and Super Admin health views.
9. Run role-by-role QA before production promotion.

## First Academy Seed

Seed `lk-studio` as the only active academy:

- LK Studio by Liat Kaplinski
- כפר ויתקין, ישראל
- Hebrew RTL-first
- adult Flamenco enabled
- shop, private lessons, media gallery, event mode and attendance enabled
- payments and push notifications controlled by feature flags until production-ready

## Not In This Task

- No full production backend migration.
- No real credentials.
- No direct public upload implementation.
- No committed secrets.
- No destructive rewrite of local V6 flows.
