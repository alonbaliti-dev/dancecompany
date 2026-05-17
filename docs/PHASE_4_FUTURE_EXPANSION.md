# Phase 4 Future Expansion

Phase 4 is a preparation phase for LK Student Space as a long-term operating system for dance academies. It does not implement full SaaS billing, native apps, advanced media processing, accounting, push provider delivery, or production event/show mode. The goal is to define stable expansion boundaries that protect Phase 1 UX stabilization, Phase 2 backend foundations, and Phase 3 operational systems.

## Principles

- Keep local/demo fallback intact until each domain is intentionally migrated.
- Every future model is academy-aware, permission-aware, and audit-aware.
- Use repositories, domain operations, and service interfaces before UI wiring.
- Prefer additive contracts over runtime changes.
- Treat AI as suggestions only. No autonomous sending, publishing, grading, billing, or permission bypass.
- Preserve RTL, mobile, Safari, PWA safe areas, and existing navigation behavior whenever UI is eventually added.

## Long-Term Platform Vision

LK Student Space should evolve from a single-academy pilot into a multi-academy platform with shared operating primitives:

- Academy identity, branding, roles, feature packages, and storage boundaries.
- Domain repositories for attendance, media, events, communication, commerce, users, and analytics.
- Audit-first writes for sensitive actions.
- Central permission checks before navigation, mutation, publication, billing, media visibility changes, or event operations.
- Stable local/demo mode for development, demos, pilot recovery, and offline-safe UX testing.

The product direction remains calm and role-centered. Students, parents, teachers, management, and Super Admins should see the next useful action, not every future capability at once.

Phase 4 should prepare platform-level architecture without pretending these advanced systems are complete. Each future domain should layer on top of Phase 2 repositories and Phase 3 operations instead of creating duplicate state, duplicate guards, or parallel service stacks.

## Scaling Strategy

Phase 4 scaling starts with contracts, not broad implementation.

- `academy_id` stays the durable tenant boundary.
- Academy switching must resolve one active academy at a time and must never infer cross-academy access from UI state alone.
- Super Admin global access remains explicit and audited.
- Academy feature packages should control future capabilities without dead CTAs.
- Academy-level storage isolation should keep R2 keys under predictable tenant prefixes, such as `academies/{academyId}/...`.
- Academy analytics should be derived from scoped events and summaries, not direct cross-tenant UI queries.
- Academy billing is future-only and must not be mixed with shop orders, teacher payments, or student purchases until separate contracts exist.
- Infrastructure scaling should keep runtime dependencies optional, degrade to local/demo mode when providers are absent, and avoid new required env vars until a domain is production-ready.
- Operational scaling should introduce monitoring, backups, disaster recovery, and admin alerts as service boundaries before they become UI.

## Academy Onboarding Model

Future onboarding should be staged:

1. Create academy shell: name, slug, timezone, locale, status.
2. Add branding preset: logo, colors, typography constraints, RTL language defaults.
3. Configure feature package: enabled modules, pilot constraints, storage profile, support level.
4. Import people and groups: students, parents, teachers, management, role mappings.
5. Validate permissions: academy admins, Super Admin access, teacher group scope.
6. Run data integrity checks: duplicate guardians, missing emergency contacts, unassigned students, orphan groups.
7. Attach academy template and presets: default schedule model, communication defaults, event defaults, media visibility defaults, and support tier.
8. Open controlled pilot mode before production launch.

Onboarding should produce audit entries for academy creation, branding changes, role imports, feature activation, and pilot-to-live transition.

## Multi-Academy Foundations

Future models should cover:

- Multiple academies per platform account.
- Academy switching for users with valid memberships.
- Academy switching UX that clearly shows the active academy, never leaks another academy, and requires an explicit switch action.
- Academy templates and presets for onboarding without hardcoding academy-specific content into UI.
- Branding packages per academy, with RTL and accessibility-safe color constraints.
- Branding presets per academy.
- Feature packages per academy.
- Academy-level R2 storage isolation.
- Academy analytics summaries.
- Academy health monitoring for sync status, data integrity, media storage, failed jobs, and permission anomalies.
- Future academy billing placeholders.

Do not build full SaaS billing in Phase 4. Keep billing as a documented contract until roles, invoices, refunds, and subscription boundaries are reviewed.

## Advanced Event And Show Mode

Annual show mode and competition mode are future operating modes, not a single screen.

Future models should prepare:

- Backstage mode for staff, teachers, and stage managers.
- Live production mode for show-day coordination without exposing sensitive backstage data to students or parents.
- Stage manager mode with stricter permissions, emergency context, and operational audit.
- Run-of-show timeline with rehearsal sequencing, cue status, stage readiness, and blocked-state reasons.
- Show run order with act status, groups, arrival windows, costume state, and stage cues.
- Costume tracking with checklists, assignment status, and issue reporting.
- Arrival and check-in flows for students, guardians, staff, volunteers, and performers.
- Emergency contacts scoped to event roles and permissions.
- Live event updates with audience segmentation.
- Production dashboards for management and stage coordination.
- Annual show mode and competition mode as distinct event profiles.

Future UI shell concepts can be documented as read-only coordination surfaces: backstage overview, stage timeline, costume checklist, arrival board, rehearsal sequence, live announcements, and stage readiness board. No Phase 4 work should create dead show screens or unstable live dashboards. The safe next step is typed contracts and permission/audit expectations.

## Apple Watch And Studio Displays

Native and display surfaces remain architecture direction only.

Future device classes:

- Apple Watch companion for teachers and stage staff.
- Studio lobby display for today’s schedule, welcome messaging, safe announcements, and non-private class status.
- Rehearsal room display for class status, countdown timers, next group, and rehearsal sequence.
- Backstage screen for annual show and competition coordination.
- Schedule screen and class status board for staff-visible operational state.
- Teacher display mode for attendance and live schedule.
- Rehearsal countdowns and next-group cues.
- Attendance quick mode for low-friction class starts.
- Wearable attendance quick mark, rehearsal reminders, countdowns, student stretch reminders, teacher quick actions, and backstage notifications.
- Backstage display mode for annual shows and competitions.
- Live announcements that remain academy-scoped and audience-filtered.

These surfaces must consume server-approved, academy-scoped snapshots. They must not become independent sources of truth.

## Future AI Roadmap

Current rule: AI suggestions only. No autonomous actions.

Future AI areas:

- Choreography assistance and rehearsal planning.
- Movement analysis only after explicit consent, privacy review, and media policy approval.
- Practice consistency analysis for supportive coaching, not punitive automation.
- Engagement prediction for retention and care workflows.
- Media auto-tagging and highlight recommendations.
- Rehearsal readiness summaries.
- Event summarization, annual show recaps, and production summaries.
- Studio operational insights for management.
- Onboarding assistance for setup checklists, missing data, and role mapping suggestions.
- Smart reminders for teachers, parents, and students.

AI orchestration must enforce:

- Permission-filtered context.
- Academy-scoped inputs and outputs.
- Human approval before sending, publishing, billing, grading, role changes, or visibility changes.
- Audit records for generated drafts, approvals, and rejected sensitive outputs.
- Clear labels that AI output is advisory.

## Push And Communication Future

Future notification architecture should support:

- Push notifications.
- Email.
- SMS.
- WhatsApp later.
- Academy-wide broadcasts.
- Event broadcasts.
- Emergency alerts with stricter permission, rate-limit, and audit requirements.
- Event reminder flows.
- Reminder campaigns for attendance, payments later, rehearsals, costumes, and show arrivals.
- Role-targeted and group-targeted messages.
- Read receipts and delivery status.

No real push, email, SMS, or WhatsApp provider is introduced in Phase 4. Provider adapters should be defined later behind service interfaces with academy-level opt-in, rate limits, consent, quiet hours, and audit.

## Finance And Business Foundation

Future finance structures should stay separate from current shop and private lesson UI until reviewed.

Future contracts:

- Invoices.
- Refunds.
- Academy financial summaries.
- Revenue summaries.
- Financial exports.
- Teacher payments later.
- Subscription plans later.
- Academy billing later.

Phase 4 must not implement accounting, payment processing, card storage, tax handling, or subscription enforcement. Financial actions must be permission-gated and audited when implemented.

## Advanced Media Pipeline

Cloudflare R2 remains the primary media storage direction. Supabase stores metadata and permissions.

Future media pipeline capabilities:

- Video transcoding.
- Thumbnail generation.
- Adaptive streaming.
- Compression profiles.
- CDN optimization.
- Archival lifecycle policies.
- AI media tagging.
- Highlight reel generation.
- Memory timeline generation for academy milestones, shows, competitions, and rehearsals.

The future pipeline should be job-based, idempotent, and academy-scoped. It should model processing queue status, thumbnail references, streaming renditions, compression profiles, archival state, retry policy, and visibility review before publish. It should never expose R2 credentials to the client and should preserve visibility rules before any asset becomes available.

## Security And Operations

Future operations should prepare:

- Monitoring for app health, repository errors, media queue health, auth anomalies, and academy sync failures.
- Audit expansion for feature activation, academy switching, event operations, AI approvals, media visibility changes, billing actions, and integration delivery.
- Academy isolation hardening through strict `academy_id` checks, scoped repositories, RLS review, and Super Admin audit.
- Media access hardening with signed URLs, visibility checks, expiry, and no direct R2 credentials in client code.
- Backup lifecycle for Supabase data, media metadata, academy exports, and recovery drills.
- Disaster recovery plans for provider outage, corrupted imports, media job failure, and academy rollback.
- Operational logs and admin alerts that are actionable without exposing private student or guardian data.

## Design System Future-Proofing

Future design work should extend the current system without destabilizing Phase 1 UX:

- Academy themes and branding packages with accessible contrast and RTL-safe layout constraints.
- Event mode themes for annual show, competition, rehearsal, and backstage states.
- Studio display layouts for large screens, distance readability, and non-private information.
- Large media gallery patterns for dense albums, video states, loading, and archive context.
- Accessibility scaling for touch targets, motion sensitivity, keyboard flow, Hebrew/English text length, and screen readers.
- Native adaptation tokens for future mobile and wearable clients.

Do not add broad UI in Phase 4. Document future shell concepts and wait for stable domain operations before implementation.

## Future Integrations

Potential integrations should be introduced through adapters and feature flags:

- Push providers.
- Email providers.
- SMS providers.
- WhatsApp Business.
- Calendar export.
- Payment providers.
- Accounting systems.
- Native mobile and watch services.
- Media processing queues.
- Analytics warehouses.

Each integration needs fallback behavior, academy opt-in, permission checks, audit records, and no required env vars that can crash local/demo mode.

## Rollout Strategy

Phase 4 rollout should stay incremental:

1. Keep contracts and docs inert while Phase 1, Phase 2, and Phase 3 stabilize.
2. Validate each future domain against academy scope, permissions, audit, local fallback, and repository boundaries.
3. Pilot one academy-facing capability at a time behind feature packages.
4. Add provider adapters only after local/demo behavior and failure modes are defined.
5. Promote from pilot to live only after lint, typecheck, build, browser QA, mobile/RTL QA, and operational rollback notes pass.
6. Avoid linking future screens into navigation until their data, permissions, empty states, and audit paths are complete.

## Risk Analysis

- Cross-academy data leakage if `academy_id` is optional or inferred from client state.
- Feature-package drift creating visible dead actions.
- Notification fatigue if quiet hours, targeting, and consent are not designed early.
- Show mode complexity overwhelming teachers during live events.
- Media cost growth from unbounded video originals and missing lifecycle policies.
- AI trust issues if suggestions are not clearly labeled and permission-filtered.
- Finance risk if shop orders, academy subscriptions, refunds, and teacher payouts are mixed too early.
- Native/display fragmentation if devices mutate operational state directly.
- Parallel implementation risk if Phase 4 screens are built before Phase 1, Phase 2, and Phase 3 foundations are stable.
- Infrastructure fragility if optional providers become startup gates.
- Monitoring noise if admin alerts are not prioritized by operational severity.
- Accessibility regression if academy themes override contrast, spacing, or RTL behavior without checks.

## Safe Phase 4 Deliverables

Safe now:

- Documentation.
- Typed future models and service contracts.
- Repository contract notes.
- Permission and audit expectations.
- Inert feature package definitions.
- Placeholder routes only when stable, clearly future-facing, and not linked from production navigation.

Not safe now:

- Full SaaS billing.
- Real push provider integration.
- Apple Watch or native implementation.
- Complex event/show mode implementation.
- Accounting implementation.
- Advanced media processing implementation.
- Broad UI expansion.

## QA Expectations

For Phase 4 preparation, verify:

- `npm run lint`
- `npm run typecheck`
- `npm run build`
- No clipping risk introduced.
- No RTL regressions introduced.
- No sheets/navigation touched.
- No duplicated state architecture.
- No dead actions or screens added.
- No unstable layouts added.
- Local/demo fallback remains available.
