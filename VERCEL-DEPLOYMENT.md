# Vercel Deployment

This app can be prepared and tested from `develop` without merging to `main`.

## Connect the Repo

1. In Vercel, import the Git repository.
2. Keep the root directory as the repository root.
3. Use the Next.js framework preset.
4. Build command: `npm run build`.
5. Output directory: leave the Vercel default for Next.js.

## Branch Strategy

- Preview deployments: `develop` and pull request branches.
- Production deployments: `main` only.

In Vercel Project Settings -> Git, set the Production Branch to `main`. With that setting, pushes to `develop` create Preview deployments and do not update Production.

## Environment Variables

Set values per environment in Vercel Project Settings -> Environment Variables. Use safe placeholders locally and never commit real secrets.

### Required for the current app shell

```bash
NEXT_PUBLIC_APP_ENV=staging
NEXT_PUBLIC_ENABLE_DB_SYNC=false
```

Use `NEXT_PUBLIC_APP_ENV=production` only for the Production environment. Keep `NEXT_PUBLIC_ENABLE_DB_SYNC=false` on Vercel until a remote persistence layer is intentionally enabled.

### Supabase

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

`SUPABASE_SERVICE_ROLE_KEY` is server-only. Do not add a `NEXT_PUBLIC_` prefix.

Optional for migration/admin tooling:

```bash
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres
```

### AI Providers

```bash
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
AI_DEFAULT_PROVIDER=openai
AI_DEFAULT_MODEL=gpt-4o-mini
```

Provider keys are server-only. Configure at least the key for `AI_DEFAULT_PROVIDER` before testing AI completion routes.

### Optional Firebase / Notifications

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=000000000000
NEXT_PUBLIC_FIREBASE_APP_ID=1:000000000000:web:placeholder
```

Only set these when Firebase Auth, Firestore, Storage or notification work is enabled.

### Vercel Runtime

Vercel automatically sets `VERCEL=1`. The app uses it to disable local JSON writes in production. Do not set it manually.

## Verify a Preview Deployment

1. Push `develop` to the remote when ready.
2. Open the Vercel Preview deployment for `develop`.
3. Visit `/api/health` and confirm it returns OK JSON.
4. Open the app root and confirm login appears immediately without a blocking loader.
5. Confirm Super Admin export/import and local database write expectations: `POST /api/local-db/write` is disabled on Vercel production-like runtime.
6. Test AI only after the selected provider key is configured.

Before promoting any change, run locally:

```bash
npm run build
```

`npm run lint` currently uses `next lint`; verify the script before treating lint as a deployment gate on Next.js 16.

## Production Release

Do not deploy Production from `develop`. Merge through the normal review process into `main`; Vercel should deploy Production only from `main`.

## Rollback

Use the Vercel dashboard Deployment history to promote a previous healthy Production deployment, or use the CLI:

```bash
vercel rollback
vercel rollback <deployment-url-or-id>
```

For a validated Preview that should become Production without rebuilding:

```bash
vercel promote <deployment-url-or-id>
```

Only promote deployments from the reviewed Production branch policy.
