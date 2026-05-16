import type { LocalDatabase } from "@/lib/local-db/db-types";
import { canManageGalleryItem } from "@/lib/security/permissions";
import type {
  GalleryItem,
  GalleryUploadPayload,
  Notification,
  SaveToGalleryPayload,
  UserProfile
} from "@/lib/types";
import { isStaffChat } from "@/lib/communication-permissions";
import type { ChatMessage, DanceGroupChat } from "@/lib/types";
import { domainGuards } from "../core/permissions";
import type { DomainMutationInput } from "../core/types";

function newId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

export function buildGalleryUploadMutation(
  actor: UserProfile,
  payload: GalleryUploadPayload
): DomainMutationInput | null {
  const draftItem = { studioId: actor.studioId, createdByUserId: actor.id };
  if (!canManageGalleryItem(actor, draftItem)) return null;

  const id = newId("gal");
  const kind = payload.mediaKind ?? (payload.photoUrl ? "photo" : "video");
  const item: GalleryItem = {
    id,
    studioId: actor.studioId,
    title: payload.title,
    description: payload.description,
    mediaKind: kind,
    videoUrl: kind === "video" ? payload.videoUrl : undefined,
    photoUrl: kind === "photo" ? payload.photoUrl : undefined,
    thumbnailUrl:
      kind === "photo" ? payload.photoUrl : payload.videoUrl ? `${payload.videoUrl}#thumb` : undefined,
    fileName: payload.fileName,
    mimeType: payload.mimeType,
    fileSizeBytes: payload.fileSizeBytes,
    uploadStatus: "complete",
    processingStatus: kind === "video" ? "processing" : "ready",
    createdByUserId: actor.id,
    createdByName: actor.name,
    sourceType: "manual_upload",
    visibility: payload.visibility,
    assignedGroupIds: payload.assignedGroupIds,
    assignedStudentIds: payload.assignedStudentIds,
    tags: payload.tags,
    relatedTaskId: payload.relatedTaskId,
    relatedGoalId: payload.relatedGoalId,
    createdAt: new Date().toISOString(),
    isPinned: false
  };

  return {
    actor,
    guard: domainGuards.manageGallery(actor),
    mutate: (db) => {
      let next: LocalDatabase = { ...db, gallery: [item, ...db.gallery] };
      if (
        payload.notifyUsers &&
        (payload.visibility === "student_group" || payload.visibility === "specific_students")
      ) {
        const notif: Notification = {
          id: newId("notif"),
          studioId: actor.studioId,
          title: "חומר חדש בגלריה",
          body: payload.title,
          createdByUserId: actor.id,
          createdByName: actor.name,
          targetType:
            payload.visibility === "specific_students" && payload.assignedStudentIds?.length
              ? "students"
              : "dance_group",
          targetUserIds: payload.assignedStudentIds,
          targetGroupIds: payload.assignedGroupIds,
          priority: "normal",
          relatedType: "gallery",
          relatedId: id,
          readByUserIds: [],
          createdAt: new Date().toISOString()
        };
        next = { ...next, notifications: [notif, ...next.notifications] };
      }
      const modItem = {
        id: `mod_${id}`,
        studioId: actor.studioId,
        kind: "gallery" as const,
        targetId: id,
        status: "open" as const,
        createdAt: new Date().toISOString()
      };
      next = {
        ...next,
        platformOs: {
          ...next.platformOs,
          moderationQueue: [modItem, ...next.platformOs.moderationQueue]
        }
      };
      return next;
    },
    audit: {
      action: `העלאת ${kind === "photo" ? "תמונה" : "וידאו"}: ${payload.title}`,
      targetType: "gallery",
      targetId: id,
      severity: "info"
    },
    activity: {
      kind: "gallery_upload",
      messageHe: `גלריה: ${payload.title}`,
      relatedType: "gallery",
      relatedId: id,
      visibility: "studio"
    },
    sync: { actionType: "media_upload", payload: { galleryId: id, kind } }
  };
}

export function buildSaveChatToGalleryMutation(
  actor: UserProfile,
  payload: SaveToGalleryPayload,
  msg: ChatMessage,
  chat: DanceGroupChat
): DomainMutationInput | null {
  if (!canManageGalleryItem(actor, { studioId: chat.studioId, createdByUserId: actor.id })) {
    return null;
  }
  const id = newId("gal");
  const sourceType = isStaffChat(chat) ? "staff_chat" : "group_chat";
  const item: GalleryItem = {
    id,
    studioId: chat.studioId,
    title: payload.title,
    description: payload.description,
    videoUrl: msg.videoUrl ?? `mock://gallery/${id}.mp4`,
    thumbnailUrl: `mock://thumb/${id}.jpg`,
    createdByUserId: actor.id,
    createdByName: actor.name,
    sourceType,
    sourceMessageId: msg.id,
    visibility: payload.visibility,
    assignedGroupIds: payload.assignedGroupIds ?? (chat.groupId ? [chat.groupId] : undefined),
    assignedStudentIds: payload.assignedStudentIds,
    tags: payload.tags,
    createdAt: new Date().toISOString(),
    isPinned: false
  };

  return {
    actor,
    guard: domainGuards.manageGallery(actor),
    mutate: (db) => ({ ...db, gallery: [item, ...db.gallery] }),
    audit: {
      action: "שמירה לגלריה מצ'אט",
      targetType: "gallery",
      targetId: id,
      severity: "info"
    },
    activity: {
      kind: "gallery_upload",
      messageHe: `נשמר מצ'אט: ${payload.title}`,
      relatedType: "gallery",
      relatedId: id
    }
  };
}

/** Queue item for failed/broken media repair (integrity pass). */
export function flagBrokenMediaInDb(db: LocalDatabase, galleryId: string): LocalDatabase {
  return {
    ...db,
    gallery: db.gallery.map((g) =>
      g.id === galleryId ? { ...g, uploadStatus: "failed" as const, processingStatus: "failed" as const } : g
    ),
    platformOs: {
      ...db.platformOs,
      systemStatus: {
        ...db.platformOs.systemStatus,
        failedUploads: db.platformOs.systemStatus.failedUploads + 1,
        updatedAt: new Date().toISOString()
      }
    }
  };
}
