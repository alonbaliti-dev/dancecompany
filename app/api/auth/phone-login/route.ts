import { NextRequest, NextResponse } from "next/server";
import { authenticateWithPhonePassword } from "@/lib/auth/phone-auth";
import { clearAcademySessionCookies, setAcademyAppSessionCookie } from "@/lib/auth/academy-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function fallbackPath(slug: string) {
  return `/academy/${encodeURIComponent(slug || "lk-studio")}/login`;
}

function redirectWithError(request: NextRequest, slug: string, error: string) {
  return NextResponse.redirect(new URL(`${fallbackPath(slug)}?error=${encodeURIComponent(error)}`, request.url), { status: 302 });
}

async function parseLoginRequest(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return (await request.json()) as { slug?: string; academyId?: string; phone?: string; password?: string };
  }

  const formData = await request.formData();
  return {
    slug: String(formData.get("slug") ?? ""),
    academyId: String(formData.get("academyId") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    password: String(formData.get("password") ?? "")
  };
}

export async function POST(request: NextRequest) {
  const body = await parseLoginRequest(request);
  const wantsJson = request.headers.get("content-type")?.includes("application/json");
  const slug = body.slug ?? "lk-studio";

  if (!body.academyId || !body.phone || !body.password) {
    await clearAcademySessionCookies();
    if (wantsJson) return NextResponse.json({ ok: false, error: "invalid_credentials" }, { status: 401 });
    return redirectWithError(request, slug, "invalid_credentials");
  }

  const result = await authenticateWithPhonePassword({
    academyId: body.academyId,
    phone: body.phone,
    password: body.password
  });

  if (result.ok === false) {
    await clearAcademySessionCookies();
    const status = result.status === 503 ? 503 : 401;
    if (wantsJson) return NextResponse.json({ ok: false, error: "invalid_credentials" }, { status });
    return redirectWithError(request, slug, result.status === 503 ? "backend_unavailable" : "invalid_credentials");
  }

  const cookie = await setAcademyAppSessionCookie(result.session);
  if (cookie.ok === false) {
    await clearAcademySessionCookies();
    if (wantsJson) return NextResponse.json({ ok: false, error: "session_unavailable" }, { status: cookie.status });
    return redirectWithError(request, slug, "session_unavailable");
  }

  if (wantsJson) {
    return NextResponse.json({
      ok: true,
      academyId: result.session.academyId,
      user: {
        id: result.session.profile.id,
        name: result.session.profile.full_name_he ?? result.session.profile.full_name,
        role: result.session.role
      }
    });
  }

  return NextResponse.redirect(new URL("/", request.url), { status: 302 });
}
