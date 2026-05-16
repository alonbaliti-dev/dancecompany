# AI Safety

AI in LK Student Space is an assistance layer, not an autonomous operator.

## Principles

- AI may suggest, summarize and draft.
- AI must not send messages, publish notifications, change data or expose private records without human approval.
- AI context must be permission-filtered by user, role, studio and target entity IDs.
- AI output must be labeled as a suggestion.
- Sensitive content should not be written into logs unless explicitly required.

## Allowed Drafts

AI may draft:

- Studio messages.
- Notifications.
- Tasks.
- Parent updates.
- Teacher feedback.
- Shop descriptions.
- Event reminders.

All user-facing drafts require approval before sending or publishing.

## Audit Expectations

AI audit metadata should include:

- requesting user
- role
- studio
- provider
- action type
- target module
- approval status
- publish status
- timestamp

Do not log full sensitive private content by default.

## Provider Safety

OpenAI and Claude keys are server-only environment variables. Missing keys should produce a friendly development error instead of crashing the app. Provider failures should return clean retryable errors and may use mock fallback suggestions in development.
