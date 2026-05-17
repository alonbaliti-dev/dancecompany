# Pilot Feedback Log

Use this log during Phase 7 real user QA. Keep entries factual, one issue per entry, and do not invent feedback. Leave `Fix commit` empty until a real fix is committed later.

Severity reference:

- P0: App unusable, login broken, data loss, permission leak, payment/security issue.
- P1: Core flow broken: attendance, user editing, product editing, media upload, messages.
- P2: Important UX issue: confusing flow, bad RTL, clipping, missing feedback.
- P3: Polish issue: spacing, wording, visual refinement.

Statuses:

- New
- Triaged
- In progress
- Fixed
- Retesting
- Verified
- Deferred
- Duplicate
- Won't fix

## Feedback Table

| Date | Tester role | Device | Browser | Issue | Severity | Screenshot/video link | Reproduction steps | Expected behavior | Actual behavior | Status | Fix commit |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |  |  |  |  |  |  |

## Repeatable Entry Template

### Entry

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

## Device Matrix

Required:

- iPhone Safari:
- Android Chrome, if possible:
- Desktop Chrome:
- iPad Safari, if possible:

Network checks:

- Wi-Fi:
- Cellular:
- Weak internet, if possible:

## Pilot Notes

- Do not add random features from pilot feedback.
- Fix P0/P1 first.
- Batch P2/P3 improvements.
- Keep fixes small.
- Run `npm run build` after every fix.
- Document every retest result.
