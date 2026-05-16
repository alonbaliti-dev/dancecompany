# LK Student Space — V6 to Production Roadmap

This roadmap defines how LK Student Space should evolve from the current V6 MVP into a production-grade operating system for dance academies. It is intentionally product-aware and implementation-focused: every phase explains what we need, why it matters, how to build it, what complexity it adds, and what the experience should feel like.

LK Student Space is not a generic dashboard, school portal, WhatsApp replacement, or admin panel. It should become a premium, calm, intelligent, emotionally connected operating system for dance academies. The core promise is simple:

**Every user opens the app and immediately sees what matters now.**

Target stack:

- Cursor for development workflow
- Next.js for the application framework
- Tailwind CSS and shadcn/ui for interface systems
- Supabase for production database and realtime capabilities
- Vercel for deployment, previews, and production hosting
- Supabase Auth for authentication and role-aware sessions
- Firebase Cloud Messaging or OneSignal for push notifications
- OpenAI API and Claude API for the AI production layer

Current V6 local JSON should be treated as an MVP/prototype layer. Production requires careful migration of storage, authentication, media, notifications, payments, and AI without breaking the calm user experience.

## 1. PRODUCT NORTH STAR

### Goal

Build a premium dance academy operating system that gives every role a focused, beautiful, trustworthy view of what matters now and what action comes next.

### Why

Dance academies run on emotion, trust, logistics, schedules, payments, communication, media, rehearsals, and live events. Most software handles these as separate tools. LK Student Space should unify them into one calm product layer that feels native to the academy and reduces daily operational noise.

The product should help the studio feel more professional, parents feel informed, students feel connected, teachers move faster, and management understand the health of the academy without digging.

### Core Product Promise

- Students see motivation, progress, schedule, media, tasks, and upcoming moments.
- Parents see only their children, relevant payments, messages, schedules, and announcements.
- Teachers see attendance, assigned groups, tasks, rehearsal needs, and private lessons.
- Management sees operational health, alerts, payments, communication, staff coordination, and readiness.
- Super Admin sees platform control, database health, feature flags, audit, backups, and cross-studio readiness.

### Business Goal

Turn LK Student Space into a premium product that can support:

- One flagship academy with production reliability.
- More academies without rewriting the architecture.
- Paid SaaS expansion by studio, season, role, and module.
- Operational differentiation: beautiful studio software that feels like a luxury member experience, not school administration.

### UX Feeling

The app should feel:

- Luxury, calm, and emotionally connected to dance.
- Fast, stable, and iPhone-native.
- Organized without feeling corporate.
- Intelligent without feeling noisy.
- Trustworthy enough for parents and payments.
- Beautiful enough that students want to open it.

It should not feel:

- Like a generic dashboard.
- Like school software.
- Like a WhatsApp replacement.
- Like an admin panel.
- Like a prototype with disconnected screens.

### Operating Principle

Every major feature must connect to:

- Database ownership
- Permission guard
- Audit trail
- Activity feed
- Notifications when relevant
- Season context
- Search/archive behavior when relevant
- Mobile-first experience

## 2. PHASE 0 — V6 UX STABILIZATION

### Goal

Stabilize the current V6 experience before adding production infrastructure. The app should open instantly, feel coherent, and prove the product experience before the backend becomes real.

### Why

If the UX is unstable before production migration, backend work will hide product problems. V6 should become the trusted product baseline: clear navigation, calm screens, coherent roles, no dead CTAs, no confusing prototype artifacts.

### What We Need

- Confirm app boot is immediate and non-blocking.
- Keep local JSON as the current MVP data layer until production migration starts.
- Ensure every role has a clear home experience.
- Remove or label dead CTAs.
- Polish mobile safe areas, touch targets, empty states, and loading states.
- Validate that students, parents, teachers, management, and Super Admin each see a meaningful first screen.
- Make sync state visible but never blocking.

### How To Build

- Audit all main flows by role.
- Prioritize dashboard clarity over adding new modules.
- Tighten copy, labels, empty states, and navigation hierarchy.
- Ensure feature modules use shared state paths and do not hardcode important editable content inside components.
- Keep the V6 local database adapter stable so production migration has a known source model.
- Add lightweight QA notes for each role and major route.

### UX/Visual Standard

The experience should feel like opening a polished iPhone app: immediate, soft, confident, and uncluttered. Every home screen should answer:

- What matters now?
- What is next?
- Do I need to act?
- Is everything okay?

Visual direction:

- Calm premium surfaces.
- Clear hierarchy.
- Minimal dashboard clutter.
- Strong spacing.
- Role-aware cards.
- Motion used only for orientation and delight.
- Hebrew and RTL quality where relevant.

### Complexity

Medium. Most work is product discipline, QA, copy, and layout refinement rather than new architecture. Complexity rises if existing screens contain business rules inside components.

### Success Criteria

- App opens instantly without startup blockers.
- Each role has a useful first screen.
- No primary navigation leads to a dead or confusing area.
- Mobile experience feels intentional.
- V6 data remains stable and exportable.
- Stakeholders can demo the product without explaining prototype gaps.

### Risks/Dependencies

- UX polish can become endless without strict acceptance criteria.
- Hidden component-level logic may make later migration harder.
- Role experiences may drift if not tested side by side.

### Next Steps

- Create a V6 role walkthrough checklist.
- Identify all dead CTAs and decide: implement later, hide, or label as coming soon.
- Review navigation on mobile, tablet, and desktop.
- Freeze the MVP data model before Phase 2 migration design.

## 3. PHASE 1 — DEPLOYMENT FOUNDATION

### Goal

Establish a reliable deployment foundation on Vercel with predictable environments, previews, production promotion, environment variables, and rollback confidence.

### Why

Production is not only code. The team needs a stable release path before real users, real auth, real data, payments, and notifications are connected. Deployment mistakes should be reversible and visible.

### What We Need

- Vercel project linked to the repository.
- Preview deployments for branches and pull requests.
- Production deployment protected by review discipline.
- Environment variable strategy for local, preview, and production.
- Basic monitoring for build failures and runtime issues.
- Clear release checklist.
- No direct merges to main without verification.

### How To Build

- Link the Next.js project to Vercel.
- Define required environment variables, even if some are placeholders initially.
- Separate public browser variables from server-only secrets.
- Document local `.env` setup without committing secrets.
- Use preview URLs for role QA before production promotion.
- Add deployment notes for rollback, domain setup, and smoke tests.

### UX/Visual Standard

Users should never feel deployment instability. Releases should feel invisible: the app loads fast, routes work, assets appear, and the product does not expose environment mistakes.

Admin-facing deployment state can be practical and minimal:

- Production URL
- Latest release notes
- Known issues
- Health indicator

### Complexity

Low to medium. The technical setup is straightforward, but discipline around environments, secrets, and release process is essential.

### Success Criteria

- Preview deployments work for every branch.
- Production deployment is repeatable.
- Environment variables are documented.
- Rollback path is known.
- Production smoke test checklist exists.
- No secrets are committed.

### Risks/Dependencies

- Misconfigured environment variables can break auth, database, media, AI, or notifications.
- Preview data must not accidentally mutate production data.
- Production deployment should not depend on local machine state.

### Next Steps

- Create deployment checklist.
- Define environment variable inventory.
- Configure preview and production environments.
- Add smoke test documentation for login, role routing, sync badge, shop route, and core navigation.

## 4. PHASE 2 — REAL DATABASE

### Goal

Migrate from local JSON MVP storage to a real Supabase database with typed schema, migration discipline, row-level security, auditability, backup strategy, and clear data ownership.

### Why

Local JSON is useful for MVP iteration, but production needs durable, queryable, secure, multi-user data. The database becomes the operating system foundation: users, roles, seasons, groups, schedules, events, attendance, payments, media metadata, messages, audit, activity, settings, and feature flags.

### What We Need

- Supabase project.
- Production schema mapped from the V6 local database.
- Tables for core academy operations.
- Database migrations.
- Row-level security policies.
- Seed and import tools.
- Backup/export plan.
- Audit table.
- Activity feed table.
- Season-aware data model.
- Clear distinction between editable content and code constants.

### How To Build

- Inventory the V6 local JSON model and classify data into production tables.
- Define stable IDs and relationships before migration.
- Create Supabase migrations for each domain.
- Add RLS policies by role and studio membership.
- Build import flow from V6 JSON into Supabase.
- Keep writes going through domain operations and a single client mutation path.
- Store sensitive operational events in audit logs.
- Add activity feed events for user-visible operational changes.
- Build backup/export flows for Super Admin.

Suggested domain tables:

- `studios`
- `seasons`
- `users`
- `profiles`
- `roles`
- `memberships`
- `students`
- `parents`
- `groups`
- `group_members`
- `teachers`
- `schedules`
- `attendance`
- `tasks`
- `events`
- `event_assignments`
- `messages`
- `notifications`
- `shop_products`
- `orders`
- `payments`
- `media_assets`
- `media_visibility`
- `audit_logs`
- `activity_feed`
- `feature_flags`
- `app_settings`

### UX/Visual Standard

The user should not feel the database migration. The app should feel more reliable, not more technical.

Visible improvements should include:

- Faster confidence that data is saved.
- Clear sync states.
- Better empty states.
- Role-correct visibility.
- Trustworthy history for sensitive changes.

Admin and Super Admin should get practical database tools:

- Import/export.
- Backup status.
- Integrity checks.
- Audit search.
- Data health warnings.

### Complexity

High. This is the first major architecture phase. Complexity comes from data modeling, RLS, migration, audit, season awareness, and keeping the existing UX stable while replacing the storage layer.

### Success Criteria

- Supabase schema exists with migrations.
- V6 data can be imported.
- RLS policies protect role-specific data.
- App reads production data without blocking startup.
- Sensitive writes create audit records.
- User-facing changes create activity feed records where relevant.
- Super Admin can export data.

### Risks/Dependencies

- Poor schema design will slow every later phase.
- RLS mistakes can leak parent/student data.
- Direct component writes can bypass audit and permissions.
- Migration should be rehearsed before production.

### Next Steps

- Create V6 data inventory.
- Design schema by domain.
- Define permission matrix by table and role.
- Build migrations and import scripts.
- Add database smoke tests.

## 5. PHASE 3 — REAL AUTH

### Goal

Replace prototype login behavior with production Supabase Auth, role-aware sessions, protected routes, linked parent/student accounts, teacher assignments, and Super Admin access control.

### Why

Trust is central to the product. Parents must only see their children. Teachers must only access assigned groups and operational tools. Management needs broader but still governed access. Super Admin requires platform-level capabilities without weakening studio-level security.

### What We Need

- Supabase Auth integration.
- Auth callback and session handling.
- Role and membership model.
- Protected routes.
- Permission guards before navigation and mutation.
- Account invitation flow.
- Parent-child linking.
- Teacher-group assignment.
- Management and Super Admin role boundaries.
- Session expiry and logout behavior.

### How To Build

- Use Supabase Auth for identity and session management.
- Store domain permissions in app tables, not only auth metadata.
- Create a `memberships` model that connects users to studios, roles, seasons, students, and groups.
- Add server-side and client-side permission checks.
- Keep route protection separate from business permission checks.
- Add invite-based onboarding for parents, students, teachers, and staff.
- Add account recovery and email verification flows.
- Ensure all sensitive mutations check guards before writing.

### UX/Visual Standard

Auth should feel premium and reassuring:

- Clean login screen.
- Studio identity visible.
- Simple language.
- No technical error messages.
- Clear recovery path.
- Parent-child switching should feel obvious and safe.
- Role changes should feel intentional, not hidden.

The user should feel: "This is my studio app, and my information is protected."

### Complexity

High. Auth touches routing, data access, permissions, onboarding, RLS, and UX trust. It should be built after the production database model is clear.

### Success Criteria

- Users can sign in with production auth.
- Roles route to correct experiences.
- Parents only see linked children.
- Teachers only see assigned operational data.
- Management has appropriate studio-wide tools.
- Super Admin access is limited and auditable.
- Protected routes cannot be accessed by unauthenticated users.
- Sensitive writes require permission guards.

### Risks/Dependencies

- Auth metadata alone is not enough for domain permissions.
- Parent/student linking must be carefully modeled.
- RLS must match app-level permission assumptions.
- Poor auth UX damages trust immediately.

### Next Steps

- Define role and permission matrix.
- Build account invitation model.
- Implement protected routes.
- Connect auth identity to database membership.
- Test every role against positive and negative access cases.

## 6. PHASE 4 — MEDIA STORAGE

### Goal

Move media from prototype references into production storage with controlled visibility, moderation, metadata, albums, and performance-safe delivery.

### Why

Media is one of the emotional pillars of the product. Dance academies create memories: rehearsals, shows, tasks, backstage, progress, achievements, and community moments. Media must feel beautiful and safe, not like random file uploads.

### What We Need

- Supabase Storage or equivalent production object storage.
- Media metadata tables.
- Visibility rules by role, group, student, event, and season.
- Upload flow with progress.
- Moderation or approval state.
- Image optimization and thumbnails.
- Video strategy.
- Deletion/archive policy.
- Media audit for sensitive changes.

### How To Build

- Create storage buckets by environment and visibility class.
- Store media metadata in the database.
- Use signed URLs or public paths only when appropriate.
- Build upload flows through permission-checked domain operations.
- Generate thumbnails and store dimensions, duration, type, owner, and context.
- Add visibility rules using `media_visibility` or equivalent domain table.
- Add archive behavior instead of hard delete for important memories.
- Connect media to groups, students, tasks, rehearsals, and events.

### UX/Visual Standard

Media should feel emotional, cinematic, and controlled:

- Large beautiful thumbnails.
- Calm album surfaces.
- Clear context: group, event, season, date.
- No cluttered file-manager feeling.
- Upload progress should feel reassuring.
- Privacy indicators should be subtle but clear.
- Parents should never wonder whether they are seeing the right child's content.

### Complexity

Medium to high. Upload basics are moderate, but visibility, performance, privacy, moderation, and video handling increase complexity.

### Success Criteria

- Users can upload allowed media.
- Media visibility respects role and assignment.
- Parents see only permitted child/group/event media.
- Teachers can add relevant operational media.
- Management can moderate and organize.
- Media loads quickly on mobile.
- Deleted media is archived when required.

### Risks/Dependencies

- Incorrect visibility can create serious privacy issues.
- Large media can hurt performance and storage costs.
- Video processing may require additional infrastructure.
- Moderation rules should be defined before broad uploads.

### Next Steps

- Define media visibility matrix.
- Choose storage bucket strategy.
- Build metadata schema.
- Add upload and gallery flows.
- Add moderation and archive states.

## 7. PHASE 5 — PUSH NOTIFICATIONS

### Goal

Add targeted production notifications that inform the right people at the right time without becoming noisy or replacing thoughtful communication.

### Why

Dance academy operations are time-sensitive: schedule changes, arrival instructions, payment reminders, rehearsal updates, teacher tasks, show mode alerts, and urgent announcements. Notifications should reduce confusion, not create a broadcast channel.

### What We Need

- Firebase Cloud Messaging or OneSignal.
- Device token registration.
- Notification preferences.
- Targeting by role, group, student, event, season, and studio.
- Server-side notification dispatch.
- Notification history in the app.
- Read receipts where needed.
- Audit for sensitive sends.
- Quiet hours and importance levels.

### How To Build

- Add device registration after auth.
- Store device tokens by user, device, platform, and studio membership.
- Build notification templates in the database.
- Send notifications through a server-side API, not from client-only logic.
- Add permission checks before sending.
- Add communication rules to prevent broadcast leaks.
- Add delivery status and read state.
- Connect notifications to activity feed where useful.

### UX/Visual Standard

Notifications should feel calm, precise, and valuable:

- Short message.
- Clear action.
- Relevant context.
- No spam.
- No repeated noise.
- In-app notification center should feel organized, not like a chat dump.

The user should feel: "The app tells me only what I need to know."

### Complexity

Medium to high. Basic push is manageable, but targeting, preferences, audit, delivery state, and avoiding notification fatigue require strong product rules.

### Success Criteria

- Users can opt into notifications.
- Device tokens are stored securely.
- Notifications can target specific roles/groups/students/events.
- Users can view notification history.
- Sensitive notifications are audited.
- Broadcast leaks are prevented.
- Notifications remain useful in show mode.

### Risks/Dependencies

- Over-notification can damage trust quickly.
- Targeting mistakes can expose private information.
- Browser and mobile PWA support may vary.
- Notification content needs careful tone.

### Next Steps

- Choose FCM or OneSignal.
- Define notification categories.
- Build targeting matrix.
- Implement token registration.
- Add server-side send pipeline.
- Test opt-in, delivery, and read states.

## 8. PHASE 6 — PAYMENT INTEGRATION

### Goal

Add secure payment infrastructure for shop purchases, tuition, private lessons, event fees, and future academy commerce without storing card data directly.

### Why

Commerce is a major operational pillar. Payments should improve trust, reduce manual chasing, and give parents clarity. The app can become the studio's financial coordination layer, but only if payments are secure, auditable, and simple.

### What We Need

- Payment provider selection.
- Server-side checkout/payment intent flow.
- Orders and payment records.
- Product and pricing tables.
- Private lesson purchase/booking flow.
- Payment status webhooks.
- Receipts.
- Refund/cancellation model.
- Parent-facing payment history.
- Management reporting.
- Audit for payment-related changes.

### How To Build

- Choose a provider based on region, fees, local payment methods, invoice needs, and compliance.
- Never store card data in the app database.
- Create server-side checkout sessions or payment intents.
- Store order state separately from payment provider state.
- Use provider webhooks to confirm payment status.
- Add idempotency keys to prevent duplicate orders.
- Connect products, packages, lessons, and events to database-managed pricing.
- Add role-aware payment visibility.

### UX/Visual Standard

Payments should feel safe, clean, and premium:

- Clear item, price, and reason.
- No surprise fees.
- Strong confirmation screen.
- Receipt access.
- Payment status visible.
- Failed payment recovery should feel calm, not alarming.

Parent experience should feel like a trusted member service, not a checkout hack attached to the app.

### Complexity

High. Payments require provider integration, webhooks, compliance thinking, order state, refunds, idempotency, audit, and careful UX.

### Success Criteria

- Products and prices come from the database.
- Checkout happens through a secure provider.
- Payment status updates via webhook.
- Parents can see order and receipt history.
- Management can see payment state.
- Failed payments are recoverable.
- No card data is stored in LK Student Space.

### Risks/Dependencies

- Payment provider choice affects architecture and local business fit.
- Webhook failures can create mismatched payment states.
- Refunds and cancellations need clear operational rules.
- Payment UX must avoid ambiguity.

### Next Steps

- Select provider.
- Define order/payment schema.
- Build server-side checkout API.
- Add webhook handler.
- Add payment history screens.
- Test success, failure, cancel, refund, and duplicate submission cases.

## 9. PHASE 7 — AI PRODUCTION LAYER

### Goal

Add AI as a controlled operational intelligence layer that helps users understand, summarize, prepare, and act, without turning the app into a generic chatbot.

### Why

AI can make the system feel intelligent: summarize studio health, surface risks, draft messages, answer operational questions, prepare show readiness, identify attendance patterns, and help management act faster. But AI must be grounded in permissions, data boundaries, and product context.

### What We Need

- OpenAI API and Claude API integration strategy.
- Server-side AI gateway layer.
- Prompt and tool governance.
- Role-aware context retrieval.
- Audit for AI-assisted sensitive actions.
- Usage limits and cost controls.
- AI output review states for messages or sensitive recommendations.
- Evaluation cases for common workflows.
- Fallback behavior when AI is unavailable.

### How To Build

- Keep all AI calls server-side.
- Build domain-specific AI tools instead of exposing raw database access.
- Add permission checks before retrieving context.
- Use structured outputs for operational results.
- Store AI requests and responses where audit or debugging requires it, avoiding unnecessary sensitive retention.
- Add cost tracking by feature, studio, and user role.
- Start with assistant features that support operations rather than fully autonomous actions.

Initial AI capabilities:

- Management daily briefing.
- Teacher rehearsal/task summary.
- Parent-safe message drafting.
- Event readiness checklist generation.
- Attendance and engagement pattern summaries.
- Search-style answers over permitted studio data.
- Super Admin data health summary.

### UX/Visual Standard

AI should feel like quiet intelligence inside the product:

- Helpful summaries.
- Clear confidence and source context.
- No magical overclaiming.
- No generic chatbot screen as the primary interface.
- Suggestions should be reviewable.
- Actions should remain user-approved.

The experience should feel like the app is thoughtful, not like the user is talking to a bot bolted onto the side.

### Complexity

High. AI requires permission-aware context, server-side controls, prompt/version governance, cost monitoring, reliability, and careful UX patterns.

### Success Criteria

- AI calls never bypass permissions.
- Outputs are grounded in permitted data.
- Sensitive AI-assisted writes are audited.
- Costs are measurable.
- AI failures degrade gracefully.
- Users can distinguish suggestions from confirmed facts/actions.

### Risks/Dependencies

- Hallucinated operational guidance can damage trust.
- Poor permission design can leak private information.
- AI costs can grow quickly.
- Chat-first UX can dilute the premium product feeling.

### Next Steps

- Define first three AI use cases.
- Build server-side AI service wrapper.
- Add role-aware context fetchers.
- Create evaluation prompts and expected outputs.
- Add audit and usage tracking.

## 10. PHASE 8 — PERFORMANCE + OFFLINE

### Goal

Make the app fast, resilient, and usable in real studio conditions: mobile networks, backstage areas, low connectivity, quick check-ins, and repeated daily usage.

### Why

A dance academy operating system must work under pressure. Teachers taking attendance cannot wait. Parents checking arrival instructions should not hit blank screens. Show mode cannot depend on perfect connectivity.

### What We Need

- Performance budgets.
- Route-level loading strategy.
- Caching strategy.
- Offline-friendly critical data.
- Optimistic UI where safe.
- Background sync.
- PWA readiness.
- Mobile Safari testing.
- Error boundaries.
- Monitoring for slow pages and failed requests.

### How To Build

- Measure current route performance.
- Define critical paths: login, home, schedule, attendance, notifications, event mode, media.
- Cache read-heavy data carefully by role and season.
- Store critical offline data locally after auth.
- Use optimistic updates only for reversible, low-risk interactions.
- Add retry queues for safe offline mutations.
- Keep payments and sensitive writes online-confirmed.
- Add skeletons and calm degraded states.

### UX/Visual Standard

Performance should feel native:

- Instant first meaningful screen.
- Smooth transitions.
- No heavy dashboard loading.
- Clear offline badge.
- Cached content remains readable.
- Failed sync feels calm and recoverable.

The user should feel the app is dependable even in a busy studio hallway.

### Complexity

Medium to high. Basic performance work is moderate, but offline correctness across roles, permissions, and mutations is complex.

### Success Criteria

- Critical routes load quickly on mobile.
- App remains useful during temporary offline states.
- Sync state is visible and non-blocking.
- Attendance and event critical data can be prepared for poor connectivity.
- Sensitive operations do not pretend to succeed when confirmation is required.
- Monitoring identifies performance regressions.

### Risks/Dependencies

- Offline data can become stale or permission-sensitive.
- Optimistic updates can create operational confusion.
- Caching must respect role and studio boundaries.
- Media can dominate performance if not optimized.

### Next Steps

- Define performance budgets.
- Identify offline-critical data.
- Add monitoring.
- Build cache and sync strategy.
- Test on real mobile devices and Safari.

## 11. PHASE 9 — EVENT / SHOW MODE

### Goal

Create a dedicated operating mode for annual shows and major events, covering arrivals, backstage, tickets, checklists, lineup, live updates, media, and role-specific coordination.

### Why

The annual show is not just another event. It is the highest-pressure, highest-emotion operating moment of the academy. If LK Student Space helps the studio run a show calmly, it becomes mission-critical.

### What We Need

- Event/show data model.
- Lineup and schedule.
- Arrival instructions.
- Backstage assignments.
- Checklists.
- Role-specific live updates.
- Parent-safe information.
- Teacher/staff operations view.
- Ticket/payment integration when ready.
- Media connection for show memories.
- Offline-ready critical data.
- Push notification integration.

### How To Build

- Model events as season-aware operational entities.
- Add show-specific modules for lineup, arrivals, groups, roles, backstage zones, tasks, and live updates.
- Build parent-facing event cards with only relevant child instructions.
- Build teacher/staff control views for attendance, readiness, backstage notes, and urgent updates.
- Add management overview for readiness and risk.
- Connect notifications to event updates.
- Add offline cache for event day critical data.

### UX/Visual Standard

Show mode should feel special, calm, and cinematic:

- Dedicated visual identity within the app.
- Clear timeline.
- Big next action.
- No operational clutter for parents.
- Staff views optimized for speed.
- Live status should be readable at a glance.
- Emotional touches through media and language, without sacrificing clarity.

The experience should feel like the studio has a professional command center in everyone's pocket.

### Complexity

High. Show mode combines scheduling, communication, attendance, media, payments, notifications, offline support, and role-specific visibility.

### Success Criteria

- Parents see exact arrival and event instructions for their child.
- Teachers see assigned groups and backstage tasks.
- Management sees readiness and unresolved issues.
- Live updates can be sent to targeted audiences.
- Critical event data works with poor connectivity.
- Event media can be organized afterward.

### Risks/Dependencies

- Must not expose backstage or child data to the wrong users.
- Event-day reliability is non-negotiable.
- Too much information can overwhelm parents.
- Requires earlier phases: auth, database, notifications, media, performance.

### Next Steps

- Define show mode MVP.
- Design event data schema.
- Create role-specific event journeys.
- Prototype event readiness dashboard.
- Test with a real show scenario before production use.

## 12. PHASE 10 — MULTI-STUDIO SAAS

### Goal

Evolve LK Student Space from a single-studio production app into a multi-studio SaaS platform with tenant isolation, studio configuration, billing readiness, feature flags, onboarding, and platform administration.

### Why

The long-term business opportunity is not only one academy. The product can become a premium operating system for dance academies. Multi-studio SaaS must be designed carefully so expansion does not weaken privacy, performance, or product quality.

### What We Need

- Tenant/studio isolation.
- Studio-level settings and branding.
- Studio onboarding flow.
- Subscription/billing model.
- Feature flags by studio.
- Cross-studio Super Admin tools.
- Data export/import per studio.
- Studio-level audit and health.
- Support tools.
- Environment strategy for platform operations.

### How To Build

- Ensure every production table is studio-scoped where appropriate.
- Enforce tenant isolation in RLS and server-side APIs.
- Add studio configuration for branding, seasons, modules, language, and policies.
- Build onboarding templates that can seed a new studio safely.
- Add feature flags to enable modules gradually.
- Add platform admin views for health, usage, errors, billing state, and support.
- Create migration tooling for studio data.
- Keep one-studio production stable before expanding broadly.

### UX/Visual Standard

Each studio should feel like the app belongs to them:

- Studio branding.
- Language and tone.
- Season context.
- Modules appropriate to their operations.
- Premium consistency across all tenants.

Super Admin should feel like platform control, not a cluttered database console.

### Complexity

Very high. Multi-tenant SaaS changes security, schema design, onboarding, billing, support, observability, and product operations.

### Success Criteria

- Multiple studios can exist without data leakage.
- New studio onboarding is repeatable.
- Feature flags work per studio.
- Studio admins manage their own operational settings.
- Super Admin can monitor health and support studios.
- Billing model can be connected cleanly.

### Risks/Dependencies

- Tenant isolation mistakes are severe.
- SaaS expansion before single-studio quality will multiply problems.
- Studio customization can fragment the product.
- Support tooling becomes essential.

### Next Steps

- Confirm single-studio production stability.
- Audit schema for tenant boundaries.
- Define studio onboarding package.
- Add feature flags and studio settings.
- Design Super Admin SaaS console.

## 13. VISUAL EXPERIENCE STANDARD

### Goal

Define the design quality bar for every production feature so the app remains premium, calm, and emotionally connected as functionality expands.

### Why

The product's visual and emotional quality is a business differentiator. Dance academies are built around presence, movement, aspiration, parents' trust, and students' identity. The interface must reflect that.

### Standard

Every screen should answer:

- Who is this for?
- What matters now?
- What is the next action?
- What can be hidden?
- What would make this feel trustworthy?
- What would make this feel beautiful without adding clutter?

Visual qualities:

- Premium surfaces with restraint.
- Strong spacing and hierarchy.
- Rounded, tactile components.
- Soft contrast and careful typography.
- Clear mobile-first layout.
- Native-feeling bottom navigation or role-aware shell.
- Beautiful cards, not dense tables, for user-facing views.
- Tables only where operationally appropriate.
- Media displayed with emotional weight.
- Empty states that guide, not decorate.
- Skeletons and loading states that preserve calm.

### What To Avoid

- Generic admin dashboard layouts.
- Dense metric grids on first screen.
- Unclear icon-only actions.
- Prototype-looking buttons.
- Random gradients without system.
- Chat-style interfaces for everything.
- Feature dumps.
- Screens that require explanation.

### Complexity

Medium. The challenge is not technical alone; it is maintaining taste and consistency as more production systems are added.

### Success Criteria

- New features feel like part of the same product.
- Mobile remains the primary quality benchmark.
- Role-specific experiences are visually distinct but coherent.
- Visual polish supports operational clarity.
- The app feels premium even in administrative flows.

## 14. IMPLEMENTATION ORDER

### Recommended Sequence

1. Stabilize V6 UX and role flows.
2. Establish Vercel deployment foundation.
3. Design production database schema.
4. Build Supabase database and migration path.
5. Add production auth and permissions.
6. Migrate core app reads/writes to production data.
7. Add media storage and visibility.
8. Add targeted notifications.
9. Add payments.
10. Add AI production layer.
11. Add performance and offline resilience.
12. Build event/show mode.
13. Expand to multi-studio SaaS.

### Why This Order

This order protects the product from unstable foundations. Auth depends on data. Media, notifications, payments, and AI depend on auth and permissions. Event mode depends on nearly every earlier system. Multi-studio SaaS should happen only after the single-studio product is reliable.

### Complexity Ladder

- Low to medium: deployment foundation, documentation, release process.
- Medium: V6 UX stabilization, visual system, basic media, performance improvements.
- High: real database, auth, payments, AI, show mode.
- Very high: multi-studio SaaS.

### Practical Milestones

Milestone 1: V6 Demo Ready

- Stable role flows.
- No confusing dead ends.
- Local JSON remains reliable.
- Product feels premium enough to show.

Milestone 2: Production Foundation Ready

- Vercel deployment.
- Supabase schema.
- Auth model.
- Environment strategy.
- Release checklist.

Milestone 3: Single-Studio Production Ready

- Real users.
- Real database.
- Real permissions.
- Media.
- Notifications.
- Payments if required for launch.
- Monitoring and backups.

Milestone 4: Operating System Ready

- AI summaries.
- Offline resilience.
- Event/show mode.
- Activity, audit, and search mature enough for daily operations.

Milestone 5: SaaS Ready

- Tenant isolation.
- Studio onboarding.
- Feature flags.
- Platform admin.
- Billing model.

## 15. DOCUMENTATION REQUIRED

### Goal

Keep the product understandable and maintainable as it grows from V6 to production.

### Why

Documentation prevents the system from becoming a collection of screens. It helps future development preserve the operating system architecture, role logic, permissions, data model, and product taste.

### Required Documents

- `docs/PRODUCTION_ROADMAP.md`: This roadmap.
- Backend architecture: database, services, API routes, and sync strategy.
- Data privacy: roles, visibility, retention, and child data protection.
- RLS policies: table-level permissions and test cases.
- Deployment checklist: environments, release, rollback, smoke tests.
- Auth and roles matrix: user types, access rules, and route protection.
- Database schema guide: tables, ownership, relationships, and migrations.
- Migration guide: V6 local JSON to Supabase.
- Audit and activity guide: which actions are logged and why.
- Notification rules: categories, targeting, frequency, and quiet hours.
- Media visibility guide: who can upload, view, moderate, archive.
- Payment integration guide: provider, webhooks, order states, refunds.
- AI governance guide: use cases, permissions, prompts, costs, evaluations.
- Event/show mode runbook: event-day operations and failure plan.
- Multi-studio SaaS guide: tenant isolation, onboarding, feature flags, support.

### Documentation Standard

Each document should explain:

- What the system does.
- Why it exists.
- Who owns it.
- What data it touches.
- What permissions protect it.
- What audit/activity records it creates.
- How to test it.
- What can go wrong.
- What should never happen.

### Complexity

Medium. Documentation is not hard to write, but it requires discipline to keep it aligned with implementation.

### Success Criteria

- New contributors understand the system without reading every component.
- Product decisions are traceable.
- Permission logic is documented before sensitive features launch.
- Production incidents have runbooks.
- The product remains coherent as modules expand.

## 16. FINAL PRINCIPLE

LK Student Space should grow like an operating system, not like a pile of features.

Every production phase must protect the same promise:

**Open the app. See what matters now. Trust what you see. Know what to do next.**

The product wins when it makes a dance academy feel calmer, more professional, more connected, and more alive. Technical architecture, database design, auth, media, payments, notifications, AI, and SaaS expansion all exist to serve that experience.

Do not ship complexity because it is technically impressive. Ship systems that make the studio easier to run, parents more confident, students more connected, teachers faster, and management clearer.

The final standard is not whether the app has many features. The final standard is whether the academy feels better because LK Student Space exists.
