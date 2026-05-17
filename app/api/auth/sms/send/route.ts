import { NextRequest, NextResponse } from "next/server";
import { sendSupabaseSmsOtp } from "@/lib/auth/supabase-sms-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let body: { academyId?: string; phone?: string };

  try {
    body = (await request.json()) as { academyId?: string; phone?: string };
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });
  }

  const result = await sendSupabaseSmsOtp({
    academyId: body.academyId ?? "",
    phone: body.phone ?? ""
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: result.status });
  }

  return NextResponse.json({
    ok: true,
    phoneTail: result.phoneTail,
    provider: "supabase_auth"
  });
}
