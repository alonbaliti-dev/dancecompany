import { NextRequest, NextResponse } from "next/server";
import { createR2SignedUpload } from "@/lib/r2/signed-upload";
import { validateR2SignedUploadRequest, type R2SignedUploadRequest } from "@/lib/r2/media-storage";
import { requireProductionSession } from "@/lib/security/production-hardening";
import type { MediaVisibility } from "@/lib/supabase/types";

function mediaVisibilityFor(input: R2SignedUploadRequest): MediaVisibility {
  if (input.context.kind === "shop_product") return "shop_public";
  if (input.context.kind === "event" || input.visibility === "public") return "event_public";
  if (input.visibility === "staff") return "staff_only";
  if (input.visibility === "management") return "management_only";
  return "group";
}

function uploadContext(input: R2SignedUploadRequest) {
  return {
    academyId: input.academyId,
    actorUserId: input.actorUserId,
    fileName: input.fileName,
    mimeType: input.mimeType,
    fileSize: input.fileSize,
    mediaType: input.mediaType,
    visibility: mediaVisibilityFor(input),
    groupId: input.context.kind === "lesson" ? input.context.groupId : undefined,
    classId: input.context.kind === "lesson" ? input.context.classId : undefined,
    lessonDate: input.context.kind === "lesson" ? input.context.lessonDate : undefined,
    eventId: input.context.kind === "event" ? input.context.eventId : undefined,
    productId: input.context.kind === "shop_product" ? input.context.productId : undefined,
    studentId: input.context.kind === "student_submission" ? input.context.studentId : undefined
  };
}

export async function POST(request: NextRequest) {
  const gate = await requireProductionSession(request, "media.r2_signed_upload");
  if (gate.ok === false) {
    return NextResponse.json({ ok: false, error: gate.error, message: gate.message }, { status: gate.status });
  }

  let body: Partial<R2SignedUploadRequest>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, reason: "Invalid JSON body." }, { status: 400 });
  }

  const validationReason = validateR2SignedUploadRequest(body);
  if (validationReason) return NextResponse.json({ ok: false, reason: validationReason }, { status: 400 });

  try {
    const upload = body as R2SignedUploadRequest;
    if (gate.mode === "verified_session") {
      upload.academyId = gate.session.academyId;
      upload.actorUserId = gate.session.profile.id;
    }
    const response = await createR2SignedUpload(uploadContext(upload));
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ ok: false, reason: error instanceof Error ? error.message : "Unable to create upload URL." }, { status: 400 });
  }
}
