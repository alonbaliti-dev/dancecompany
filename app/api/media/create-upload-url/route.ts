import { NextRequest, NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/errors/api-error-response";
import { createAcademyScope } from "@/lib/security/academy-scope";
import { requireProductionSession } from "@/lib/security/production-hardening";
import { createR2SignedUpload } from "@/lib/r2/signed-upload";
import type { CreateUploadUrlRequest } from "@/lib/r2/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function canCreateMediaUpload(gate: Awaited<ReturnType<typeof requireProductionSession>>, body: Partial<CreateUploadUrlRequest>) {
  if (gate.ok === false) return false;
  if (gate.mode === "local_demo") return true;
  const role = gate.session.role;
  if (role === "super_admin" || role === "management") return true;
  if (role === "teacher") return Boolean(body.groupId || body.classId);
  return false;
}

export async function POST(request: NextRequest) {
  let body: Partial<CreateUploadUrlRequest>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, reason: "Invalid JSON body." }, { status: 400 });
  }

  const gate = await requireProductionSession(request, "media.create_upload_url", { academyId: body.academyId });
  if (gate.ok === false) {
    return apiErrorResponse(gate.error, gate.status, { technicalDetails: gate.message });
  }

  if (!canCreateMediaUpload(gate, body)) {
    return apiErrorResponse("forbidden", 403, { messageHe: "אין הרשאה להעלות מדיה ליעד הזה.", messageEn: "You do not have permission to upload media to this context." });
  }

  try {
    const scope = createAcademyScope({
      academyId: body.academyId,
      actor:
        gate.mode === "verified_session"
          ? gate.session.actor
          : {
              userId: body.actorUserId ?? "unknown",
              academyId: body.academyId,
              academyIds: body.academyId ? [body.academyId] : []
            }
    });
    const response = await createR2SignedUpload({
      ...body,
      academyId: scope.academyId,
      actorUserId: gate.mode === "verified_session" ? gate.session.actor.userId : (body.actorUserId ?? "local-demo"),
      actorName: gate.mode === "verified_session" ? gate.session.profile.full_name : body.actorName
    });

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ ok: false, reason: error instanceof Error ? error.message : "Unable to create upload URL." }, { status: 400 });
  }
}
