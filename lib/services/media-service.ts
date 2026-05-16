import type { MediaItem, MediaUploadDraft, MediaVisibility } from "@/lib/media/media-types";
import type { V2Database, V2Product, V2User } from "@/lib/v2/types";

export type MediaTarget = {
  studioId: string;
  groupIds?: string[];
  studentIds?: string[];
  productId?: string;
  visibility?: MediaVisibility;
};

export function canManageShopProducts(user: V2User): boolean {
  return user.role === "management" || user.role === "super_admin" || user.permissions.manage_shop;
}

export function canAttachMediaToProduct(user: V2User): boolean {
  return canManageShopProducts(user);
}

export function canUploadMedia(user: V2User, target: MediaTarget): boolean {
  if (!user.isActive) return false;
  if (user.role === "super_admin") return true;
  if (user.studioId !== target.studioId) return false;
  if (user.role === "management" || user.permissions.manage_studio) return true;
  if (user.role !== "teacher") return false;
  if (target.productId) return false;
  const groupIds = target.groupIds ?? [];
  if (!groupIds.length) return false;
  return groupIds.every((gid) => user.groupIds.includes(gid));
}

export function canManageMedia(user: V2User, item: MediaItem): boolean {
  if (user.role === "super_admin") return true;
  if (user.studioId !== item.studioId) return false;
  if (user.role === "management" || user.permissions.manage_studio) return true;
  return item.uploadedByUserId === user.id;
}

export function canViewMedia(user: V2User, item: MediaItem): boolean {
  if (user.role === "super_admin") return true;
  if (user.studioId !== item.studioId) return false;
  if (canManageMedia(user, item)) return true;
  switch (item.visibility) {
    case "shop_public":
    case "studio_legacy_public":
      return true;
    case "management_only":
      return user.role === "management";
    case "staff_only":
      return user.role === "management" || user.role === "teacher";
    case "teachers_only":
      return user.role === "teacher" || user.role === "management";
    case "specific_group":
      return (item.linkedGroupIds ?? []).some((gid) => user.groupIds.includes(gid));
    case "specific_students":
      return user.role === "student"
        ? (item.linkedStudentIds ?? []).includes(user.id)
        : user.role === "parent"
          ? user.linkedStudentIds.some((sid) => (item.linkedStudentIds ?? []).includes(sid))
          : false;
    case "parents":
      return user.role === "parent" || user.role === "management" || user.role === "teacher";
    default:
      return false;
  }
}

export function mediaAudienceUserIds(db: V2Database, item: MediaItem): string[] {
  const ids = new Set<string>();
  const studioUsers = db.users.filter((u) => u.studioId === item.studioId);
  if (item.visibility === "specific_group") {
    for (const user of studioUsers) {
      const inGroup = (item.linkedGroupIds ?? []).some((gid) => user.groupIds.includes(gid));
      const parentOfGroupStudent =
        user.role === "parent" &&
        user.linkedStudentIds.some((sid) => {
          const student = db.users.find((u) => u.id === sid);
          return student?.groupIds.some((gid) => (item.linkedGroupIds ?? []).includes(gid));
        });
      if (inGroup || parentOfGroupStudent) ids.add(user.id);
    }
  }
  if (item.visibility === "specific_students") {
    for (const sid of item.linkedStudentIds ?? []) ids.add(sid);
    for (const parent of studioUsers.filter((u) => u.role === "parent")) {
      if (parent.linkedStudentIds.some((sid) => (item.linkedStudentIds ?? []).includes(sid))) ids.add(parent.id);
    }
  }
  if (item.visibility === "parents") {
    studioUsers.filter((u) => u.role === "parent").forEach((u) => ids.add(u.id));
  }
  if (item.visibility === "teachers_only") {
    studioUsers.filter((u) => u.role === "teacher").forEach((u) => ids.add(u.id));
  }
  if (item.visibility === "staff_only") {
    studioUsers.filter((u) => u.role === "teacher" || u.role === "management").forEach((u) => ids.add(u.id));
  }
  if (item.visibility === "management_only") {
    studioUsers.filter((u) => u.role === "management").forEach((u) => ids.add(u.id));
  }
  return [...ids];
}

export function createLocalMediaItem(input: {
  user: V2User;
  file: File;
  draft: MediaUploadDraft;
  localPreviewUrl?: string;
}): MediaItem {
  const now = new Date().toISOString();
  return {
    id: `media_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    studioId: input.user.studioId,
    uploadedByUserId: input.user.id,
    uploadedByName: input.user.name,
    mediaType: input.file.type.startsWith("video/") ? "video" : "image",
    title: input.draft.title.trim() || input.file.name,
    description: input.draft.description?.trim() || undefined,
    fileName: input.file.name,
    mimeType: input.file.type || "application/octet-stream",
    fileSize: input.file.size,
    localPreviewUrl: input.localPreviewUrl,
    thumbnailUrl: input.file.type.startsWith("image/") ? input.localPreviewUrl : undefined,
    visibility: input.draft.visibility,
    linkedGroupIds: input.draft.linkedGroupIds,
    linkedStudentIds: input.draft.linkedStudentIds,
    linkedProductId: input.draft.linkedProductId,
    tags: input.draft.tags,
    uploadStatus: "ready",
    createdAt: now,
    updatedAt: now
  };
}

export function productFeaturedMedia(db: V2Database, product: V2Product): MediaItem | undefined {
  const id = product.featuredImageMediaId ?? product.imageMediaIds?.[0];
  return id ? db.mediaItems.find((item) => item.id === id) : undefined;
}

