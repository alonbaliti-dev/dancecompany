# Phase 12 Native Ecosystem + Immersive Academy Systems

Phase 12 prepares LK Student Space to grow from a stable web platform into a connected premium academy ecosystem across mobile devices, wearables, studio displays, backstage spaces and immersive media experiences. This is an architecture preparation phase only. It does not build native apps, device-specific dashboards, realtime providers, production display clients or new runtime UI.

Previous phase references:

- Advanced AI layer: `docs/PHASE_11_ADVANCED_AI.md`
- Multi-academy expansion: `docs/PHASE_10_MULTI_ACADEMY_EXPANSION.md`
- Live operations: `docs/PHASE_9_LIVE_OPERATIONS.md`
- Future expansion: `docs/PHASE_4_FUTURE_EXPANSION.md`
- Multi-academy architecture: `docs/MULTI_ACADEMY_ARCHITECTURE.md`
- R2 media architecture: `docs/CLOUDFLARE_R2_MEDIA_ARCHITECTURE.md`

Typed Phase 12 contracts live in `lib/platform/native-ecosystem.ts`. They are intentionally inert: no native code, no service worker changes, no provider integrations, no new secrets, no display runtime and no production navigation changes.

## Ecosystem Philosophy

The product direction is one academy operating system, many calm surfaces. Web remains the stable foundation. Native, watch, display and backstage experiences should extend the same academy-aware platform instead of creating parallel apps with separate logic, separate permissions or separate data models.

Phase 12 principles:

- Preserve the current web platform, mobile PWA behavior and local/demo fallback.
- Keep `academyId` as the tenant boundary for every future device and sync contract.
- Treat each device as a role-specific surface, not a separate source of truth.
- Prefer shared domain logic, shared API contracts and shared permission checks.
- Use server-approved snapshots for watch, displays and backstage boards.
- Keep sensitive operations role-safe, audited and reversible.
- Avoid notification overload by designing targeting, priority, quiet hours and digest behavior first.
- Do not expose unfinished native experiences, dead display modes or broad UI shells.

The ecosystem should feel premium, emotional and operationally useful. A student sees motivation and belonging. A teacher marks attendance quickly. A parent sees clarity and trust. Management sees readiness. A stage manager sees only the next cue and the blockers that matter.

## Device Strategy

Future surfaces should share one platform contract:

- Web and PWA: primary product, administration, management, student and parent experience.
- iOS app: premium mobile shell for fast access, push, camera/media capture and offline-safe teacher/student flows.
- Android app: parity with iOS for core academy actions, notifications, media capture and offline queue.
- iPad experience: rehearsal, teacher, management and event coordination surface with larger touch targets and split context.
- Apple Watch companion: glanceable teacher/stage actions, reminders and countdowns.
- Studio displays: read-only or tightly controlled snapshots for lobbies, rehearsal rooms, backstage, production and event countdowns.
- TV/gallery mode: immersive media playback, annual show archives and emotional legacy presentation.

No device should fork business logic. Device clients request scoped data through platform APIs, apply local caching rules and submit mutations through the same permission-aware write path once implemented.

## Native App Direction

Native apps are future clients, not a replacement for the web platform.

Shared logic strategy:

- Keep role, academy, permission, audit and media visibility rules in platform APIs and shared TypeScript contracts.
- Extract portable domain decisions into service interfaces before any native implementation.
- Use API boundaries rather than importing web component state into native clients.
- Keep native presentation thin: authenticate, cache, render, capture, queue and submit through approved APIs.
- Preserve local/demo fallback in the web repo; native development should not add required provider gates to web startup.

iOS direction:

- Prioritize fast teacher actions, push notifications, camera/media capture, offline attendance queue and polished student/parent engagement.
- Support Apple platform conventions only after API contracts are stable.
- Keep sensitive management operations behind explicit authentication and server validation.

Android direction:

- Match core mobile capabilities without assuming iOS-only behavior.
- Treat background upload, push token registration and offline queue behavior as adapter implementations behind shared contracts.
- Avoid platform-specific data models.

iPad direction:

- Prepare for teacher, rehearsal and backstage workflows with larger layouts, role-safe split views and fast timeline scanning.
- Avoid cluttered dashboards. iPad should make coordination easier, not expose every management feature at once.

Authentication flow:

- Native clients authenticate against the same server-trusted user and academy membership model.
- Session refresh, device registration and push token registration stay academy-scoped.
- Super Admin academy switching must remain explicit and audited.
- Normal users must never infer or switch into another academy through device state.

Push notification strategy:

- Register device tokens per user, academy, device family and consent state.
- Resolve audiences server-side before dispatch.
- Enforce quiet hours, priority, rate limits, event-specific urgency and role visibility.
- Support digesting non-urgent updates to avoid noise.

Media synchronization:

- Uploads use academy-scoped media policies and R2 key prefixes.
- Background uploads must be resumable, idempotent and visibility-reviewed before publish.
- Native camera integration should create draft media records first, then upload, process and publish only after permission checks.

## Apple Ecosystem Direction

Apple ecosystem support should be elegant and constrained:

- iPhone: fast mobile access, push, camera capture, background upload, attendance and personal progress.
- iPad: rehearsal, teacher, backstage and production coordination.
- Apple Watch: minimal companion for reminders and quick actions.
- Apple TV or AirPlay-style future display: gallery and event memory presentation through approved display snapshots.

Apple-specific capabilities, such as haptics, widgets or watch complications, should be adapter-level enhancements. They must not create separate domain rules or required web dependencies.

## Apple Watch Direction

Apple Watch should be minimal, fast and glanceable. It is not a small dashboard.

Prepared watch experiences:

- Attendance quick mark for teachers.
- Rehearsal reminders for assigned groups.
- Backstage countdowns for stage staff.
- Teacher quick actions for class status.
- Stretch reminders for students where enabled.
- Event notifications for relevant participants.
- Arrival reminders for shows, rehearsals and competitions.

Watch rules:

- Show one immediate action or status at a time.
- Prefer short labels, clear countdowns and haptic cues.
- Never expose broad student lists, private parent details or management dashboards.
- Mutations must be minimal, idempotent and server-validated.
- Emergency or backstage notifications must be role-targeted and rate-limited.

## Studio Hardware Direction

Studio display systems should make the physical academy calmer and better coordinated. They should not become generic dashboards.

Prepared display modes:

- Studio lobby screens: academy branding, welcome state, today timeline, safe announcements and upcoming classes.
- Rehearsal room displays: current class, next group, countdowns, room status and instructor notes safe for the room.
- Backstage displays: next cues, check-in status, costume readiness, stage queue and urgent staff instructions.
- Production displays: run-of-show timeline, stage state, blockers and production communication.
- Event countdown screens: arrival windows, rehearsal calls, show countdown and safe public readiness.
- Live schedule boards: class timeline, room allocation, announcements and safe status.

Display rules:

- Use academy branding and readable large-screen typography.
- Consume server-approved snapshots.
- Default to read-only.
- Hide private student, guardian, emergency, payment and health information unless the display is staff-only and role-scoped.
- Include expiry timestamps so stale screens are obvious.
- Keep layouts simple enough to read at distance.

## Backstage Systems

Backstage and show mode are immersive production operations, not a decorative event screen.

Prepared backstage capabilities:

- Run-of-show timeline.
- Backstage check-in.
- Costume readiness.
- Emergency contact access for authorized staff only.
- Stage queue.
- Rehearsal sequencing.
- Production communication.
- Live event updates.

Architecture requirements:

- Academy-scoped, event-scoped and role-safe.
- Mobile-friendly for teachers and stage staff.
- Stage manager actions require stricter permission and audit.
- Parents and students receive only audience-appropriate updates.
- Emergency contact visibility is purpose-limited and logged.
- Offline queue behavior must avoid duplicate check-ins or stale stage state.

Backstage surfaces should emphasize next cue, current blocker, responsible owner and safe escalation path.

## Immersive Media Experience

The media ecosystem should preserve academy identity and emotional legacy.

Prepared media experiences:

- Large gallery screens.
- TV/gallery mode.
- Event memory playback.
- Highlight reels.
- Annual show archives.
- Cinematic presentation mode.
- Rehearsal-to-show timeline memories.

Media rules:

- R2 remains the production media storage direction.
- Supabase stores metadata, permissions, visibility, event links and academy scope.
- Large screens must use approved renditions, not originals.
- Highlight reels and memory playback must respect visibility and consent.
- Annual show archives should be indexed by academy, season, event and group.
- Public or lobby playback requires explicit safe-public visibility.

## Advanced Mobile Experience

Future mobile-native patterns should improve real workflows while keeping the current web app mobile-first and PWA-safe.

Prepared mobile-native directions:

- Native gestures for quick navigation and media review.
- Haptics for countdowns, confirmations and backstage cues.
- Offline-first attendance, check-in and draft media flows.
- Background uploads with resumable media queue.
- Camera integration for class media, event moments and student submissions.
- Quick attendance actions for teachers.
- Media capture optimization for thumbnails, compression and upload retry.

No current web runtime should depend on native-only capabilities. Web remains usable on mobile Safari, Android browsers and PWA contexts.

## Push + Live Experience

Live systems should help people act at the right moment without becoming noisy.

Prepared live experiences:

- Backstage alerts.
- Teacher reminders.
- Rehearsal countdowns.
- Event updates.
- Attendance sync.
- Gallery updates.
- Arrival reminders.
- Production communication.

Notification rules:

- Server-side audience resolution before dispatch.
- Academy, role, group, event and individual targeting.
- Quiet hours and consent for non-urgent messages.
- Priority tiers for info, reminder, urgent and emergency.
- Deduplication and idempotency keys for live event sends.
- Delivery and read state stored as operational metadata, not UI truth.
- Digest low-priority updates where possible.

## API + Sync Architecture

The sync model should support web, native, watch, displays and backstage systems without fragmenting architecture.

Source-of-truth rules:

- Supabase and platform repositories remain durable source of truth for structured data.
- R2 remains durable source of truth for media objects.
- Device caches are temporary.
- Watch and display snapshots are derived and expirable.
- Offline mutations are queued, permission-checked and reconciled server-side.

Caching strategy:

- Web uses current app state and repository patterns.
- Native clients use academy-scoped caches with explicit invalidation.
- Watch uses tiny snapshots and short-lived action payloads.
- Displays use read-only snapshots with expiry and stale indicators.
- Media clients cache thumbnails/renditions, not private originals.

Offline queue strategy:

- Queue only approved action types.
- Store idempotency keys, actor, academy, target entity and timestamp.
- Revalidate permission, academy scope and entity state before applying.
- Resolve conflicts with server state and clear user feedback.
- Never queue broad management, billing, role or visibility changes without explicit future review.

Media sync strategy:

- Upload drafts first.
- Use academy-prefixed R2 keys.
- Track local file state, upload state, processing state and publish state separately.
- Retry safely with idempotency keys.
- Require visibility review before gallery/public playback.

Notification sync strategy:

- Device registrations are scoped to academy and user.
- Notification preferences sync per role and channel.
- Live event notifications use event-scoped subscriptions.
- Delivery/read status should not be treated as proof of operational completion.

## Synchronization Model

Phase 12 prepares a sync vocabulary:

- `snapshot`: read-only derived state for display/watch/live boards.
- `command`: user-initiated mutation request that requires server validation.
- `event`: server-recorded fact after accepted mutation or system update.
- `queue_item`: offline or retryable command with idempotency.
- `media_job`: upload, processing or rendition task.
- `notification_intent`: targeted message request before provider delivery.

Conflict handling should favor correctness and trust:

- Attendance and check-in conflicts show latest server state and require human confirmation if ambiguous.
- Backstage state conflicts prioritize stage manager authority and audit.
- Media duplicate uploads merge into one draft where possible.
- Display clients never write conflict-prone state.
- Watch actions submit narrow commands only.

## Accessibility + Multi-Device QA

Future QA must verify the whole ecosystem, not only one browser width.

Prepared QA matrix:

- iPhone Safari and future iOS app.
- Android Chrome and future Android app.
- iPad Safari and future iPad app.
- Apple Watch companion.
- Studio lobby displays.
- Rehearsal room displays.
- Backstage displays.
- Production displays.
- Large TV/gallery screens.
- Keyboard, screen reader, reduced motion and high contrast.
- Hebrew RTL and English LTR across all device classes.

QA rules:

- Large displays must pass distance readability and stale-state clarity.
- Watch flows must be usable in seconds.
- Touch targets must scale for teachers moving quickly.
- RTL must be tested for event timelines, countdowns, cards, media captions and display layouts.
- Motion/haptics must respect reduced-motion and accessibility preferences.
- Manual web QA remains required before any future runtime UI work.

Manual QA for Phase 12 itself is limited because the phase intentionally avoids runtime UI changes.

## Design System Future-Proofing

The design system should prepare native, watch, display and event modes without forking visual language.

Prepared design directions:

- Native adaptation tokens for navigation, spacing, touch targets and gesture affordances.
- Watch adaptation tokens for glanceable typography, concise labels and haptic emphasis.
- Display adaptation tokens for distance readability, high contrast, large status blocks and safe public content.
- Event mode themes for annual show, competition, rehearsal and backstage urgency.
- Backstage themes that clarify state without panic.
- Accessibility scaling for text, contrast, reduced motion and screen readers.
- Motion/haptics direction that supports confirmation, urgency and countdowns without overload.

Design rules:

- Academy branding can personalize mood, but cannot hide critical state or reduce accessibility.
- Event/backstage colors must communicate state consistently across web, mobile, watch and displays.
- Large media experiences should feel cinematic while preserving privacy and visibility rules.
- No duplicate design system should be created for native clients.

## Scaling Risks

Main ecosystem risks:

- Native fragmentation if mobile apps implement independent permissions, data models or fallback behavior.
- Watch overload if too many workflows are compressed into a tiny surface.
- Display privacy leaks from lobby or backstage screens showing sensitive information.
- Notification fatigue during rehearsals, events and show days.
- Sync conflicts during offline attendance, check-in or backstage state updates.
- Media cost growth from background uploads, large galleries and cinematic playback.
- Stale displays causing operational mistakes.
- Cross-academy leakage through device tokens, caches, snapshots or media prefixes.
- Accessibility regression when adapting to watch, display or event-mode themes.
- Provider fragility if native push, realtime or display services become required startup gates.

## Rollout Strategy

Phase 12 rollout stays architectural:

1. Keep this master doc and typed contracts inert.
2. Validate every future surface against academy scope, permissions, audit, visibility, local fallback and sync behavior.
3. Stabilize web APIs before any native client work.
4. Pilot one device surface at a time, starting with the smallest operational value.
5. Add provider adapters only after fallback, retry, privacy and support rules are documented.
6. Run lint, typecheck, build and mobile/RTL/browser QA before linking any runtime UI.
7. Keep native and display clients out of production navigation until data, permissions, empty states, stale-state handling and support runbooks are complete.

## Implementation Rules

Allowed in Phase 12:

- Documentation.
- Architecture preparation.
- API boundary planning.
- Service interface planning.
- Synchronization planning.
- Typed placeholders.
- Scalable inert models.

Not allowed in Phase 12:

- Native app implementation.
- Apple Watch app implementation.
- Display client implementation.
- New realtime provider integration.
- Service worker/PWA runtime changes.
- Device-specific hacks.
- Duplicate architecture.
- Broad UI expansion.
- Unfinished navigation links.
- Provider requirements that break local/demo fallback.

## Phase 12 Verification Notes

Automated checks for this phase:

```bash
npm run lint
npm run typecheck
npm run build
```

Manual QA expectations:

- No current web regressions.
- No broken mobile UX.
- No RTL regressions.
- No runtime navigation, sheets, service worker or PWA changes.
- No duplicate state architecture.
- No native implementation, display client, realtime provider or push provider wiring.

Because Phase 12 is docs/types-only, manual browser/device QA may be recorded as not performed unless runtime code is changed later.
