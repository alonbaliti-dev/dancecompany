# LK Student Space

LK Student Space is a premium mobile-first operating system for dance academies and performing arts schools. It combines academy-aware communication, lessons, attendance, private lessons, shop, media, events, management operations, Super Admin controls, and a governed AI assistance layer in a Hebrew RTL experience.

## V6 Philosophy

V6 is the clean production foundation. The product should feel like a calm, high-end native app: centered on mobile, compact, role-aware, database-driven, operationally useful, and safe by design.

The current local JSON database is the MVP/prototype data layer. Production is intended to move toward Supabase Postgres/Auth/Realtime, Cloudflare R2 signed media storage, Vercel hosting, Firebase Cloud Messaging or OneSignal notifications, and server-side OpenAI/Claude APIs.

The platform owner and global Super Admin is Alon Baliti / אלון בליטי. The first active academy is LK Studio by Liat Kaplinski in כפר ויתקין, ישראל. The local V6 model keeps `studioId` as the current academy scope and introduces `academyId` as the forward production naming.

## Target Stack

- IDE: Cursor
- Frontend: Next.js, Tailwind CSS, shadcn/ui
- Backend and DB: Supabase
- Auth: Supabase Auth
- Media: Cloudflare R2 with signed URLs and Supabase metadata
- Hosting: Vercel
- Notifications: Firebase Cloud Messaging or OneSignal
- AI: OpenAI API and Claude API, server-side only

## Run Locally

```bash
npm install
npm run dev
```

Build verification:

```bash
npm run build
```

## Deployment

Use `develop` for Vercel Preview deployments and keep Production deployments on `main`. See `VERCEL-DEPLOYMENT.md` for the branch setup, required environment variables, verification checklist and rollback procedure.

## Post-Deploy Verification

Before promoting or accepting a deployment, run the production readiness and Vercel smoke-test checklist in `DEPLOYMENT-QA.md`.

## Environment

Copy `.env.example` to `.env.local` and fill only the values needed for your environment.

Required or planned variables include:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` server-only
- `OPENAI_API_KEY` server-only
- `ANTHROPIC_API_KEY` server-only
- `AI_DEFAULT_PROVIDER`
- `AI_DEFAULT_MODEL`
- `NEXT_PUBLIC_APP_ENV`
- `NEXT_PUBLIC_ENABLE_DB_SYNC`
- `CLOUDFLARE_R2_ACCOUNT_ID` server-only
- `CLOUDFLARE_R2_ACCESS_KEY_ID` server-only
- `CLOUDFLARE_R2_SECRET_ACCESS_KEY` server-only
- `CLOUDFLARE_R2_BUCKET`
- `CLOUDFLARE_R2_PUBLIC_BASE_URL`

Never expose service role keys, R2 secrets, payment secrets, or AI provider keys with a `NEXT_PUBLIC_` prefix.

## Architecture Overview

- `app/` contains Next.js routes and API endpoints.
- `components/v6/` contains the active V6 product UI.
- `components/v6/design-system/` contains shared V6 shell, surfaces, buttons, fields, sheets, AI suggestion primitives, and tokens.
- `components/v6/screens/` contains extracted role-aware V6 screens.
- `lib/v6/` contains V6 app state, seed database and core types.
- `lib/r2/` contains the Cloudflare R2 media storage foundation and safe placeholder signing helpers.
- `lib/domains/` contains domain selectors, guards, operations, notifications and audit helpers.
- `lib/engines/v6/` contains operational intelligence such as attendance risk, event readiness, management health, media visibility and audit summaries.
- `lib/ai/` contains AI agents, provider abstraction, safety, permissions and prompt governance.
- `database/` contains local MVP JSON seed data and editable prompt templates.

## Documentation

- `ARCHITECTURE.md`
- `AI-SAFETY.md`
- `DEPLOYMENT-QA.md`
- `ENVIRONMENT.md`
- `VERCEL-DEPLOYMENT.md`
- `CONTRIBUTING.md`
- `PRODUCT_BRIEF.md`
- `RUN_AND_DEPLOY.md`
- `docs/MULTI_ACADEMY_ARCHITECTURE.md`
- `docs/CLOUDFLARE_R2_MEDIA_ARCHITECTURE.md`
- `docs/SUPABASE_MIGRATION_PLAN.md`
- `docs/PRODUCTION_ROADMAP.md`
