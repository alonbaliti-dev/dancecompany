import { NextRequest, NextResponse } from "next/server";
import { apiErrorResponse, supabaseUnavailableResponse } from "@/lib/errors/api-error-response";
import { upsertPhoneCredential } from "@/lib/auth/phone-auth";
import { repositoryContextFromSession } from "@/lib/repositories/repository-context";
import { requireProductionSession } from "@/lib/security/production-hardening";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let body: {
    academyId?: string;
    userProfileId?: string;
    phone?: string;
    temporaryPassword?: string;
    mustChangePassword?: boolean;
    temporaryPasswordFlag?: boolean;
  };

  try {
    body = await request.json();
  } catch {
    return apiErrorResponse("invalid_json", 400, { messageHe: "בקשת איפוס הסיסמה אינה תקינה.", messageEn: "Invalid password reset request body." });
  }

  if (!body.academyId || !body.userProfileId || !body.phone || !body.temporaryPassword) {
    return apiErrorResponse("missing_password_reset_payload", 400, {
      messageHe: "חסרים פרטי משתמש או סיסמה זמנית.",
      messageEn: "Missing user or temporary password fields."
    });
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
      message: "Password reset route is available; local demo keeps credentials in browser-only state."
    });
  }

  try {
    const credential = await upsertPhoneCredential(repositoryContextFromSession(gate.session), {
      academyId: body.academyId,
      userProfileId: body.userProfileId,
      phone: body.phone,
      password: body.temporaryPassword,
      temporaryPasswordFlag: body.temporaryPasswordFlag ?? true,
      mustChangePassword: body.mustChangePassword ?? true,
      status: "active"
    });

    const supabase = getSupabaseServerClient({ preferServiceRole: true });
    if (supabase.enabled) {
      await supabase.client.from("audit_logs").insert({
        id: `audit_auth_reset_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
        academy_id: body.academyId,
        actor_user_id: gate.session.actor.userId,
        action: "auth.password_reset_requested",
        target: body.userProfileId,
        metadata: {
          source: "academy_phone",
          temporaryPasswordFlag: body.temporaryPasswordFlag ?? true,
          mustChangePassword: body.mustChangePassword ?? true
        }
      });
    }

    return NextResponse.json({
      ok: true,
      mode: "supabase",
      credential: {
        id: credential.id,
        userProfileId: credential.user_profile_id,
        phoneNormalized: credential.phone_normalized,
        temporaryPasswordFlag: credential.temporary_password_flag,
        mustChangePassword: credential.must_change_password,
        status: credential.status
      }
    });
  } catch (error) {
    return supabaseUnavailableResponse(error instanceof Error ? error.message : undefined);
  }
}
