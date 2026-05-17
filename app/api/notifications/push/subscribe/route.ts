import { NextResponse } from "next/server";
import { saveNotificationPreferences, savePushSubscription } from "@/lib/notifications/push-repository";
import { requireProductionSession } from "@/lib/security/production-hardening";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const gate = await requireProductionSession(request, "notifications.push_subscribe");
  if (gate.ok === false) {
    return NextResponse.json({ ok: false, error: gate.error, message: gate.message }, { status: gate.status });
  }

  let body: {
    academyId?: string;
    userId?: string;
    subscription?: { endpoint?: string; keys?: { p256dh?: string; auth?: string } };
    preferences?: {
      parentUpdates?: boolean;
      eventReminders?: boolean;
      urgentAlerts?: boolean;
      paymentConfirmations?: boolean;
    };
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  if (!body.academyId || !body.userId) {
    return NextResponse.json({ ok: false, error: "missing_identity" }, { status: 400 });
  }

  if (gate.mode === "verified_session") {
    body.academyId = gate.session.academyId;
    body.userId = gate.session.profile.id;
  }

  const results = [];
  if (body.subscription?.endpoint) {
    results.push(await savePushSubscription({
      academyId: body.academyId,
      userId: body.userId,
      endpoint: body.subscription.endpoint,
      keys: body.subscription.keys ?? {},
      userAgent: request.headers.get("user-agent") ?? undefined
    }));
  }

  if (body.preferences) {
    results.push(await saveNotificationPreferences({
      academyId: body.academyId,
      userId: body.userId,
      parentUpdates: body.preferences.parentUpdates ?? true,
      eventReminders: body.preferences.eventReminders ?? true,
      urgentAlerts: body.preferences.urgentAlerts ?? true,
      paymentConfirmations: body.preferences.paymentConfirmations ?? true
    }));
  }

  return NextResponse.json({ ok: true, results });
}
