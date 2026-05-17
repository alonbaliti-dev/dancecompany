import { NextResponse } from "next/server";
import { getIntegrationHealthReport } from "@/lib/integrations/health";
import { requireProductionSession } from "@/lib/security/production-hardening";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isSuperAdminRequest(request: Request) {
  const role = request.headers.get("x-lk-actor-role");
  const devBypass = process.env.NODE_ENV !== "production" && request.headers.get("x-lk-dev-health") === "1";
  return role === "super_admin" || devBypass;
}

export async function GET(request: Request) {
  const gate = await requireProductionSession(request, "integrations.health", { roles: ["super_admin"] });
  if (gate.ok === false) {
    return NextResponse.json({ ok: false, error: gate.error, message: gate.message }, { status: gate.status });
  }

  if (gate.mode !== "verified_session" && !isSuperAdminRequest(request)) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const report = await getIntegrationHealthReport();
  return NextResponse.json(
    { ok: true, report },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
