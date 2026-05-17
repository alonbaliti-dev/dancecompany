import { NextResponse } from "next/server";
import { safeWebhookMetadata, verifyHmacWebhook } from "@/lib/webhooks/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const verified = verifyHmacWebhook(rawBody, request.headers.get("x-media-signature"), "MEDIA_WEBHOOK_SECRET");
  if (verified.ok === false) return NextResponse.json({ ok: false, error: verified.error }, { status: verified.status });

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    mode: "placeholder",
    received: safeWebhookMetadata(payload)
  });
}
