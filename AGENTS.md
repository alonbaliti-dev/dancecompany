# AGENTS.md

## Cursor Cloud specific instructions

### Overview

LK Student Space is a mobile-first PWA for dance academies built with Next.js 16 (App Router), Tailwind CSS v4, TypeScript, and React. It uses a local JSON file-based database (`database/*.json` bundled into `public/fallback-bundle.json`) — no external database or services are needed for local development.

### Running the app

- **Dev server:** `npm run dev` — starts on `0.0.0.0:3000` via `scripts/dev-network.mjs`
- **Build:** `npm run build`
- **Health check:** `curl http://localhost:3000/api/health` returns `{"ok":true}`

### Known issues

- **Lint:** `npm run lint` calls `next lint`, which was removed in Next.js 16. There is no standalone ESLint config file (`eslint.config.mjs`) in the repo, so linting is currently non-functional. If linting is needed, create an `eslint.config.mjs` importing from `eslint-config-next`.
- The app uses many `"latest"` version specifiers in `package.json`. Dependency versions may shift between installs.

### Environment variables

No env vars are required for basic local development. Copy `.env.example` to `.env.local` for the template. Optional keys include `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, and Supabase credentials (not wired yet).

### Architecture quick reference

See `README.md` for the full architecture overview. Key directories:
- `app/` — Next.js routes and API endpoints
- `components/v6/` — active V6 product UI
- `lib/` — domain logic, state, AI, security
- `database/` — local JSON seed data

### Testing

No automated test framework is currently configured. Verify changes with `npm run build` (includes TypeScript checks). Manual testing via the browser at `http://localhost:3000`.
