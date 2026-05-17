# Phase 7 Real User QA / Pilot Testing

Phase 7 prepares LK Student Space for real usage testing before production launch. This phase does not add major features, redesign flows, launch publicly, remove local/demo fallback, or enable live providers. The goal is to find what breaks, what confuses real users, and what must be simplified before production.

## Pilot Goals

- Validate that each role can complete the daily workflows that matter to them.
- Identify confusing wording, unclear buttons, broken expectations, unreadable layouts, and incomplete feedback states.
- Confirm the app stays calm and trustworthy on mobile devices, especially iPhone Safari.
- Confirm local/demo fallback remains usable while production services are still gated.
- Build a prioritized fix list before public launch.
- Separate launch blockers from polish so the team does not add random features during QA.

## Pilot Rules

- Do not add random features during the pilot.
- Fix P0 and P1 issues first.
- Batch P2 and P3 improvements into small, reviewed groups.
- Keep every fix small and tied to a logged issue.
- Run `npm run build` after every fix.
- Preserve local/demo fallback unless a specific production rollout task explicitly replaces it.
- Document every issue, decision, skipped request, and retest result in `docs/PILOT_FEEDBACK_LOG.md`.
- Do not launch publicly until Phase 7 success criteria are met.

## Tester Roles

Each tester should use only the flows relevant to their role. Avoid asking pilot users to test admin-only tools unless they are actually responsible for that work.

### Student

Primary question: can a student understand what matters today and complete daily practice without help?

Scenarios:

1. Login.
2. View Home.
3. View next lesson.
4. Mark daily stretch done.
5. View task or media.
6. Send an allowed response if the flow is enabled for the student.

Observe:

- Does the student know what to do next?
- Is the daily action motivating and easy to find?
- Are task/media states understandable?
- Does anything feel too technical or too much like an admin system?

### Parent

Primary question: can a parent understand their child's status without feeling overloaded?

Scenarios:

1. Login.
2. View linked child.
3. Check attendance summary.
4. View event reminder.
5. View shop, ticket, or private lesson area.
6. View gallery.

Observe:

- Does the parent understand which child the information belongs to?
- Is the language clear and reassuring?
- Are attendance, event, shop, ticket, private lesson, and gallery areas easy to distinguish?
- Does the app reduce WhatsApp dependency or create more questions?

### Teacher

Primary question: can a teacher complete class-time work quickly, especially attendance?

Scenarios:

1. Login.
2. View assigned groups.
3. Mark attendance.
4. Send group update.
5. Assign practice task.
6. Upload media.
7. Handle private lesson request.

Observe:

- Can attendance be completed during class without slowing the teacher down?
- Are assigned groups easy to find?
- Does weak internet or loading state block class workflow?
- Are media upload and group update actions obvious enough?

### Management

Primary question: can management see what needs attention and handle common operations?

Scenarios:

1. Login.
2. Review attention items.
3. Manage users.
4. Check attendance completion.
5. Manage shop product.
6. Review event readiness.
7. View media/gallery.

Observe:

- Does management know what needs attention now?
- Can users, products, events, attendance, and media be managed without developer help?
- Which actions still require WhatsApp, spreadsheets, or manual coordination?
- Are permission boundaries and audit expectations clear?

### Super Admin

Primary question: can Super Admin inspect platform readiness without exposing technical tools to normal users?

Scenarios:

1. Login.
2. Switch academy context.
3. Check system health.
4. Verify integrations.
5. Inspect audit logs.
6. Verify feature flags.

Observe:

- Is academy context always explicit?
- Are integration statuses understandable without leaking secrets?
- Are audit logs sufficient to investigate sensitive actions?
- Are feature flags discoverable and safe to interpret?

## Feedback Questions

Ask every tester:

- What was confusing?
- What felt useful?
- What looked unprofessional?
- What did you expect to happen?
- What button/action did not work?
- Was anything hard to read?
- Did anything feel too technical?
- Did anything feel missing?

Teacher-specific questions:

- Can you mark attendance quickly during class?
- Can you find your groups easily?
- Can you upload media easily?

Parent-specific questions:

- Do you understand what matters for your child?
- Is the language clear?
- Do you feel informed without being overwhelmed?

Management-specific questions:

- Do you know what needs attention?
- Can you manage users/products/events?
- What still requires WhatsApp/manual work?

## Bug Report Format

Use this format for every issue in `docs/PILOT_FEEDBACK_LOG.md`:

- Date:
- Tester role:
- Device:
- Browser:
- Issue:
- Severity:
- Screenshot/video link:
- Reproduction steps:
- Expected behavior:
- Actual behavior:
- Status:
- Fix commit:

Keep reports factual. Do not combine unrelated issues into one report. If a tester gives broad feedback, split it into specific issues or label it as an observation.

## Severity Levels

- P0: App unusable, login broken, data loss, permission leak, payment/security issue.
- P1: Core flow broken: attendance, user editing, product editing, media upload, messages.
- P2: Important UX issue: confusing flow, bad RTL, clipping, missing feedback.
- P3: Polish issue: spacing, wording, visual refinement.

Triage rules:

- P0 blocks all rollout and must be fixed immediately.
- P1 blocks role rollout for the affected workflow.
- P2 should be batched and fixed before broad launch unless explicitly accepted.
- P3 can be batched after critical pilot learnings are stable.

## Device Testing Guidance

Required devices:

- iPhone Safari.
- Android Chrome, if possible.
- Desktop Chrome.
- iPad Safari, if possible.

Network conditions:

- Test Wi-Fi.
- Test cellular.
- Test weak internet if possible.
- For teacher attendance, verify that weak internet does not create uncertainty about saved or queued changes.

Screen and accessibility checks:

- Verify mobile safe areas and bottom navigation.
- Check text scaling and clipping.
- Check tap target comfort.
- Check RTL layout and Hebrew copy where applicable.
- Confirm loading, empty, success, and error states are understandable.

## Rollout Plan

1. Internal dry run: Super Admin and management complete all role scenarios using local/demo fallback.
2. Staff pilot: teachers test assigned groups, attendance, updates, tasks, media, and private lesson requests with non-production data.
3. Parent/student pilot: selected trusted families test child status, daily practice, attendance summary, events, shop/ticket/private lesson views, and gallery.
4. Issue triage: classify all feedback as P0, P1, P2, P3, duplicate, question, or feature request.
5. Fix pass: resolve P0/P1 first, then batch small P2/P3 improvements.
6. Retest: original reporter or role owner retests the same reproduction steps.
7. Launch readiness review: confirm success criteria, unresolved risks, and explicit no-go items before any production launch decision.

Feature requests discovered during the pilot should be logged separately and deferred unless they directly remove a P0/P1 blocker.

## Success Criteria

Phase 7 passes when:

- No P0 issues remain.
- No unresolved P1 issues remain.
- Teachers can complete attendance.
- Parents understand child status.
- Students can complete daily practice.
- Management can manage users, shop, and events.
- Super Admin can inspect system health.
- The app feels readable and trustworthy on mobile.

## Required QA Commands

Run before and after pilot fixes:

```bash
npm run lint
npm run typecheck
npm run build
```

Document any existing warnings or failures with the date, command, and exact blocker. A failed command does not automatically mean Phase 7 failed, but unresolved build/type/lint failures must be understood before launch.

## Not In Scope

- No public launch.
- No broad redesign.
- No major new features.
- No live payment rollout.
- No production provider enablement.
- No UI feedback form unless requested later.
- No browser QA automation required for this documentation phase; manual pilot execution is the next step.
