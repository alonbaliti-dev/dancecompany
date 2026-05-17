# Phase 9 Live Operations & Stabilization

Phase 9 turns LK Student Space from a technically launched product into a stable operating platform for real academy use. This phase is not a feature expansion phase. It protects live trust, watches real friction, fixes the highest-risk problems first, and keeps local/demo fallback available.

Previous phase references:

- Launch preparation: `docs/PHASE_8_PRODUCTION_LAUNCH.md`
- Pilot QA: `docs/PHASE_7_REAL_USER_QA.md`
- Production hardening: `docs/PHASE_6_PRODUCTION_HARDENING.md`
- Integration foundations: `docs/PHASE_5_REAL_INTEGRATIONS.md`
- Release process: `docs/RELEASE_PROCESS.md`
- Pilot feedback log: `docs/PILOT_FEEDBACK_LOG.md`

## Live Operations Philosophy

- Stability beats feature volume.
- Users should always understand what happened, what is pending, and what to do next.
- Super Admin sees simple operational signals, not raw secrets or developer-only noise.
- Real usage should teach the product through safe analytics, support cases, and observed friction.
- Fix P0/P1 issues before widening rollout or adding new capability.
- Preserve local/demo fallback for development, emergency diagnosis, and low-risk demos.

## Phase 9 Stability Rules

- No mass UI rewrite.
- No architecture replacement.
- No broad navigation redesign.
- No unstable experimental systems in live flows.
- No mobile instability, blocking loaders, or hidden critical actions.
- No external analytics provider until explicitly approved and configured.
- No sensitive media, raw search text, card data, secrets, passwords, or contact details in analytics.
- No deploy, push, or commit as part of this phase unless explicitly requested later.

## Stabilization Priorities

1. Login, academy scope, and role permissions.
2. Attendance completion during class time.
3. Media upload and gallery visibility.
4. Payment safety and provider reconciliation.
5. Notifications only after consent and provider readiness.
6. Mobile Safari, Android Chrome, RTL, weak internet, and PWA safety.
7. Super Admin health, support ownership, rollback clarity, and release discipline.

## Real Usage Analytics Foundations

Typed analytics contracts live in `lib/analytics/operations-analytics.ts`. They define events for:

- Screen usage: `screen.view`
- Navigation flow: `navigation.transition`
- Failed actions: `action.failed`
- Upload failures: `upload.failed`
- Payment failures: `payment.failed`
- Attendance completion: `attendance.completed`
- Task completion: `task.completed`
- Notification engagement: `notification.engaged`
- Gallery usage: `gallery.used`
- Search usage: `search.used`

Rules:

- Every event must include `academyId`.
- Prefer role and surface over user-level tracking.
- Use session hashes only when needed for debugging flow loops.
- Search stores length/result buckets, never raw query text.
- Media events store context/kind/count buckets, never media content, URLs, faces, or captions.
- Payment events store failure context and amount buckets only, never card data or provider secrets.
- Super Admin insight should be operational: what is failing, confusing, slow, or unused.
- No provider call is wired in Phase 9; these contracts are ready for later approved persistence.

## Operational Health Dashboard

The existing Super Admin "חיבורים" panel can now receive operational health signals from the integration health report without a new UI surface. The added typed health summary lives in `lib/operations/health-summary.ts` and prepares status for:

- Upload failures
- Webhook issues
- Integration status
- Academy health
- Pending errors
- Storage usage
- Sync failures
- Payment anomalies

The panel language remains simple Hebrew. When real counters exist, connect them to `buildOperationalHealthSnapshot`; until then, unknown metrics stay in "במעקב" instead of pretending they are healthy.

## Incident Handling

Incident contracts live in `lib/operations/incidents.ts`.

Severity:

- P0: security, data exposure, data loss, live payment corruption, or full login outage. Freeze rollout and consider rollback immediately.
- P1: major role flow broken, repeated upload/payment/auth/webhook failure, broken private gallery, class-time attendance blocked.
- P2: repeated confusion, notification issue, weak internet degradation, localized support load.
- P3: low-risk wording, polish, isolated non-blocking issue.

Handling loop:

1. Acknowledge and record safe metadata only.
2. Classify severity and affected academy/role.
3. Protect users first: hide unsafe media, block duplicate payment actions, preserve queued work, or show clear recovery copy.
4. Assign owner and next check time.
5. Fix or mitigate P0/P1 before new rollout.
6. Retest the affected journey on mobile and desktop.
7. Record root cause, user impact, release SHA, and follow-up prevention.

Prepared playbooks cover failed uploads, payment failures, auth failures, webhook failures, broken galleries, notification issues, sync issues, and weak internet failures.

## Error Recovery Contracts

Operational handling should follow these defaults:

- Failed uploads: never publish incomplete media; allow retry; show clear status; log R2 key only after metadata is safely recorded.
- Payment failures: never retry charge silently; compare app order, webhook, and provider source of truth; manual correction requires audit.
- Auth failures: do not loosen role checks; guide reset/relogin; verify academy scope before support changes.
- Webhook failures: require signature verification and idempotency; retry safely; reconcile with provider dashboard.
- Broken galleries: hide suspect visibility first; verify academy, group, student, moderation, and R2 object references.
- Notification issues: respect consent; use backup channel for urgent messages; avoid duplicate noisy sends.
- Sync issues: use the Phase 6 offline queue policies; show queued/syncing/failed state; do not block class workflows unnecessarily.
- Weak internet: reduce required payload, preserve progress locally where allowed, and make retry visible.

## Support Workflows

Support contracts live in `lib/operations/support-workflows.ts`.

Prepared workflows:

- Password reset
- Parent relinking
- Incorrect attendance
- Media visibility correction
- Upload issue resolution
- Payment support
- Academy onboarding help

Rules:

- Verify identity before account, parent-child, or payment changes.
- Audit sensitive changes.
- Keep Super Admin tools simple and safe.
- Never expose another student, parent, media item, payment, or academy during support.
- Convert repeated questions into clearer onboarding copy or small UI wording changes.

## Real-World UX Refinement Process

Observe first, change narrowly:

- Teachers: time to mark attendance, confusion during class, upload retry clarity, too many taps.
- Parents: child linkage, payment status wording, gallery access, notification clarity.
- Students: motivation, next action, task completion, gallery discovery.
- Management: bottlenecks, support volume, attendance correction, event readiness.

Allowed improvements:

- Shorten wording.
- Reduce clutter.
- Make status/feedback more visible.
- Remove dead or misleading CTAs.
- Improve speed, lazy loading, and retry clarity.

Not allowed in Phase 9:

- Broad redesign.
- New domain features unrelated to live stability.
- Experimental flows in class-time or payment paths.
- Changes that make demo/local mode brittle.

## Release Strategy

Use `docs/RELEASE_PROCESS.md` for the structured release process:

1. Develop on a branch.
2. Preview deployment from branch or `develop`.
3. Preview QA.
4. Staged rollout to small real group.
5. Production release only after checks pass and owner approves.
6. Post-release monitoring.
7. Rollback if P0/P1 criteria are met.

Hotfix rules:

- Hotfixes must be minimal, reviewed, and tied to an incident or release blocker.
- No drive-by cleanup in hotfixes.
- Run `npm run lint`, `npm run typecheck`, and `npm run build` unless the release owner explicitly accepts an emergency exception.
- After hotfix, retest the failed journey and update the incident record.

## Rollback Strategy

- App rollback: restore the last healthy Vercel production deployment.
- Data rollback: never restore production directly; validate in staging first.
- Payment rollback: do not assume app rollback changes provider state; reconcile provider records manually.
- Media rollback: freeze media publishing if metadata and R2 objects diverge; reconcile by academy and object key.
- After rollback: retest login, role routing, academy isolation, attendance, gallery, payments, Super Admin health, and the failed journey.

## Production Maintenance Process

Daily during pilot:

- Review Super Admin health.
- Review P0/P1 support issues.
- Check upload, webhook, sync, and payment anomalies.
- Check pilot feedback log.
- Confirm no widened rollout with unresolved P0/P1.

Weekly:

- Review repeated support categories.
- Review performance and mobile issues.
- Confirm backups and restore readiness.
- Close stale accepted-risk items or turn them into planned work.
- Update release notes and known issues.

## Performance Optimization Plan

Audit and improve without destabilizing UX:

- Media galleries: lazy load, image sizing, pagination, private URL expiry, avoid loading originals in list views.
- Event screens: cache stable event structure, split live status from archived content.
- Attendance: keep class-time path fast, save incrementally, support queued sync, avoid large re-renders.
- Large lists: search index, filters, pagination, virtualization only after measuring.
- Uploads: size checks before signing, progress feedback, retry queue, background completion.
- Mobile: test Safari memory, keyboard, safe area, install mode, slow networks, and reduced motion.
- Query efficiency: academy-scoped reads, limited fields, indexes for common filters, no cross-academy broad scans.
- Background sync: bounded retries, clear failed state, no silent infinite loops.

## User Feedback Loop

Every feedback item should include role, device, academy, flow, severity, steps, screenshot/video if safe, owner, and retest result.

Prioritization:

- P0/P1 first.
- Repeated friction beats isolated preference.
- Class-time teacher blockers outrank cosmetic issues.
- Parent confusion that creates support load outranks nice-to-have polish.
- Student engagement changes should be measured before expanding.

Validation:

- Fix one narrow problem.
- Retest on the original role/device.
- Confirm the user-facing wording is clear.
- Watch whether the same issue reappears.
- Record improvement in `docs/PILOT_FEEDBACK_LOG.md` or the issue tracker.

## Long-Term Data & Media Care

- Keep media archives academy-scoped and event-scoped.
- Preserve annual show memories as durable collections, not temporary uploads.
- Keep old event galleries accessible according to visibility rules.
- Verify R2 object keys and database metadata stay consistent.
- Define retention and recovery for originals, thumbnails, and metadata.
- Keep academy legacy protected during migrations, imports, and rollbacks.
- Test recovery of uploaded media and related gallery metadata before broad onboarding.

## QA And Release Safety

Automated checks for this phase:

```bash
npm run lint
npm run typecheck
npm run build
```

Manual QA checklist:

- [ ] Mobile Safari login, navigation, safe area, installed PWA.
- [ ] Android Chrome login, navigation, install behavior.
- [ ] Weak internet for attendance, uploads, gallery, and sync.
- [ ] Upload success, upload failure, retry, and incomplete upload handling.
- [ ] Gallery access, broken gallery fallback, and media visibility.
- [ ] Attendance completion, correction, queued sync, and teacher speed.
- [ ] Notifications consent, subscribe, send/test, and fallback channel where enabled.
- [ ] Management flows for users, groups, events, shop/private lessons, and support.
- [ ] Academy switching or academy-specific login paths.
- [ ] Role permissions for student, parent, teacher, management, and Super Admin.

## Phase 9 Verification Notes

Recorded on 2026-05-17 during live-operations foundation work:

- `npm run lint` passed with warnings: 134 warnings, 0 errors. Warning categories match existing project warnings such as unused variables/imports, React hook dependency/set-state-in-effect warnings, `<img>` optimization warnings, and one `require()` style import warning.
- `npm run typecheck` passed.
- `npm run build` passed. Build emitted the existing npm `devdir` config warning and Node `module.register()` deprecation warning.
- Manual browser/device QA was not performed during contract/documentation creation.
- No deployment, public rollout, live payment enablement, push/commit, or local/demo fallback removal was performed.
