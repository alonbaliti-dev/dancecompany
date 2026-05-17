import { NextResponse } from "next/server";
import { createPaymentIntentOnServer, recordPaymentAudit } from "@/lib/payments/payment-service";
import { requireProductionSession } from "@/lib/security/production-hardening";
import type { CreatePaymentIntentRequest } from "@/lib/payments/types";

/**
 * POST /api/payments/create-session
 *
 * Server-only payment session creation. The client may send a checkout draft,
 * but the final amount is resolved from database products/lesson requests here.
 */
export async function POST(request: Request) {
  const gate = await requireProductionSession(request, "payments.create_session");
  if (gate.ok === false) {
    return NextResponse.json({ error: gate.error, message: gate.message }, { status: gate.status });
  }

  let body: CreatePaymentIntentRequest;
  try {
    body = (await request.json()) as CreatePaymentIntentRequest;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!body?.studioId || !body?.orderId || !body?.userId || !body?.provider || body.currency !== "ILS") {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  if (gate.mode === "verified_session") {
    body.studioId = gate.session.academyId;
    body.userId = gate.session.profile.id;
  }

  try {
    const result = await createPaymentIntentOnServer(body);

    recordPaymentAudit({
      studioId: body.studioId,
      orderId: body.orderId,
      transactionId: result.transaction.id,
      action: "payment_initiated",
      actorUserId: body.userId,
      actorName: "לקוח",
      note: `${result.transaction.processorProvider ?? "unconfigured"}:${body.provider}`
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "payment_session_failed";
    const status = message.includes("configured") || message.includes("secret") || message.includes("terminal") ? 503 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
