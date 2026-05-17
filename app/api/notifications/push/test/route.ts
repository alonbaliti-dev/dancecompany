import { NextResponse } from "next/server";
import { requireProductionSession } from "@/lib/security/production-hardening";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const gate = await requireProductionSession(request, "notifications.push_test", { roles: ["super_admin"] });
  if (gate.ok === false) {
    return NextResponse.json({ ok: false, error: gate.error, message: gate.message }, { status: gate.status });
  }

  if (gate.mode !== "verified_session" && request.headers.get("x-lk-actor-role") !== "super_admin") {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const configured = Boolean(
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY &&
    process.env.VAPID_PRIVATE_KEY &&
    process.env.VAPID_SUBJECT
  );

  if (!configured) {
    return NextResponse.json({
      ok: false,
      mode: "sandbox",
      error: "push_provider_not_configured"
    }, { status: 503 });
  }

  return NextResponse.json({
    ok: true,
    mode: "sandbox",
    message: "push_test_ready_no_live_send"
  });
}
