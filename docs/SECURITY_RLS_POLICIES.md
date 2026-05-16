# Supabase Row Level Security (RLS) — Policy Drafts

LK Student Space is multi-tenant: every studio-scoped row includes `studio_id`.  
Apply RLS on **all** tables below. Super-admin cross-studio operations use **service role** only on the server.

JWT custom claims (recommended):

- `studio_id`
- `role`: `student` | `teacher` | `management` | `super_admin`
- `user_id` (= `auth.uid()`)

---

## `users` / `profiles`

| Role | SELECT | INSERT | UPDATE | DELETE |
|------|--------|--------|--------|--------|
| Student | Own row | — | Own row (limited columns) | — |
| Teacher | Own + students in assigned groups | — | Own row | — |
| Management | All in `studio_id` | Invite via server | All in studio | Soft-disable via server |
| Super admin | Service role only | Service role | Service role | Service role |

```sql
-- Example: student reads self
create policy "profiles_select_own" on profiles
  for select using (auth.uid() = id);

-- Example: management reads studio
create policy "profiles_select_studio" on profiles
  for select using (
    studio_id = (auth.jwt() ->> 'studio_id')::uuid
    and (auth.jwt() ->> 'role') in ('management', 'teacher')
  );
```

---

## `groups` / `group_members`

| Role | Access |
|------|--------|
| Student | Groups they belong to (`group_members.user_id = auth.uid()`) |
| Teacher | Groups where `group_members.role = teacher` and `user_id = auth.uid()` |
| Management | All groups in `studio_id` |
| Super admin | Service role |

```sql
create policy "groups_select_member" on groups
  for select using (
    studio_id = (auth.jwt() ->> 'studio_id')::uuid
    and exists (
      select 1 from group_members gm
      where gm.group_id = groups.id and gm.user_id = auth.uid()
    )
  );
```

---

## `tasks`

| Role | SELECT | INSERT/UPDATE |
|------|--------|----------------|
| Student | Assigned (personal / group / studio scope) | Progress updates only |
| Teacher | Assigned groups + created tasks | Create/edit for assigned groups |
| Management | All in studio | Full |
| Super admin | Service role | Service role |

Restrict `studio_id` on all policies. Students cannot change `assigned_group_ids` or `created_by`.

---

## `notifications`

| Role | SELECT | INSERT |
|------|--------|--------|
| Student | Targeted to self / group / studio broadcast | — |
| Teacher | Sent + received in scope | Assigned groups/students only |
| Management | Studio-wide | Studio-wide |
| Super admin | Platform admins via server | Server only |

**Read receipts:** store in `notification_reads (notification_id, user_id, read_at)` — users see only their own row; senders/management use aggregated view via RPC.

---

## `chat_messages` / `group_chats`

| Role | SELECT | INSERT | UPDATE/DELETE |
|------|--------|--------|----------------|
| Student | Member of dance group chat only; **no staff chat** | Own messages in member chats | Own message edit window (optional) |
| Teacher | Assigned groups + staff chat | Same | Moderate assigned groups |
| Management | All studio chats | All | Moderate all studio |
| Super admin | Audit via server | — | — |

```sql
-- Students cannot see staff chat
create policy "chat_messages_select_student" on chat_messages
  for select using (
    exists (
      select 1 from group_chats gc
      join group_members gm on gm.group_id = gc.group_id
      where gc.id = chat_messages.group_chat_id
        and gc.chat_type = 'dance_group'
        and gm.user_id = auth.uid()
    )
  );
```

No student-to-student DM table — only group channels.

---

## `gallery_items`

| Role | SELECT | INSERT/UPDATE |
|------|--------|----------------|
| Student | Visibility = group / specific students | — |
| Teacher | Staff + assigned student content | Create with visibility rules |
| Management | All in studio | Full |
| Super admin | Service role | Service role |

Storage objects must match `gallery_items.storage_path` and `studio_id`.

---

## `events` (legacy board)

| Role | SELECT | WRITE |
|------|--------|-------|
| Student | Studio + published | — |
| Teacher | Studio | Assigned groups if allowed |
| Management | Studio | Full |
| Super admin | Service role | Service role |

---

## `attendance`

| Role | SELECT | WRITE |
|------|--------|-------|
| Student | Own sessions | — |
| Teacher | Assigned groups | Mark for assigned sessions |
| Management | Studio | Full |

---

## `audit_logs`

| Role | SELECT | INSERT |
|------|--------|--------|
| Student | — | — |
| Teacher | — | — |
| Management | `studio_id` match | Server trigger / Edge Function |
| Super admin | Service role (platform) | Service role |

**Never** allow client INSERT with arbitrary `actor_user_id` — use `auth.uid()` in trigger.

```sql
create policy "audit_select_management" on audit_logs
  for select using (
    studio_id = (auth.jwt() ->> 'studio_id')::uuid
    and (auth.jwt() ->> 'role') = 'management'
  );
```

---

## Storage buckets

- Private bucket per studio: `studio-{studio_id}-media`
- Policies on `storage.objects` check `studio_id` path prefix + gallery/chat ownership
- Signed URLs for read; upload only with `authenticated` + size/MIME checks in Edge Function

---

## Testing RLS

1. Use Supabase SQL editor with `set request.jwt.claims` to impersonate roles.
2. Verify students cannot `select` from staff chat or other studios.
3. Verify teachers cannot update users outside assigned groups.

See also: `docs/SECURITY_RATE_LIMITS.md`, `lib/security/ARCHITECTURE.md`.
