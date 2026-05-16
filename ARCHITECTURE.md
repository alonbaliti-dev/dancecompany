# Architecture

LK Student Space V6 is organized as a layered product foundation.

## Layers

- Next.js App Router in `app/` handles pages and server routes.
- V6 UI in `components/v6/` renders the active product.
- V6 design system in `components/v6/design-system/` owns shared layout, surfaces, buttons, fields, sheets, bottom navigation and AI suggestion primitives.
- V6 screens in `components/v6/screens/` progressively replace the original monolith.
- V6 state in `lib/v6/AppProvider.tsx` remains the single write path during the local MVP stage.
- Domain logic in `lib/domains/` owns selectors, guards, operations, notification templates and audit helpers.
- Operational engines in `lib/engines/v6/` produce product intelligence for Home, Management, Super Admin and AI.
- AI infrastructure in `lib/ai/` owns providers, prompt governance, permissions, safety validation and mock agents.
- Local seed data in `database/` stands in for the future Supabase database.

## Production Direction

The target production backend is Supabase:

- Supabase Auth for identity.
- Supabase Postgres with row-level security for data isolation.
- Supabase Storage or compatible object storage for media.
- Vercel for hosting and server-side API routes.
- Firebase Cloud Messaging or OneSignal for push notifications.
- OpenAI and Claude through server-side API routes only.

## Non-Negotiables

- Sensitive operations must pass guards before writes.
- User-facing AI output must require approval.
- Important writes must produce audit metadata.
- API keys and service credentials must remain server-only.
- Mobile Hebrew RTL must remain centered, readable and touch-friendly.
