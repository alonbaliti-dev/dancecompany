import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import type { LocalDatabase } from "@/lib/local-db/db-types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Server-only bundled snapshot (`public/fallback-bundle.json` on the Mac).
 * Client fallback when `/api/local-db/read` is unreachable — still HTTP, never local fs.
 */
export async function GET() {
  const started = Date.now();
  const bundlePath = path.join(process.cwd(), "public", "fallback-bundle.json");

  try {
    if (!fs.existsSync(bundlePath)) {
      console.error("[lk-db/api/fallback] missing file", bundlePath);
      return NextResponse.json({ error: "fallback-bundle.json not found on server" }, { status: 404 });
    }

    const raw = fs.readFileSync(bundlePath, "utf8");
    const database = JSON.parse(raw) as LocalDatabase;
    if (!database || database.version !== 1) {
      return NextResponse.json({ error: "invalid fallback bundle schema" }, { status: 500 });
    }

    return NextResponse.json(
      {
        database,
        report: {
          source: "fallback",
          fileErrors: [],
          loadedAt: new Date().toISOString(),
          durationMs: Date.now() - started,
          databaseDirExists: false
        }
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "fallback read failed";
    console.error("[lk-db/api/fallback]", message, e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
