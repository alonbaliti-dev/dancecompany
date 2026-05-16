import { NextResponse } from "next/server";
import { readLocalDatabaseSafe } from "@/lib/local-db/read-db-safe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Server-only: reads `/database/*.json` on the Mac/Next host (fs).
 * Browsers (including iPhone) must use this route — never read `/database` on the client.
 */
export async function GET() {
  const started = Date.now();
  try {
    const { db, report } = readLocalDatabaseSafe();
    if (report.fileErrors.length > 0) {
      console.error("[lk-db/api] partial read", report.fileErrors);
    }
    return NextResponse.json(
      { database: db, report },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          Pragma: "no-cache",
          "X-Db-Load-Source": report.source,
          "X-Db-Load-Ms": String(Date.now() - started),
          "X-Db-File-Errors": String(report.fileErrors.length)
        }
      }
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "read failed";
    console.error("[lk-db/api] read failed", message, e);
    return NextResponse.json(
      {
        error: message,
        report: {
          source: "fallback",
          fileErrors: [{ file: "*", moduleKey: "*", message }],
          loadedAt: new Date().toISOString(),
          durationMs: Date.now() - started,
          databaseDirExists: false
        }
      },
      { status: 500 }
    );
  }
}
