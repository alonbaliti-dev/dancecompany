/**
 * Storage security — Supabase Storage buckets.
 *
 * Production:
 * - Private buckets per studio: `studio-{studioId}-media`
 * - Signed URLs via `createSignedUrl` (short TTL, e.g. 15–60 min)
 * - Upload via authenticated route or resumable upload with size cap
 * - RLS on `storage.objects` tied to `gallery_items` / message ownership
 */
import { galleryItemAppliesToUser } from "@/lib/gallery-permissions";
import type { GalleryItem, UserProfile } from "@/lib/types";
import { assertStudioScope } from "./studio-isolation";
import type { MediaAccessItem } from "./types";

/** Default: private. Public URLs only for marketing assets outside app. */
export const STORAGE_DEFAULT_PRIVATE = true;

/** Max upload size — enforce in Storage policy + API route. */
export const MAX_VIDEO_BYTES = 100 * 1024 * 1024; // 100 MB
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 MB

export const ALLOWED_MEDIA_MIME_TYPES = [
  "video/mp4",
  "video/quicktime",
  "image/jpeg",
  "image/png"
] as const;

export type AllowedMimeType = (typeof ALLOWED_MEDIA_MIME_TYPES)[number];

export function isAllowedMimeType(mime: string): mime is AllowedMimeType {
  return (ALLOWED_MEDIA_MIME_TYPES as readonly string[]).includes(mime);
}

export function canAccessMedia(user: UserProfile, item: MediaAccessItem | GalleryItem): boolean {
  if (!assertStudioScope(user, item.studioId)) return false;
  if ("tags" in item) return galleryItemAppliesToUser(item as GalleryItem, user);
  return galleryItemAppliesToUser(
    {
      id: "",
      studioId: item.studioId,
      title: "",
      visibility: item.visibility,
      assignedGroupIds: item.assignedGroupIds,
      assignedStudentIds: item.assignedStudentIds,
      createdByUserId: item.createdByUserId ?? "",
      createdByName: "",
      sourceType: "manual_upload",
      videoUrl: "",
      thumbnailUrl: "",
      tags: [],
      createdAt: "",
      isPinned: false
    },
    user
  );
}

/**
 * Mock signed URL. Production: `supabase.storage.from(bucket).createSignedUrl(path, ttl)`.
 */
export function createSignedMediaUrl(params: {
  bucket: string;
  path: string;
  expiresInSeconds?: number;
}): { url: string; expiresAt: string } {
  const ttl = params.expiresInSeconds ?? 900;
  const expiresAt = new Date(Date.now() + ttl * 1000).toISOString();
  return {
    url: `mock://signed/${params.bucket}/${params.path}?exp=${encodeURIComponent(expiresAt)}`,
    expiresAt
  };
}

export function storageBucketForStudio(studioId: string): string {
  return `studio-${studioId}-media`;
}
