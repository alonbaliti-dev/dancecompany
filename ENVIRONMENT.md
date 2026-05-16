# Environment

Use `.env.local` for local secrets. Do not commit real secrets.

## Supabase

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

`NEXT_PUBLIC_SUPABASE_ANON_KEY` is safe in the browser only when row-level security is correctly configured. `SUPABASE_SERVICE_ROLE_KEY` must never be exposed to the client.

## AI Providers

```bash
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
AI_DEFAULT_PROVIDER=openai
AI_DEFAULT_MODEL=gpt-4o-mini
```

Provider keys are server-only. Do not prefix them with `NEXT_PUBLIC_`.

## App Environment

```bash
NEXT_PUBLIC_APP_ENV=development
```

Use `development`, `staging` or `production`.

## Local Files

Local uploads, temporary media and generated database backups are ignored by git. Keep production media in secure storage rather than the repository.
