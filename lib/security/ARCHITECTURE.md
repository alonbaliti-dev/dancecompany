# Security Architecture (Mock → Supabase)

## Layers

1. **Authentication** — Supabase Auth (phone/password). Session JWT + `profiles` row.
2. **Authorization** — `lib/security/permissions.ts` guards + RLS on every table.
3. **Studio isolation** — `studio_id` on all tenant rows; `lib/security/studio-isolation.ts`.
4. **Storage** — private buckets, signed URLs, MIME/size limits (`lib/security/storage.ts`).
5. **Chat safety** — group-only, staff hidden, content filter placeholder (`lib/security/chat-safety.ts`).
6. **Audit** — `createAuditLog()` → `audit_logs` via server (`lib/security/audit.ts`).
7. **Rate limits** — Edge/API (`lib/security/rate-limits.ts`, `docs/SECURITY_RATE_LIMITS.md`).

## Client rules

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are safe **with RLS enabled**.
- `SUPABASE_SERVICE_ROLE_KEY` — **server only** (Edge Functions, CI migrations). Never in Next.js client bundle.
- No passwords in `UserProfile` or session storage.
- No `dangerouslySetInnerHTML` for user content; use `sanitizeDisplayText()`.

## Session model

See `lib/security/session.ts` — fields: `userId`, `studioId`, `permissions`, `issuedAt`, `expiresAt`.

## Next steps for Supabase

1. Enable RLS on all tables per `docs/SECURITY_RLS_POLICIES.md`.
2. Replace `auth-client` mock with `@supabase/supabase-js` auth.
3. Move notification recipient resolution to Edge Function.
4. Wire `appendAudit` to `audit_logs` insert trigger + service role for admin tools.
