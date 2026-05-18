# Frontend State Architecture Audit - Phase 1

Date: 2026-05-18
Scope: Dance Company OS v6 frontend state preparation only. No backend, API, database, auth, routing, or visual changes.

## Current Findings

- `lib/v6/AppProvider.tsx` already provides a single frontend write path through reducer actions, local persistence, audit entries, and domain operations. Phase 1 does not need another provider.
- `components/v6/screens/HomeScreen.tsx` mixed presentation with read-side state derivation: entity lookups, actor-scoped messages/events/lessons, attendance progress, weekly timetable grouping, room loads, role-specific management alerts, and product buckets were all computed inline.
- Domain adapters already exist in `lib/domains/core/domain-adapters.ts` and provide useful normalized views, roster views, weekly schedule views, and attendance summaries. The main gap was not normalization itself, but where derived screen models are assembled.
- Attendance state is split correctly between write operations in the provider and read selectors in domain modules, but repeated progress/status calculations lived in screen code.
- Weekly schedule state for management was the highest-risk duplication point: weekday normalization, lesson sorting, duration inference, density labels, room bucketing, and selected lesson lookup were coupled to JSX.
- Bottom sheet state is UI-local and should stay that way for now. The selected management timetable day and selected lesson sheet are transient screen concerns, not app or domain state.

## Phase 1 Structure

- Added `lib/v6/view-models.ts` as a pure frontend read-side module.
- The module accepts `V6Database`, actor/current-role data, and optional date context, then derives stable view models without fetching, mutating, or persisting data.
- It centralizes lightweight entity indexes, actor home context, attendance progress labels, product/payment labels, teacher/group display helpers, and management home/timetable view models.
- `HomeScreen` now consumes the management home view model with `useMemo`, while retaining local UI state for selected day and bottom sheet selection.

## What Scales Better Now

- Backend integration can later replace `V6Database` input without rewriting the management home JSX.
- Read-side state has a clearer contract: selectors/view models prepare data; components render it and own transient UI interactions.
- Timetable derivation is reusable for future management, teacher, or schedule-editing screens.
- Entity lookup patterns are stable through maps instead of repeated `find` calls inside dense schedule/alert derivation.

## Still Mock-Dependent

- `V6Database` is still hydrated from seed/local storage.
- Lessons, groups, attendance, events, tasks, products, and messages are still local/mock-backed data.
- Date semantics for weekly lessons still use a lightweight "today weekday" interpretation, not real lesson occurrence scheduling.
- Timetable duration inference remains heuristic when lesson duration/end time is absent.

## Phase 2 Recommendation

- Extend view models to student and teacher home branches after snapshot/visual verification, especially feed rows, attention students, and attendance summaries.
- Add focused unit tests for pure view-model functions before expanding the selector layer.
- Introduce memoized selector boundaries near shared domain screens if render cost becomes measurable.
- Keep provider/write-path changes separate from frontend read-model work.

## Phase 3 Boundaries

- Domain contracts stay in `lib/domains/**`: selectors and adapters normalize attendance, rosters, schedules, events, messages, and shop data without depending on React components.
- `lib/v6/view-models.ts` is the frontend read-model adapter for v6 home screens. It accepts `V6Database`, actor data, and explicit UI context such as the current Hebrew weekday, then returns stable rows, labels, indexes, and empty defaults without fetching, mutating, persisting, or reading wall-clock time inside role view-model selectors.
- UI components keep UI-local state only: selected timetable day, selected lesson bottom sheet, icons, click handlers, tab/screen navigation targets, and presentational fallback copy.
- Backend integration can later replace the `V6Database` source or hydrate the same domain contracts. The v6 home UI should not need route, provider, auth, payment, or API changes just to consume backend-backed data.
