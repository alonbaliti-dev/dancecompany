export type MediaVisibility =
  | "specific_group"
  | "specific_students"
  | "parents"
  | "teachers_only"
  | "staff_only"
  | "management_only"
  | "shop_public"
  | "studio_legacy_public";

export type MediaUploadStatus = "queued" | "uploading" | "processing" | "ready" | "failed";

export type MediaItem = {
  id: string;
  studioId: string;
  uploadedByUserId: string;
  uploadedByName: string;
  mediaType: "image" | "video";
  title: string;
  description?: string;
  fileName: string;
  mimeType: string;
  fileSize?: number;
  localPreviewUrl?: string;
  storageUrl?: string;
  thumbnailUrl?: string;
  visibility: MediaVisibility;
  linkedGroupIds?: string[];
  linkedStudentIds?: string[];
  linkedProductId?: string;
  linkedEventId?: string;
  linkedTaskId?: string;
  linkedAchievementId?: string;
  tags: string[];
  uploadStatus: MediaUploadStatus;
  createdAt: string;
  updatedAt: string;
};

export type MediaUploadDraft = {
  title: string;
  description?: string;
  visibility: MediaVisibility;
  linkedGroupIds?: string[];
  linkedStudentIds?: string[];
  linkedProductId?: string;
  tags: string[];
};

export const MEDIA_TAG_OPTIONS = ["חזרה", "כוריאוגרפיה", "טכניקה", "שיעור", "מופע"] as const;

export const MEDIA_ACCEPT = "image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm";

export const MEDIA_LIMITS = {
  imageBytes: 12 * 1024 * 1024,
  videoWarningBytes: 250 * 1024 * 1024
};

