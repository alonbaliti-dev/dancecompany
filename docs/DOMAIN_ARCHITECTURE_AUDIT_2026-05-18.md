# Domain architecture audit - 2026-05-18

Scope: Dance Company OS v6 frontend/domain preparation only. No UI, backend, database, auth, upload, R2, Supabase, API, session, repository, payment, commit, push, or deployment changes are included.

## Current State Findings

- `lib/v6/types.ts` is the active v6 MVP contract. It mixes stable domain entities (`V6User`, `V6Group`, `V6Lesson`, `V6AttendanceRecord`) with UI-oriented fields (`schedule`, `room`, `title`, `style`, `ageGroup`) and a still-inline `tasks` shape inside `V6Database`.
- `lib/local-db/db-types.ts` and `lib/types.ts` already hold older normalized concepts (`parentsStudents`, `StudioGroup`, `StudioClass`, `StudentTask`, `Notification`, `ChatMessage`, shop payment statuses), but they are not the same model as v6. The repo currently has two vocabulary layers: legacy local DB/product OS types and the v6 in-memory frontend model.
- `lib/lovable/types.ts` and `lib/lovable/sample-data.ts` are intentionally UI-shaped prototype data. They are useful as product language references, but they should not become source-of-truth models because they store display strings like `teacher`, `room`, `members`, `schedule`, `price`, and `status` directly on cards.
- `components/v6/screens/HomeScreen.tsx` derives real operational views directly from `db.users`, `db.groups`, `db.lessons`, `db.attendance`, `db.tasks`, `db.notifications`, and `db.messages`. This preserves current behavior, but it also couples timetable, rooms, attendance progress, attention items, and payment/demo state to screen-level calculations.
- `lib/domains/attendance/selectors.ts`, `lib/domains/messages/selectors.ts`, `lib/domains/events/selectors.ts`, and `lib/domains/shop/selectors.ts` are a good direction: domain-specific selectors already isolate some role scoping. They still operate over the current v6 shapes rather than a normalized core model.
- `lib/v6/dedupe.ts` is compensating for missing relationship tables by normalizing parent/student links and teacher/group assignments from repeated arrays on users and groups. That is safe for the MVP, but it should become an adapter step rather than the long-term domain authority.

## Domain Gaps By Area

- Student: represented as `V6User` with `role: "student"`. Student profile, membership/payment state, family links, group enrollment, age stage, and communication policy are all mixed into the user row.
- Parent/Family: parents are `V6User` rows with `linkedStudentIds`, while students may also carry `linkedParentIds`. There is no explicit family/account entity for sibling handling, billing contact, primary contact, or household-level communication preferences.
- Teacher: represented as `V6User` with `role: "teacher"` and `groupIds`; groups also store `teacherIds`. The duplicate relationship is normalized by `dedupeTeacherGroupAssignments`, but the source of truth is ambiguous.
- Group: `V6Group` contains roster IDs, teacher IDs, style labels, style IDs, age labels, age IDs, schedule text, location text, and communication policy. This is convenient for rendering but weak for editing and conflict checks.
- WeeklyGroupSchedule: currently `V6Lesson` plus `V6Group.schedule`. A recurring weekly schedule should be its own entity with day, time, duration, room, effective dates, and optional teacher overrides.
- LessonOccurrence: current attendance points to `lessonId` plus optional `classDate`. That works for a simple recurring class, but cannot cleanly handle cancellations, substitutions, one-off rehearsals, room changes, or generated occurrence IDs.
- AttendanceRecord: v6 attendance is close, but `lessonId` should eventually become `lessonOccurrenceId`; `groupId` should stay denormalized only for scoping/query convenience.
- StudioRoom: rooms are free text on lessons/groups. This blocks capacity, active/inactive status, conflict detection, and room-level operations.
- PaymentStatus/MembershipPlan: v6 intentionally has payment disabled, but UI language references membership and payment state through feature flags/products. Payment status should remain a frontend/domain enum for display and readiness, not live payment logic.
- Notification/StudioMessage: v6 has simple notifications and messages. Legacy `lib/types.ts` has richer target/read/related types. A canonical audience target should unify personal/group/studio targeting before adding more communication flows.
- Task/AttentionItem: v6 inline tasks are group tasks with `doneByUserIds`; Home also synthesizes attention items from events, student statuses, attendance, and tasks. A separate `AttentionItem` read model can keep "what needs action" consistent without turning every alert into a persisted task.

## Proposed Normalized Domain Structure

The proposed frontend-only contracts now live in `lib/domains/core/domain-types.ts`. They are not wired into UI yet.

- Identity and roles: keep auth/user identity separate from operational roles. `Student`, `Parent`, and `Teacher` reference `userId` instead of being the user row itself.
- Family/account: introduce `ParentFamily` as the household/account relationship between parents and students, including primary parent and billing contact references.
- Group operations: use `Group` for roster, teacher, age/style, room defaults, communication mode, and links to weekly schedules.
- Timetable: split recurring schedule (`WeeklyGroupSchedule`) from dated class instance (`LessonOccurrence`).
- Attendance: record attendance against `lessonOccurrenceId`, with `studentId`, `groupId`, `status`, `markedByUserId`, and `markedAt`.
- Rooms: use `StudioRoom` IDs from schedules/occurrences instead of relying on room labels.
- Commerce readiness: keep `PaymentStatus` and `MembershipPlan` as display/domain status contracts only. No payment execution or persistence is implied.
- Communication: use `Notification` and `StudioMessage` with shared `AudienceTarget` and optional `DomainReference` for related entities.
- Operations attention: use `AttentionItem` as an operational read model for attendance, payment, schedule, registration, task, wellbeing, or system issues.

## Relationship Map

- `UserId` -> optional role profiles: `Student.userId`, `Parent.userId`, `Teacher.userId`.
- `ParentFamily.parentIds` -> `Parent.id`; `ParentFamily.studentIds` -> `Student.id`.
- `Student.familyId` -> `ParentFamily.id`; `Student.parentIds` -> `Parent.id`.
- `Student.groupIds` -> `Group.id`; `Teacher.groupIds` -> `Group.id`.
- `Group.studentIds` -> `Student.id`; `Group.teacherIds` -> `Teacher.id`.
- `Group.weeklyScheduleIds` -> `WeeklyGroupSchedule.id`.
- `WeeklyGroupSchedule.groupId` -> `Group.id`; `WeeklyGroupSchedule.roomId` -> `StudioRoom.id`.
- `LessonOccurrence.weeklyScheduleId` -> `WeeklyGroupSchedule.id`; `LessonOccurrence.groupId` -> `Group.id`; `LessonOccurrence.roomId` -> `StudioRoom.id`.
- `AttendanceRecord.lessonOccurrenceId` -> `LessonOccurrence.id`; `AttendanceRecord.studentId` -> `Student.id`; `AttendanceRecord.groupId` -> `Group.id`.
- `Notification.audience` and `StudioMessage.audience` target students, groups, or studio-wide cohorts.
- `AttentionItem.subject` points to the entity that needs action; `AttentionItem.source` can point to the signal that created it.

## Existing Structures That Should Evolve

- `V6User`: keep for current UI, but gradually adapt into `Student`, `Parent`, and `Teacher` profiles for domain selectors.
- `V6Group`: keep rendering fields for now, but migrate source-of-truth fields toward IDs: `danceStyleId`, `ageGroupId`, `defaultRoomId`, `weeklyScheduleIds`.
- `V6Lesson`: rename conceptually to recurring weekly schedule or adapt into `WeeklyGroupSchedule`; create dated `LessonOccurrence` only when attendance, cancellation, substitution, or event operations need it.
- `V6AttendanceRecord`: keep current shape until screens migrate, then add an adapter that maps `lessonId + classDate` to `lessonOccurrenceId`.
- `V6Database.tasks`: extract the inline type to a named v6/domain type in a future low-risk pass. Longer term, split persisted tasks from generated attention items.
- `lib/lovable/*`: treat as reference-only visual/product sample data. Do not migrate it into the core data layer except through explicit adapters.
- `lib/types.ts` legacy models: mine for proven concepts (`AudienceTarget`, `StudentTask`, richer notification metadata), but avoid wholesale reuse because names and assumptions differ from v6.

## Safe Incremental Migration Order

1. Keep current UI on `V6Database` and introduce type-only contracts, which this pass does.
2. Add pure adapter selectors that derive `Student`, `Parent`, `Teacher`, `Group`, `WeeklyGroupSchedule`, and `StudioRoom` views from current v6 data. No UI rewrites yet.
3. Move screen-level timetable helpers from `HomeScreen.tsx` into domain selectors: weekday normalization, duration calculation, room load, schedule density, and next lesson selection.
4. Extract the inline v6 `tasks` array type into a named `V6Task` type, then add an `AttentionItem` selector that derives operational alerts from events, attendance, student status, and tasks.
5. Introduce `StudioRoom` as frontend-only seed data or derived IDs from current labels, still without persistence.
6. Add `WeeklyGroupSchedule` adapters around `V6Lesson`; only later introduce `LessonOccurrence` for attendance/edit flows.
7. Once adapters are stable and tested, migrate UI imports one screen at a time from raw v6 rows to domain selectors.

## Scalability Risks

- Timetable conflict detection is not reliable while rooms and recurring schedules are free text.
- Parent/family flows will get fragile with siblings, divorced households, multiple guardians, or adult students unless family/account relationships are explicit.
- Teacher and group relationships can drift because assignment is stored on both users and groups.
- Attendance history will become hard to query once cancellations, substitutions, multiple lessons per day, and make-up classes exist.
- Notifications and messages can leak or under-target if audience rules stay as ad-hoc `userIds`/`groupId` filters.
- Payment and membership wording should stay strictly separated from payment execution until a real backend/payment provider exists.

## Non-Goals

- No new UI.
- No backend or database schema implementation.
- No persistence, Supabase, R2, API, upload, auth, session, repository, checkout, or payment logic changes.
- No broad migration from `V6Database` to the new contracts in this pass.
- No commit, push, or deploy.

## Changes Applied In This Pass

- Added `lib/domains/core/domain-types.ts` with normalized frontend-only contracts for the requested domains.
- Exported the new type-only contracts from `lib/domains/index.ts`.
- Left current v6 UI behavior and runtime data paths unchanged.

