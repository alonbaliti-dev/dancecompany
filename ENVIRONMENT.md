# Environment

Use `.env.local` for local secrets. In Vercel, set the same values under Project Settings -> Environment Variables. Do not commit real secrets.

## Supabase

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
# Server only; do not expose to browser code.
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

`NEXT_PUBLIC_SUPABASE_ANON_KEY` is safe in the browser only when row-level security is correctly configured. `SUPABASE_SERVICE_ROLE_KEY` must never be exposed to the client.

Optional for migrations/admin scripts only:

```bash
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres
```

## AI Providers

```bash
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
AI_DEFAULT_PROVIDER=openai
AI_DEFAULT_MODEL=gpt-4o-mini
```

Provider keys are server-only. Do not prefix them with `NEXT_PUBLIC_`. `AI_DEFAULT_PROVIDER` must be `openai` or `anthropic`.

## App Environment

```bash
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_ENABLE_DB_SYNC=false
NEXT_PUBLIC_USE_SUPABASE_DATA=false
```

Use `development`, `staging` or `production` for `NEXT_PUBLIC_APP_ENV`. Keep `NEXT_PUBLIC_ENABLE_DB_SYNC=false` on Vercel until remote persistence is intentionally deployed; production otherwise uses the bundled database. `NEXT_PUBLIC_USE_SUPABASE_DATA` is a planned switch for future Supabase adapters.

Vercel automatically provides `VERCEL=1` at runtime. Do not set it manually.

## Firebase / Notifications

Firebase is prepared for future Auth, Firestore, Storage and notification work. Add these only when that integration is enabled:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=000000000000
NEXT_PUBLIC_FIREBASE_APP_ID=1:000000000000:web:placeholder
```

## Local Files

Local uploads, temporary media and generated database backups are ignored by git. Keep production media in secure storage rather than the repository.
