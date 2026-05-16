/**
 * Payment service — client entry point for secure checkout.
 *
 * ARCHITECTURE (production):
 *   Frontend (this app)
 *     → POST /api/payments/create-intent  (no card data)
 *     → PSP / wallet UI (Stripe Elements, Apple Pay, Bit app)
 *     → POST /api/payments/webhook        (PSP confirms)
 *     → DB: orders + payment_transactions
 *     → GET  /api/payments/verify         (optional poll for Bit/PayBox)
 *
 * NEVER store or transmit full card numbers from React state.
 */

import type {
  CreatePaymentIntentRequest,
  CreatePaymentIntentResponse,
  PaymentAuditAction,
  PaymentAuditEntry,
  PaymentProvider,
  PaymentStatus,
  PaymentTransaction,
  RefundPaymentRequest,
  VerifyPaymentRequest
} from "./types";
import { getPaymentProvider } from "./providers";

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
  const plugin = getPaymentProvider(req.provider);
  const result = await plugin.createIntentOnServer(req);
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
      const res = await fetch("/api/payments/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req)
      });
      if (res.ok) {
        const data = (await res.json()) as CreatePaymentIntentResponse;
        persistTransaction(data.transaction);
        return data;
      }
    } catch {
      /* fall through to server-side simulation for offline demo */
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
}): Promise<PaymentTransaction | null> {
  const tx = [...transactionStore.values()].find(
    (t) => t.orderId === event.orderId || t.providerReference === event.providerReference
  );
  if (!tx) return null;
  const updated: PaymentTransaction = {
    ...tx,
    status: event.status,
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
  if (tx.status === "pending" && (tx.provider === "bit" || tx.provider === "paybox")) {
    const updated = { ...tx, status: "paid" as const, updatedAt: new Date().toISOString() };
    persistTransaction(updated);
    recordPaymentAudit({
      studioId: tx.studioId,
      orderId: tx.orderId,
      transactionId: tx.id,
      action: "payment_paid",
      actorUserId: "system",
      actorName: "אימות תשלום",
      note: "demo_verify"
    });
    return updated;
  }
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
  listPaymentAuditsForOrder,
  recordPaymentAudit,
  shopPaymentStatusFromTransaction
};
