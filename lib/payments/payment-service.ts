/**
 * Payment service — client entry point for secure checkout.
 *
 * ARCHITECTURE (production):
 *   Frontend (this app)
 *     → POST /api/payments/create-session (no card data, amount resolved server-side)
 *     → PSP / wallet UI (Tranzila/Cardcom/Grow hosted page or wallet app)
 *     → POST /api/payments/webhook        (PSP confirms)
 *     → DB: orders + payment_transactions
 *     → GET  /api/payments/status         (optional poll for Bit/PayBox)
 *
 * NEVER store or transmit full card numbers from React state.
 */

import type {
  CreatePaymentIntentRequest,
  CreatePaymentIntentResponse,
  ManualOfficePaymentRequest,
  PaymentAuditAction,
  PaymentAuditEntry,
  PaymentProvider,
  PaymentStatus,
  PaymentTransaction,
  RefundPaymentRequest,
  VerifyPaymentRequest
} from "./types";
import { getPaymentProvider } from "./providers";
import {
  assertServerPaymentConfig,
  buildProviderHostedSession,
  getPaymentProviderConfig
} from "./processor-adapters";
import { resolvePaymentOrderDraft } from "./order-resolution";

function newId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/** In-memory store for demo — replace with Supabase `payment_transactions` in production. */
const transactionStore = new Map<string, PaymentTransaction>();
const auditStore: PaymentAuditEntry[] = [];

export function listPaymentAuditsForOrder(orderId: string): PaymentAuditEntry[] {
  return auditStore.filter((a) => a.orderId === orderId).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

export function getStoredTransaction(id: string): PaymentTransaction | undefined {
  return transactionStore.get(id);
}

export function getStoredTransactionByOrder(orderId: string, academyId?: string): PaymentTransaction | undefined {
  return [...transactionStore.values()].find((tx) => tx.orderId === orderId && (!academyId || tx.academyId === academyId));
}

export function recordPaymentAudit(input: {
  studioId: string;
  orderId: string;
  transactionId: string;
  action: PaymentAuditAction;
  actorUserId: string;
  actorName: string;
  note?: string;
}): PaymentAuditEntry {
  const entry: PaymentAuditEntry = {
    id: newId("pay_audit"),
    ...input,
    createdAt: new Date().toISOString()
  };
  auditStore.unshift(entry);
  return entry;
}

function auditActionForStatus(status: PaymentStatus): PaymentAuditAction {
  if (status === "authorized") return "payment_authorized";
  if (status === "paid") return "payment_paid";
  if (status === "failed") return "payment_failed";
  if (status === "cancelled") return "payment_cancelled";
  if (status === "refunded") return "payment_refunded";
  return "payment_initiated";
}

export function persistTransaction(tx: PaymentTransaction): PaymentTransaction {
  transactionStore.set(tx.id, tx);
  return tx;
}

/**
 * SERVER: Create payment intent.
 * In production this runs only in `app/api/payments/create-intent/route.ts`.
 * Exported for API route and local dev simulation.
 */
export async function createPaymentIntentOnServer(
  req: CreatePaymentIntentRequest
): Promise<CreatePaymentIntentResponse> {
  const resolved = resolvePaymentOrderDraft(req);
  if ("error" in resolved) {
    throw new Error(resolved.error);
  }
  if (req.amount && req.amount !== resolved.draft.amount) {
    throw new Error("client_amount_mismatch");
  }

  const configResult = assertServerPaymentConfig(getPaymentProviderConfig(resolved.draft.academyId));
  if ("error" in configResult) {
    throw new Error(configResult.error);
  }
  if (!configResult.config.enabledMethods.includes(req.provider)) {
    throw new Error("payment_method_not_enabled");
  }

  const serverRequest: CreatePaymentIntentRequest = {
    ...req,
    academyId: resolved.draft.academyId,
    amount: resolved.draft.amount,
    currency: resolved.draft.currency,
    description: resolved.draft.description
  };

  const plugin = getPaymentProvider(req.provider);
  const providerResult = await plugin.createIntentOnServer(serverRequest);
  const hostedSession = buildProviderHostedSession(serverRequest, configResult.config);
  const transaction: PaymentTransaction = {
    ...providerResult.transaction,
    academyId: resolved.draft.academyId,
    studioId: req.studioId,
    amount: resolved.draft.amount,
    currency: resolved.draft.currency,
    processorProvider: configResult.config.provider,
    method: req.provider,
    metadata: resolved.draft.safeMetadata,
    providerReference: `${configResult.config.provider}_${providerResult.transaction.id}`
  };
  const result: CreatePaymentIntentResponse = {
    transaction,
    ...hostedSession
  };
  persistTransaction(result.transaction);
  return result;
}

/**
 * CLIENT: Calls secure API route — never processes cards locally.
 */
export async function createPaymentIntent(
  req: CreatePaymentIntentRequest
): Promise<CreatePaymentIntentResponse> {
  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/payments/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req)
      });
      if (res.ok) {
        const data = (await res.json()) as CreatePaymentIntentResponse;
        persistTransaction(data.transaction);
        return data;
      }
      throw new Error((await res.json().catch(() => ({ error: "payment_create_failed" }))).error);
    } catch {
      throw new Error("payment_create_failed");
    }
  }
  return createPaymentIntentOnServer(req);
}

/**
 * SERVER: Webhook handler — verify PSP signature, then update transaction + order.
 * See `app/api/payments/webhook/route.ts`.
 */
export async function handlePaymentWebhookEvent(event: {
  provider: PaymentProvider;
  providerReference: string;
  status: PaymentStatus;
  orderId: string;
  rawWebhookSafeMetadata?: PaymentTransaction["rawWebhookSafeMetadata"];
}): Promise<PaymentTransaction | null> {
  const tx = [...transactionStore.values()].find(
    (t) => t.orderId === event.orderId || t.providerReference === event.providerReference
  );
  if (!tx) return null;
  const updated: PaymentTransaction = {
    ...tx,
    status: event.status,
    providerTransactionId: event.providerReference,
    rawWebhookSafeMetadata: event.rawWebhookSafeMetadata,
    updatedAt: new Date().toISOString()
  };
  persistTransaction(updated);
  recordPaymentAudit({
    studioId: tx.studioId,
    orderId: tx.orderId,
    transactionId: tx.id,
    action: auditActionForStatus(event.status),
    actorUserId: "system",
    actorName: "מערכת תשלומים",
    note: `webhook:${event.provider}`
  });
  return updated;
}

/** CLIENT / SERVER: Poll or confirm payment after external redirect (Bit / PayBox). */
export async function verifyPayment(req: VerifyPaymentRequest): Promise<PaymentTransaction | null> {
  if (typeof window !== "undefined") {
    try {
      const res = await fetch(`/api/payments/verify?transactionId=${encodeURIComponent(req.transactionId)}&studioId=${encodeURIComponent(req.studioId)}`);
      if (res.ok) {
        const data = (await res.json()) as { transaction: PaymentTransaction };
        persistTransaction(data.transaction);
        return data.transaction;
      }
    } catch {
      /* demo fallback */
    }
  }
  const tx = transactionStore.get(req.transactionId);
  if (!tx || tx.studioId !== req.studioId) return null;
  return tx;
}

/**
 * SERVER: Refund via PSP — never client-only.
 */
export async function refundPayment(req: RefundPaymentRequest): Promise<PaymentTransaction | null> {
  const tx = transactionStore.get(req.transactionId);
  if (!tx || tx.studioId !== req.studioId) return null;
  const updated: PaymentTransaction = {
    ...tx,
    status: "refunded",
    updatedAt: new Date().toISOString(),
    failureReason: req.reason
  };
  persistTransaction(updated);
  return updated;
}

export function markManualOfficePayment(req: ManualOfficePaymentRequest): PaymentTransaction {
  const now = new Date().toISOString();
  const transaction: PaymentTransaction = {
    id: newId("pay_manual"),
    academyId: req.academyId,
    studioId: req.academyId,
    orderId: req.orderId,
    userId: req.actorUserId,
    provider: "credit_card",
    method: "credit_card",
    amount: 0,
    currency: "ILS",
    status: "paid",
    providerReference: `manual_${req.method}_${req.orderId}`,
    metadata: {
      manualMethod: req.method,
      note: req.note ?? ""
    },
    createdAt: now,
    updatedAt: now
  };
  persistTransaction(transaction);
  recordPaymentAudit({
    studioId: req.academyId,
    orderId: req.orderId,
    transactionId: transaction.id,
    action: "payment_manual_status_changed",
    actorUserId: req.actorUserId,
    actorName: req.actorName,
    note: req.method
  });
  return transaction;
}

/** Map payment status → shop order payment status (subset). */
export function shopPaymentStatusFromTransaction(status: PaymentStatus): import("@/lib/types").ShopPaymentStatus {
  if (status === "paid") return "paid";
  if (status === "authorized") return "pending";
  if (status === "failed") return "failed";
  if (status === "refunded") return "refunded";
  if (status === "cancelled") return "cancelled";
  return "pending";
}

export const paymentService = {
  createPaymentIntent,
  createPaymentIntentOnServer,
  verifyPayment,
  refundPayment,
  handlePaymentWebhookEvent,
  getStoredTransaction,
  getStoredTransactionByOrder,
  listPaymentAuditsForOrder,
  recordPaymentAudit,
  markManualOfficePayment,
  shopPaymentStatusFromTransaction
};
