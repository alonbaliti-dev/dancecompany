import { NextResponse } from "next/server";
import { getStoredTransaction } from "@/lib/payments/payment-service";

/**
 * GET /api/payments/verify?transactionId=&studioId=
 * Legacy alias for status polling. It never marks pending payments as paid.
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

  return NextResponse.json({ transaction: tx });
}
