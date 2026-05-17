import { NextRequest, NextResponse } from "next/server";
import { requireVerifiedAcademySession } from "@/lib/auth/academy-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const academyId = request.nextUrl.searchParams.get("academyId");
  const result = await requireVerifiedAcademySession(request, { academyId });

  if (result.ok === false) {
    return NextResponse.json({ ok: false, error: result.code }, { status: result.status });
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
      phone: result.session.profile.phone,
      email: result.session.profile.email
    }
  });
}
