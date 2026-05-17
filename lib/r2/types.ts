import type { MediaItemRow, MediaVisibility } from "@/lib/supabase/types";

export type R2EnvKey =
  | "CLOUDFLARE_R2_ACCOUNT_ID"
  | "CLOUDFLARE_R2_ACCESS_KEY_ID"
  | "CLOUDFLARE_R2_SECRET_ACCESS_KEY"
  | "CLOUDFLARE_R2_BUCKET"
  | "CLOUDFLARE_R2_PUBLIC_BASE_URL";

export type R2Config =
  | {
      configured: true;
      accountId: string;
      accessKeyId: string;
      secretAccessKey: string;
      bucket: string;
      publicBaseUrl?: string;
      endpoint: string;
    }
  | {
      configured: false;
      bucket: string;
      publicBaseUrl?: string;
      reason: string;
      missingEnv: R2EnvKey[];
    };

export type MediaUploadContext = {
  academyId: string;
  groupId?: string;
  classId?: string;
  eventId?: string;
  productId?: string;
  studentId?: string;
  lessonDate?: string;
  lessonTime?: string;
};

export type CreateUploadUrlRequest = MediaUploadContext & {
  actorUserId: string;
  actorName?: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  mediaType: "image" | "video" | "document" | "audio" | "other";
  visibility: MediaVisibility;
  tags?: string[];
};

export type RenderableMediaItem = MediaItemRow & {
  public_url: string | null;
  signed_url: string | null;
  render_url: string | null;
  url_mode: "public" | "signed" | "unavailable";
};

export type CreateUploadUrlResponse =
  | {
      ok: true;
      mode: "r2";
      mediaItemId: string;
      uploadUrl: string;
      method: "PUT";
      headers: Record<string, string>;
      bucket: string;
      r2Key: string;
      expiresInSeconds: number;
    }
  | {
      ok: true;
      mode: "local_demo";
      mediaItemId: string;
      bucket: string;
      r2Key: string;
      reason: string;
    };
