# Phase 3 Operations Layer

Phase 3 prepares LK Student Space to become a calm operating system for dance academies. It layers operational contracts on top of Phase 1 UX stabilization and Phase 2 backend foundation without forcing UI migration, live provider integrations, or broad unfinished screens.

## Operational Philosophy

- Phase 1 remains the priority: the app must open instantly, keep the existing local/demo experience, and avoid unstable navigation or layout changes.
- Phase 2 remains the backend foundation: Supabase, academy scoping, repositories, R2 media direction, permissions and audit must stay additive and reversible.
- Phase 3 adds operational shape: models, repository contracts, selector helpers, permissions, audit expectations and rollout order.
- Every operation is academy-scoped with explicit `academyId`.
- AI can summarize, highlight risk and suggest follow-up. AI must never auto-send, auto-publish, change payment state, expose media, or bypass human approval.
- Management views should feel human and calm: what needs attention, who owns the next action, and what can wait.

## Feature Map

- Calendar and events: rehearsals, general rehearsals, competitions, annual shows, workshops, camps, private lessons and deadlines.
- Daily stretch and practice: teacher-assigned plans, student completion, parent visibility and management engagement stats.
- Attendance analytics: absence trends, lateness, repeated absence detection, engagement risk and role-safe summaries.
- Notifications: unified notification drafts, preferences, delivery states and future push/email compatibility.
- Media and galleries: lesson timeline, event galleries, annual show archives, competition memories, tagging, moderation and visibility rules.
- Shop and orders: product lifecycle, stock states, event tickets, order tracking, manual office payments and future receipts/refunds.
- Private lessons: teacher availability, slot suggestions, request states, approvals, reminders, payment readiness and lesson history.
- Management operations: missing attendance, unresolved issues, inactive students, missing rehearsals, unpaid orders, pending private lessons and event readiness.
- AI operations: approved insight drafts, risk detection, suggested follow-ups and event/media summaries.

## Database Entities

Phase 3 should be additive to Phase 2 schema work. Do not overwrite Phase 2 migrations. Add tables only when backend wiring is intentionally scheduled.

Core:

- `school_years`
- `audit_logs`
- `operation_issues`
- `ai_operational_insights`

Calendar and events:

- `calendar_events`
- `calendar_participants`
- `event_lifecycle_states`
- `event_reminders`
- `event_group_links`
- `event_teacher_links`
- `event_student_links`

Practice:

- `practice_tasks`
- `practice_plans`
- `practice_plan_tasks`
- `practice_plan_groups`
- `practice_completion`
- `practice_streaks`

Attendance analytics:

- `attendance_records` from Phase 2 remains the source of truth.
- `attendance_summaries` can be materialized later if needed.
- `attendance_trends` can be a view or computed selector.
- `engagement_risk_scores` can start as computed output and become persisted snapshots later.

Notifications:

- `notifications`
- `notification_preferences`
- `notification_deliveries`
- `notification_read_receipts`
- `notification_templates`

Media:

- `media_items` from Phase 2 remains the source of truth for R2 metadata.
- `media_operation_collections`
- `media_tags`
- `media_visibility_rules`
- `teacher_upload_history`

Commerce:

- `shop_products`
- `shop_orders`
- `shop_order_items`
- `payment_events`
- `manual_payment_confirmations`
- `receipt_records`
- `refund_records`

Private lessons:

- `teacher_availability`
- `private_lesson_requests`
- `private_lesson_slot_suggestions`
- `private_lesson_history`
- `private_lesson_reminders`

All tenant-owned entities require `academy_id`, `created_at`, `updated_at`, lifecycle status where relevant, and RLS before remote use.

## Repository Structure

Current foundation:

- `lib/domains/operations/types.ts` defines stable Phase 3 app models.
- `lib/domains/operations/selectors.ts` contains pure local/demo-safe selectors.
- `lib/repositories/operations-repository.ts` defines repository interfaces for future local and Supabase implementations.

Future implementation path:

- Keep UI components on existing local data until a domain is intentionally migrated.
- Implement one repository at a time under `lib/repositories/`.
- Each write path must accept `OperationsRepositoryContext` with `academyId` and actor context.
- Supabase repository implementations should map camelCase models to snake_case tables.
- Local demo repositories should continue returning safe seed-backed data when Supabase env vars are missing.

## Notification Architecture

Notifications are created as drafts, approved when needed, queued for in-app delivery first, and only later connected to push/email providers.

Supported kinds:

- `attendance_alert`
- `event_reminder`
- `rehearsal_update`
- `competition_update`
- `private_lesson_update`
- `payment_order_update`
- `teacher_message`
- `practice_reminder`
- `gallery_update`

Core flow:

1. Domain operation creates a notification draft with source entity and target.
2. Permission guard validates sender and audience.
3. Human approval is required for AI-generated or high-impact messages.
4. Repository expands targets server-side.
5. In-app delivery is created in `notification_deliveries`.
6. Future push/email adapters read approved deliveries only.

Preferences:

- Per user, per notification kind.
- Channel list: `in_app`, future `push`, future `email`, future `sms`.
- Quiet hours are stored but not enforced by a live provider in Phase 3 foundation.

## Event Lifecycle

Event types:

- rehearsal
- general rehearsal
- competition
- annual show
- workshop
- camp
- private lesson
- deadline

Lifecycle:

1. Draft: management creates shell with school year, date, type and visibility.
2. Announced: linked groups, teachers and participant rules are stable.
3. Collecting approvals: parent/student confirmations and payment readiness are tracked.
4. Rehearsing: rehearsal events and reminders are linked.
5. Ready: missing approvals, costumes, payments and checklist items are below threshold.
6. Live: event mode can later surface arrival/backstage/ticket data.
7. Completed: attendance, media and summaries are captured.
8. Archived: annual show and competition memories become long-term galleries.

Calendar support:

- month/day/list/year view structures
- school-year filtering
- filters by group, style, teacher and event type
- participant status and approval status
- group, teacher and media collection links
- reminders as notification drafts

## Attendance Analytics Flow

Source data remains attendance records. Analytics are computed first and can be materialized later.

Flow:

1. Teacher marks attendance.
2. Attendance write is guarded and audited.
3. Analytics selector groups by student, group and date range.
4. Repeated absences and lateness become `AttendanceTrend`.
5. Risk score is computed with reasons and `requiresHumanReview: true`.
6. Management sees groups/students needing attention.
7. Teachers see recurring absences for assigned groups.
8. Parents see a simple child summary only.

No automated parent alert is sent without approval.

## Practice And Stretch Flow

Student:

1. Opens daily stretch/practice.
2. Sees the current assigned task.
3. Marks `סיימתי`.
4. Optional note/media can be added later.
5. Streak and progress update locally and through repository contracts.

Teacher:

1. Creates tasks such as daily stretch, technique, choreography, conditioning or reflection.
2. Assigns a practice plan to groups.
3. Monitors completion and students needing help.
4. Can add follow-up tasks, but messaging still goes through notification approval rules.

Management:

- sees completion rate by group
- sees inactive students
- sees practice engagement trends
- does not get an enterprise-style dashboard overload

AI:

- can suggest follow-up based on low completion
- cannot auto-message students or parents
- cannot change teacher assignments

## AI Insight Flow

AI sources:

- attendance
- calendar
- practice
- notifications
- media
- shop
- private lessons
- management

Flow:

1. Repository or selector builds scoped context.
2. AI produces a draft insight with risk level, summary and suggested actions.
3. Insight is stored with `requiresApproval: true`.
4. Management or authorized teacher approves, rejects or converts it into a manual action.
5. Only approved human actions can become notifications, edits or published summaries.

Hard limits:

- no auto-send
- no auto-publish
- no permission bypass
- no cross-academy analysis except Super Admin scoped operations
- no payment or media visibility changes without explicit audit

## Management Operations Flow

Management issue types:

- missing attendance
- unresolved issue
- inactive student
- missing rehearsal
- unpaid order
- pending private lesson
- event readiness

Flow:

1. Selectors/repositories collect operational signals.
2. Issues are normalized into `ManagementIssue`.
3. UI can later show a calm prioritized list.
4. Each issue has a `nextAction` and linked entity.
5. Acknowledgement is separate from resolution.
6. Sensitive actions route back through domain operations, permission guards and audit.

## Permissions

Baseline:

- Students see own practice, attendance summary, events and visible media.
- Parents see linked children only.
- Teachers see assigned groups, recurring absences, assigned practice plans and upload history.
- Management sees academy operations, event readiness, engagement and unresolved issues.
- Super Admin may access cross-academy control only through explicit global/super-admin scope.

Sensitive writes requiring permission and audit:

- attendance edits
- payment status changes
- media visibility changes
- event edits
- parent/student link changes
- role changes
- private lesson state changes
- notification preference changes when changed by staff

## Audit

Audit action foundation:

- `attendance.edit`
- `payment_status.change`
- `media_visibility.change`
- `event.edit`
- `parent_student_link.change`
- `role.change`
- `practice_assignment.edit`
- `notification.preference_change`
- `private_lesson.status_change`

Every sensitive write should record:

- `academyId`
- actor user id
- action
- entity type and id
- before/after when practical
- reason when staff action affects family/student-facing data

## Rollout Order

1. Keep Phase 1 UX stable and fix boot/navigation/usability issues.
2. Finish Phase 2 backend foundation: Supabase clients, RLS-safe schema, auth mode, R2 metadata and repository fallback.
3. Add Phase 3 contracts and docs only.
4. Wire read-only calendar/event repository to local demo data.
5. Add practice completion write path with local fallback and audit.
6. Add attendance analytics selectors to management/teacher views.
7. Add notification draft/preference repositories with in-app delivery only.
8. Add media collection/visibility contracts on top of Phase 2 media metadata.
9. Expand shop/private lesson operations without live payment provider integration.
10. Add AI insight drafts with approval and no autonomous actions.

## Risk Analysis

- Broad UI changes could destabilize Phase 1; avoid until contracts are stable.
- Supabase migrations could conflict with active Phase 2 work; defer schema changes unless coordinated.
- Notification target expansion can leak data if done client-side; resolve targets server-side.
- AI insight context can leak cross-role data; build context after permission filtering.
- Attendance risk scoring can create emotional harm if surfaced bluntly; show human-readable reasons and require review.
- Media visibility errors are high-impact; default to private/group-limited visibility and audit every change.
- Manual payment states must be clear so office payments are not confused with provider-confirmed payments.
- Private lesson scheduling should stay simple; avoid premature optimization into a full scheduling engine.
- Local fallback must remain available for pilots and development without Supabase/R2 env vars.
