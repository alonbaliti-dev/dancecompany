# Data & Privacy — LK Student Space

## Data ownership

The **dance studio** owns student and operational data. The platform processes data only to provide the service.

## Visibility by role

| Data | Student | Parent | Teacher | Management | Super admin |
|------|---------|--------|---------|------------|-------------|
| Own profile | ✓ | Child linked | Assigned students | All in studio | Platform audit |
| Other students PII | — | Child only | Assigned groups | Studio | Cross-studio (server) |
| Grades / XP / tasks | Own | Child summary | Assigned | Studio | — |
| Teacher internal notes | — | — | Staff visibility | ✓ | — |
| Staff chat | — | — | ✓ | ✓ | Audit |
| Gallery (restricted) | Per visibility | Per child | Assigned + staff | All | All |
| Audit log | — | — | — | Studio | Platform |
| Billing | — | — | — | Studio plan | Platform |

## Read receipts

Notification read state is private: students see only their own read status. Aggregates for senders/management are computed server-side.

## Backups

- Nightly encrypted backups (production target: Supabase PITR + off-site export).
- Restore runbook owned by platform ops; studio notified on incident.

## Deletion & export

- **Export:** management requests export → audit log → server generates ZIP (mock: button in נתונים ובטיחות).
- **Deletion:** account deletion requests handled by studio management + platform DPA; soft-delete with retention window.

## Parent mode

Parents see progress summaries only — not staff-only notes or other students’ data.

## Implementation

- Enforce with RLS (`docs/SECURITY_RLS_POLICIES.md`).
- UI guards in `lib/security/permissions.ts` are not sufficient alone.
