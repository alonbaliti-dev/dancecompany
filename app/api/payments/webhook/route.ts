import { NextResponse } from "next/server";
import { handlePaymentWebhookEvent } from "@/lib/payments/payment-service";
import { parseSafeWebhookPayload, verifyWebhookSignature } from "@/lib/payments/processor-adapters";

/**
 * POST /api/payments/webhook
 *
 * Production:
 * - Verify signature (Tranzila/Cardcom/Grow HMAC or provider webhook secret)
 * - Idempotent processing by event id
 * - Update order + send confirmation email
 *
 * Supported future providers: Tranzila, Cardcom, Grow by Meshulam, Bit, PayBox
 */
export async function POST(request: Request) {
  if (!process.env.PAYMENT_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "payment_webhook_secret_missing" }, { status: 503 });
  }

  const rawBody = await request.text();
  const signature =
    request.headers.get("x-payment-signature") ??
    request.headers.get("x-tranzila-signature") ??
    request.headers.get("x-cardcom-signature") ??
    request.headers.get("x-grow-signature");

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }

  let event: ReturnType<typeof parseSafeWebhookPayload>;
  try {
    event = parseSafeWebhookPayload(rawBody);
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!event) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const transaction = await handlePaymentWebhookEvent({
    provider: event.provider,
    providerReference: event.providerReference,
    status: event.status,
    orderId: event.orderId,
    rawWebhookSafeMetadata: event.safeMetadata
  });
  if (!transaction) {
    return NextResponse.json({ error: "transaction_not_found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, transaction });
}
