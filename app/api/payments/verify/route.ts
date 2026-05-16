import { NextResponse } from "next/server";
import { getStoredTransaction, persistTransaction, recordPaymentAudit } from "@/lib/payments/payment-service";

/**
 * GET /api/payments/verify?transactionId=&studioId=
 * Poll after Bit/PayBox redirect or wallet delay.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const transactionId = searchParams.get("transactionId");
  const studioId = searchParams.get("studioId");

  if (!transactionId || !studioId) {
    return NextResponse.json({ error: "missing_params" }, { status: 400 });
  }

  const tx = getStoredTransaction(transactionId);
  if (!tx || tx.studioId !== studioId) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  // Production: query PSP status, do not auto-mark paid without confirmation
  let transaction = tx;
  if (tx.status === "pending" && (tx.provider === "bit" || tx.provider === "paybox")) {
    transaction = persistTransaction({ ...tx, status: "paid", updatedAt: new Date().toISOString() });
    recordPaymentAudit({
      studioId,
      orderId: tx.orderId,
      transactionId: tx.id,
      action: "payment_paid",
      actorUserId: "system",
      actorName: "אימות תשלום",
      note: "verify_endpoint"
    });
  }

  return NextResponse.json({ transaction });
}
