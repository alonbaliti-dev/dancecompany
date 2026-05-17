import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { V6Product, V6User } from "@/lib/v6/types";
import {
  STUDIO_MEDIA_BUCKET,
  attachMediaToProductContext,
  buildStudioMediaStoragePath,
  canActorUploadToMediaContext,
  createMediaItemId,
  createMediaItemMetadata,
  sanitizeMediaFileName,
  type CreateMediaItemMetadataInput,
  type MediaItemRecord,
  type MediaStorageContext,
  type MediaType,
  type MediaVisibility,
  type ProductImageMediaPatch
} from "./media-repository";

export type UploadableMediaFile = Blob & {
  name?: string;
  type?: string;
  size: number;
};

export type MediaUploadContext =
  | {
      kind: "teacher";
      storage: Extract<MediaStorageContext, { kind: "group" }>;
      visibility?: Extract<MediaVisibility, "group" | "staff" | "management">;
      lessonTime?: string;
    }
  | {
      kind: "management";
      storage: Extract<MediaStorageContext, { kind: "group" | "event" | "competition" | "annual_show" | "shop_product" }>;
      visibility?: MediaVisibility;
      lessonTime?: string;
    }
  | {
      kind: "student";
      storage: Extract<MediaStorageContext, { kind: "student_submission" }>;
      visibility?: Extract<MediaVisibility, "private" | "group">;
    }
  | {
      kind: "product";
      storage: Extract<MediaStorageContext, { kind: "shop_product" }>;
      visibility?: Extract<MediaVisibility, "shop" | "public" | "management">;
      product?: Pick<V6Product, "id" | "studioId" | "title" | "imageMediaIds" | "featuredImageMediaId">;
      featured?: boolean;
    }
  | {
      kind: "event";
      storage: Extract<MediaStorageContext, { kind: "event" }>;
      visibility?: Extract<MediaVisibility, "group" | "staff" | "management" | "public">;
    };

export type MediaUploadInput = {
  actor: V6User;
  file: UploadableMediaFile;
  context: MediaUploadContext;
  title: string;
  description?: string;
  tags?: string[];
  durationSeconds?: number;
  thumbnailPath?: string;
  localPreviewUrl?: string;
};

export type MediaUploadSuccess = {
  status: "success";
  mode: "supabase";
  item: MediaItemRecord;
  storagePath: string;
  warnings: string[];
  productPatch?: ProductImageMediaPatch;
};

export type MediaUploadUnconfigured = {
  status: "unconfigured";
  mode: "local_metadata";
  item: MediaItemRecord;
  storagePath: string;
  previewOnly: true;
  warnings: string[];
  productPatch?: ProductImageMediaPatch;
};

export type MediaUploadFailure = {
  status: "failure";
  mode: "validation" | "permissions" | "supabase" | "local_metadata";
  reason: string;
  warnings?: string[];
  error?: unknown;
};

export type MediaUploadResult = MediaUploadSuccess | MediaUploadUnconfigured | MediaUploadFailure;

const IMAGE_SIZE_WARNING_BYTES = 12 * 1024 * 1024;
const VIDEO_SIZE_WARNING_BYTES = 250 * 1024 * 1024;

export function buildTeacherMediaUploadContext(input: {
  studioId: string;
  groupId: string;
  classId: string;
  lessonDate: string;
  lessonTime?: string;
  visibility?: Extract<MediaVisibility, "group" | "staff" | "management">;
}): MediaUploadContext {
  return {
    kind: "teacher",
    storage: {
      kind: "group",
      studioId: input.studioId,
      groupId: input.groupId,
      classId: input.classId,
      lessonDate: input.lessonDate
    },
    lessonTime: input.lessonTime,
    visibility: input.visibility ?? "group"
  };
}

export function buildManagementMediaUploadContext(input: {
  storage: Extract<MediaStorageContext, { kind: "group" | "event" | "competition" | "annual_show" | "shop_product" }>;
  visibility?: MediaVisibility;
  lessonTime?: string;
}): MediaUploadContext {
  return {
    kind: "management",
    storage: input.storage,
    visibility: input.visibility ?? "management",
    lessonTime: input.lessonTime
  };
}

export function buildStudentSubmissionUploadContext(input: {
  studioId: string;
  studentId: string;
  taskId: string;
  visibility?: Extract<MediaVisibility, "private" | "group">;
}): MediaUploadContext {
  return {
    kind: "student",
    storage: {
      kind: "student_submission",
      studioId: input.studioId,
      studentId: input.studentId,
      taskId: input.taskId
    },
    visibility: input.visibility ?? "private"
  };
}

export function buildProductImageUploadContext(input: {
  studioId: string;
  productId: string;
  product?: Pick<V6Product, "id" | "studioId" | "title" | "imageMediaIds" | "featuredImageMediaId">;
  featured?: boolean;
  visibility?: Extract<MediaVisibility, "shop" | "public" | "management">;
}): MediaUploadContext {
  return {
    kind: "product",
    storage: {
      kind: "shop_product",
      studioId: input.studioId,
      productId: input.productId
    },
    product: input.product,
    featured: input.featured,
    visibility: input.visibility ?? "shop"
  };
}

export function buildEventMediaUploadContext(input: {
  studioId: string;
  eventId: string;
  visibility?: Extract<MediaVisibility, "group" | "staff" | "management" | "public">;
}): MediaUploadContext {
  return {
    kind: "event",
    storage: {
      kind: "event",
      studioId: input.studioId,
      eventId: input.eventId
    },
    visibility: input.visibility ?? "management"
  };
}

export function validateMediaUploadInput(input: MediaUploadInput) {
  const warnings: string[] = [];
  const title = input.title.trim();
  const fileName = sanitizeMediaFileName(input.file.name || `${title || "media"}.${defaultExtensionForMime(input.file.type)}`);
  const mediaType = inferMediaType(input.file.type);

  if (!title) return { valid: false as const, reason: "Media title is required.", warnings };
  if (!mediaType) return { valid: false as const, reason: "Only image and video uploads are supported.", warnings };
  if (!input.file.size || input.file.size <= 0) return { valid: false as const, reason: "Upload file is empty.", warnings };
  if (!fileName) return { valid: false as const, reason: "A safe upload filename could not be generated.", warnings };

  if (mediaType === "image" && input.file.size > IMAGE_SIZE_WARNING_BYTES) {
    warnings.push("Image is larger than 12 MB. Production should compress originals and generate thumbnails.");
  }

  if (mediaType === "video" && input.file.size > VIDEO_SIZE_WARNING_BYTES) {
    warnings.push("Video is larger than 250 MB. Production should upload directly to storage and queue transcoding.");
  }

  const contextReason = validateRequiredContext(input.context);
  if (contextReason) return { valid: false as const, reason: contextReason, warnings };

  return { valid: true as const, title, fileName, mediaType, warnings };
}

function validateRequiredContext(context: MediaUploadContext) {
  if (context.storage.kind === "group" && (!context.storage.groupId || !context.storage.classId || !context.storage.lessonDate)) {
    return "Group uploads require groupId, classId, and lessonDate.";
  }
  if (context.storage.kind === "shop_product" && !context.storage.productId) return "Product image uploads require productId.";
  if (context.storage.kind === "event" && !context.storage.eventId) return "Event media uploads require eventId.";
  if (context.storage.kind === "competition" && !context.storage.competitionId) return "Competition media uploads require competitionId.";
  if (context.storage.kind === "annual_show" && !context.storage.showId) return "Annual show media uploads require showId.";
  if (context.storage.kind === "student_submission" && (!context.storage.studentId || !context.storage.taskId)) {
    return "Student submissions require studentId and taskId.";
  }
  return null;
}

function inferMediaType(mimeType = ""): MediaType | null {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  return null;
}

function defaultExtensionForMime(mimeType = "") {
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  if (mimeType === "image/gif") return "gif";
  if (mimeType.startsWith("video/")) return "mp4";
  return "jpg";
}

function contextVisibility(context: MediaUploadContext): MediaVisibility {
  if (context.kind === "student") return context.visibility ?? "private";
  if (context.kind === "product") return context.visibility ?? "shop";
  if (context.kind === "teacher") return context.visibility ?? "group";
  if (context.kind === "event") return context.visibility ?? "management";
  return context.visibility ?? "management";
}

function contextId(context: MediaUploadContext) {
  if (context.storage.kind === "group") return context.storage.groupId;
  if (context.storage.kind === "shop_product") return context.storage.productId;
  if (context.storage.kind === "event") return context.storage.eventId;
  if (context.storage.kind === "competition") return context.storage.competitionId;
  if (context.storage.kind === "annual_show") return context.storage.showId;
  return context.storage.taskId;
}

export async function uploadMedia(input: MediaUploadInput): Promise<MediaUploadResult> {
  const validation = validateMediaUploadInput(input);
  if (!validation.valid) return { status: "failure", mode: "validation", reason: validation.reason, warnings: validation.warnings };

  if (!canActorUploadToMediaContext(input.actor, input.context.storage)) {
    return {
      status: "failure",
      mode: "permissions",
      reason: "Actor is not allowed to upload media for this context.",
      warnings: validation.warnings
    };
  }

  const id = createMediaItemId();
  const storagePath = buildStudioMediaStoragePath(input.context.storage, id, validation.fileName);
  const supabase = getSupabaseServerClient({ preferServiceRole: true });

  if (supabase.enabled === false) {
    const localItem = await createMetadataRecord(input, {
      id,
      storagePath,
      fileName: validation.fileName,
      mediaType: validation.mediaType,
      status: "ready",
      localPreviewUrl: input.localPreviewUrl
    });

    if (localItem.status === "failure") {
      return { status: "failure", mode: "local_metadata", reason: localItem.reason, error: localItem.error, warnings: validation.warnings };
    }

    const productPatch = input.context.kind === "product" && input.context.product ? (await attachMediaToProductContext(input.context.product, localItem.data.id, { featured: input.context.featured })).productPatch : undefined;

    return {
      status: "unconfigured",
      mode: "local_metadata",
      item: localItem.data,
      storagePath,
      previewOnly: true,
      productPatch,
      warnings: [
        ...validation.warnings,
        supabase.reason,
        "No file was uploaded. This result is preview-only/dev-only metadata."
      ]
    };
  }

  const { error: uploadError } = await supabase.client.storage.from(STUDIO_MEDIA_BUCKET).upload(storagePath, input.file, {
    contentType: input.file.type || undefined,
    upsert: false
  });

  if (uploadError) {
    return {
      status: "failure",
      mode: "supabase",
      reason: "Failed to upload media file to Supabase Storage.",
      error: uploadError,
      warnings: validation.warnings
    };
  }

  const publicUrl = contextVisibility(input.context) === "public" || contextVisibility(input.context) === "shop" ? supabase.client.storage.from(STUDIO_MEDIA_BUCKET).getPublicUrl(storagePath).data.publicUrl : undefined;

  const metadataResult = await createMetadataRecord(input, {
    id,
    storagePath,
    fileName: validation.fileName,
    mediaType: validation.mediaType,
    status: "ready",
    publicUrl
  });

  if (metadataResult.status === "failure") {
    return { status: "failure", mode: "supabase", reason: metadataResult.reason, error: metadataResult.error, warnings: validation.warnings };
  }

  const productPatch = input.context.kind === "product" && input.context.product ? (await attachMediaToProductContext(input.context.product, metadataResult.data.id, { featured: input.context.featured })).productPatch : undefined;

  return {
    status: "success",
    mode: "supabase",
    item: metadataResult.data,
    storagePath,
    warnings: validation.warnings,
    productPatch
  };
}

async function createMetadataRecord(
  input: MediaUploadInput,
  media: {
    id: string;
    storagePath: string;
    fileName: string;
    mediaType: MediaType;
    status: CreateMediaItemMetadataInput["status"];
    publicUrl?: string;
    localPreviewUrl?: string;
  }
) {
  const metadata: CreateMediaItemMetadataInput = {
    id: media.id,
    studioId: input.context.storage.studioId,
    academyId: input.context.storage.academyId ?? input.context.storage.studioId,
    groupId: input.context.storage.kind === "group" ? input.context.storage.groupId : undefined,
    classId: input.context.storage.kind === "group" ? input.context.storage.classId : undefined,
    eventId: input.context.storage.kind === "event" ? input.context.storage.eventId : undefined,
    competitionId: input.context.storage.kind === "competition" ? input.context.storage.competitionId : undefined,
    productId: input.context.storage.kind === "shop_product" ? input.context.storage.productId : undefined,
    studentId: input.context.storage.kind === "student_submission" ? input.context.storage.studentId : undefined,
    lessonDate: input.context.storage.kind === "group" ? input.context.storage.lessonDate : undefined,
    lessonTime: "lessonTime" in input.context ? input.context.lessonTime : undefined,
    uploadedByUserId: input.actor.id,
    uploadedByName: input.actor.name,
    uploadedByRole: input.actor.role,
    mediaType: media.mediaType,
    title: input.title.trim(),
    description: input.description?.trim() || undefined,
    tags: [...new Set((input.tags ?? []).map((tag) => tag.trim()).filter(Boolean))],
    storageBucket: STUDIO_MEDIA_BUCKET,
    storagePath: media.storagePath,
    r2Bucket: process.env.CLOUDFLARE_R2_BUCKET,
    r2Key: media.storagePath,
    publicUrl: media.publicUrl,
    signedUrlMetadata: media.publicUrl ? null : { strategy: "signed_url_required", generatedAt: null },
    thumbnailPath: input.thumbnailPath,
    fileName: media.fileName,
    mimeType: input.file.type || "application/octet-stream",
    fileSize: input.file.size,
    durationSeconds: input.durationSeconds,
    visibility: contextVisibility(input.context),
    status: media.status,
    localPreviewUrl: media.localPreviewUrl,
    contextType: input.context.storage.kind,
    contextId: contextId(input.context)
  };

  return createMediaItemMetadata(metadata);
}

export async function linkUploadedMediaToProduct(
  product: Pick<V6Product, "id" | "studioId" | "title" | "imageMediaIds" | "featuredImageMediaId">,
  mediaItemId: string,
  options: { featured?: boolean; sortOrder?: number } = {}
) {
  return attachMediaToProductContext(product, mediaItemId, options);
}
