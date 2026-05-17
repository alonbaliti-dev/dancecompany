import "server-only";

import { assertScopedAcademyId, requireAcademyScope, type AcademyScopedQuery } from "@/lib/security/academy-scope";
import { requireRepositoryWriteContext, type RepositoryWriteContext } from "@/lib/repositories/repository-context";
import { getR2Config } from "@/lib/r2/client";
import { createR2SignedReadUrl } from "@/lib/r2/signed-upload";
import type { RenderableMediaItem } from "@/lib/r2/types";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { MediaItemRow, MediaStatus, MediaVisibility } from "@/lib/supabase/types";
import { safeInitialV6Database } from "@/lib/v6/seed";

export type MediaItemDraft = {
  id: string;
  academyId: string;
  groupId?: string;
  classId?: string;
  eventId?: string;
  productId?: string;
  studentId?: string;
  uploadedByUserId?: string;
  uploadedByName?: string;
  lessonDate?: string;
  lessonTime?: string;
  tags?: string[];
  visibility: MediaVisibility;
  r2Bucket: string;
  r2Key: string;
  thumbnailKey?: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  mediaType: "image" | "video" | "document" | "audio" | "other";
  status?: MediaStatus;
};

export type MediaItemFilters = {
  groupId?: string;
  classId?: string;
  eventId?: string;
  productId?: string;
  uploadedByUserId?: string;
  lessonDate?: string;
  mediaType?: "image" | "video";
};

type MediaWriteScope = AcademyScopedQuery & {
  actorUserId?: string;
};

function toMediaRow(draft: MediaItemDraft): MediaItemRow {
  const now = new Date().toISOString();

  return {
    id: draft.id,
    academy_id: draft.academyId,
    group_id: draft.groupId ?? null,
    class_id: draft.classId ?? null,
    event_id: draft.eventId ?? null,
    product_id: draft.productId ?? null,
    student_id: draft.studentId ?? null,
    uploaded_by_user_id: draft.uploadedByUserId ?? null,
    uploaded_by_name: draft.uploadedByName ?? null,
    lesson_date: draft.lessonDate ?? null,
    lesson_time: draft.lessonTime ?? null,
    tags: draft.tags ?? [],
    visibility: draft.visibility,
    r2_bucket: draft.r2Bucket,
    r2_key: draft.r2Key,
    thumbnail_key: draft.thumbnailKey ?? null,
    file_name: draft.fileName,
    mime_type: draft.mimeType,
    file_size: draft.fileSize,
    media_type: draft.mediaType,
    status: draft.status ?? "uploaded",
    metadata: {},
    created_at: now,
    updated_at: now
  };
}

function mediaUsesPublicUrl(visibility: MediaVisibility) {
  return visibility === "shop_public" || visibility === "event_public" || visibility === "legacy_public";
}

function publicR2Url(publicBaseUrl: string | undefined, key: string) {
  if (!publicBaseUrl) return null;
  const base = publicBaseUrl.replace(/\/+$/, "");
  return `${base}/${key.split("/").map(encodeURIComponent).join("/")}`;
}

function toRenderableMediaItem(row: MediaItemRow): RenderableMediaItem {
  const config = getR2Config();
  const publicUrl = config.publicBaseUrl && mediaUsesPublicUrl(row.visibility) ? publicR2Url(config.publicBaseUrl, row.r2_key) : null;
  const signedUrl = !publicUrl && config.configured ? createR2SignedReadUrl(row.r2_key).url : null;
  const renderUrl = publicUrl ?? signedUrl;

  return {
    ...row,
    public_url: publicUrl,
    signed_url: signedUrl,
    render_url: renderUrl,
    url_mode: publicUrl ? "public" : signedUrl ? "signed" : "unavailable"
  };
}

function mediaMatchesFilters(row: MediaItemRow, filters: MediaItemFilters) {
  if (filters.groupId && row.group_id !== filters.groupId) return false;
  if (filters.classId && row.class_id !== filters.classId) return false;
  if (filters.eventId && row.event_id !== filters.eventId) return false;
  if (filters.productId && row.product_id !== filters.productId) return false;
  if (filters.uploadedByUserId && row.uploaded_by_user_id !== filters.uploadedByUserId) return false;
  if (filters.lessonDate && row.lesson_date !== filters.lessonDate) return false;
  if (filters.mediaType && row.media_type !== filters.mediaType) return false;
  return true;
}

export async function listMediaItems(scope: AcademyScopedQuery, filters: MediaItemFilters = {}): Promise<RenderableMediaItem[]> {
  const academyId = requireAcademyScope(scope);
  const supabase = getSupabaseServerClient();

  if (!supabase.enabled) {
    return safeInitialV6Database.media
      .filter((item) => (item.academyId ?? item.studioId) === academyId)
      .map((item) =>
        toRenderableMediaItem(toMediaRow({
          id: item.id,
          academyId,
          groupId: item.groupId,
          classId: item.classId,
          eventId: item.linkedEventId ?? item.eventId,
          productId: item.linkedProductId,
          studentId: item.studentId,
          uploadedByUserId: item.uploadedByUserId,
          uploadedByName: item.uploaderName,
          lessonDate: item.lessonDate,
          lessonTime: item.lessonTime,
          tags: item.tags,
          visibility: item.visibility === "shop" ? "shop_public" : item.visibility === "event" ? "event_public" : item.visibility === "archive" ? "legacy_public" : "group",
          r2Bucket: item.r2Bucket ?? "academy-media",
          r2Key: item.r2Key ?? `academies/${academyId}/legacy/${item.fileName}`,
          thumbnailKey: item.thumbnailKey,
          fileName: item.fileName,
          mimeType: item.mimeType ?? "application/octet-stream",
          fileSize: item.fileSize ?? 0,
          mediaType: item.mediaType
        }))
      )
      .filter((item) => mediaMatchesFilters(item, filters));
  }

  let query = supabase.client
    .from("media_items")
    .select("*")
    .eq("academy_id", academyId)
    .order("created_at", { ascending: false });

  if (filters.groupId) query = query.eq("group_id", filters.groupId);
  if (filters.classId) query = query.eq("class_id", filters.classId);
  if (filters.eventId) query = query.eq("event_id", filters.eventId);
  if (filters.productId) query = query.eq("product_id", filters.productId);
  if (filters.uploadedByUserId) query = query.eq("uploaded_by_user_id", filters.uploadedByUserId);
  if (filters.lessonDate) query = query.eq("lesson_date", filters.lessonDate);
  if (filters.mediaType) query = query.eq("media_type", filters.mediaType);

  const { data, error } = await query;

  if (error) throw error;
  return (data ?? []).map(toRenderableMediaItem);
}

export async function createMediaItem(draft: MediaItemDraft, scope: MediaWriteScope): Promise<MediaItemRow> {
  assertScopedAcademyId(draft, scope);
  const row = toMediaRow(draft);
  const supabase = getSupabaseServerClient({ preferServiceRole: true });

  if (!supabase.enabled) {
    return row;
  }

  const { data, error } = await supabase.client.from("media_items").insert(row).select("*").single();
  if (error) throw error;

  if (scope.actorUserId) {
    await supabase.client.from("audit_logs").insert({
      id: `audit_media_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
      academy_id: row.academy_id,
      actor_user_id: scope.actorUserId,
      action: "media.uploaded",
      target: row.id,
      metadata: {
        r2_bucket: row.r2_bucket,
        r2_key: row.r2_key,
        visibility: row.visibility,
        media_type: row.media_type
      }
    });
  }

  return data;
}

export async function createMediaItemWithContext(context: RepositoryWriteContext, draft: MediaItemDraft): Promise<MediaItemRow> {
  const verified = requireRepositoryWriteContext(context);
  assertScopedAcademyId(draft, verified);

  return createMediaItem(
    {
      ...draft,
      academyId: verified.academyId,
      uploadedByUserId: verified.actor.userId
    },
    { academyId: verified.academyId, actorUserId: verified.actor.userId }
  );
}
