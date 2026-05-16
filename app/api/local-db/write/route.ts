import { NextResponse } from "next/server";
import type { LocalDatabase } from "@/lib/local-db/db-types";
import { writeLocalDatabaseToDisk } from "@/lib/local-db/write-db";

/**
 * LOCAL / DEV ONLY — writes JSON back to project `/database`.
 * Do NOT rely on this in Vercel production (ephemeral FS). Use Supabase for real persistence.
 */
export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production" && process.env.VERCEL === "1") {
    return NextResponse.json(
      { error: "Local database write is disabled on Vercel. Use Export + commit JSON or Supabase." },
      { status: 403 }
    );
  }

  try {
    const body = (await req.json()) as LocalDatabase;
    if (!body || body.version !== 1) {
      return NextResponse.json({ error: "Expected LocalDatabase with version: 1" }, { status: 400 });
    }
    writeLocalDatabaseToDisk(body);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "write failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
