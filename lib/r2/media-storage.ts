import "server-only";

import { sanitizeMediaFileName } from "@/lib/domains/media/media-repository";

export const R2_MEDIA_BUCKET_FALLBACK = "academy-media";

export type R2MediaVisibility = "private" | "group" | "staff" | "management" | "shop" | "public";

export type R2MediaContext =
  | { kind: "lesson"; academyId: string; groupId: string; classId: string; lessonDate: string }
  | { kind: "event"; academyId: string; eventId: string }
  | { kind: "competition"; academyId: string; competitionId: string }
  | { kind: "annual_show"; academyId: string; showId: string }
  | { kind: "shop_product"; academyId: string; productId: string }
  | { kind: "student_submission"; academyId: string; studentId: string; taskId: string }
  | { kind: "legacy"; academyId: string }
  | { kind: "thumbnail"; academyId: string };

export type R2SignedUploadRequest = {
  academyId: string;
  actorUserId: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  mediaType: "image" | "video";
  visibility: R2MediaVisibility;
  context: R2MediaContext;
};

export type R2MediaMetadataDraft = {
  academyId: string;
  groupId?: string;
  classId?: string;
  eventId?: string;
  competitionId?: string;
  productId?: string;
  studentId?: string;
  uploadedByUserId: string;
  uploaderName?: string;
  lessonDate?: string;
  lessonTime?: string;
  tags: string[];
  visibility: R2MediaVisibility;
  r2Bucket: string;
  r2Key: string;
  thumbnailKey?: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  mediaType: "image" | "video";
  createdAt: string;
};

export function getR2MediaConfig() {
  const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
  const bucket = process.env.CLOUDFLARE_R2_BUCKET || R2_MEDIA_BUCKET_FALLBACK;
  const publicBaseUrl = process.env.CLOUDFLARE_R2_PUBLIC_BASE_URL;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
    return {
      configured: false as const,
      bucket,
      publicBaseUrl,
      reason: "Cloudflare R2 is not configured. Add server-only R2 credentials before enabling production signed uploads."
    };
  }

  return {
    configured: true as const,
    accountId,
    accessKeyId,
    secretAccessKey,
    bucket,
    publicBaseUrl,
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`
  };
}

function safeSegment(value: string) {
  return sanitizeMediaFileName(value).replace(/\./g, "-") || "unknown";
}

export function buildR2MediaKey(context: R2MediaContext, mediaItemId: string, fileName: string) {
  const safeAcademyId = safeSegment(context.academyId);
  const safeMediaId = safeSegment(mediaItemId);
  const safeFileName = sanitizeMediaFileName(fileName);
  const suffix = `${safeMediaId}-${safeFileName}`;

  if (context.kind === "lesson") {
    return `academies/${safeAcademyId}/groups/${safeSegment(context.groupId)}/lessons/${safeSegment(context.classId)}/${safeSegment(context.lessonDate)}/${suffix}`;
  }

  if (context.kind === "event") return `academies/${safeAcademyId}/events/${safeSegment(context.eventId)}/${suffix}`;
  if (context.kind === "competition") return `academies/${safeAcademyId}/competitions/${safeSegment(context.competitionId)}/${suffix}`;
  if (context.kind === "annual_show") return `academies/${safeAcademyId}/annual-shows/${safeSegment(context.showId)}/${suffix}`;
  if (context.kind === "shop_product") return `academies/${safeAcademyId}/shop/products/${safeSegment(context.productId)}/${suffix}`;
  if (context.kind === "student_submission") return `academies/${safeAcademyId}/students/${safeSegment(context.studentId)}/submissions/${safeSegment(context.taskId)}/${suffix}`;
  if (context.kind === "thumbnail") return `academies/${safeAcademyId}/thumbnails/${suffix}`;
  return `academies/${safeAcademyId}/legacy/${suffix}`;
}

export function validateR2SignedUploadRequest(input: Partial<R2SignedUploadRequest>) {
  if (!input.academyId?.trim()) return "academyId is required.";
  if (!input.actorUserId?.trim()) return "actorUserId is required.";
  if (!input.fileName?.trim()) return "fileName is required.";
  if (!input.mimeType?.trim()) return "mimeType is required.";
  if (!input.fileSize || input.fileSize <= 0) return "fileSize must be greater than zero.";
  if (input.mediaType !== "image" && input.mediaType !== "video") return "mediaType must be image or video.";
  if (!input.context || input.context.academyId !== input.academyId) return "context.academyId must match academyId.";
  if (input.visibility === "public" && input.context.kind !== "shop_product" && input.context.kind !== "event" && input.context.kind !== "competition" && input.context.kind !== "annual_show" && input.context.kind !== "legacy") {
    return "Public uploads are only allowed for approved public/shop/event/legacy contexts.";
  }
  return null;
}
