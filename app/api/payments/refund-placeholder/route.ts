import { NextResponse } from "next/server";
import { getStoredTransaction, recordPaymentAudit } from "@/lib/payments/payment-service";
import type { RefundPaymentRequest } from "@/lib/payments/types";

/**
 * POST /api/payments/refund-placeholder
 *
 * Production refund orchestration placeholder. It validates the management
 * intent shape and records an audit entry, but does not call a provider API.
 */
export async function POST(request: Request) {
  let body: RefundPaymentRequest & { actorUserId?: string; actorName?: string; managementReason?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!body?.transactionId || !body?.studioId || !body?.actorUserId || !body?.managementReason) {
    return NextResponse.json({ error: "missing_management_intent" }, { status: 400 });
  }

  const transaction = getStoredTransaction(body.transactionId);
  if (!transaction || transaction.studioId !== body.studioId) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  recordPaymentAudit({
    studioId: body.studioId,
    orderId: transaction.orderId,
    transactionId: transaction.id,
    action: "payment_refunded",
    actorUserId: body.actorUserId,
    actorName: body.actorName ?? "הנהלה",
    note: `refund_placeholder:${body.managementReason}`
  });

  return NextResponse.json({
    ok: true,
    placeholder: true,
    message: "refund_provider_call_not_implemented",
    transaction
  });
}
