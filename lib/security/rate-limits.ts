/**
 * Rate limiting & abuse prevention — architecture (mock counters).
 *
 * Production: implement with Redis / Upstash / Supabase Edge + sliding window.
 *
 * | Endpoint / action        | Suggested limit        |
 * |--------------------------|------------------------|
 * | login (per IP + phone)   | 5 / 15 min, lockout 30m|
 * | password reset           | 3 / hour per phone     |
 * | chat message             | 30 / min per user      |
 * | notification broadcast   | 10 / hour per teacher|
 * | gallery upload           | 20 / day per user      |
 * | admin permission change  | 50 / hour per studio   |
 * | data export request      | 2 / day per studio     |
 */

export const RATE_LIMITS = {
  login: { max: 5, windowMs: 15 * 60 * 1000 },
  passwordReset: { max: 3, windowMs: 60 * 60 * 1000 },
  chatMessage: { max: 30, windowMs: 60 * 1000 },
  notificationSend: { max: 10, windowMs: 60 * 60 * 1000 },
  upload: { max: 20, windowMs: 24 * 60 * 60 * 1000 },
  adminAction: { max: 50, windowMs: 60 * 60 * 1000 },
  dataExport: { max: 2, windowMs: 24 * 60 * 60 * 1000 }
} as const;

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export type RateLimitKey = keyof typeof RATE_LIMITS;

export function checkRateLimit(key: string, limitKey: RateLimitKey): { allowed: true } | { allowed: false; retryAfterMs: number } {
  const rule = RATE_LIMITS[limitKey];
  const now = Date.now();
  const bucketKey = `${limitKey}:${key}`;
  let b = buckets.get(bucketKey);
  if (!b || now >= b.resetAt) {
    b = { count: 0, resetAt: now + rule.windowMs };
    buckets.set(bucketKey, b);
  }
  if (b.count >= rule.max) {
    return { allowed: false, retryAfterMs: b.resetAt - now };
  }
  b.count += 1;
  return { allowed: true };
}

export function resetRateLimit(key: string, limitKey: RateLimitKey): void {
  buckets.delete(`${limitKey}:${key}`);
}
