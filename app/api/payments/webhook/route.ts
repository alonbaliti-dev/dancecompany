import { NextResponse } from "next/server";
import { handlePaymentWebhookEvent } from "@/lib/payments/payment-service";
import type { PaymentProvider, PaymentStatus } from "@/lib/payments/types";

/**
 * POST /api/payments/webhook
 *
 * Production:
 * - Verify signature (Stripe-Signature, Tranzila HMAC, Bit webhook secret)
 * - Idempotent processing by event id
 * - Update order + send confirmation email
 *
 * Supported future providers: Stripe, Tranzila, Meshulam, Hyp, Grow, Cardcom, Bit, PayBox
 */
export async function POST(request: Request) {
  const body = (await request.json()) as {
    provider: PaymentProvider;
    providerReference: string;
    status: PaymentStatus;
    orderId: string;
  };

  if (!body?.orderId || !body?.status || !body?.provider) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  // TODO: verify webhook signature before trusting body

  const transaction = await handlePaymentWebhookEvent(body);
  if (!transaction) {
    return NextResponse.json({ error: "transaction_not_found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, transaction });
}
