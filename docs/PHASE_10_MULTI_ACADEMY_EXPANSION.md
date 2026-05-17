# Phase 10 Multi-Academy Expansion Platform

Phase 10 prepares LK Student Space to grow from one academy into a premium multi-academy operating platform. It is a foundation phase, not a broad SaaS launch. LK Studio must remain stable, local/demo fallback must remain available, and every new concept must be academy-aware, permission-aware, audit-aware and additive.

Previous phase references:

- Live operations: `docs/PHASE_9_LIVE_OPERATIONS.md`
- Production launch: `docs/PHASE_8_PRODUCTION_LAUNCH.md`
- Production hardening: `docs/PHASE_6_PRODUCTION_HARDENING.md`
- Future expansion: `docs/PHASE_4_FUTURE_EXPANSION.md`
- Backend foundation: `docs/PHASE_2_BACKEND_FOUNDATION.md`
- Multi-academy baseline: `docs/MULTI_ACADEMY_ARCHITECTURE.md`
- R2 media architecture: `docs/CLOUDFLARE_R2_MEDIA_ARCHITECTURE.md`

## Multi-Academy Philosophy

The product direction is: same operating system, different academy identity. Each academy gets its own name, branding, login presence, roles, feature package, media archive, galleries, analytics and support context, while the core app architecture stays shared.

Rules:

- No public self-signup.
- No rushed SaaS billing.
- No cross-academy data access for normal users.
- No LK Studio disruption during expansion.
- No runtime rewrites until contracts, QA and migration rules are stable.
- Super Admin controls platform setup, switching, repair, export/import, archive and recovery.
- Academy management controls only its own academy.
- Students, parents, teachers and assistants never see another academy.

## Phase 10 Foundation Added

Typed inert contracts live in `lib/platform/multi-academy.ts`. They prepare:

- Super Admin-only academy onboarding drafts.
- Academy branding drafts.
- Academy feature packages and entitlements.
- Academy role permission defaults.
- R2 media isolation helpers.
- Academy analytics contracts.
- Support tool contracts.
- Scaling safety rules.
- Billing preparation without enforcement.
- Super Admin academy switching contracts.
- Academy template presets.

These contracts are not wired into live UI, API routes, migrations, providers or billing enforcement in Phase 10.

## Onboarding Flow

Academy creation must be Super Admin-only and deliberate:

1. Super Admin creates an academy draft with academy name, slug, location, timezone and contact info.
2. Super Admin chooses a template or starts from a minimal academy shell.
3. Super Admin configures logo, colors, login welcome text, gallery mood, event style and shop atmosphere.
4. Super Admin selects the feature package.
5. Super Admin assigns the academy owner or first management admin.
6. The system validates default permissions and confirms no public self-signup is enabled.
7. A dry-run setup report checks academy ID, slug, branding, permissions, feature flags, media prefixes and support owner.
8. The academy enters pilot status.
9. Only after QA does the academy become active.

Required onboarding fields:

- Academy name.
- Slug.
- Logo.
- Location.
- Timezone.
- Contact info.
- Branding colors.
- Feature package.
- Default permissions.
- Academy admin assignment.

## Academy Lifecycle

Lifecycle states:

- `draft`: Super Admin is preparing shell, branding and package.
- `setup`: users, groups, permissions and imports are being reviewed.
- `pilot`: a small trusted audience is testing real flows.
- `active`: academy is operational.
- `paused`: academy access or rollout is temporarily restricted.
- `archived`: academy is retained for records and recovery, not active use.
- `recovery`: Super Admin is repairing data, media, permissions or imports.

State changes are sensitive platform actions. They require Super Admin context, academy ID, audit entry, rollback note and a visible current academy context.

## Academy Isolation Strategy

Every durable production row must include `academy_id` in Supabase and `academyId` in application contracts. Current V6 compatibility may still carry `studioId`, but production scoping must treat `academyId` as the tenant boundary.

Isolation rules:

- Repositories receive explicit academy scope through `lib/security/academy-scope.ts`.
- Global reads require Super Admin context.
- Management, teachers, assistants, parents and students query only their own academy.
- Super Admin switching must be explicit and visually obvious.
- Audit logs include academy ID and actor user ID.
- Feature flags, permissions, analytics, media and support cases remain academy-scoped.
- Imports must validate academy ID on every row before writing.

Supabase/RLS direction:

- Every exposed academy-owned table uses `academy_id`.
- RLS policies must derive role and academy membership from trusted server/app metadata, not editable user metadata.
- Views exposed to clients must not bypass academy isolation.
- Updates require matching select policies and academy membership checks.

## Academy Branding System

Branding should change academy identity without changing product architecture.

Each academy can support:

- Custom logo.
- Primary, secondary and highlight colors.
- Custom login page.
- Custom welcome text.
- Custom gallery mood.
- Custom event style.
- Custom shop atmosphere.
- Future reserved domain or subdomain.

Branding must remain bounded by accessibility, RTL support, readable contrast, premium calm UI and shared navigation structure. A theme should not be able to hide critical actions, change permission behavior or fork the product.

## Academy Feature Packages

Feature packages are academy-scoped entitlement bundles. They prepare product fit without building full SaaS billing yet.

Prepared package direction:

- Basic academy: attendance, gallery and simple shop foundations.
- Competition academy: event mode, practice tracking, AI insights and future backstage readiness.
- Kids-focused academy: parent-linked communication, galleries, events and conservative visibility defaults.
- Adult dance academy: adult groups, direct student communication, private lessons and practice tracking.
- Performing arts academy: wider production/event/shop/private lesson needs.

Possible features:

- Shop.
- Private lessons.
- AI insights.
- Gallery.
- Event mode.
- Backstage mode later.
- Advanced notifications.
- Practice tracking.
- Payments later.
- Storage usage later.

Feature flags remain academy-scoped. A package enables defaults, but Super Admin may still review final entitlements before activation.

## Academy Management Structure

Phase 10 prepares this hierarchy:

- Academy owner: owns academy-level operations and first escalation, scoped to one academy.
- Academy management: manages users, groups, attendance, shop, media, private lessons, branding where allowed and support within one academy.
- Teachers: attendance, assigned groups, class media, tasks and private lessons where enabled.
- Assistants: limited attendance/class support where assigned.
- Parents: linked children only.
- Students: personal student view and allowed academy content.
- Super Admin: platform-level setup, switching, archive, repair, export/import, feature packages, cross-academy aggregate insight and audit.

Permission defaults are prepared in `phase10DefaultPermissions`, but live permission enforcement remains in the existing permission and academy scope systems until UI wiring is explicitly planned.

## Multi-Academy Media Isolation

Cloudflare R2 remains the production media direction. Phase 10 confirms the required boundary:

```text
academy-media/
  academies/{academyId}/
    groups/{groupId}/lessons/{classId}/{YYYY-MM-DD}/
    events/{eventId}/
    competitions/{competitionId}/
    annual-shows/{showId}/
    shop/products/{productId}/
    students/{studentId}/submissions/
    galleries/
    archive/
    legacy/
```

Existing `buildR2ObjectKey()` already writes signed upload keys under `academies/{academyId}/...`. Phase 10 adds inert helper contracts to verify a key stays inside the active academy prefix before future download/listing tools expose it.

Rules:

- No cross-academy media access.
- No broad user-driven R2 prefix listing.
- Metadata, R2 key and visibility rule must carry the same academy ID.
- Private media is signed URL only.
- Public media requires explicit approval and visibility state.
- Archive separation is by academy, then event/gallery/archive context.

## Academy Analytics Foundation

Academy-level analytics should help operations without becoming personal surveillance.

Prepared metric categories:

- Engagement.
- Attendance trends.
- Practice completion.
- Gallery usage.
- Event participation.
- Payment/order summaries.

Academy management sees its own academy only. Super Admin may see platform-wide aggregate insight, but not raw personal details, contact info, media content, raw search text or payment secrets.

## Academy Support Tools

Phase 10 prepares Super Admin-only support/admin tool contracts for:

- Academy setup.
- Academy repair.
- User migration.
- Academy export/import.
- Academy archive.
- Academy recovery.

Every support tool requires academy ID, Super Admin role, audit entry, local fallback preservation and a clear live-academy risk flag. Repair and migration tools must prefer dry-run reports before writes.

## Scaling Risks

Main risks before onboarding many academies:

- Queries that omit academy ID or scan across all academies.
- Galleries that load too many originals or list broad R2 prefixes.
- Event archives slowing current live event/class screens.
- Notification audience leaks or duplicate sends.
- Imports that mix academy IDs.
- Super Admin switching without visible context.
- Feature packages becoming billing enforcement before product and support are ready.
- Analytics collecting too much detail.

`phase10ScalingSafety` documents required rules for queries, media, events, notifications, analytics and imports.

## Operational Procedures

New academy setup:

1. Create academy draft.
2. Select template and package.
3. Configure branding.
4. Assign academy owner.
5. Import or create a small test group.
6. Verify role permissions.
7. Verify academy login branding.
8. Upload test media and confirm academy prefix.
9. Confirm gallery visibility.
10. Run pilot QA before activation.

Academy repair:

1. Freeze risky writes if needed.
2. Confirm active academy context.
3. Collect safe support summary.
4. Inspect scoped records only.
5. Apply minimal fix.
6. Audit sensitive changes.
7. Retest the affected role flow.

Academy archive/recovery:

1. Confirm owner approval and Super Admin approval.
2. Export academy-scoped data snapshot where available.
3. Preserve media prefixes and metadata.
4. Disable active writes.
5. Keep records recoverable according to retention policy.
6. Test recovery in a non-live context before restoring any production data.

## Migration Strategy

Migration from LK Studio-first to multi-academy must be gradual:

1. Keep LK Studio as the first active academy.
2. Preserve local/demo fallback and existing seeded academy.
3. Treat `studioId` as compatibility while moving production contracts toward `academyId`.
4. Add academy-scoped contracts before new UI.
5. Validate Supabase migrations and RLS before remote production changes.
6. Dry-run imports and academy setup with non-live data.
7. Onboard one additional academy in pilot mode before scaling.
8. Only then introduce stronger Super Admin academy management UI.

## Billing And Subscription Preparation

Phase 10 prepares billing shape only:

- Academy subscriptions.
- Billing plans.
- Invoices later.
- Storage usage later.
- Academy feature entitlements.

Not included:

- Full SaaS billing.
- Subscription enforcement.
- Public checkout for academies.
- Automatic feature cutoffs.
- Billing provider wiring.

Student commerce and future academy billing must stay separate. Existing shop/private lesson payments are not the same as academy subscription billing.

## Academy Switching UX Foundation

Super Admin switching requirements:

- Obvious current academy name and identity.
- Explicit switch action.
- Immediate branding refresh.
- Academy-safe navigation after switch.
- No accidental cross-editing.
- Audit for sensitive changes after switching.
- Clear distinction between platform aggregate views and academy-local views.

Normal users never switch academies and never see other academy names unless they truly belong to multiple academies in a future approved model.

## Academy Template System

Templates should configure safe defaults, not create forks.

Prepared template direction:

- Kids dance academy preset.
- Flamenco academy preset.
- Competition academy preset.
- Performing arts preset.

Templates can configure branding defaults, feature defaults, terminology defaults and event structures. They should not bypass permission review, academy owner assignment or media visibility policy.

## Long-Term SaaS Direction

Long term, LK Student Space can become a curated academy platform with managed onboarding, academy packages, branded login, reliable media storage, event operating modes, optional advanced analytics and later subscription billing.

The near-term principle is controlled expansion. The platform should grow through Super Admin-led onboarding and support, not anonymous signup, automated billing pressure or generic SaaS dashboards.

## QA Checklist

Automated checks for this phase:

```bash
npm run lint
npm run typecheck
npm run build
```

Manual QA checklist:

- [ ] Academy isolation: repository calls and future tools require academy ID.
- [ ] Academy login branding: `/academy/[slug]/login` shows correct logo, colors and welcome copy.
- [ ] Academy switching: Super Admin sees obvious current academy context before edits.
- [ ] Academy feature flags: package defaults do not enable features for another academy.
- [ ] Media separation: uploads and galleries use `academies/{academyId}/...`.
- [ ] Role permissions: owner, management, teacher, assistant, parent and student remain role-safe.
- [ ] Management visibility: academy management cannot see platform-wide or other-academy data.
- [ ] Super Admin controls: setup, repair, import/export, archive and recovery remain Super Admin-only.

## Phase 10 Verification Notes

Recorded during Phase 10 foundation work:

- `npm run lint` passed with warnings only: 134 warnings, 0 errors. Warning categories match the existing repo baseline such as unused variables/imports, React hook dependency/set-state-in-effect warnings, `<img>` optimization warnings and one CommonJS `require()` warning.
- `npm run typecheck` passed.
- `npm run build` passed when rerun outside the sandbox. The first sandboxed build attempt failed while loading `next.config.js` because `os.networkInterfaces()` was blocked by the sandbox.
- Manual browser/device QA was not performed because this phase intentionally avoids broad UI wiring.
- No deployment, live provider call, Supabase migration, push, commit or production rollout was performed.
- No local/demo fallback was removed.
- No full SaaS billing was implemented.
- LK Studio runtime flows were not intentionally changed.
