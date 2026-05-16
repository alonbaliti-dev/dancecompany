# Rate Limiting & Abuse Prevention

Client mock counters live in `lib/security/rate-limits.ts`.  
**Production:** enforce at API gateway / Edge Function with Redis or Upstash.

| Action | Limit | Key |
|--------|-------|-----|
| Login | 5 / 15 min | IP + normalized phone |
| Password reset | 3 / hour | phone |
| Chat message | 30 / min | `user_id` |
| Notification send | 10 / hour | `user_id` |
| Media upload | 20 / day | `user_id` |
| Admin permission change | 50 / hour | `studio_id` |
| Data export | 2 / day | `studio_id` |

On exceed: HTTP 429 with `Retry-After`. Log repeated abuse to `audit_logs` (severity `warning`).
