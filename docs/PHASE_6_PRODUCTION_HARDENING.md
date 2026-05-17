# Phase 6 Production Hardening

Phase 6 hardens LK Student Space for real users without adding features, redesigning flows, deploying production, or removing the local/demo fallback. The goal is to make launch risk explicit and keep unsafe production paths blocked until Supabase Auth, RLS, audit persistence and provider credentials are verified end-to-end.

## Security Checklist

- Keep `AUTH_MODE=local_demo` as the safe default until a Supabase Auth rollout is approved.
- Never expose `SUPABASE_SERVICE_ROLE_KEY`, R2 credentials, payment secrets, AI keys, webhook secrets, VAPID private key, email/SMS/WhatsApp keys, or provider tokens to client code.
- Browser code may use only explicitly public values: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, and intentionally public Firebase config.
- All sensitive server routes must validate a real server-bound user session, academy, role and permission before reading or mutating data.
- Do not trust client-supplied prices, roles, academy IDs, group assignments, media visibility, AI scope, payment status, or webhook payloads.
- Payment creation resolves amount from server data and rejects client amount mismatch. Webhooks require HMAC/provider signatures and sanitized metadata.
- Media access is denied unless academy, visibility, group/student linkage, role and moderation status allow it.
- AI routes create drafts only. Publishing requires explicit human approval and an audit entry.
- Webhooks reject missing secrets, missing signatures and invalid signatures.
- Normal users never see raw stack traces, secret names, provider payloads, card metadata, or internal database errors.
- Super Admin diagnostic views may show technical health only after verified Super Admin auth.

## Data Privacy Rules

- `academy_id` is the tenant boundary for every durable academy record.
- Student, parent, teacher, attendance, message, notification, payment, media and achievement records are private by default.
- Parent access is limited to linked students and their permitted groups/events.
- Teacher access is limited to assigned groups, assigned students, assigned private lessons and staff-visible operational data.
- Management access is academy-scoped, never cross-academy unless the user is Super Admin.
- Super Admin access is audited and used for platform operations, support, migration and integrity checks.
- Public reads are only allowed for intentionally public academy login shells, active branding, and approved public/shop/event media.
- Never persist card numbers, CVV/CVC, full PAN, raw webhook secrets, provider access tokens, AI provider keys or private push keys.
- AI prompts and outputs that reference students are treated as sensitive drafts until reviewed and published by an authorized human.

## Permission Model

- Students: self profile, own schedule/progress/tasks, own submissions and media allowed by group visibility.
- Parents: linked children only, approved communications, payments/orders for linked children, event instructions relevant to linked children.
- Teachers: assigned groups/classes, attendance, tasks, teacher feedback, assigned private lessons and staff-only media where applicable.
- Management: academy operations, users, products/orders, events, communication, attendance corrections, media moderation and reports.
- Super Admin: platform configuration, cross-academy support, imports/exports, feature flags, integrity checks, audit logs and health status.

Server-side production checks must bind the request to Supabase Auth, resolve the profile/roles from database records, then compare the requested `academy_id` with allowed academies. The current Phase 6 production gate blocks selected sensitive route foundations in `NODE_ENV=production` until that session binding exists.

## RLS Strategy

RLS is already enabled in the Phase 2 migration with intentionally conservative policies. Production rollout must add reviewed policies before a remote project is connected to real data. Policy helper contracts live in `lib/security/rls-policy-plan.ts`.

- `academies`: active login shell fields may be public; operational fields require same academy, management or Super Admin.
- `users_profile`: self, linked parent/student, teacher assignment, management and Super Admin reads; writes require management or Super Admin.
- `groups`: assigned students/parents/teachers see relevant group records; management and Super Admin manage.
- `attendance_records`: students/parents read permitted records; assigned teachers and management edit; every edit audited.
- `tasks`: visible to assigned students/groups/parents; teacher/management create and update.
- `messages`: recipients read only targeted messages; teachers/management send within allowed scope; emergency messages require management.
- `notifications`: users read/update their own read status; creation is management/server-only.
- `shop_products`: active/member-visible academy products readable; management controls content/pricing.
- `shop_orders`: user/linked parent/management reads; payment status writable only by verified webhook or audited management action.
- `private_lesson_requests`: student/linked parent/requested teacher/management scope.
- `media_items`: academy + visibility + group/student/event/product context; public only for approved shop/event/legacy records.
- `events`: academy/event/group visibility; backstage/emergency fields staff-only.
- `achievements`: student/group visibility with management publishing.
- `audit_logs`: append-only service role writes; management/Super Admin reads; normal users never read.

Required Supabase details:

- Use `auth.uid()` to join `users_profile.auth_user_id`, not user-editable metadata.
- Store authorization in profile/role tables or trusted app metadata, not `raw_user_meta_data`.
- Ensure UPDATE policies also have matching SELECT policies.
- Keep privileged functions outside exposed schemas or use reviewed security patterns.
- Views exposed to clients must use `security_invoker = true` on supported Postgres versions.

## Audit Requirements

Audit entries include actor, academy, action, target, timestamp, status and a safe before/after summary when useful. They must not contain passwords, card data, tokens, raw provider payloads or full student medical notes.

Audit actions required before launch:

- User creation/edit.
- Password reset request/completion state.
- Role or permission changes.
- Parent/student link changes.
- Attendance edits and corrections.
- Product, order and payment changes.
- Media visibility changes, uploads and deletes.
- Event and annual-show operational changes.
- Emergency messages and urgent alerts.
- AI-generated draft approval and publishing.
- Imports, exports and restore operations.
- Feature flag changes.

Phase 6 adds shared audit action contracts in `lib/security/production-hardening.ts`. Persistence to `audit_logs` remains a launch blocker for production Supabase mode.

## Backup Strategy

- Supabase: enable daily backups before pilot, point-in-time recovery for production, and document restore drills per academy.
- Supabase exports: Super Admin export/import remains the human-readable fallback; exports must include schema version and academy ID.
- R2: enable object versioning/lifecycle where available, keep originals private, and retain deleted objects for a defined recovery window.
- Archive: optional Backblaze or cold storage mirror for high-value media and annual-show assets.
- Metadata recovery: media can be restored only if `media_items` metadata and R2 keys are backed up together.
- Restore process: restore database to staging first, validate academy isolation, verify media references, then promote only after Super Admin approval.

Failure handling:

- Data import fails: keep the previous database active, show a friendly failure, store an import audit entry and allow retry after validation.
- Media upload fails: keep metadata in `pending_upload` or queue state, retry upload, and never publish broken media.
- Payment webhook fails: do not mark paid, retry idempotently, show pending to user, alert management if provider status diverges.
- User deleted accidentally: restore profile and role records from backup; revoke sessions if credentials were involved.
- Academy data corrupted: freeze writes, restore scoped backup to staging, compare audit/export records, then restore scoped production data.

## Monitoring Strategy

- Super Admin health panel shows Supabase, R2, payments, webhooks, push and messaging readiness.
- Normal users see friendly messages and retry options only.
- Log server route failures with route ID, academy ID, actor ID and safe error code.
- Track webhook signature failures, payment mismatch errors, upload failures, AI provider failures and sync queue failures.
- Add uptime checks for app boot, `/api/health`, integration health under Super Admin auth, and critical server routes.
- Add alerting thresholds for repeated 401/403, payment failures, upload failures, Supabase latency and R2 signing failures.

## Error Handling

- Normal users: short friendly message, retry when safe, contact studio when permission/payment/account action is needed.
- Teachers during class: never block attendance workflow on weak internet; queue and clearly show sync status.
- Parents/students: payment/media/message errors should not expose provider or database internals.
- Super Admin: can see technical details, environment readiness and provider status after verified auth.
- Shared user-facing error contracts live in `lib/errors/user-facing-errors.ts`.
- Raw stack traces are never rendered in normal UI.

## Performance Risks

- Large user lists: paginate, search server-side, avoid loading all academies/users for normal roles.
- Media galleries: lazy load, thumbnail first, signed URLs only when needed, paginate by academy/context/status.
- Video uploads: direct-to-R2, progress, resumable/retry queue, size/type limits and post-upload processing state.
- Calendar/event views: range queries by date and academy, avoid rendering all yearly events at once.
- Attendance screens: prefetch current class/group, queue edits offline, avoid blocking on background sync.
- Management dashboards: aggregate on the server or cached selectors; avoid client-side scanning of full academy history.
- Audit logs: indexed by academy, created_at, actor and action; paginated Super Admin reads only.

## Offline And Weak Internet

- Cached schedule remains available for class start.
- Attendance edits queue locally with retry and conflict resolution.
- Draft messages are saved before send and require confirmation after reconnect.
- Media uploads queue with progress, retry and clear failed state.
- Sync status badge stays visible but does not block core class workflows.
- Failed sync retries use backoff and surface unresolved conflicts to teachers/management.
- Offline queue contracts live in `lib/reliability/offline-queue-types.ts`.

## Edge Cases

- User belongs to multiple academies: active academy must be explicit and audited when changed.
- Parent has multiple children in different groups: every read checks child linkage and group visibility.
- Teacher substitutes a group: temporary assignment must be time-bound and audited.
- Student changes group mid-season: old attendance/media visibility must follow historical policy.
- Media is uploaded before metadata write succeeds: keep object private and reconcile by R2 key.
- Payment provider marks paid after local timeout: webhook is source of truth and must be idempotent.
- Webhook replay: reject duplicate event IDs before mutating state.
- AI draft includes sensitive content: block publish intent and require human approval.
- Import partially succeeds: rollback or quarantine partial records before users see them.
- Deleted user owns records: preserve audit/history with nullable actor fields and safe display names.

## Accessibility And Mobile QA

- Verify 390px mobile width and iPhone Safari safe areas.
- Keep bottom navigation clear of content and keyboard-safe forms.
- Tap targets are at least 44px.
- Hebrew RTL remains correct across cards, forms, dialogs and navigation.
- Text scaling does not clip labels, buttons or tables.
- Contrast remains readable on dark premium surfaces.
- Loading, error and empty states are screen-reader understandable.
- No redesign is part of Phase 6; only regressions should be fixed.

## Integration Safety

- Supabase missing env must not crash local/demo mode.
- R2 missing env returns local/demo signed-upload response and never exposes credentials.
- Payments stay sandbox until live provider review; server calculates amount and validates webhook signature.
- Push subscriptions do not request permission on load; private VAPID key is server-only.
- AI provider keys are server-only; provider failure returns friendly retryable error or dev mock outside production.
- Webhook secrets are required before accepting webhook payloads.
- Super Admin health status must not be publicly accessible in production.

## Production Launch Checklist

- `npm run lint`, `npm run typecheck` and `npm run build` pass.
- Supabase Auth session binding is implemented for server routes.
- RLS policies are reviewed against the table-by-table strategy and applied to staging.
- Service role is used only from trusted server code and never imported into client components.
- Audit log persistence is active for every sensitive mutation.
- Supabase backup/PITR and restore drill are verified.
- R2 lifecycle, CORS, object privacy and recovery plan are verified.
- Payment sandbox flow, amount mismatch rejection, webhook idempotency and provider reconciliation pass.
- Media upload, metadata completion, visibility enforcement and moderation pass.
- Integration health panel is Super Admin-only under verified auth.
- Offline class workflows are tested on weak internet.
- Mobile Safari/RTL/accessibility checklist passes.
- Manual QA covers login, role guards, academy isolation, add/edit user, add/edit product, upload fallback, attendance, payments sandbox, AI approval, notifications and export/import.

## Launch Blockers

- Production server routes are not yet bound to verified Supabase Auth sessions. Phase 6 blocks selected sensitive route foundations in production until this exists.
- RLS policies beyond public academy login/branding are still strategy-level and must be written, reviewed and tested in staging.
- Audit logs are defined but not yet persisted for every sensitive mutation path.
- Payment transaction persistence and webhook idempotency are still placeholder/local-demo for parts of the flow.
- Media visibility enforcement needs route-level verified identity before production use.
- Push subscription storage is placeholder and must be tied to verified user identity.
- Manual browser QA was not completed in this phase unless separately recorded.
