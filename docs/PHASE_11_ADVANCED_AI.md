# Phase 11 Advanced AI Intelligence Layer

Phase 11 prepares LK Student Space to become a calm, intelligent academy operating platform. AI is an assistance layer for humans, not an autonomous operator. It summarizes, organizes, drafts, highlights and recommends so students, parents, teachers, management and Super Admin can make better decisions with less friction.

Previous phase references:

- Multi-academy expansion: `docs/PHASE_10_MULTI_ACADEMY_EXPANSION.md`
- Live operations: `docs/PHASE_9_LIVE_OPERATIONS.md`
- Production launch: `docs/PHASE_8_PRODUCTION_LAUNCH.md`
- Production hardening: `docs/PHASE_6_PRODUCTION_HARDENING.md`
- AI safety baseline: `AI-SAFETY.md`
- Current AI contracts: `lib/ai/*`

Typed Phase 11 contracts live in `lib/ai/advanced-ai.ts`. They are intentionally inert: no live provider calls, no autonomous action executors, no new secrets, no broad UI, no deployment behavior.

## AI Philosophy

AI in LK Student Space should feel:

- Calm.
- Helpful.
- Contextual.
- Subtle.
- Premium.
- Emotionally intelligent.
- Operationally useful.

AI should never feel:

- Spammy.
- Robotic.
- Overwhelming.
- Intrusive.
- Autonomous.
- Creepy.
- Everywhere in the UI.

The product language is: "הצעה בלבד". AI may help people notice what matters, understand next steps and draft safer communication, but humans remain responsible for judgment, tone, timing and approval.

## Safety Rules

- No autonomous AI behavior.
- No auto-send.
- No auto-publish.
- No automatic critical data modification.
- No discipline, escalation, grading or sensitive conclusions without human review.
- No permission bypass.
- No cross-academy access for normal roles.
- No unrelated student, parent, teacher, media, payment or message access.
- No unsafe facial recognition.
- No raw secrets, passwords, card data or private provider identifiers in prompts or logs.
- No sensitive raw personal data in audit logs unless explicitly required and approved.
- Local/demo fallback must remain available.

AI output must be labeled as a suggestion. User-facing output must enter review before any send, publish or follow-up workflow.

## Permission Model

The permission model remains role-aware, academy-aware and scope-aware:

- Student: `self` only.
- Parent: `self` and `linked_students` only.
- Teacher: `self` and `assigned_groups` only.
- Management: academy/studio operations and management scopes only.
- Super Admin: system scope, with explicit academy context.

Every AI request must carry:

- `academyId`.
- `studioId`.
- actor user ID and role.
- allowed scope.
- explicit target entity IDs.
- action type.
- target module.
- sensitivity level.

AI must use the same boundaries as the product: academy isolation, linked child access, assigned group access, management scope and Super Admin-only platform scope.

## Academy-Aware AI

Phase 10 made academy boundaries a first-class platform concept. Phase 11 treats `academyId` as the tenant boundary for every AI suggestion, approval and audit event.

Rules:

- AI context builders must resolve or receive an explicit `academyId`.
- Target IDs must be validated against the current academy.
- Management insights are academy-scoped, not platform-wide.
- Super Admin platform insights must make the active academy context clear.
- Prompt templates must describe allowed context and forbidden context.
- No model receives cross-academy data unless the actor is Super Admin and the workflow is explicitly platform-level.

## Orchestration Architecture

The safe orchestration layer is prepared around existing `lib/ai` patterns:

- `lib/ai/ai-types.ts`: shared action, scope, target, sensitivity and draft types.
- `lib/ai/ai-request-context.ts`: conservative request validation for role, studio, academy, scope and targets.
- `lib/ai/ai-safety.ts`: blocks publish intent and wraps output as a suggestion.
- `lib/ai/ai-approval.ts`: marks user-facing AI actions as approval-required.
- `lib/ai/ai-audit.ts`: builds sanitized audit metadata.
- `lib/ai/advanced-ai.ts`: Phase 11 registry, context builder, approval queue contracts and prompt template metadata.

The architecture is deliberately not an agent loop. It is a typed suggestion pipeline:

1. Build academy-aware context.
2. Validate actor, role, scope and target IDs.
3. Select a registered AI use case and prompt template metadata.
4. Produce a suggestion or draft from provided context only.
5. If user-facing, queue for human review.
6. User edits, approves or rejects.
7. System logs sanitized audit metadata.
8. Only an approved human-owned workflow may send or publish later.

## Role-Specific AI Foundations

The Phase 11 registry prepares safe AI use cases for each role.

Student AI:

- Stretch and practice reminders.
- Encouragement.
- Practice consistency summaries.
- Upcoming rehearsal reminders.
- Task summaries.

Parent AI:

- Child progress summaries.
- Attention alerts.
- Attendance summaries.
- Upcoming event reminders.
- Payment reminders.

Teacher AI:

- Attendance insights.
- Group engagement insights.
- Practice completion summaries.
- Message drafts.
- Event preparation summaries.
- Rehearsal readiness.

Management AI:

- Operational bottlenecks.
- Event readiness.
- Engagement drops.
- Unresolved tasks.
- Attendance risks.
- Parent communication summaries.

Super Admin AI:

- Platform health.
- Academy health.
- Integration issues.
- Scaling insights.
- UX friction analysis.
- Operational anomalies.

## Approval Workflow

All user-facing AI outputs require approval:

- Parent messages.
- Teacher feedback.
- Attendance follow-up.
- Event announcements.
- Reminders.
- Summaries.

Workflow:

1. AI drafts a suggestion.
2. User reviews the suggestion.
3. User edits if needed.
4. User approves or rejects.
5. System logs the approval or rejection.
6. Only approved content can continue into a human-owned send or publish flow.

Approval metadata should include actor, reviewer, academy, action type, target module, prompt type, suggestion ID, approval status and timestamp. Audit logs should store sanitized metadata and small previews, not full sensitive raw content.

## Practice And Engagement AI

Prepared support areas:

- Stretch completion.
- Practice streaks.
- Attendance consistency.
- Missed rehearsals.
- Engagement drops.
- Uploaded practice videos later.
- Group participation.

Allowed outcomes:

- Suggest follow-up.
- Suggest encouragement.
- Suggest easier or harder practice plan.
- Suggest teacher attention.
- Summarize consistency.

Blocked outcomes:

- Automatic discipline.
- Automatic escalation.
- Automatic parent message.
- Automatic grading.
- Automated conclusions based on one missed rehearsal.

## Event And Show AI

Prepared support areas:

- Rehearsal readiness.
- Missing participation.
- Costume reminders.
- Checklist summaries.
- Annual show preparation.
- Event recap summaries.
- Competition summaries.

Event AI should help management and teachers understand readiness without creating pressure or noise. Announcements, reminders and recap text remain drafts until approved.

## Media And Gallery AI

Prepared future direction:

- Auto-tagging suggestions by event, group, category and timeline.
- Event grouping.
- Timeline organization.
- Highlight suggestions.
- Memory and archive organization.
- Search assistance.

Hard boundary:

- No unsafe facial recognition.
- No hidden media exposure.
- No auto-publish.
- No visibility changes without human moderation.
- No private URLs in prompts or logs.

## Management Insight Language

Management AI should use simple Hebrew, not enterprise jargon. Examples:

- קבוצת היפ הופ נוער ירדה בהשלמת תרגולים השבוע
- יש 3 תלמידים עם היעדרויות חוזרות
- אירוע סוף שנה עדיין חסר רשימת תלבושות

These are signals for review, not automatic conclusions.

## UI Experience

Phase 11 does not add a large AI interface. UI guidance only:

- Subtle AI cards.
- Contextual recommendations.
- Short summaries.
- "למה זה מוצע?" explanations.
- Optional "Ask LK" later, only after the safety model is stable.
- RTL-first, mobile-readable, low-noise copy.

Avoid:

- Giant chat surfaces.
- Floating intrusive assistants.
- Noisy overlays.
- AI everywhere.
- Unreviewed message composition.
- User-facing confidence theater.

## Safety And Audit

Every AI action must be:

- Logged.
- Attributable.
- Reviewable.
- Reversible where relevant.
- Academy-scoped.
- Permission-scoped.

Audit metadata should include:

- Prompt type.
- Actor.
- Role.
- Academy.
- Studio.
- Action type.
- Target module.
- Target IDs, bounded and sanitized.
- Suggestion ID or preview.
- Approval/rejection status.
- Timestamp.

Never log sensitive raw personal data unnecessarily. Sensitive details should be represented through safe buckets, statuses or IDs where possible.

## Risk Analysis

Main risks:

- Cross-academy data leakage.
- Parent seeing unlinked student information.
- Teacher seeing unassigned group details.
- AI tone sounding judgmental or disciplinary.
- AI drafts being mistaken for sent messages.
- Too many cards causing operational noise.
- Unsafe media tagging or facial recognition pressure.
- Prompt or audit logs storing sensitive raw data.
- Future provider changes bypassing local safety gates.

Mitigations:

- Keep AI behind role, scope and academy validation.
- Require explicit target IDs.
- Keep user-facing output pending approval.
- Use prompt templates with allowed and forbidden inputs.
- Keep audit sanitized.
- Preserve local/demo fallback.
- Add UI sparingly and close to existing workflows.

## Operational Boundaries

AI may:

- Summarize.
- Draft.
- Organize.
- Highlight.
- Recommend.
- Explain why a suggestion exists.
- Reduce repetitive operational review.

AI may not:

- Send.
- Publish.
- Charge.
- Refund.
- Modify attendance.
- Modify roles or permissions.
- Change event status.
- Change gallery visibility.
- Escalate a student or parent issue automatically.
- Access unrelated academy data.

## Rollout Strategy

1. Phase 11 contracts only: docs, types, registry and approval queue metadata.
2. Internal Super Admin review with local/demo data.
3. Management-only pilot cards for aggregate, non-sensitive insights.
4. Teacher assigned-group insights with no outbound actions.
5. Parent/student summaries only after linked-student validation and careful RTL/mobile QA.
6. Provider-backed suggestions only after prompt governance, audit persistence and fallback behavior are verified.
7. Optional "Ask LK" only after contextual cards prove useful and quiet.

Each stage must pass safety QA before expanding audience or surface area.

## Future AI Direction

Prepared, not built:

- Choreography assistance.
- Movement analysis.
- Rehearsal analysis.
- Event forecasting.
- Engagement prediction.
- Academy health forecasting.
- AI-powered search.
- Academy memory generation.

These areas require explicit future design, privacy review, consent review, media safety review and real QA. Phase 11 does not build unstable experimental systems.

## Manual QA Checklist

- AI suggestions are role-safe.
- Academy isolation is respected.
- Parent scope only includes linked children.
- Teacher scope only includes assigned groups.
- User-facing output requires approval.
- No auto-send behavior exists.
- No auto-publish behavior exists.
- No critical data is automatically modified.
- No sensitive data leaks into prompts, previews or audit logs.
- AI cards remain readable in RTL and mobile.
- Local/demo fallback still works.
- Provider failure remains retryable and does not crash the app.

## Phase 11 Limits

This phase does not:

- Deploy AI to production.
- Add new secrets.
- Add new provider calls.
- Add broad UI.
- Add autonomous executors.
- Commit or push changes.
- Remove fallback behavior.

The output is a stable foundation for future approved AI features, not a live autonomous AI system.
