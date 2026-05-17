# Phase 5 Real Integrations Foundation

Phase 5 starts connecting LK Student Space to real services without replacing the stable local/demo product. The goal is readiness: safe server routes, typed adapters, health checks, env documentation and rollback paths.

## Integration Goals

- Confirm Supabase live project readiness while preserving local fallback.
- Use Cloudflare R2 as the production media object store through signed uploads.
- Prepare Israeli payment providers in sandbox mode: Tranzila, Cardcom and Grow/Meshulam.
- Prepare push notifications, email, SMS and WhatsApp without early prompts or live spam.
- Add secure webhook entry points that reject unsigned payloads.
- Give Super Admin a simple Hebrew health view for connection status.

## Services Needed

- Supabase Postgres/Auth for durable academy data, metadata and future auth.
- Cloudflare R2 for original media, product images, lesson media and event media.
- Payment provider sandbox account for Tranzila, Cardcom or Grow/Meshulam.
- Web Push/VAPID keys for browser push tests.
- Future messaging providers for email, SMS and WhatsApp.
- Vercel or equivalent environment variable management for local, preview and production.

## Environment Variables

Server-only variables must never be prefixed with `NEXT_PUBLIC_`.

```bash
AUTH_MODE=local_demo
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

CLOUDFLARE_R2_ACCOUNT_ID=
CLOUDFLARE_R2_ACCESS_KEY_ID=
CLOUDFLARE_R2_SECRET_ACCESS_KEY=
CLOUDFLARE_R2_BUCKET=academy-media
CLOUDFLARE_R2_PUBLIC_BASE_URL=

PAYMENT_PROVIDER=tranzila
PAYMENT_PROVIDER_PUBLIC_KEY=
PAYMENT_PROVIDER_SECRET_KEY=
PAYMENT_WEBHOOK_SECRET=
PAYMENT_TERMINAL_ID=
PAYMENT_SANDBOX=true

NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:ops@example.com

EMAIL_PROVIDER=
EMAIL_API_KEY=
EMAIL_SANDBOX=true
SMS_PROVIDER=
SMS_API_KEY=
SMS_SANDBOX=true
WHATSAPP_PROVIDER=
WHATSAPP_API_KEY=
WHATSAPP_SANDBOX=true

MEDIA_WEBHOOK_SECRET=
NOTIFICATION_WEBHOOK_SECRET=
```

## Security Risks

- Service role, R2, payment, VAPID private and provider API keys are server-only.
- Do not trust client price or product data; payment sessions resolve totals server-side.
- Do not store card numbers, CVV or full PAN anywhere in the app.
- RLS must be reviewed before remote Supabase rollout; do not rely on user-editable metadata for authorization.
- Webhooks must reject missing or invalid signatures.
- Media visibility must be enforced by academy, group, role and moderation state before broad UI wiring.
- Push permission must be requested only after a user action.

## Implementation Order

1. Keep Phase 1 UI and local demo boot stable.
2. Validate env and connection health via `/api/integrations/health`, guarded for Super Admin/dev.
3. Use existing Phase 2 Supabase migration `20260517180000_phase_2_backend_foundation.sql` for LK Studio and Alon Baliti Super Admin seed readiness.
4. Use `/api/media/create-upload-url`, direct R2 `PUT`, then `/api/media/complete-upload` for metadata.
5. Keep payment creation under `/api/payments/create-session`; sandbox providers only.
6. Process verified payment webhooks through `/api/payments/webhook` or `/api/webhooks/payments`.
7. Add push subscription and preference storage placeholders before live sending.
8. Add provider abstractions for email, SMS and WhatsApp; default to no-op/sandbox.
9. Expose simple Hebrew integration status only in the Super Admin surface.

## Testing Strategy

- Run `npm run lint`, `npm run typecheck` and `npm run build`.
- With no env vars, the app must boot and show missing statuses rather than crashing.
- With Supabase env vars, `/api/integrations/health` performs a short read-only `academies` check.
- With missing R2, signed upload route returns `local_demo`.
- With R2 configured, signed upload route returns a short-lived signed `PUT` URL.
- Payment session route must reject missing provider config and client amount mismatch.
- Webhook routes must reject missing/invalid signatures.
- Push helpers must not request permission on app load.

## Rollback Strategy

- Remove or disable Phase 5 env vars to return to local/demo behavior.
- Keep `AUTH_MODE=local_demo` until Supabase Auth rollout is explicitly approved.
- Leave `PAYMENT_SANDBOX=true` until a live payment review is complete.
- Keep UI domain wiring local until each repository adapter is verified.
- If R2 fails, stop using signed upload responses and keep local preview/demo behavior.

## Production Checklist

- Supabase project migrated and reviewed, including RLS and Super Admin access.
- LK Studio academy and Alon Baliti Super Admin seed verified.
- R2 bucket, CORS, lifecycle rules and public/private URL policy reviewed.
- Payment provider contract, sandbox credentials and webhook signatures verified.
- Webhook idempotency and durable transaction tables added before live charging.
- Push subscription and notification preference tables applied.
- Messaging provider templates approved for parent updates, event reminders, urgent alerts and payment confirmations.
- All secrets stored in environment/secret manager only.
- Super Admin health panel shows expected statuses in preview.
- No production deployment or provider live mode until manual approval.
