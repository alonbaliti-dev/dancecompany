# Product transformation map - 2026-05-18

This map is frontend-only. It documents ownership and safe sequencing before deeper product work. It does not approve backend/schema/API changes.

## Real frontend ownership

- App entry and V6 orchestration: `components/v6/LKStudentSpaceV6.tsx`
- Home: `components/v6/screens/HomeScreen.tsx`
- Mobile shell and bottom navigation: `components/v6/design-system/AppShell.tsx`
- Shared V6 UI primitives, sheet, actions, rows, controls: `components/v6/design-system/primitives.tsx`
- Shared V6 tokens, tone, surfaces, safe classes: `components/v6/design-system/tokens.ts`
- V6 app state, local persistence, audit and frontend reducer: `lib/v6/AppProvider.tsx`
- V6 data model: `lib/v6/types.ts`
- Seed content and role labels: `lib/v6/seed.ts`
- Shop selectors and operations: `lib/domains/shop/selectors.ts`, `lib/domains/shop/operations.ts`
- Attendance selectors and operations: `lib/domains/attendance/selectors.ts`, `lib/domains/attendance/operations.ts`
- Messages selectors: `lib/domains/messages/selectors.ts`
- Events selectors: `lib/domains/events/selectors.ts`
- Existing broader app shell and older screens: `components/AppShell.tsx`, `components/navigation/*`, `components/shop/*`, `components/media/*`, `components/users/*`

## Current content/admin flexibility

- Existing V6 supports `editableTexts` and `featureFlags` in `V6Database`.
- Current V6 UI does not yet have schema-backed homepage composition, nav item ordering, section visibility, role module ordering, featured product ordering, or gallery highlight management.
- A full CMS/admin composition layer requires an explicit data model decision before backend/schema/API work.
- Safe frontend-only foundation: typed mobile modules and composable UI primitives that can later read from DB-backed configuration.

## Safe implementation sequence

1. Foundation: mobile composition primitives, tighter shell/nav/sheet rhythm, and a screen checklist.
2. Role-aware Home: module anatomy driven by real selectors and existing text only.
3. Shop/product/cart: commerce anatomy, product grid/list density, checkout-state surfaces using existing product/order behavior.
4. Schedule/attendance: fast operational rows and attendance sheet task flow.
5. Notifications/messages: inbox grouping, read actions, role relevance.
6. Gallery/media: memory/event/group timeline using existing media/gallery collections.
7. More/management: settings architecture, admin flexibility, editable text/flags/branding management.
8. CMS architecture: only after approving DB/API/storage model for screen composition and role visibility.

## Stage 1 scope in this run

- Add frontend-only mobile composition primitives.
- Rebase Home on those primitives.
- Refine bottom navigation and sheet primitives as platform baseline.
- Continue Shop/product structure only if validation remains green.
