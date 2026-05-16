# Deployment QA

Use this checklist before promoting a Vercel deployment. `develop` is for Preview verification only; Production must remain tied to `main`.

## Vercel Smoke-Test Workflow

1. Open the latest Vercel Preview deployment for the branch under review.
2. Confirm `/api/health` returns an OK JSON response.
3. Open the app root and confirm the login screen appears without a blocking loader.
4. Complete the checklist sections below on mobile and desktop viewport sizes.
5. Record the deployment URL, commit SHA, reviewer, and any exceptions before release approval.

## Vercel Environment Variables

- [ ] Production Branch is set to `main` in Vercel Project Settings.
- [ ] Preview deployments are enabled for `develop` and pull request branches.
- [ ] `NEXT_PUBLIC_APP_ENV` matches the target environment.
- [ ] `NEXT_PUBLIC_ENABLE_DB_SYNC` is intentionally set for the environment.
- [ ] Server-only secrets do not use the `NEXT_PUBLIC_` prefix.
- [ ] AI provider keys and database service keys are marked sensitive in Vercel.
- [ ] Any changed environment variable was followed by a fresh deployment.

## Supabase/Firebase Connectivity

- [ ] Supabase URL and anon key are configured for the target environment when Supabase is enabled.
- [ ] Supabase service role key is configured only for server-side routes or admin tooling.
- [ ] Firebase project values are configured only when Firebase Auth, messaging, storage, or Firestore work is enabled.
- [ ] Connection-dependent screens fail safely when a provider is not configured.
- [ ] Runtime logs show no repeated provider initialization or credential errors.

## Login/Auth

- [ ] Login screen renders immediately on first load.
- [ ] Valid test credentials can enter the app.
- [ ] Invalid credentials show a clear error and do not navigate into the app.
- [ ] Refreshing an authenticated session returns to the expected role experience.
- [ ] Signing out returns to login without stale private data visible.

## Mobile Layout

- [ ] iPhone Safari viewport shows no horizontal overflow.
- [ ] Safe-area spacing works on notch and home-indicator devices.
- [ ] Primary navigation remains reachable with one thumb.
- [ ] Forms, sheets, and modals fit small screens without clipped actions.
- [ ] Tablet and desktop layouts remain readable after mobile checks.

## Super Admin Access

- [ ] Super Admin credentials open the platform owner experience.
- [ ] Super Admin tools are reachable from the expected system area.
- [ ] Export/import controls are visible only to permitted roles.
- [ ] Sensitive admin actions require the expected confirmation or guard.
- [ ] Audit or activity entries are created for sensitive admin writes when writes are enabled.

## AI API Safety Checks

- [ ] AI provider keys are server-only and never exposed in the client bundle.
- [ ] AI routes are disabled or fail safely when the selected provider key is missing.
- [ ] Prompt templates and editable AI content come from governed data, not ad-hoc component text.
- [ ] AI responses do not expose raw secrets, service keys, private prompts, or unrelated student data.
- [ ] Rate, permission, and role checks are verified before testing production AI features.

## Form Submissions

- [ ] Required-field validation appears before submission.
- [ ] Successful submissions show a clear confirmation state.
- [ ] Failed submissions show a recoverable error state.
- [ ] Double-clicking submit does not create duplicate records.
- [ ] Submitted data survives navigation or refresh when persistence is expected.

## Database Write/Read Verification

- [ ] Current persistence mode is documented for the deployment.
- [ ] Read paths return expected seeded or remote data after a hard refresh.
- [ ] Write paths are allowed only in intended environments.
- [ ] Vercel production-like runtime does not rely on local JSON writes.
- [ ] Any successful sensitive write has matching audit and activity records.
- [ ] Exported data can be re-imported or restored in a test environment.

## Rollback Procedure

- [ ] Identify the last known healthy Production deployment in Vercel.
- [ ] Prefer Vercel dashboard rollback for urgent recovery.
- [ ] CLI rollback command is available to the release owner:

```bash
vercel rollback
vercel rollback <deployment-url-or-id>
```

- [ ] If a validated Preview must become Production without rebuilding, use promotion only after branch policy approval:

```bash
vercel promote <deployment-url-or-id>
```

- [ ] For code-level recovery, revert the bad commit on `main` and let Vercel create a fresh Production deployment.
- [ ] After rollback, rerun `/api/health`, login, Super Admin access, and the failed user journey.

## Post-Deploy Verification

- [ ] Confirm the Production URL resolves with a valid SSL certificate.
- [ ] Confirm `/api/health` returns OK JSON from Production.
- [ ] Confirm login, role routing, mobile navigation, and at least one critical form flow.
- [ ] Review Vercel runtime logs for errors during the first smoke-test session.
- [ ] Document any deferred issue with owner, severity, and follow-up date.
