/**
 * Local pilot upload — stores blob URL in memory until Supabase Storage is wired.
 * Production: replace with signed upload URL + virus scan + transcode queue.
 */

export type LocalUploadResult = {
  url: string;
  thumbnailUrl?: string;
  mimeType: string;
  fileSizeBytes: number;
  mediaKind: "video" | "photo";
};

export async function processLocalMediaFile(file: File): Promise<LocalUploadResult> {
  const mime = file.type || (file.name.match(/\.(mp4|mov|webm)$/i) ? "video/mp4" : "image/jpeg");
  const mediaKind = mime.startsWith("video/") ? "video" : "photo";
  const url = URL.createObjectURL(file);
  return {
    url,
    thumbnailUrl: mediaKind === "photo" ? url : undefined,
    mimeType: mime,
    fileSizeBytes: file.size,
    mediaKind
  };
}

export const MEDIA_LIMITS = {
  maxVideoMb: 200,
  maxPhotoMb: 12,
  maxVideoBytes: 200 * 1024 * 1024,
  maxPhotoBytes: 12 * 1024 * 1024
};

export function validateMediaFile(file: File): string | null {
  const isVideo = file.type.startsWith("video/") || /\.(mp4|mov|webm)$/i.test(file.name);
  const isPhoto = file.type.startsWith("image/") || /\.(jpe?g|png|webp|heic)$/i.test(file.name);
  if (!isVideo && !isPhoto) return "סוג קובץ לא נתמך — וידאו או תמונה בלבד";
  if (isVideo && file.size > MEDIA_LIMITS.maxVideoBytes) return `וידאו עד ${MEDIA_LIMITS.maxVideoMb}MB`;
  if (isPhoto && file.size > MEDIA_LIMITS.maxPhotoBytes) return `תמונה עד ${MEDIA_LIMITS.maxPhotoMb}MB`;
  return null;
}
