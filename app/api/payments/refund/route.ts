import { NextResponse } from "next/server";
import { refundPayment, recordPaymentAudit } from "@/lib/payments/payment-service";
import type { RefundPaymentRequest } from "@/lib/payments/types";

/**
 * POST /api/payments/refund — management / super-admin only in production.
 */
export async function POST(request: Request) {
  const body = (await request.json()) as RefundPaymentRequest & { actorUserId?: string; actorName?: string };

  if (!body?.transactionId || !body?.studioId) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const transaction = await refundPayment(body);
  if (!transaction) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  recordPaymentAudit({
    studioId: body.studioId,
    orderId: transaction.orderId,
    transactionId: transaction.id,
    action: "payment_refunded",
    actorUserId: body.actorUserId ?? "system",
    actorName: body.actorName ?? "הנהלה",
    note: body.reason
  });

  return NextResponse.json({ transaction });
}
