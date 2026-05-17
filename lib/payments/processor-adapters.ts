import crypto from "crypto";
import type {
  CreatePaymentIntentRequest,
  CreatePaymentIntentResponse,
  PaymentMethod,
  PaymentProcessorProvider,
  PaymentProviderConfig,
  PaymentStatus
} from "./types";

const METHODS_BY_PROCESSOR: Record<PaymentProcessorProvider, PaymentMethod[]> = {
  tranzila: ["credit_card", "apple_pay", "google_pay", "bit"],
  cardcom: ["credit_card", "apple_pay", "google_pay", "bit"],
  grow_meshulam: ["credit_card", "apple_pay", "google_pay", "bit", "paybox"]
};

export function getPaymentProviderConfig(academyId: string): PaymentProviderConfig | null {
  const provider = process.env.PAYMENT_PROVIDER as PaymentProcessorProvider | undefined;
  if (!provider || !METHODS_BY_PROCESSOR[provider]) return null;

  return {
    academyId,
    provider,
    terminalId: process.env.PAYMENT_TERMINAL_ID,
    merchantId: process.env.PAYMENT_PROVIDER_PUBLIC_KEY,
    publicConfig: {
      sandbox: String(process.env.PAYMENT_SANDBOX ?? "true")
    },
    secretConfigReference: "PAYMENT_PROVIDER_SECRET_KEY",
    enabledMethods: METHODS_BY_PROCESSOR[provider],
    isActive: true
  };
}

export function assertServerPaymentConfig(config: PaymentProviderConfig | null):
  | { ok: true; config: PaymentProviderConfig }
  | { ok: false; error: string } {
  if (!config) return { ok: false, error: "payment_provider_not_configured" };
  if (!process.env.PAYMENT_PROVIDER_SECRET_KEY) return { ok: false, error: "payment_provider_secret_missing" };
  if (!process.env.PAYMENT_TERMINAL_ID) return { ok: false, error: "payment_terminal_missing" };
  return { ok: true, config };
}

export function buildProviderHostedSession(
  req: CreatePaymentIntentRequest,
  config: PaymentProviderConfig
): Pick<CreatePaymentIntentResponse, "clientSecret" | "redirectUrl" | "pollUrl"> {
  const sandbox = process.env.PAYMENT_SANDBOX !== "false";
  const encodedOrder = encodeURIComponent(req.orderId);
  const redirectUrl = sandbox
    ? `/payments/sandbox/${config.provider}?orderId=${encodedOrder}`
    : undefined;

  if (req.provider === "bit" || req.provider === "paybox") {
    return {
      redirectUrl: redirectUrl ?? `/api/payments/status?orderId=${encodedOrder}`,
      pollUrl: `/api/payments/status?transactionId=${encodedOrder}&academyId=${encodeURIComponent(config.academyId)}`
    };
  }

  return {
    clientSecret: sandbox ? `sandbox_${config.provider}_${req.orderId}` : undefined,
    redirectUrl
  };
}

export function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.PAYMENT_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const left = Buffer.from(signature, "utf8");
  const right = Buffer.from(expected, "utf8");
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

export function parseSafeWebhookPayload(rawBody: string):
  | {
      provider: PaymentMethod;
      providerReference: string;
      status: PaymentStatus;
      orderId: string;
      safeMetadata: Record<string, string | number | boolean | null>;
    }
  | null {
  const parsed = JSON.parse(rawBody) as Record<string, unknown>;
  const providerReference = String(parsed.providerTransactionId ?? parsed.providerReference ?? parsed.transactionId ?? "");
  const orderId = String(parsed.orderId ?? parsed.OrderId ?? "");
  const provider = normalizePaymentMethod(parsed.provider ?? parsed.method);
  const status = normalizeWebhookStatus(parsed.status);

  if (!providerReference || !orderId || !provider || !status) return null;

  return {
    provider,
    providerReference,
    orderId,
    status,
    safeMetadata: sanitizeWebhookMetadata(parsed)
  };
}

function normalizePaymentMethod(input: unknown): PaymentMethod | null {
  const value = String(input ?? "").toLowerCase();
  if (["credit_card", "card", "cc"].includes(value)) return "credit_card";
  if (value === "apple_pay") return "apple_pay";
  if (value === "google_pay") return "google_pay";
  if (value === "bit") return "bit";
  if (value === "paybox") return "paybox";
  return null;
}

function normalizeWebhookStatus(input: unknown): PaymentStatus | null {
  const value = String(input ?? "").toLowerCase();
  if (["paid", "success", "approved", "completed", "captured"].includes(value)) return "paid";
  if (["pending", "created", "processing"].includes(value)) return "pending";
  if (["failed", "declined", "error"].includes(value)) return "failed";
  if (["cancelled", "canceled", "voided"].includes(value)) return "cancelled";
  if (["refunded", "refund"].includes(value)) return "refunded";
  return null;
}

function sanitizeWebhookMetadata(payload: Record<string, unknown>) {
  const blocked = /card|pan|cvv|cvc|secret|token|authorization|password/i;
  return Object.fromEntries(
    Object.entries(payload)
      .filter(([key, value]) => !blocked.test(key) && ["string", "number", "boolean"].includes(typeof value))
      .slice(0, 20)
  ) as Record<string, string | number | boolean | null>;
}
