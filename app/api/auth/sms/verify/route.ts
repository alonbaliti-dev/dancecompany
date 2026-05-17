import { NextRequest, NextResponse } from "next/server";
import { setAcademyAppSessionCookie, setSupabaseSessionCookies } from "@/lib/auth/academy-session";
import { isSupportedIsraeliPhone } from "@/lib/auth/password-hashing";
import { verifySupabaseSmsOtp } from "@/lib/auth/supabase-sms-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let body: { academyId?: string; phone?: string; code?: string };

  try {
    body = (await request.json()) as { academyId?: string; phone?: string; code?: string };
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });
  }

  if (!isSupportedIsraeliPhone(body.phone ?? "")) {
    return NextResponse.json({ ok: false, error: "invalid_phone" }, { status: 400 });
  }

  const result = await verifySupabaseSmsOtp({
    academyId: body.academyId ?? "",
    phone: body.phone ?? "",
    token: body.code ?? ""
  });

  if (result.ok === false) {
    return NextResponse.json({ ok: false, error: result.code }, { status: result.status });
  }

  if (result.supabaseSession) {
    await setSupabaseSessionCookies(result.supabaseSession);
  }

  const cookie = await setAcademyAppSessionCookie(result.session);
  if (cookie.ok === false) {
    return NextResponse.json({ ok: false, error: cookie.code }, { status: cookie.status });
  }

  return NextResponse.json({
    ok: true,
    academyId: result.session.academyId,
    academyIds: result.session.academyIds,
    authMethod: result.session.authMethod,
    role: result.session.role,
    platformRole: result.session.platformRole ?? null,
    user: {
      id: result.session.profile.id,
      name: result.session.profile.full_name_he ?? result.session.profile.full_name,
      phone: result.session.profile.phone
    }
  });
}
