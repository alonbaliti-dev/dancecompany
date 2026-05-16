# LK Student Space — Backend Architecture (Preparation)

This document describes how the frontend is structured for Supabase + PostgreSQL migration **without** connecting production backends yet.

## Layers

```
UI (components)
  → React contexts (lib/state/boundaries.ts)
  → lib/services/* (orchestration)
  → lib/database/repositories/* (interfaces)
  → Supabase client / Edge Functions
```

## Security

- **Never rely on hidden UI** — use `lib/security/permissions.ts`, `lib/security/enforce.ts`, and `lib/permissions.ts`.
- **Studio isolation** — every row has `studioId`; RLS enforces `studio_id = jwt.studio_id`.
- **Teachers** — filter by `assigned_groups` / `group_members`.
- **Students** — own profile + group-scoped resources only.
- **Super admin** — platform tables only; service role never in browser.

See also: `lib/security/ARCHITECTURE.md`, `docs/SECURITY_RLS_POLICIES.md`.

## Supabase mapping (planned)

| Domain | Tables (snake_case) | Realtime | Storage |
|--------|---------------------|----------|---------|
| Auth | `auth.users`, `profiles`, `user_permissions` | — | — |
| Tasks | `tasks`, `task_completions` | optional | — |
| Updates | `studio_updates`, `update_reads` | — | — |
| Notifications | `notifications` | yes | — |
| Chats | `group_chats`, `chat_messages` | yes | — |
| Gallery | `gallery_items` | — | bucket `gallery` |
| Events | `studio_events`, `event_achievements` | — | — |
| Shop | `shop_products`, `shop_orders` | — | — |
| Audit | `audit_logs` | — | — |
| Flags | `feature_flags` | — | — |

## Environment

Copy `.env.example` → `.env.local` and fill Supabase keys when ready.

Install (when wiring):

```bash
npm install @supabase/supabase-js @supabase/ssr
```

## Migration order

1. Auth + profiles + RLS base policies  
2. Groups, classes, roster  
3. Tasks + updates + notifications  
4. Gallery storage + signed URLs  
5. Chats realtime  
6. Events, achievements, shop  
7. Audit + feature flags  

## Mock → live switch

Set `NEXT_PUBLIC_USE_SUPABASE_DATA=true` (future) and implement repository adapters that call `getSupabaseBrowser()` instead of context seeds.
