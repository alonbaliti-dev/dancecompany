import { NextResponse } from "next/server";
import { createPaymentIntentOnServer, recordPaymentAudit } from "@/lib/payments/payment-service";
import type { CreatePaymentIntentRequest } from "@/lib/payments/types";

/**
 * POST /api/payments/create-intent
 *
 * Production checklist:
 * - Authenticate session (studio + user)
 * - Validate order amount server-side against DB
 * - Route to PSP (Stripe / Tranzila / Bit / PayBox)
 * - Return client_secret or redirect_url only — never PAN/CVV
 */
export async function POST(request: Request) {
  const body = (await request.json()) as CreatePaymentIntentRequest;

  if (!body?.studioId || !body?.orderId || !body?.userId || !body?.provider || !body?.amount) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  if (body.amount <= 0 || body.currency !== "ILS") {
    return NextResponse.json({ error: "invalid_amount" }, { status: 400 });
  }

  const result = await createPaymentIntentOnServer(body);

  recordPaymentAudit({
    studioId: body.studioId,
    orderId: body.orderId,
    transactionId: result.transaction.id,
    action: "payment_initiated",
    actorUserId: body.userId,
    actorName: "לקוח",
    note: body.provider
  });

  return NextResponse.json(result);
}
