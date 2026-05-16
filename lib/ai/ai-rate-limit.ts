import type { AIActionType, AIRequestContext } from "./ai-types";

export type AIRateLimitDecision =
  | { ok: true; remaining: number; resetAt: string; override: boolean }
  | { ok: false; code: "ai_rate_limited"; message: string; status: 429; remaining: 0; resetAt: string; override: false };

export type AIRateLimitStore = {
  hit: (key: string, windowMs: number) => { count: number; resetAt: number };
};

const memoryBuckets = new Map<string, { count: number; resetAt: number }>();

export const memoryAIRateLimitStore: AIRateLimitStore = {
  hit(key, windowMs) {
    const now = Date.now();
    const current = memoryBuckets.get(key);
    if (!current || current.resetAt <= now) {
      const next = { count: 1, resetAt: now + windowMs };
      memoryBuckets.set(key, next);
      return next;
    }

    current.count += 1;
    return current;
  }
};

const limits = {
  user: { max: 20, windowMs: 60 * 60 * 1000 },
  studio: { max: 120, windowMs: 60 * 60 * 1000 },
  action: { max: 12, windowMs: 15 * 60 * 1000 }
};

export function checkAIRateLimit(input: {
  context: AIRequestContext;
  actionType: AIActionType;
  store?: AIRateLimitStore;
}): AIRateLimitDecision {
  if (input.context.currentUser.role === "super_admin") {
    return { ok: true, remaining: Number.POSITIVE_INFINITY, resetAt: new Date(Date.now()).toISOString(), override: true };
  }

  const store = input.store ?? memoryAIRateLimitStore;
  const keys = [
    { key: `user:${input.context.currentUser.id}`, limit: limits.user },
    { key: `studio:${input.context.studioId}`, limit: limits.studio },
    { key: `action:${input.context.currentUser.id}:${input.actionType}`, limit: limits.action }
  ];

  let remaining = Number.POSITIVE_INFINITY;
  let resetAt = Date.now();

  for (const item of keys) {
    const bucket = store.hit(item.key, item.limit.windowMs);
    remaining = Math.min(remaining, Math.max(item.limit.max - bucket.count, 0));
    resetAt = Math.max(resetAt, bucket.resetAt);

    if (bucket.count > item.limit.max) {
      return {
        ok: false,
        code: "ai_rate_limited",
        message: "AI request limit reached. Please retry later.",
        status: 429,
        remaining: 0,
        resetAt: new Date(bucket.resetAt).toISOString(),
        override: false
      };
    }
  }

  return { ok: true, remaining, resetAt: new Date(resetAt).toISOString(), override: false };
}
