# Release Process

This process keeps LK Student Space stable while real academies use it. It complements `docs/PHASE_8_PRODUCTION_LAUNCH.md` and `docs/PHASE_9_LIVE_OPERATIONS.md`.

## Branch And Environment Flow

1. Develop on a feature or fix branch.
2. Merge reviewed work into `develop` for Preview validation.
3. Run Preview QA against the Vercel Preview deployment.
4. Stage rollout to a small approved user group.
5. Promote to production only after release owner approval.
6. Monitor production immediately after release.
7. Roll back if P0/P1 criteria are met.

Environment expectations:

- Feature branches: development and Preview only.
- `develop`: Preview QA and staged validation.
- `main`: production only.
- Local/demo fallback remains available in development.
- Preview must not point to production data unless explicitly approved as a read-only diagnostic.

## Required Automated Checks

Run before release candidate approval:

```bash
npm run lint
npm run typecheck
npm run build
```

If an emergency P0 hotfix skips a check, the release owner must record the reason and run the skipped check immediately after mitigation.

## Preview QA Checklist

- [ ] Login and sign out.
- [ ] Academy-specific login path.
- [ ] Role routing for student, parent, teacher, management, Super Admin.
- [ ] Attendance completion and correction.
- [ ] Media upload, failure state, retry, and gallery listing.
- [ ] Gallery visibility for allowed and blocked roles.
- [ ] Shop/private lesson discovery.
- [ ] Payment sandbox session and failure handling.
- [ ] Notifications consent/subscription where enabled.
- [ ] Super Admin health: app, integrations, uploads, webhooks, sync, payments.
- [ ] Mobile Safari.
- [ ] Android Chrome.
- [ ] RTL and safe-area layout.
- [ ] Weak internet behavior.
- [ ] Local/demo fallback still boots without live provider credentials.

## Migration Verification

Before applying or relying on a migration:

- [ ] Migration reviewed for academy scope and RLS impact.
- [ ] Migration applied to staging/Preview first.
- [ ] Existing demo/local boot still works.
- [ ] Backup or rollback path is documented.
- [ ] RLS policies tested by role.
- [ ] Media, payment, notification, and webhook rows remain academy-scoped.
- [ ] Super Admin access remains explicit and audited.

After migration:

- [ ] Run automated checks.
- [ ] Smoke test login, attendance, media, gallery, payments sandbox, and Super Admin health.
- [ ] Record migration SHA, date, owner, and accepted risks.

## Release Notes Template

Use short release notes that are useful to operators:

```md
## Release YYYY-MM-DD

Owner:
Commit/Deployment:
Scope:

### Changed
- 

### Fixed
- 

### Operational Notes
- 

### Known Issues
- 

### QA Evidence
- lint:
- typecheck:
- build:
- manual:
```

## Staged Rollout

Start small and widen only after stability is visible:

1. Internal Super Admin/release owner.
2. Management users.
3. Selected teachers.
4. Selected parents/students.
5. Wider academy rollout.

Stop widening rollout when:

- Login or role routing breaks.
- Cross-academy, wrong-child, or private media exposure is suspected.
- Attendance blocks class operation.
- Uploads or galleries repeatedly fail.
- Payment status is inconsistent with provider state.
- Support volume shows repeated confusion.
- Super Admin health shows repeated red status.

## Hotfix Process

Hotfixes are for live risk, not convenience.

Rules:

- Tie the hotfix to an incident, P0/P1 support case, or release blocker.
- Make the smallest safe change.
- Avoid broad refactors, design changes, or opportunistic cleanup.
- Preserve local/demo fallback.
- Run automated checks unless the release owner accepts an emergency exception.
- Retest the exact failed flow.
- Update release notes and incident record.

Flow:

1. Classify incident and owner.
2. Create a fix branch from the production base.
3. Patch only the failing surface.
4. Run checks and targeted manual QA.
5. Preview if time allows; for P0, document any skipped step.
6. Release with owner approval.
7. Monitor and close only after the failure stops.

## Rollback Process

Rollback triggers:

- P0 security, data exposure, data loss, or full login outage.
- P1 repeated failure in attendance, upload/gallery, payment, auth, or webhook flow.
- New release causes worse support load than previous version.
- Super Admin health shows production-blocking status after deploy.

App rollback:

- Use Vercel deployment history to restore the last known healthy deployment.
- Record previous deployment, rollback target, reason, owner, and time.
- Smoke test immediately after rollback.

Data rollback:

- Freeze affected writes.
- Restore into staging first.
- Validate academy isolation, payment status, media references, and user access.
- Promote restored data only after approval.

Payment/media rollback notes:

- App rollback does not undo provider-side payment state.
- Payment reconciliation must use provider records as source of truth.
- Media rollback must reconcile database metadata and R2 objects by academy and object key.

## Post-Release Monitoring

First hour:

- Login and role routing.
- Super Admin health.
- Server/API errors.
- Upload failures.
- Webhook failures.
- Payment anomalies.
- Sync failures.

First day:

- Review support cases.
- Review pilot feedback.
- Check mobile/weak-internet reports.
- Confirm no P0/P1 before widening rollout.

First week:

- Batch small fixes.
- Convert repeated confusion into wording or onboarding improvements.
- Keep new feature work frozen until stability is proven.
