import "server-only";

import crypto from "crypto";

export type WebhookVerificationResult =
  | { ok: true }
  | { ok: false; status: 400 | 401 | 503; error: "webhook_secret_missing" | "signature_missing" | "invalid_signature" };

export function verifyHmacWebhook(rawBody: string, signature: string | null, secretEnvName: string): WebhookVerificationResult {
  const secret = process.env[secretEnvName]?.trim();
  if (!secret) return { ok: false, status: 503, error: "webhook_secret_missing" };
  if (!signature) return { ok: false, status: 401, error: "signature_missing" };

  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const left = Buffer.from(signature, "utf8");
  const right = Buffer.from(expected, "utf8");
  if (left.length !== right.length || !crypto.timingSafeEqual(left, right)) {
    return { ok: false, status: 401, error: "invalid_signature" };
  }

  return { ok: true };
}

export function safeWebhookMetadata(payload: Record<string, unknown>) {
  const blocked = /secret|token|authorization|password|card|pan|cvv|cvc/i;
  return Object.fromEntries(
    Object.entries(payload)
      .filter(([key, value]) => !blocked.test(key) && ["string", "number", "boolean"].includes(typeof value))
      .slice(0, 20)
  );
}
