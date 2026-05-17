import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { V6Product, V6Role, V6User } from "@/lib/v6/types";

export const STUDIO_MEDIA_BUCKET = "studio-media";

export type MediaType = "image" | "video";
export type MediaVisibility = "group" | "staff" | "management" | "shop" | "private" | "public";
export type MediaStatus = "uploading" | "processing" | "ready" | "failed" | "archived";
export type MediaCollectionType = "group_gallery" | "lesson_timeline" | "event_gallery" | "teacher_resource" | "shop_product";

export type MediaStorageContext =
  | {
      kind: "group";
      studioId: string;
      academyId?: string;
      groupId: string;
      classId: string;
      lessonDate: string;
    }
  | {
      kind: "shop_product";
      studioId: string;
      academyId?: string;
      productId: string;
    }
  | {
      kind: "event";
      studioId: string;
      academyId?: string;
      eventId: string;
    }
  | {
      kind: "competition";
      studioId: string;
      academyId?: string;
      competitionId: string;
    }
  | {
      kind: "annual_show";
      studioId: string;
      academyId?: string;
      showId: string;
    }
  | {
      kind: "student_submission";
      studioId: string;
      academyId?: string;
      studentId: string;
      taskId: string;
    };

export type MediaItemRecord = {
  id: string;
  studioId: string;
  academyId?: string;
  groupId?: string | null;
  classId?: string | null;
  eventId?: string | null;
  competitionId?: string | null;
  productId?: string | null;
  studentId?: string | null;
  lessonDate?: string | null;
  lessonTime?: string | null;
  uploadedByUserId: string;
  uploadedByName: string;
  uploadedByRole: V6Role;
  mediaType: MediaType;
  title: string;
  description?: string | null;
  tags: string[];
  storageBucket: string;
  storagePath: string;
  r2Bucket?: string;
  r2Key?: string;
  publicUrl?: string | null;
  signedUrlMetadata?: Record<string, unknown> | null;
  thumbnailPath?: string | null;
  thumbnailKey?: string | null;
  fileName: string;
  mimeType: string;
  fileSize: number;
  durationSeconds?: number | null;
  visibility: MediaVisibility;
  status: MediaStatus;
  createdAt: string;
  updatedAt: string;
  devOnly?: boolean;
  localPreviewUrl?: string;
  contextType?: MediaStorageContext["kind"];
  contextId?: string;
};

export type CreateMediaItemMetadataInput = Omit<MediaItemRecord, "createdAt" | "updatedAt" | "devOnly"> & {
  createdAt?: string;
  updatedAt?: string;
};

export type MediaListFilters = {
  studioId: string;
  academyId?: string;
  groupId?: string;
  uploaderUserId?: string;
  lessonDate?: string;
  lessonTime?: string;
  classId?: string;
  tags?: string[];
  mediaType?: MediaType;
  visibility?: MediaVisibility | MediaVisibility[];
  status?: MediaStatus | MediaStatus[];
};

export type MediaRepositoryResult<T> =
  | {
      status: "success";
      mode: "supabase" | "local_metadata";
      data: T;
      warnings?: string[];
    }
  | {
      status: "failure";
      mode: "supabase" | "local_metadata";
      reason: string;
      error?: unknown;
    };

export type MediaCollectionInput = {
  id?: string;
  studioId: string;
  academyId?: string;
  groupId?: string | null;
  title: string;
  description?: string | null;
  type: MediaCollectionType;
};

const localMediaItems = new Map<string, MediaItemRecord>();
const localCollectionItems = new Map<string, Array<{ mediaItemId: string; sortOrder: number }>>();

type SupabaseQueryBuilder = {
  insert: (values: unknown) => SupabaseQueryBuilder;
  update: (values: unknown) => SupabaseQueryBuilder;
  upsert: (values: unknown) => SupabaseQueryBuilder;
  select: (columns?: string) => SupabaseQueryBuilder;
  single: () => Promise<{ data: unknown; error: unknown }>;
  eq: (column: string, value: unknown) => SupabaseQueryBuilder;
  in: (column: string, values: readonly unknown[]) => SupabaseQueryBuilder;
  contains: (column: string, value: unknown) => SupabaseQueryBuilder;
  order: (column: string, options?: { ascending?: boolean }) => SupabaseQueryBuilder;
  then: Promise<{ data: unknown; error: unknown }>["then"];
};

function fromSupabaseTable(supabase: { client: { from: (table: string) => unknown } }, table: string) {
  return supabase.client.from(table) as SupabaseQueryBuilder;
}

type DbMediaItemRow = {
  id: string;
  studio_id: string;
  group_id: string | null;
  class_id: string | null;
  lesson_date: string | null;
  lesson_time: string | null;
  uploaded_by_user_id: string;
  uploaded_by_name: string;
  uploaded_by_role: V6Role;
  media_type: MediaType;
  title: string;
  description: string | null;
  tags: string[] | null;
  storage_bucket: string;
  storage_path: string;
  public_url: string | null;
  signed_url_metadata: Record<string, unknown> | null;
  thumbnail_path: string | null;
  file_name: string;
  mime_type: string;
  file_size: number;
  duration_seconds: number | null;
  visibility: MediaVisibility;
  status: MediaStatus;
  created_at: string;
  updated_at: string;
};

function nowIso() {
  return new Date().toISOString();
}

function mediaId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `media_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function safePathSegment(value: string) {
  return value
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}

export function sanitizeMediaFileName(fileName: string) {
  const rawName = fileName.split(/[\\/]/).pop()?.trim() || "media";
  const lastDot = rawName.lastIndexOf(".");
  const rawBase = lastDot > 0 ? rawName.slice(0, lastDot) : rawName;
  const rawExtension = lastDot > 0 ? rawName.slice(lastDot + 1) : "";
  const base = safePathSegment(rawBase) || "media";
  const extension = safePathSegment(rawExtension.toLowerCase());

  return extension ? `${base}.${extension}` : base;
}

export function buildStudioMediaStoragePath(context: MediaStorageContext, mediaItemId: string, fileName: string) {
  const safeFileName = sanitizeMediaFileName(fileName);
  const safeMediaId = safePathSegment(mediaItemId) || mediaId();
  const academyId = "academyId" in context ? (context.academyId ?? context.studioId) : context.studioId;
  const academyPrefix = `academies/${safePathSegment(academyId)}`;

  if (context.kind === "group") {
    return `${academyPrefix}/groups/${safePathSegment(context.groupId)}/lessons/${safePathSegment(context.classId)}/${safePathSegment(context.lessonDate)}/${safeMediaId}-${safeFileName}`;
  }

  if (context.kind === "shop_product") {
    return `${academyPrefix}/shop/products/${safePathSegment(context.productId)}/${safeMediaId}-${safeFileName}`;
  }

  if (context.kind === "event") {
    return `${academyPrefix}/events/${safePathSegment(context.eventId)}/${safeMediaId}-${safeFileName}`;
  }

  if (context.kind === "competition") {
    return `${academyPrefix}/competitions/${safePathSegment(context.competitionId)}/${safeMediaId}-${safeFileName}`;
  }

  if (context.kind === "annual_show") {
    return `${academyPrefix}/annual-shows/${safePathSegment(context.showId)}/${safeMediaId}-${safeFileName}`;
  }

  return `${academyPrefix}/students/${safePathSegment(context.studentId)}/submissions/${safePathSegment(context.taskId)}/${safeMediaId}-${safeFileName}`;
}

export function canActorUploadToMediaContext(actor: V6User, context: MediaStorageContext) {
  if (actor.role === "super_admin") return true;
  if (actor.studioId !== context.studioId) return false;
  if (actor.role === "management" || actor.permissions.manageMedia) return true;

  if (context.kind === "group") {
    return actor.role === "teacher" && actor.groupIds.includes(context.groupId);
  }

  if (context.kind === "student_submission") {
    return actor.role === "student" && actor.id === context.studentId;
  }

  return false;
}

export function canActorViewMediaMetadata(actor: V6User, item: Pick<MediaItemRecord, "studioId" | "groupId" | "visibility" | "uploadedByUserId">) {
  if (actor.role === "super_admin") return true;
  if (actor.studioId !== item.studioId) return false;
  if (actor.role === "management" || actor.permissions.manageMedia) return true;
  if (item.visibility === "public" || item.visibility === "shop") return true;
  if (item.visibility === "staff") return actor.role === "teacher";
  if (item.visibility === "private") return item.uploadedByUserId === actor.id || actor.linkedStudentIds.includes(item.uploadedByUserId);
  return Boolean(item.groupId && actor.groupIds.includes(item.groupId));
}

function toDbMediaItem(input: CreateMediaItemMetadataInput) {
  return {
    id: input.id,
    studio_id: input.studioId,
    group_id: input.groupId ?? null,
    class_id: input.classId ?? null,
    lesson_date: input.lessonDate ?? null,
    lesson_time: input.lessonTime ?? null,
    uploaded_by_user_id: input.uploadedByUserId,
    uploaded_by_name: input.uploadedByName,
    uploaded_by_role: input.uploadedByRole,
    media_type: input.mediaType,
    title: input.title,
    description: input.description ?? null,
    tags: input.tags,
    storage_bucket: input.storageBucket,
    storage_path: input.storagePath,
    public_url: input.publicUrl ?? null,
    signed_url_metadata: input.signedUrlMetadata ?? null,
    thumbnail_path: input.thumbnailPath ?? null,
    file_name: input.fileName,
    mime_type: input.mimeType,
    file_size: input.fileSize,
    duration_seconds: input.durationSeconds ?? null,
    visibility: input.visibility,
    status: input.status,
    created_at: input.createdAt ?? nowIso(),
    updated_at: input.updatedAt ?? nowIso()
  };
}

function fromDbMediaItem(row: DbMediaItemRow): MediaItemRecord {
  return {
    id: row.id,
    studioId: row.studio_id,
    groupId: row.group_id,
    classId: row.class_id,
    lessonDate: row.lesson_date,
    lessonTime: row.lesson_time,
    uploadedByUserId: row.uploaded_by_user_id,
    uploadedByName: row.uploaded_by_name,
    uploadedByRole: row.uploaded_by_role,
    mediaType: row.media_type,
    title: row.title,
    description: row.description,
    tags: row.tags ?? [],
    storageBucket: row.storage_bucket,
    storagePath: row.storage_path,
    publicUrl: row.public_url,
    signedUrlMetadata: row.signed_url_metadata,
    thumbnailPath: row.thumbnail_path,
    fileName: row.file_name,
    mimeType: row.mime_type,
    fileSize: row.file_size,
    durationSeconds: row.duration_seconds,
    visibility: row.visibility,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function localMediaRecord(input: CreateMediaItemMetadataInput): MediaItemRecord {
  const createdAt = input.createdAt ?? nowIso();
  return {
    ...input,
    createdAt,
    updatedAt: input.updatedAt ?? createdAt,
    devOnly: true
  };
}

export async function createMediaItemMetadata(input: CreateMediaItemMetadataInput): Promise<MediaRepositoryResult<MediaItemRecord>> {
  const supabase = getSupabaseServerClient({ preferServiceRole: true });

  if (supabase.enabled === false) {
    const item = localMediaRecord(input);
    localMediaItems.set(item.id, item);
    return {
      status: "success",
      mode: "local_metadata",
      data: item,
      warnings: [supabase.reason, "Metadata is stored in memory only for this dev session."]
    };
  }

  const { data, error } = await fromSupabaseTable(supabase, "media_items").insert(toDbMediaItem(input)).select("*").single();

  if (error) {
    return { status: "failure", mode: "supabase", reason: "Failed to create media item metadata.", error };
  }

  return { status: "success", mode: "supabase", data: fromDbMediaItem(data as DbMediaItemRow) };
}

export async function updateMediaStatus(mediaItemId: string, status: MediaStatus): Promise<MediaRepositoryResult<MediaItemRecord>> {
  const supabase = getSupabaseServerClient({ preferServiceRole: true });
  const updatedAt = nowIso();

  if (supabase.enabled === false) {
    const current = localMediaItems.get(mediaItemId);
    if (!current) return { status: "failure", mode: "local_metadata", reason: "Media item was not found in local metadata fallback." };
    const updated = { ...current, status, updatedAt };
    localMediaItems.set(mediaItemId, updated);
    return { status: "success", mode: "local_metadata", data: updated, warnings: ["Status changed only in local dev metadata."] };
  }

  const { data, error } = await fromSupabaseTable(supabase, "media_items").update({ status, updated_at: updatedAt }).eq("id", mediaItemId).select("*").single();

  if (error) {
    return { status: "failure", mode: "supabase", reason: "Failed to update media item status.", error };
  }

  return { status: "success", mode: "supabase", data: fromDbMediaItem(data as DbMediaItemRow) };
}

export async function listMediaItems(filters: MediaListFilters, actor?: V6User): Promise<MediaRepositoryResult<MediaItemRecord[]>> {
  const supabase = getSupabaseServerClient();

  if (supabase.enabled === false) {
    const items = Array.from(localMediaItems.values()).filter((item) => mediaMatchesFilters(item, filters)).filter((item) => (actor ? canActorViewMediaMetadata(actor, item) : true));
    return { status: "success", mode: "local_metadata", data: items, warnings: [supabase.reason] };
  }

  let query = fromSupabaseTable(supabase, "media_items").select("*").eq("studio_id", filters.studioId).order("created_at", { ascending: false });

  if (filters.groupId) query = query.eq("group_id", filters.groupId);
  if (filters.uploaderUserId) query = query.eq("uploaded_by_user_id", filters.uploaderUserId);
  if (filters.lessonDate) query = query.eq("lesson_date", filters.lessonDate);
  if (filters.lessonTime) query = query.eq("lesson_time", filters.lessonTime);
  if (filters.classId) query = query.eq("class_id", filters.classId);
  if (filters.mediaType) query = query.eq("media_type", filters.mediaType);
  if (filters.visibility) query = Array.isArray(filters.visibility) ? query.in("visibility", filters.visibility) : query.eq("visibility", filters.visibility);
  if (filters.status) query = Array.isArray(filters.status) ? query.in("status", filters.status) : query.eq("status", filters.status);

  for (const tag of filters.tags ?? []) {
    query = query.contains("tags", [tag]);
  }

  const { data, error } = await query;

  if (error) {
    return { status: "failure", mode: "supabase", reason: "Failed to list media items.", error };
  }

  const items = ((data as DbMediaItemRow[] | null) ?? []).map(fromDbMediaItem).filter((item) => (actor ? canActorViewMediaMetadata(actor, item) : true));
  return { status: "success", mode: "supabase", data: items };
}

function mediaMatchesFilters(item: MediaItemRecord, filters: MediaListFilters) {
  if (item.studioId !== filters.studioId) return false;
  if (filters.groupId && item.groupId !== filters.groupId) return false;
  if (filters.uploaderUserId && item.uploadedByUserId !== filters.uploaderUserId) return false;
  if (filters.lessonDate && item.lessonDate !== filters.lessonDate) return false;
  if (filters.lessonTime && item.lessonTime !== filters.lessonTime) return false;
  if (filters.classId && item.classId !== filters.classId) return false;
  if (filters.mediaType && item.mediaType !== filters.mediaType) return false;
  if (filters.visibility) {
    const allowed = Array.isArray(filters.visibility) ? filters.visibility : [filters.visibility];
    if (!allowed.includes(item.visibility)) return false;
  }
  if (filters.status) {
    const allowed = Array.isArray(filters.status) ? filters.status : [filters.status];
    if (!allowed.includes(item.status)) return false;
  }
  return (filters.tags ?? []).every((tag) => item.tags.includes(tag));
}

export async function attachMediaToCollection(
  collection: MediaCollectionInput,
  mediaItemId: string,
  sortOrder = 0
): Promise<MediaRepositoryResult<{ collectionId: string; mediaItemId: string; sortOrder: number }>> {
  const collectionId = collection.id ?? `collection_${collection.type}_${collection.groupId ?? collection.studioId}`;
  const supabase = getSupabaseServerClient({ preferServiceRole: true });

  if (supabase.enabled === false) {
    const items = localCollectionItems.get(collectionId) ?? [];
    localCollectionItems.set(collectionId, [...items.filter((item) => item.mediaItemId !== mediaItemId), { mediaItemId, sortOrder }]);
    return {
      status: "success",
      mode: "local_metadata",
      data: { collectionId, mediaItemId, sortOrder },
      warnings: [supabase.reason, "Collection links are stored in memory only for this dev session."]
    };
  }

  const now = nowIso();
  const { error: collectionError } = await fromSupabaseTable(supabase, "media_collections").upsert({
    id: collectionId,
    studio_id: collection.studioId,
    group_id: collection.groupId ?? null,
    title: collection.title,
    description: collection.description ?? null,
    type: collection.type,
    created_at: now,
    updated_at: now
  });

  if (collectionError) {
    return { status: "failure", mode: "supabase", reason: "Failed to upsert media collection.", error: collectionError };
  }

  const { error: itemError } = await fromSupabaseTable(supabase, "media_collection_items").upsert({
    collection_id: collectionId,
    media_item_id: mediaItemId,
    sort_order: sortOrder
  });

  if (itemError) {
    return { status: "failure", mode: "supabase", reason: "Failed to attach media to collection.", error: itemError };
  }

  return { status: "success", mode: "supabase", data: { collectionId, mediaItemId, sortOrder } };
}

export function buildProductImageMediaPatch(product: Pick<V6Product, "imageMediaIds" | "featuredImageMediaId">, mediaItemId: string, options: { featured?: boolean } = {}) {
  const imageMediaIds = [...new Set([...(product.imageMediaIds ?? []), mediaItemId])];
  return {
    imageMediaIds,
    featuredImageMediaId: options.featured || !product.featuredImageMediaId ? mediaItemId : product.featuredImageMediaId
  };
}

export type ProductImageMediaPatch = ReturnType<typeof buildProductImageMediaPatch>;

export async function attachMediaToProductContext(
  product: Pick<V6Product, "id" | "studioId" | "title" | "imageMediaIds" | "featuredImageMediaId">,
  mediaItemId: string,
  options: { featured?: boolean; sortOrder?: number } = {}
) {
  const collectionResult = await attachMediaToCollection(
    {
      id: `shop_product_${product.id}`,
      studioId: product.studioId,
      title: `Shop product media: ${product.title || product.id}`,
      type: "shop_product"
    },
    mediaItemId,
    options.sortOrder ?? product.imageMediaIds.length
  );

  return {
    collectionResult,
    productPatch: buildProductImageMediaPatch(product, mediaItemId, { featured: options.featured })
  };
}

export function createMediaItemId() {
  return mediaId();
}
