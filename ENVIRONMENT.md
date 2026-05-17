# Environment

Use `.env.local` for local secrets. In Vercel, set the same values under Project Settings -> Environment Variables. Do not commit real secrets.

## Supabase

```bash
AUTH_MODE=local_demo
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
# Server only; do not expose to browser code.
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

`AUTH_MODE` must be `local_demo` or `supabase`. Keep `local_demo` as the safe default until Supabase Auth is intentionally enabled. `NEXT_PUBLIC_SUPABASE_ANON_KEY` is safe in the browser only when row-level security is correctly configured. `SUPABASE_SERVICE_ROLE_KEY` must never be exposed to the client.

Optional for migrations/admin scripts only:

```bash
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres
```

Local Supabase structure lives under `supabase/`:

- `supabase/config.toml` is local-only project configuration for CLI validation and local database resets.
- `supabase/migrations/20260517180000_phase_2_backend_foundation.sql` creates the academy-aware schema with RLS enabled.
- `supabase/seed.sql` idempotently seeds LK Studio and the Alon Baliti Super Admin profile without passwords or secrets.

The seed intentionally does not create a Supabase Auth password. After creating the local Auth user in Supabase Studio/Auth, bind the generated UUID manually:

```sql
update public.users_profile
set auth_user_id = '<local-auth-user-uuid>'::uuid,
    email = 'alon@example.com'
where id = 'alon';
```

Do not commit real emails, passwords, access tokens, refresh tokens or service-role keys.

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

## Environment Scopes

- Local: use `.env.local`, keep `AUTH_MODE=local_demo` unless explicitly testing Supabase, and expect missing-service health statuses.
- Preview: set sandbox/test provider values only. Do not enable live payment or messaging sends.
- Production: set only reviewed secrets in the platform environment manager. Do not launch production integrations until migrations, RLS, webhook verification and rollback are approved.

## Cloudflare R2 Media

Cloudflare R2 is the long-term production media store for academy photos, videos, product images, lesson memories, event galleries, competition archives, annual show media and legacy content. Supabase/Postgres should store metadata and permissions; R2 stores the files.

```bash
CLOUDFLARE_R2_ACCOUNT_ID=your-account-id
CLOUDFLARE_R2_ACCESS_KEY_ID=your-r2-access-key-id
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
CLOUDFLARE_R2_BUCKET=academy-media
CLOUDFLARE_R2_PUBLIC_BASE_URL=https://media.example.com
```

`CLOUDFLARE_R2_ACCESS_KEY_ID` and `CLOUDFLARE_R2_SECRET_ACCESS_KEY` are server-only. Never prefix them with `NEXT_PUBLIC_`. Public URLs are only for approved public, shop, event, competition, annual-show or legacy media; private group, student and lesson media must use signed URLs.

The Phase 2 signed-upload routes are `/api/media/create-upload-url`, `/api/media/complete-upload` and `/api/media/list`. Missing R2 credentials return demo-only metadata responses. When R2 is configured, upload URLs are signed in trusted server code; clients never receive R2 secrets.

## Payments

```bash
PAYMENT_PROVIDER=tranzila
PAYMENT_PROVIDER_PUBLIC_KEY=provider-public-or-merchant-id
PAYMENT_PROVIDER_SECRET_KEY=provider-secret-from-secret-manager
PAYMENT_WEBHOOK_SECRET=shared-webhook-hmac-secret
PAYMENT_TERMINAL_ID=provider-terminal-id
PAYMENT_SANDBOX=true
```

`PAYMENT_PROVIDER` must be `tranzila`, `cardcom` or `grow_meshulam`. All payment creation happens in server routes; never prefix `PAYMENT_PROVIDER_SECRET_KEY` or `PAYMENT_WEBHOOK_SECRET` with `NEXT_PUBLIC_`. The client never stores credit card data, and webhook status changes are rejected unless `PAYMENT_WEBHOOK_SECRET` is configured and the HMAC signature is valid.

Payment endpoints:

- `/api/payments/create-session` creates a sandbox hosted-session response after resolving price server-side.
- `/api/payments/webhook` and `/api/webhooks/payments` accept provider callbacks only with a valid HMAC signature.
- `/api/payments/status` is read-only and never marks a payment as paid.

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

## Browser Push

Push is prepared without asking users for permission on load. Request permission only after a deliberate user action.

```bash
NEXT_PUBLIC_VAPID_PUBLIC_KEY=public-web-push-key
VAPID_PRIVATE_KEY=private-web-push-key
VAPID_SUBJECT=mailto:ops@example.com
```

`NEXT_PUBLIC_VAPID_PUBLIC_KEY` is the only push key that may be public. `VAPID_PRIVATE_KEY` is server-only. The service worker is `public/lk-push-sw.js`; subscription storage is prepared through `/api/notifications/push/subscribe`.

## Email / SMS / WhatsApp

These are provider abstractions only. Defaults are no-op/sandbox and must not send live messages until templates and consent rules are approved.

```bash
EMAIL_PROVIDER=
EMAIL_API_KEY=
EMAIL_SANDBOX=true
SMS_PROVIDER=twilio
SMS_API_KEY=
SMS_SANDBOX=true
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_FROM_NUMBER=+1xxxxxxxxxx
# Or use a Messaging Service instead of a direct From number:
TWILIO_MESSAGING_SERVICE_SID=
WHATSAPP_PROVIDER=
WHATSAPP_API_KEY=
WHATSAPP_SANDBOX=true
```

SMS OTP login uses Twilio through trusted server routes only. Normal users see a studio phone-code login, not Supabase email/password. Keep `SMS_SANDBOX=true` until a live Twilio sender is approved; set it to `false` only when you are ready to send real SMS. Future studio/parent notifications can reuse the same server-side SMS provider abstraction for parent updates, event reminders, urgent alerts and payment confirmations.

## Webhooks

```bash
MEDIA_WEBHOOK_SECRET=
NOTIFICATION_WEBHOOK_SECRET=
```

Webhook routes reject unsigned payloads when their secret is missing or the signature is invalid:

- `/api/webhooks/payments`
- `/api/webhooks/media`
- `/api/webhooks/notifications`

Only safe metadata is logged or returned. Secrets, card fields and tokens are filtered out.

## Integration Health

Super Admin can view integration status from V6 More -> ניהול -> חיבורים. The guarded route is `/api/integrations/health`; it reports `מחובר`, `חסר`, `בדיקה נכשלה`, `מצב בדיקה` or `כבוי` without exposing secret values.

## Local Files

Local uploads, temporary media and generated database backups are ignored by git. Keep production media in secure storage rather than the repository.
