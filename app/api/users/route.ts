import { NextRequest, NextResponse } from "next/server";
import { apiErrorResponse, supabaseUnavailableResponse } from "@/lib/errors/api-error-response";
import { listUsersByAcademy, upsertUserProfile, type UserProfileDraft } from "@/lib/repositories/user-repository";
import { repositoryContextFromSession } from "@/lib/repositories/repository-context";
import { createAcademyScope } from "@/lib/security/academy-scope";
import { requireProductionSession } from "@/lib/security/production-hardening";
import { DEFAULT_ACADEMY_ID } from "@/lib/v6/seed";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const academyId = request.nextUrl.searchParams.get("academyId") ?? DEFAULT_ACADEMY_ID;
  const gate = await requireProductionSession(request, "users.manage", {
    academyId,
    roles: ["management", "super_admin"]
  });

  if (gate.ok === false) {
    return apiErrorResponse(gate.error, gate.status, { technicalDetails: gate.message });
  }

  try {
    const scope = createAcademyScope({ academyId, actor: gate.mode === "verified_session" ? gate.session.actor : undefined });
    const users = await listUsersByAcademy(scope);
    return NextResponse.json({ ok: true, mode: gate.mode === "verified_session" ? "supabase" : "local_demo", academyId: scope.academyId, users });
  } catch (error) {
    return supabaseUnavailableResponse(error instanceof Error ? error.message : undefined);
  }
}

export async function POST(request: NextRequest) {
  let body: { academyId?: string; user?: UserProfileDraft };

  try {
    body = (await request.json()) as { academyId?: string; user?: UserProfileDraft };
  } catch {
    return apiErrorResponse("invalid_json", 400, { messageHe: "בקשת המשתמש אינה תקינה.", messageEn: "Invalid user request body." });
  }

  if (!body.academyId || !body.user?.id || !body.user.fullName || !body.user.role) {
    return apiErrorResponse("missing_user_payload", 400, { messageHe: "חסרים פרטי משתמש לשמירה.", messageEn: "Missing user fields." });
  }

  const gate = await requireProductionSession(request, "users.manage", {
    academyId: body.academyId,
    roles: ["management", "super_admin"]
  });

  if (gate.ok === false) {
    return apiErrorResponse(gate.error, gate.status, { technicalDetails: gate.message });
  }

  if (gate.mode !== "verified_session") {
    return NextResponse.json({
      ok: true,
      mode: "local_demo",
      message: "User persistence route is available, but local demo mode keeps writes in the browser database.",
      user: body.user
    });
  }

  try {
    const user = await upsertUserProfile(repositoryContextFromSession(gate.session), body.user);
    return NextResponse.json({ ok: true, mode: "supabase", user });
  } catch (error) {
    return supabaseUnavailableResponse(error instanceof Error ? error.message : undefined);
  }
}
