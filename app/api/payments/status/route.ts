import { NextResponse } from "next/server";
import { getStoredTransaction, getStoredTransactionByOrder } from "@/lib/payments/payment-service";

/**
 * GET /api/payments/status?transactionId=&academyId=
 * GET /api/payments/status?orderId=&academyId=
 *
 * Status is read-only. It never upgrades pending payments to paid; only a
 * verified provider webhook or an audited management action may do that.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const transactionId = searchParams.get("transactionId");
  const orderId = searchParams.get("orderId");
  const academyId = searchParams.get("academyId") ?? searchParams.get("studioId") ?? undefined;

  if (!transactionId && !orderId) {
    return NextResponse.json({ error: "missing_params" }, { status: 400 });
  }

  const transaction = transactionId
    ? getStoredTransaction(transactionId)
    : orderId
      ? getStoredTransactionByOrder(orderId, academyId)
      : undefined;

  if (!transaction || (academyId && transaction.academyId !== academyId && transaction.studioId !== academyId)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({
    transaction,
    orderStatus: {
      orderId: transaction.orderId,
      paymentStatus: transaction.status,
      receiptStatus: transaction.status === "paid" ? "ready" : "not_ready"
    }
  });
}
