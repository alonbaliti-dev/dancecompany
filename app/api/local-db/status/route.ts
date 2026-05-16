import { NextResponse } from "next/server";
import { getLocalDatabaseStatus } from "@/lib/local-db/read-db-safe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Server-only diagnostics — reads `/database` on the Mac/Next host.
 * Safe to call from iPhone browser: returns metadata only, no fs on client.
 */
export async function GET() {
  try {
    const status = getLocalDatabaseStatus();
    return NextResponse.json(status, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" }
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "status failed";
    console.error("[lk-db/api/status]", message, e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
