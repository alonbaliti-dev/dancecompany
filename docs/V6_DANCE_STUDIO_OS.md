# V6 Dance Studio OS Foundation

V6 now models LK Student Space as a dance-studio operating system for ages 3-80, not as isolated screens.

## Local Prototype Tables

- `ageGroups`, `danceStyles`, `groups`
- `events`, `eventParticipants`, `eventGroups`, `eventChecklists`, `eventMedia`
- `galleryCollections`, `galleryItems`
- `achievements`, `legacyEntries`
- `showReadiness`, `competitionResults`

The local DB keeps backward-compatible group fields such as `ageGroup`, `danceStyle`, and `style`, while adding stable IDs such as `ageGroupId` and `danceStyleId`.

## Role Rules

- Young students are parent-visible by default.
- Adult groups, especially adult Flamenco, use direct communication and do not assume parent links.
- Teachers see assigned groups, calendar, rehearsals, attendance, and upload paths.
- Management sees the full calendar, readiness, missing approvals/costumes, gallery flow, and legacy structures.
- Super Admin sees data integrity and system health across the whole local DB.

## Content Integrity

Achievements and legacy are management-entered records. Seed data includes only neutral placeholders such as "מקום להישג שיוזן על ידי ההנהלה" and does not invent real wins, history, or awards.

AI remains suggestion-only. It may draft readiness/reminder/update ideas, but every AI surface requires human approval before any communication or publication.
