import { NextRequest, NextResponse } from "next/server";
import { apiErrorResponse, supabaseUnavailableResponse } from "@/lib/errors/api-error-response";
import { createMediaItemWithContext, type MediaItemDraft } from "@/lib/repositories/media-repository";
import { repositoryContextFromSession } from "@/lib/repositories/repository-context";
import { attachMediaToShopProduct } from "@/lib/repositories/shop-repository";
import { getR2Config } from "@/lib/r2/client";
import { createAcademyScope } from "@/lib/security/academy-scope";
import { requireProductionSession } from "@/lib/security/production-hardening";
import type { MediaVisibility } from "@/lib/supabase/types";

type CompleteUploadBody = Omit<MediaItemDraft, "visibility"> & {
  actorUserId: string;
  visibility: MediaVisibility;
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "image/heif"]);
const VIDEO_TYPES = new Set(["video/mp4", "video/quicktime", "video/webm"]);
const MAX_IMAGE_BYTES = 25 * 1024 * 1024;
const MAX_UPLOAD_BYTES = 500 * 1024 * 1024;

function hasCompletePermission(gate: Awaited<ReturnType<typeof requireProductionSession>>, body: Partial<CompleteUploadBody>) {
  if (gate.ok === false) return false;
  if (gate.mode === "local_demo") return true;
  if (gate.session.role === "super_admin" || gate.session.role === "management") return true;
  if (gate.session.role === "teacher") return Boolean(body.groupId || body.classId);
  return false;
}

function validateCompletedMedia(body: Partial<CompleteUploadBody>) {
  if (!body.id || !body.academyId || !body.r2Bucket || !body.r2Key || !body.fileName || !body.mimeType || !body.mediaType || !body.visibility) {
    return "Missing required media metadata.";
  }
  if (body.mediaType !== "image" && body.mediaType !== "video") return "Only image and video uploads are supported.";
  if (!body.fileSize || body.fileSize <= 0 || body.fileSize > MAX_UPLOAD_BYTES) return "fileSize must be between 1 byte and 500 MB.";
  if (body.mediaType === "image" && body.fileSize > MAX_IMAGE_BYTES) return "Images must be 25 MB or smaller.";
  if (body.mediaType === "image" && !IMAGE_TYPES.has(body.mimeType)) return "Unsupported image type.";
  if (body.mediaType === "video" && !VIDEO_TYPES.has(body.mimeType)) return "Unsupported video type.";
  if (body.visibility === "shop_public" && body.mediaType !== "image") return "Product media uploads must be images.";
  return null;
}

function expectedR2Prefix(body: Partial<CompleteUploadBody>, academyId: string) {
  if (body.productId || body.visibility === "shop_public") return `academies/${academyId}/shop/products/${body.productId ?? "uncategorized"}/`;
  if (body.eventId || body.visibility === "event_public") return `academies/${academyId}/events/${body.eventId ?? "uncategorized"}/`;
  if (body.groupId && body.classId) return `academies/${academyId}/groups/${body.groupId}/lessons/${body.classId}/`;
  return `academies/${academyId}/`;
}

export async function POST(request: NextRequest) {
  let body: Partial<CompleteUploadBody>;

  try {
    body = await request.json();
  } catch {
    return apiErrorResponse("invalid_json", 400, { messageHe: "בקשת המדיה אינה תקינה.", messageEn: "Invalid media request body." });
  }

  const validationError = validateCompletedMedia(body);
  if (validationError) {
    return apiErrorResponse("invalid_media_metadata", 400, { messageHe: "פרטי המדיה אינם תקינים.", messageEn: validationError, technicalDetails: validationError });
  }

  const gate = await requireProductionSession(request, "media.complete_upload", { academyId: body.academyId });
  if (gate.ok === false) {
    return apiErrorResponse(gate.error, gate.status, { technicalDetails: gate.message });
  }

  if (!hasCompletePermission(gate, body)) {
    return apiErrorResponse("forbidden", 403, { messageHe: "אין הרשאה להשלים העלאת מדיה ליעד הזה.", messageEn: "You do not have permission to complete this media upload." });
  }

  if (gate.mode !== "verified_session") {
    return NextResponse.json({
      ok: false,
      mode: "local_demo",
      error: "demo_only",
      message: "Local demo can show a temporary preview, but media metadata was not persisted. Enable a verified academy session and R2 to complete a real upload."
    });
  }

  const r2Config = getR2Config();
  if (r2Config.configured === false) {
    return apiErrorResponse("r2_not_configured", 503, {
      messageHe: "אחסון R2 לא מוגדר. אפשר להציג תצוגה מקומית בלבד, ללא שמירה קבועה.",
      messageEn: r2Config.reason,
      technicalDetails: r2Config.reason
    });
  }

  if (body.r2Bucket !== r2Config.bucket) {
    return apiErrorResponse("invalid_r2_bucket", 400, { messageHe: "יעד האחסון אינו תואם.", messageEn: "Upload bucket does not match the configured R2 bucket." });
  }

  try {
    const scope = createAcademyScope({
      academyId: body.academyId,
      actor:
        gate.mode === "verified_session"
          ? gate.session.actor
          : {
              userId: body.actorUserId ?? body.uploadedByUserId ?? "unknown",
              academyId: body.academyId,
              academyIds: [body.academyId]
            }
    });
    const expectedPrefix = expectedR2Prefix(body, scope.academyId);
    if (!body.r2Key?.startsWith(expectedPrefix)) {
      return apiErrorResponse("invalid_r2_key", 400, {
        messageHe: "נתיב המדיה אינו תואם לאקדמיה או ליעד שנבחר.",
        messageEn: "R2 key does not match the requested academy/context."
      });
    }
    const draft = {
      id: body.id,
      academyId: scope.academyId,
      groupId: body.groupId,
      classId: body.classId,
      eventId: body.eventId,
      productId: body.productId,
      studentId: body.studentId,
      uploadedByUserId: body.uploadedByUserId ?? body.actorUserId,
      uploadedByName: body.uploadedByName,
      lessonDate: body.lessonDate,
      lessonTime: body.lessonTime,
      tags: body.tags,
      visibility: body.visibility,
      r2Bucket: body.r2Bucket,
      r2Key: body.r2Key,
      thumbnailKey: body.thumbnailKey,
      fileName: body.fileName,
      mimeType: body.mimeType,
      fileSize: body.fileSize ?? 0,
      mediaType: body.mediaType,
      status: "uploaded"
    } satisfies MediaItemDraft;
    const context = repositoryContextFromSession(gate.session);
    const mediaItem = await createMediaItemWithContext(context, draft);

    if (body.productId) {
      await attachMediaToShopProduct(context, body.productId, body.id);
    }

    return NextResponse.json({ ok: true, mode: "metadata_recorded", mediaItem });
  } catch (error) {
    return supabaseUnavailableResponse(error instanceof Error ? error.message : undefined);
  }
}
