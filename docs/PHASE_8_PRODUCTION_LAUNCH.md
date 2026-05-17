# Phase 8 Production Launch Preparation

Phase 8 prepares LK Student Space for the first real production release for LK Studio by Liat Kaplinski. This phase is launch readiness only: no public launch, no deployment, no live payments, no broad new UI, and no removal of local/demo fallback.

Previous phase references:

- Phase 5 integration foundations: `docs/PHASE_5_REAL_INTEGRATIONS.md`
- Phase 6 production hardening: `docs/PHASE_6_PRODUCTION_HARDENING.md`
- Phase 7 real user QA: `docs/PHASE_7_REAL_USER_QA.md`
- Vercel setup: `VERCEL-DEPLOYMENT.md`
- Deployment QA: `DEPLOYMENT-QA.md`
- Environment guidance: `ENVIRONMENT.md`

## Launch Rules

- Do not launch publicly until all critical checks pass.
- Do not deploy production from a feature branch.
- Do not enable live charging. Payments remain sandbox until a separate live-payment approval.
- Do not onboard everyone at once.
- Preserve local/demo mode as the safe fallback.
- Treat unverified production infrastructure as a launch blocker, not as an assumption.
- Keep post-launch work focused on bugs, usability, stability, and operational friction.

## Release Gate

Production release is blocked until every required item below is either checked or explicitly accepted by the release owner with a written reason.

- [ ] `main` is the Vercel Production Branch.
- [ ] `develop` and pull requests create Preview deployments only.
- [ ] No direct experimental commits are made to `main`.
- [ ] `npm run lint` passes.
- [ ] `npm run typecheck` passes.
- [ ] `npm run build` passes.
- [ ] Supabase production project is configured and backed up.
- [ ] RLS policies are active and tested against academy isolation.
- [ ] Cloudflare R2 production bucket, CORS, lifecycle, and signed upload flow are verified.
- [ ] Payment provider remains sandbox and webhook verification is tested.
- [ ] Super Admin health status is accessible only to authorized Super Admin users.
- [ ] Mobile Safari, Android Chrome, RTL, weak internet, and installable PWA checks pass.
- [ ] Pilot P0/P1 issues from `docs/PILOT_FEEDBACK_LOG.md` are closed or accepted as blockers.
- [ ] Rollback owner, support owner, and first-week monitoring cadence are assigned.

## Launch Checklist

- [ ] Confirm final launch scope: LK Studio only, first academy only.
- [ ] Confirm production domain and HTTPS certificate.
- [ ] Confirm LK Studio branding, title, icon, install label, and login path.
- [ ] Confirm production environment variables are present in Vercel and scoped correctly.
- [ ] Confirm preview environment variables use sandbox/test services only.
- [ ] Confirm local/demo mode still boots with missing provider credentials.
- [ ] Confirm production data seed/import path for LK Studio users, groups, products, lessons, and roles.
- [ ] Confirm Super Admin account for Alon Baliti / אלון בליטי.
- [ ] Confirm teacher, management, parent, and student pilot accounts.
- [ ] Confirm emergency rollback path and support contact.
- [ ] Record release date, release owner, reviewed commit SHA, deployment URL, and accepted exceptions.

## Infrastructure Checklist

Vercel:

- [ ] Project root is the repository root.
- [ ] Framework preset is Next.js.
- [ ] Build command is `npm run build`.
- [ ] Production Branch is `main`.
- [ ] Preview deployments are enabled for `develop` and pull request branches.
- [ ] Production domain is attached and HTTPS is valid.
- [ ] Environment variables are configured per environment, not copied blindly across scopes.
- [ ] Runtime logs are available to the release owner.

Supabase:

- [ ] Production project exists and is separate from preview/testing.
- [ ] Daily backups are enabled before pilot data enters production.
- [ ] PITR or equivalent restore capability is approved for launch.
- [ ] Phase 2 migration has been applied to a staging/preview project first.
- [ ] RLS is enabled on exposed tables.
- [ ] Policies are tested for student, parent, teacher, management, and Super Admin roles.
- [ ] Service role key is server-only and never used in client code.
- [ ] Restore drill is completed in staging before public rollout.

Cloudflare R2:

- [ ] Production bucket exists and is separate from preview/testing.
- [ ] Bucket CORS permits only approved app origins.
- [ ] Lifecycle/versioning policy is approved.
- [ ] Originals remain private unless intentionally public.
- [ ] Signed upload creation is verified.
- [ ] Upload completion metadata is verified.
- [ ] Gallery/listing reads do not assume local-only media.

Payments:

- [ ] Provider sandbox account is configured.
- [ ] `PAYMENT_SANDBOX=true` remains set for launch prep.
- [ ] Hosted session creation resolves amount server-side.
- [ ] Webhook signatures are verified.
- [ ] Order lifecycle is tested with sandbox provider callbacks.
- [ ] Refund flow is documented as a placeholder unless fully implemented and audited.
- [ ] No card numbers, CVV/CVC, full PAN, or raw provider secrets are stored.
- [ ] Live charging is blocked until a separate approval.

Monitoring and support:

- [ ] `/api/health` works in preview and production.
- [ ] `/api/integrations/health` is guarded and visible only to Super Admin/dev contexts.
- [ ] Webhook failures, upload failures, auth failures, and payment status mismatches are logged with safe metadata.
- [ ] First-week support cadence is assigned.
- [ ] Critical incidents have owner, severity, and rollback criteria.

## Vercel Production Setup

Branch strategy:

- `main` is production.
- `develop` is preview/testing.
- Feature branches and pull requests are preview only.
- No direct experimental commits to `main`.
- Production promotion requires reviewed code, passing checks, and release-owner approval.

Environment separation:

- Production uses production Supabase, production R2, production domain, and sandbox payments until live-payment approval.
- Preview uses staging/test Supabase, staging/test R2, and sandbox providers only.
- Development uses `.env.local`, local/demo fallback, and intentionally missing-service health statuses where needed.
- Never point preview deployments at production data unless the release owner explicitly approves a read-only diagnostic.

Secure env handling:

- Store secrets in Vercel Project Settings -> Environment Variables or another approved secret manager.
- Do not commit `.env.local`, provider credentials, service-role keys, R2 secrets, webhook secrets, payment secrets, AI keys, VAPID private keys, or messaging API keys.
- `NEXT_PUBLIC_` variables are browser-visible. Use this prefix only for intentionally public values.
- After changing Vercel environment variables, create a fresh preview build before accepting the result.
- Keep `.env.example` as a template only.

Production environment checklist:

- [ ] `AUTH_MODE=supabase` only after Supabase Auth/session binding is verified.
- [ ] `NEXT_PUBLIC_APP_ENV=production`
- [ ] `NEXT_PUBLIC_ENABLE_DB_SYNC` set intentionally for production behavior.
- [ ] `NEXT_PUBLIC_USE_SUPABASE_DATA` enabled only when repository adapters are verified.
- [ ] `NEXT_PUBLIC_SUPABASE_URL` points to production Supabase.
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` belongs to production Supabase and is protected by RLS.
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is server-only and marked sensitive.
- [ ] `CLOUDFLARE_R2_ACCOUNT_ID`, `CLOUDFLARE_R2_ACCESS_KEY_ID`, `CLOUDFLARE_R2_SECRET_ACCESS_KEY`, `CLOUDFLARE_R2_BUCKET`, and `CLOUDFLARE_R2_PUBLIC_BASE_URL` are configured for production media.
- [ ] `PAYMENT_PROVIDER`, `PAYMENT_PROVIDER_PUBLIC_KEY`, `PAYMENT_PROVIDER_SECRET_KEY`, `PAYMENT_WEBHOOK_SECRET`, and `PAYMENT_TERMINAL_ID` use sandbox/test values until live approval.
- [ ] `PAYMENT_SANDBOX=true`
- [ ] `OPENAI_API_KEY` and/or `ANTHROPIC_API_KEY` are server-only and used only after AI route permissions are reviewed.
- [ ] `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, and `VAPID_SUBJECT` are configured only after notification consent and storage are approved.
- [ ] `MEDIA_WEBHOOK_SECRET` and `NOTIFICATION_WEBHOOK_SECRET` are configured before accepting those webhook payloads.

Deployment flow:

1. Merge reviewed launch candidate into `develop`.
2. Let Vercel create a Preview deployment.
3. Run automated checks: `npm run lint`, `npm run typecheck`, `npm run build`.
4. Run the production QA checklist in `DEPLOYMENT-QA.md` against the Preview deployment.
5. Verify Super Admin health status and provider sandbox status.
6. Fix blockers on a branch, then repeat Preview checks.
7. Merge the approved release candidate into `main` only after written approval.
8. Let Vercel deploy Production from `main`.
9. Run post-deploy smoke checks immediately.
10. Begin the slow rollout sequence below.

No production deployment was performed as part of creating this Phase 8 plan.

Rollback plan:

- Primary rollback: use Vercel Deployment history to restore the previous healthy Production deployment.
- CLI rollback is available to the release owner when appropriate: `vercel rollback` or `vercel rollback <deployment-url-or-id>`.
- Data rollback must be handled separately from app rollback. Never restore production data directly without staging validation.
- If payment state diverges, provider dashboard/webhook records are the source of truth until reconciliation is completed.
- If media metadata and R2 objects diverge, freeze media publishing and reconcile by R2 key before re-enabling uploads.
- After rollback, rerun `/api/health`, login, Super Admin access, academy isolation, and the failed user journey.

## Domain And Branding Strategy

Initial production domain:

- Primary app domain: `app.lkstudio.co.il`
- LK Studio login path: `/academy/lk-studio/login` or the configured LK Studio academy slug.
- Root path may redirect to the active public login shell only after production routing is approved.

Future academy routing:

- Keep academy-specific login paths as the first multi-academy model.
- Future subdomains may be introduced when needed, for example `academy-name.domain.com`.
- Subdomains must map to an academy record, not hardcoded component branches.
- Every request must resolve academy context before showing private data.

Branding checklist:

- [ ] Academy name, Hebrew display name, logo/icon, colors, and public login copy load from academy data.
- [ ] Metadata title and description match LK Studio launch branding.
- [ ] `public/manifest.json` name, short name, theme color, direction, language, and icons are correct.
- [ ] `app/layout.tsx` metadata, Apple web app title, manifest link, theme color, and viewport settings are correct.
- [ ] Mobile install branding is checked on iPhone Safari and Android Chrome.
- [ ] No cross-academy branding appears after refresh, deep link, or sign out.

Current PWA notes:

- Manifest exists at `public/manifest.json`.
- SVG icon exists at `public/icon.svg`.
- App metadata and viewport settings exist in `app/layout.tsx`.
- Launch QA should still verify real device install behavior and whether PNG/maskable assets are required by target browsers.

## Production Database And Storage Checklist

Supabase production:

- [ ] Production project is created and owned by the correct team.
- [ ] Production project is separate from preview/testing.
- [ ] Backups are enabled.
- [ ] Restore process is tested in staging.
- [ ] RLS is active on every exposed production table.
- [ ] Academy isolation is verified for all roles.
- [ ] Super Admin access is explicit and audited.
- [ ] Service role usage is limited to trusted server routes/admin scripts.
- [ ] Auth session binding is verified before production Supabase mode.

Cloudflare R2 production:

- [ ] Production bucket name and region/account are documented.
- [ ] Bucket is private by default.
- [ ] Approved public media policy is documented.
- [ ] Signed upload route returns a short-lived upload URL only after permission checks.
- [ ] Upload completion writes metadata with academy, user, context, visibility, moderation state, and R2 key.
- [ ] Media list/gallery reads enforce academy and visibility.
- [ ] Failed upload tracking is visible to management or Super Admin.
- [ ] No production media path relies on local files.

Launch blockers if not verified:

- Supabase production project not connected or not backed up.
- RLS not tested with real role fixtures.
- Server routes not bound to verified Supabase Auth sessions.
- R2 signed upload flow not verified end to end.
- Media visibility relies on client-side filtering only.

## Payment Provider Readiness

Live payments remain disabled for Phase 8.

Before live payment approval:

- [ ] Provider contract and merchant account are approved.
- [ ] Sandbox hosted session is tested.
- [ ] Webhook verification rejects missing, invalid, and replayed signatures.
- [ ] Order lifecycle is tested: created, pending, paid, failed/cancelled, refunded/placeholder.
- [ ] Refund behavior is documented. If refund execution is not implemented, management must handle refunds manually in the provider dashboard.
- [ ] Audit logs capture payment session creation, webhook status change, manual correction, and refund action.
- [ ] Payment status shown to users matches provider/source-of-truth state.
- [ ] No secrets or raw card details are exposed in UI, logs, client bundles, or committed files.
- [ ] Live charging is enabled only after a separate release checklist and written approval.

## Monitoring And Health Plan

Health surfaces:

- `/api/health`: public/simple app health smoke check.
- `/api/integrations/health`: guarded integration health for Super Admin/dev contexts.
- Super Admin health panel: simple production health status for Supabase, R2, payments, webhooks, push, and messaging.

Track:

- App boot errors and repeated server route failures.
- Integration health check failures.
- Failed uploads and incomplete upload metadata.
- Webhook signature failures, processing failures, and retries.
- Auth failures, permission denials, and suspicious cross-academy attempts.
- Media storage signing/listing failures.
- Payment session creation failures, webhook mismatch, and stuck pending orders.
- AI provider failures and blocked unsafe AI actions.
- Notification subscription failures and send failures when messaging is enabled.

Alerting thresholds:

- Any P0 security, data-loss, or payment issue triggers immediate rollout freeze.
- Repeated 401/403 spikes require auth/permission review.
- Repeated payment or webhook failures require provider dashboard reconciliation.
- Repeated upload failures require R2 health and signed URL review.
- Super Admin health red status during rollout blocks wider onboarding.

## Backup And Recovery Verification

Supabase:

- [ ] Daily backups enabled before real users enter production.
- [ ] PITR or approved equivalent is enabled for production.
- [ ] Restore drill completed into staging.
- [ ] Academy-scoped recovery steps are documented.
- [ ] Export/import fallback is tested with academy ID and schema version.

R2:

- [ ] Lifecycle/versioning policy is configured where available.
- [ ] Originals and high-value media have a retention plan.
- [ ] Deleted-object recovery window is defined.
- [ ] Metadata and object keys are backed up together.
- [ ] Annual show and major event media have extra recovery consideration.

Disaster recovery:

- [ ] Freeze writes when corruption or cross-academy exposure is suspected.
- [ ] Restore database to staging first.
- [ ] Validate academy isolation and media references in staging.
- [ ] Promote restored data only after Super Admin/release-owner approval.
- [ ] Document incident timeline, affected records, rollback action, and follow-up fix.

## Security Final Review Checklist

Auth and permissions:

- [ ] Server routes use verified auth/session binding before sensitive reads or writes.
- [ ] Roles and academy access come from trusted database/profile records, not user-editable metadata.
- [ ] Parent access is limited to linked children.
- [ ] Teacher access is limited to assigned groups/students/private lessons.
- [ ] Management access is academy-scoped.
- [ ] Super Admin routes are explicit, guarded, and audited.

Data and isolation:

- [ ] No public sensitive student, parent, teacher, payment, message, or attendance data.
- [ ] No cross-academy data access through direct API calls, deep links, search, media URLs, or cached state.
- [ ] No unrestricted admin routes.
- [ ] Audit logging covers sensitive writes.

Route review:

- [ ] Media upload/list routes enforce academy, role, visibility, and moderation.
- [ ] Payment routes resolve price server-side and never trust client amount/status.
- [ ] Payment webhooks require signatures and idempotency.
- [ ] AI routes are server-only, permission-aware, and draft/approval-first.
- [ ] Webhooks reject missing or invalid secrets/signatures.
- [ ] Push, email, SMS, and WhatsApp sends remain sandbox/no-op until consent and templates are approved.

Secret review:

- [ ] No leaked keys in committed files.
- [ ] No service role, R2 secret, payment secret, webhook secret, AI key, VAPID private key, or messaging key has `NEXT_PUBLIC_`.
- [ ] Logs sanitize provider payloads, card metadata, tokens, and raw secrets.

Known Phase 8 blockers inherited from Phase 6:

- Production server routes still require verified Supabase Auth session binding before live production use.
- RLS policy implementation and staging test evidence must be completed.
- Audit persistence for every sensitive mutation must be verified.
- Payment transaction idempotency and provider reconciliation must be verified before live charging.
- Media visibility must be enforced server-side before real private galleries launch.

## Mobile And PWA Readiness

Checklist:

- [ ] App opens immediately on iPhone Safari.
- [ ] App opens on Android Chrome.
- [ ] Home screen install works.
- [ ] Installed app shows correct LK name/icon/theme.
- [ ] Splash screen/background color is acceptable.
- [ ] Safe-area viewport works with notches and home indicators.
- [ ] Bottom navigation and primary actions are reachable.
- [ ] Keyboard does not hide critical form actions.
- [ ] RTL layout remains correct across login, home, attendance, shop, gallery, and management screens.
- [ ] Weak internet does not block attendance or critical class workflows without clear feedback.
- [ ] Offline fallback basics are understood: local/demo data may remain available, but remote writes must show sync/pending/failure state.

Manual device test plan:

1. iPhone Safari: open domain, login, navigate tabs, install to Home Screen, reopen installed app, test safe area.
2. Android Chrome: open domain, login, install if prompted, reopen installed app.
3. Weak internet: throttle or test cellular, then verify login feedback, attendance, media upload failure state, and retry language.
4. RTL/text scaling: check Hebrew screens with larger text settings where possible.

## Real User Onboarding

Do not onboard everyone at once. Each group gets a short walkthrough, a support path, and a known test window.

Shared onboarding message should include:

- App link or academy login path.
- Which account to use.
- Password setup/reset instructions.
- What the user should try first.
- What not to do yet, especially live payments if still sandbox.
- Support contact and expected response time.
- How to report a bug: role, device, steps, screenshot/video if possible.

Students:

- Login.
- Check Home for today/next action.
- Open lessons/tasks.
- View allowed media/gallery.
- Report confusing wording or missing class/group.

Parents:

- Login.
- Confirm linked child/children.
- Check attendance or event reminder.
- Open shop/private lessons/gallery.
- Report missing child, wrong group, payment confusion, or unclear messages.

Teachers:

- Login before class.
- Confirm assigned groups.
- Mark attendance in a test/approved class flow.
- Try group update/task/media upload only if enabled for pilot.
- Report anything that slows class operation.

Management:

- Login.
- Review attention items.
- Check user/group/product/event/media management flows.
- Verify Super Admin support path for data fixes.
- Record operational work still happening outside the app.

Super Admin:

- Verify academy context.
- Check health status.
- Verify integrations show safe statuses and no secrets.
- Review export/import, audit, and feature flag expectations.
- Keep launch blockers visible.

## Production QA Plan

Automated checks before launch:

```bash
npm run lint
npm run typecheck
npm run build
```

Manual QA checklist:

- [ ] Login.
- [ ] Role routing and sign out.
- [ ] Attendance.
- [ ] Media upload.
- [ ] Gallery.
- [ ] Shop.
- [ ] Products.
- [ ] Payments sandbox.
- [ ] Notifications subscription/preferences where enabled.
- [ ] Private lessons.
- [ ] Management tools.
- [ ] Super Admin tools.
- [ ] Academy isolation.
- [ ] Export/import in safe test flow.
- [ ] Mobile Safari.
- [ ] Android Chrome.
- [ ] RTL.
- [ ] Weak internet.

Record every failed check in `docs/PILOT_FEEDBACK_LOG.md` or the launch issue tracker with owner, severity, reproduction steps, and retest result.

## Slow Launch Strategy

1. Internal testing: Alon/release owner and technical reviewers only.
2. Management: LK Studio management validates operational flows and data correctness.
3. Teachers: selected teachers validate class-time flows, especially attendance and media.
4. Selected parents/students: small trusted group validates clarity, login, child linkage, gallery, shop/private lesson discovery, and support load.
5. Wider academy rollout: only after first groups pass without P0/P1 blockers.

Stop widening rollout when:

- Login breaks for a role.
- Cross-academy or wrong-child access is suspected.
- Payments, media, or attendance show unreliable state.
- Support volume reveals confusion that blocks normal use.
- Super Admin health shows repeated red status.

## Post-Launch Stabilization Plan

First 24 hours:

- Monitor health, logs, login failures, media upload failures, webhook failures, payment sandbox/status mismatches, and support messages.
- Freeze non-critical feature work.
- Fix P0 immediately and consider rollback.
- Fix P1 before widening rollout.

First week:

- Daily review of support issues and pilot feedback.
- Small bug-fix batches only.
- Retest mobile Safari, attendance, gallery, shop, private lessons, management, and Super Admin tools after each fix batch.
- Keep live payments disabled unless the separate payment go-live checklist is completed.

After stabilization:

- Convert repeated support questions into onboarding copy or UI wording fixes.
- Prioritize reliability, clarity, and operational friction before new features.
- Plan live payments, broader notifications, and future academy subdomains as separate controlled releases.

## Phase 8 Verification Notes

Recorded on 2026-05-17 during launch-prep documentation work:

- `npm run lint` passed with warnings: 134 warnings, 0 errors. Warning categories include unused variables/imports, React hook dependency/set-state-in-effect warnings, `<img>` optimization warnings, and one `require()` style import warning.
- `npm run typecheck` passed.
- `npm run build` passed. Build emitted a Node deprecation warning for `module.register()`.
- Manual browser/device QA was not performed in this phase. The required manual coverage remains: login, attendance, media upload, gallery, shop, products, payments sandbox, notifications, private lessons, management tools, Super Admin tools, iPhone Safari, Android Chrome, RTL, and weak internet.
- No deployment, public launch, live payment enablement, push/commit, or local/demo fallback removal was performed.
