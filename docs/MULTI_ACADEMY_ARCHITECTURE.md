# Multi-Academy Architecture

LK Student Space is evolving into a premium operating system for dance academies and performing arts schools, not a single-studio prototype. The product standard is simple: would a real academy confidently use this tomorrow?

## Platform Owner

Global platform owner and Super Admin:

- Alon Baliti / אלון בליטי

Alon controls the platform layer across academies: academy creation, archive and switching, branding, users, feature flags, system health, storage health, database/export/import, AI prompts, Cloudflare R2 config and platform audit.

Management users manage only their own academy. Teachers, parents, students and adult dancers never see another academy's records.

## Current Active Academy

The first active academy is:

- `id`: `lk-studio`
- `name`: `LK Studio by Liat Kaplinski`
- `slug`: `lk-studio`
- `location`: `כפר ויתקין, ישראל`
- `country`: `Israel`
- `timezone`: `Asia/Jerusalem`
- `status`: `active`

LK Studio identity: premium dark luxury, champagne and gold accents, warm stage lighting, elegant dance academy atmosphere, Hebrew RTL-first, boutique studio feeling, and a mix of flamenco, classical, modern and hip-hop.

## Academy Model

The local foundation defines `Academy`, `AcademyBranding` and `AcademySettings` in `lib/v6/types.ts`. V6 still uses `studioId` throughout the MVP so existing flows remain stable. Production should treat `studioId` as the current academy scope and add or migrate to `academyId` during the Supabase migration.

Required production shape:

```ts
type Academy = {
  id: string;
  name: string;
  slug: string;
  location: string;
  country: string;
  timezone: string;
  status: "active" | "inactive" | "archived";
  branding: AcademyBranding;
  settings: AcademySettings;
  createdAt: string;
  updatedAt: string;
};
```

Branding includes logo, display name, accent colors, background mood, dance-style palette, hero imagery, typography preference where allowed, shop/event/gallery mood, PWA app name, icons and splash screens later.

## Data Isolation

Every durable production record must carry `academyId` or the current compatibility alias `studioId`:

- users, credentials, permissions and roles
- groups, age groups, dance styles, classes and lessons
- attendance, private lessons, tasks and daily practice
- messages, notifications and parent communication
- shop products, orders and payments
- media, galleries, achievements and legacy
- events, performances, competitions, rehearsals, general rehearsals, annual shows, workshops and camps
- audit logs, activity feed, feature flags, AI prompts and settings

No academy can query, mutate or infer another academy's data. Super Admin can switch/view across academies; management is scoped to its own academy.

Phase 2 adds `lib/security/academy-scope.ts` as the repository contract for this rule. Repository calls must receive an explicit `academyId` scope, and global reads are reserved for Super Admin context only. The Supabase migration uses `academy_id` as the database tenant key.

## Roles

The role structure remains:

- `student`
- `parent`
- `teacher`
- `management`
- `super_admin`

`super_admin` is platform-level. Management permissions are academy-local. Adult dancers are students with direct communication and no parent dependency.

## Age Groups

Supported age groups:

- גיל הרך
- גן
- יסודי
- חטיבה
- תיכון
- מבוגרים

Adult Flamenco and other adult groups use direct communication, direct notifications and direct attendance/practice summaries. The system must not assume every student has a parent account.

## Routing And Login

Target routing:

- `/academy/[slug]`
- `/academy/[slug]/login`
- authenticated user context for returning users

For now, the default academy is `lk-studio`. Each academy login can have its own logo, academy name, background, accent colors, welcome copy, approved media highlights and future PWA assets. This gives every academy an isolated identity on the same OS foundation.

Phase 2 prepares `/academy/[slug]/login` as a branded login shell. It loads active academy branding when Supabase is configured and falls back to the local LK Studio academy without removing the existing local login.

## Phase 10 Expansion Foundation

Phase 10 adds a dedicated expansion plan in `docs/PHASE_10_MULTI_ACADEMY_EXPANSION.md` and inert typed contracts in `lib/platform/multi-academy.ts`.

The new contracts prepare Super Admin-only academy onboarding, branding drafts, feature packages, academy role defaults, media isolation helpers, analytics contracts, support tool contracts, scaling rules, billing preparation, switching contracts and template presets. They do not wire a new runtime UI, public signup, provider call, migration or SaaS billing enforcement.

Expansion remains controlled: LK Studio stays the first active academy, local/demo fallback stays available, and new academies should enter through reviewed Super Admin setup, pilot QA and explicit activation.

## Core Sections

Primary navigation:

- בית
- שיעורים
- הודעות
- חנות
- עוד

Expanded operating sections:

- גלריה
- אירועים
- זכרונות
- משימות / תרגול
- נוכחות
- שיעורים פרטיים
- תלמידים
- צוות
- ניהול
- מנהל מערכת

## Calendar And Events

The academy calendar must support day, week, month and school-year timeline views with filters by academy, age group, group, teacher, dance style and event type.

Event model coverage:

- performances
- competitions
- rehearsals
- general rehearsals
- annual shows
- workshops
- camps

Management views should stay calm and organized: what needs attention, attendance gaps, unresolved tasks, parent communication, readiness summaries and next action.

## Gallery, Achievements And Legacy

The gallery is mandatory academy memory infrastructure, not a nice-to-have. It must support lesson media, event galleries, competition memories, annual show archives, historical studio memories, teacher resources, student submissions and choreography references.

Achievements and legacy records must be respectful and factual: competition wins, participation, show archives, milestones, group achievements and studio memories. Do not invent history or fake awards.

## Daily Practice

Daily practice/stretching is an architecture requirement even if not fully implemented now:

- teachers assign practice or stretching tasks
- students mark done and build streaks
- videos can be attached later
- parents see a summary for linked children
- management sees engagement trends
- AI can suggest practice plans for approval only

## AI Layer

AI is approval-only. It may suggest attendance insights, practice nudges, readiness summaries, media captions, message drafts and event actions. It must not auto-send, auto-mutate, bypass permissions or expose another academy's context.

## UX Standard

The product should feel premium, emotionally intelligent, calm, elegant, Hebrew RTL-native, mobile-first, operationally clear and visually intentional. It is not generic school software, a dashboard, WhatsApp replacement or enterprise admin.

Safe UI rules:

- Use simple Hebrew and avoid internal jargon such as cockpit, diagnostics, orchestration and operational intelligence.
- Design for 390px as the primary mobile width.
- Keep safe content zones and avoid clipping.
- Show what matters now and the next useful action.
- Use controlled passes: stabilize, QA, improve, QA.
- Avoid destructive rewrites.
