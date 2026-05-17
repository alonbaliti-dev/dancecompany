import { NextResponse } from "next/server";
import { refundPayment, recordPaymentAudit } from "@/lib/payments/payment-service";
import { requireProductionSession } from "@/lib/security/production-hardening";
import type { RefundPaymentRequest } from "@/lib/payments/types";

/**
 * POST /api/payments/refund — management / super-admin only in production.
 */
export async function POST(request: Request) {
  const gate = await requireProductionSession(request, "payments.refund", { roles: ["management", "super_admin"] });
  if (gate.ok === false) {
    return NextResponse.json({ error: gate.error, message: gate.message }, { status: gate.status });
  }

  const body = (await request.json()) as RefundPaymentRequest & { actorUserId?: string; actorName?: string };

  if (!body?.transactionId || !body?.studioId) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  if (gate.mode === "verified_session") {
    body.studioId = gate.session.academyId;
    body.actorUserId = gate.session.profile.id;
    body.actorName = gate.session.profile.full_name_he ?? gate.session.profile.full_name;
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
