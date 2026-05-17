# V6 Functional Bug Triage

Functional triage is prioritized over visual redesign. Current V6 visual/RTL changes are preserved and not intentionally altered.

## Shop Product Management

| Bug area | Exact flow tested | Expected behavior | Actual behavior | Fix applied | QA status |
| --- | --- | --- | --- | --- | --- |
| Product add/edit/save | Add product, edit product, set title/category/price/stock/image, save, navigate away/back, export DB | Product validates, saves through V6 state, shows success feedback, appears in shop immediately, persists locally/export, audit entry created | Add product CTA opened media screen; no product form existed, so category/price/stock/image could not be saved from shop management | Added V6 product editor in shop, domain validation via `buildV6SaveProductOperation`, provider save/update with audit and management notification, product image metadata save/select, immediate category refresh | Passed. Browser/code QA covered add, edit, immediate selector display, navigation persistence via local DB state, export JSON inclusion, and audit entry |
| Product validation | Save without title, valid price, category, stock status | Clear Hebrew error, no silent failure, no invalid product in DB | Save path accepted raw product action without validation | Added title, price, category, stock status, and image reference validation with Hebrew errors before dispatch | Code fixed; automated checks passed |
| Product archive/disabled | Disable/archive product and verify shop behavior | Product remains in DB/export but is unavailable/marked inactive in shop | No shop management UI for disabled/archive state | Added stock status selector backed by `active`; inactive products remain in DB/export and are excluded from active shop selectors | Passed by selector/export regression coverage |

## User Editing

| Bug area | Exact flow tested | Expected behavior | Actual behavior | Fix applied | QA status |
| --- | --- | --- | --- | --- | --- |
| Add/edit user | Add user, edit name/phone/role/status/permissions, close/reopen | User state updates, auth credentials update, role changes affect UI, success feedback and audit log created | New-user save reused actor shape and normal edits always sent credential payload, causing unintended credential resets and wrong defaults | Added explicit user draft construction, V6 user operation validation, active status and permissions UI, credential creation only for new users, phone sync on edits, audit/notifications in provider; fixed mobile sheet height/z-index so controls remain reachable at 390px | Passed. Browser opened mobile user management, created a student, verified persistence after reload; code QA covered add parent, link parent/student, edit name/phone, role/permission change, deactivate/reactivate, reopen/export/audit |
| Password reset | Reset password and log in with updated credentials | Password minimum enforced, credentials update, audit entry created, success feedback shown | Reset action silently did nothing for users without existing credentials and had no UI-side minimum validation | Added password validation through `buildV6ResetPasswordOperation`; reducer upserts credentials so reset works for any user | Passed by functional QA against credential persistence and audit entry |
| Relationships/teacher groups | Link/unlink parent/student, assign teacher to group | Bidirectional links update and teacher group assignments persist in users/groups/export DB | User editor did not expose parent/student links or teacher group assignments; groups were not synced from user edits | Added parent linked-student selector and teacher/student group assignment chips; provider syncs `users.groupIds` into `groups.teacherIds`/`groups.studentIds` | Passed by functional QA for linked parent/student and teacher-to-group sync |
| User validation | Missing name/phone/role, short password, invalid links | Clear Hebrew error, no invalid write | Invalid drafts could be dispatched directly | Added Hebrew validation for name, phone, role, password length, group IDs, and linked student IDs | Code fixed; automated checks passed |

## Attendance

| Bug area | Exact flow tested | Expected behavior | Actual behavior | Fix applied | QA status |
| --- | --- | --- | --- | --- | --- |
| Attendance save | Teacher opens assigned group, mark all present, individual absent/late/excused, add note, save, reopen | Attendance records persist, exceptions are preserved, notes persist, success feedback and audit log created | Attendance button only wrote an audit entry and toast; no attendance editor or persisted records existed | Added attendance editor, per-student statuses/notes, class date, save action, reducer merge by lesson/date/student, audit and success feedback | Passed. Functional QA covered all-present save, absent/late/excused/note save, reopen-equivalent persistence, export shape, and audit |
| Group visibility | Teacher sees assigned groups only; management sees status | Unauthorized groups hidden; management summaries reflect saved attendance | Teacher guard treated `manageAttendance` permission as global access | Tightened attendance guard so only management/super admin get global access; teachers are limited to assigned group teacher IDs | Passed. Teacher sees assigned group and cannot see unauthorized group; management health reflects attendance issue |
| Insights/alerts | Repeated absences update attendance inputs and notify/alert where supported | Attendance summary/insights update from saved records | Risk/AI/event readiness paths did not consistently count saved `absent` records alongside legacy `missing` records | Expanded attendance type/statuses; risk/rate selectors count absent/missing and treat late as present for percentage; AI risk and event readiness now count absent records; absence save creates existing notification alerts | Failed/fixed, then passed. Functional QA verified student percentage, attendance risk, AI insight, event readiness, and management health updates |
| Attendance validation | Missing group/date or invalid student status | Clear Hebrew error, no invalid write | No save validation path existed | Added `buildV6SaveAttendanceOperation` validation for group, class date, student IDs, statuses, and permissions | Code fixed; automated checks passed |

## Final QA Pass

- User management: passed with one fixed follow-up. Mobile browser QA exposed unreachable lower sheet controls in the 390px side-panel viewport; `BottomSheet` now uses a fixed viewport height and higher overlay layer. Domain QA verified add student, add parent, parent/student link, edit name/phone, reset password, role and permission changes, teacher group assignment, deactivate/reactivate, export shape, audit entries, and persistence.
- Attendance: failed/fixed for absent records not updating every insight path, then passed. Domain QA verified teacher assigned-group access, unauthorized group exclusion, all-present save, absent/late/excused/note save, persistence, attendance percentage, attendance risk, AI risk insight, management health, event readiness, export shape, and audit.
- Shop regression: passed. Domain QA verified add product, edit product, active shop selector visibility, persistence/export shape, and audit entry.
- Follow-up: browser automation in the Cursor side panel still has limited coordinate reliability for long bottom-sheet forms, so final persistence/export assertions were backed by code-level QA against the same domain operations and selectors.

## 2026-05-17 Critical Functional Recovery Pass

Functional recovery superseded visual redesign. The pass preserved the existing V6 visual system and focused only on shop product management, user management, and group-centered attendance.

| Area | Exact flow tested | Expected | Actual/root cause | Fix applied | QA status |
| --- | --- | --- | --- | --- | --- |
| Shop product create/edit | Add product with name, category, type, price in ₪, description, image from media, inventory/status, visibility, save, then view in shop/export state | Complete product sheet validates and saves through provider/domain; image and price render immediately | Product model only had title/category/price/active/image IDs; UI lacked product type, price mode, inventory status, visibility, member-only details and richer metadata | Added optional V6 product fields, domain constants/validation/normalization, category/type/inventory/visibility/price-mode controls, image-library binding, member-only and notes/pickup metadata | Automated lint/typecheck/build passed. Browser QA confirmed sheet fields, price input, and media-library selection; side-panel click interception blocked final save click, so persistence is covered by provider/domain save path and build checks |
| User sorting/grouping/edit context | Open user management, search/filter by role/group/age/style/status, inspect cards, edit student/parent/teacher/management context fields | Hebrew alphabetical sorting, grouped by role, relationship-aware cards and filters, complete edit context | User selector returned raw DB order and editor only handled basic role/groups/links | Added shared `sortByHebrewName`, `groupUsersByRole`, `groupStudentsByGroup`, `groupTeachersByStyle`, `sortGroupsByAgeAndStyle`; added filters and role-specific fields for age/style/parents/children/private lessons/responsibility/notes | Automated lint/typecheck/build passed. Code QA verifies selectors and editor state persist through `upsert_user`, group sync, parent linkage sync, permissions, audit and local export |
| Attendance group flow | Open lessons, choose assigned group/class, mark all present, mark absent/late/excused exceptions, add notes, save, reopen context | Teacher sees assigned groups only; student rows sorted; group context shows style/teacher/time/count/marked/last saved; save updates attendance records and downstream engines | Attendance row order was raw DB order; all-present did not set every row; context lacked saved timestamp and marked count | Added sorted attendance students selector, full group context, all-present overwrite, saved timestamps, recent absence/task/parent cues, and persisted records with `savedAt` | Automated lint/typecheck/build passed. Code QA verifies save operation permissions, record replacement keys, attendance rate/risk/management/event readiness consumers |

Checks run:

- `npm run lint` passed.
- `npm run typecheck` passed.
- `npm run build` passed with Next.js 16.2.6/Turbopack. Build emitted only the existing Node `module.register()` deprecation warning.

Manual/browser QA notes:

- Shop sheet opened in the browser, showed required fields, accepted price `123`, and selected an existing media-library image.
- The browser side panel contained a prior local DB state with older test products and a Next dev hydration overlay; a fixed/bottom navigation layer intercepted the final sheet save click in automation. No code or build failure was observed.
- No deployment, commit, push, merge, backend expansion, AI expansion, or visual redesign was performed.

## 2026-05-17 Critical V6 Structural Cleanup

Structural cleanup superseded visual polish. The pass focused on duplicate records, edit sheet reachability, and V6 local UI/state flows only.

| Area | Root cause | Fix applied | Affected screens | QA status |
| --- | --- | --- | --- | --- |
| Duplicate records | V6 hydration/import accepted saved arrays without a canonical normalization pass, and selectors rendered raw arrays if old local state already contained duplicate IDs/composite rows. User/group relationships could also drift between `users.groupIds`, parent links, and `groups.teacherIds/studentIds`. | Added `lib/v6/dedupe.ts` with `dedupeById`, `dedupeByCompositeKey`, `dedupeParentStudentLinks`, `dedupeTeacherGroupAssignments`, `dedupeShopProducts`, `normalizeV6Database`, and `mergeV6Database`. Seed clone, local hydration, import, and sensitive reducer writes now normalize by ID/composite keys and prefer latest timestamp when present. Shop/users/attendance/messages/media selectors also dedupe their outputs. | Users, products, groups, parent/student links, teacher assignments, shop categories/products, More menu targets, media, attendance, notifications. | Typecheck passed. Lint passed with existing warnings. Local duplicate state is normalized on next load/write. |
| Edit sheets too low/unreachable | `BottomSheet` was rendered inside the animated V6 shell, so `position: fixed` could be scoped by transformed ancestors. Several desktop flows also rendered the same editor inline below content, creating duplicate/unreachable forms. | `BottomSheet` now portals to `document.body`, locks `html` and `body` scroll, uses fixed viewport height, internal `overflow-y-auto`, safe-area padding, sticky header, and sticky form footers supplied by editors. Removed duplicate desktop inline editors for attendance, shop products, and users. | Add/edit product, image picker inside product editor, add/edit user, reset password, parent/student link, group assignment, attendance marking/notes, media upload. | Browser QA at 390px reproduced the original unreachable-sheet failure before the portal fix. After hot reload, Cursor browser snapshots and screenshots disagreed, so final reachability is backed by the portal/fixed-height implementation plus typecheck/lint/build. |
| Sheet state conflicts | Each flow used booleans/IDs plus duplicated inline editor rendering, so multiple editor surfaces could exist for one action. | Converted active edit flows to typed `activeSheet` objects in screen scope: attendance, product add/edit, user add/edit, and media upload. Only one primary sheet renders per screen, and save/cancel closes it. | Lessons, Shop, Users, Media. | Code QA verifies single sheet state and removal of inline duplicate editors. |

Checks run for this pass:

- `npm run typecheck` passed.
- `npm run lint` passed with existing repository warnings.
- `npm run build` passed with the existing Node `module.register()` deprecation warning from the toolchain.

Constraints honored:

- No visual polish work, deployment, backend/AI expansion, commit, push, or merge was performed.

## 2026-05-17 Management Stabilization Checkpoint

This checkpoint stayed on `fix/v6-management-stabilization` and did not resume deployment or visual polish. The goal was to make the management sheet system reliable enough for add/edit users, add/edit products, and attendance flows.

| Area | Root cause found | Fix applied | Manual QA status |
| --- | --- | --- | --- |
| Sheet visibility and positioning | The portal existed but the core panel could remain visually unreliable during hot reload/manual QA, and the scroll-lock focus effect reran on every form state change because `onClose` changed identity. This could steal focus while typing. | Kept the sheet portal but made the dialog a plain stable fixed panel, added explicit fixed/z-index inline positioning for the overlay, preserved internal scroll, and stored `onClose` in a ref so Escape handling does not refocus the sheet on every keystroke. | Passed in browser. User, product, and attendance sheets render visibly over the app, have internal scrolling, and keep the bottom nav behind the overlay. |
| Sheet pointer events | The full-screen backdrop could win hit-testing over dialog controls in some nested-scroll states, intermittently intercepting save clicks. | Gave the backdrop `zIndex: 0` and the dialog `zIndex: 1` inside the fixed overlay. | Passed in browser. User save, product save, and attendance save buttons received clicks reliably after the fix. |
| Product manager visibility | Management product lists used the active-shop selector, so draft/hidden/inactive products could disappear from the edit surface after save. | Added `selectV6ShopProductsForActor`; managers/super admins see deduped products for editing, while regular shop users still see only active visible products. | Passed in browser. Added product, selected existing media image, saved, reopened, edited price from `123` to `145`, saved, and saw the updated price in shop. |
| User management persistence | Existing typed sheet state was safe, but the sheet infrastructure made add/edit/reset flows unreliable before the overlay fixes. | Kept single `activeSheet` user editor and stabilized the shared sheet layer underneath it. | Passed in browser. Added student, saved and saw grouped/sorted list update, reopened user sheet, reset password, edited name, saved, and saw the updated card persist. |
| Attendance persistence | Attendance flow needed verification through the now-stable sheet, including reopen and management summary update. | No domain rewrite needed beyond the existing active sheet and saved attendance path; verified the sheet fixes against the attendance editor. | Passed in browser. Opened group, marked absent with note, saved, saw management summary update, reopened with note persisted, then used “mark all present,” saved, and saw summary update to `1 סומנו, 0 חסרים, 0 איחורים`. |

Checks for this checkpoint:

- `npm run typecheck` passed before manual QA.
- Full `npm run lint`, `npm run typecheck`, and `npm run build` are required after this documentation update.

Constraints honored:

- No deployment, push, merge, backend expansion, AI expansion, or visual polish was performed.
