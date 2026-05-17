import type { V6Database, V6MediaItem, V6User } from "@/lib/v6/types";
import { canV6ViewMedia } from "./guards";
import { dedupeById, dedupeByCompositeKey } from "@/lib/v6/dedupe";

export function selectV6MediaForActor(db: V6Database, actor: V6User) {
  const media = dedupeByCompositeKey(dedupeById(db.media), (item) => `${item.studioId}:${item.title}:${item.fileName}:${item.mediaType}:${item.linkedGroupId ?? ""}:${item.linkedProductId ?? ""}`);
  return media.filter((item) => canV6ViewMedia(actor, item));
}

export function selectV6MediaByGroup(db: V6Database, actor: V6User, groupId: string) {
  return selectV6MediaForActor(db, actor).filter((item: V6MediaItem) => item.linkedGroupId === groupId);
}

export function selectV6GalleryCollectionsForActor(db: V6Database, actor: V6User) {
  const actorGroups = new Set(actor.groupIds);
  const linkedStudents = actor.role === "parent" ? db.users.filter((student) => actor.linkedStudentIds.includes(student.id)) : [];
  const linkedGroupIds = new Set(linkedStudents.flatMap((student) => student.groupIds));
  return db.galleryCollections.filter((collection) => {
    if (actor.role === "super_admin" || actor.permissions.manageMedia) return true;
    if (collection.visibility === "management") return actor.role === "management";
    if (collection.visibility === "staff") return actor.role === "teacher" || actor.role === "management";
    if (actor.role === "parent") return collection.visibility === "parents" && collection.groupIds.some((groupId) => linkedGroupIds.has(groupId));
    if (actor.role === "student") return collection.visibility === "students" && collection.groupIds.some((groupId) => actorGroups.has(groupId));
    return collection.groupIds.some((groupId) => actorGroups.has(groupId));
  }).sort((a, b) => `${b.schoolYear} ${a.title}`.localeCompare(`${a.schoolYear} ${b.title}`, "he", { numeric: true }));
}

export function selectV6GalleryItemsForCollection(db: V6Database, actor: V6User, collectionId: string) {
  const visibleMediaIds = new Set(selectV6MediaForActor(db, actor).map((item) => item.id));
  return db.galleryItems
    .filter((item) => item.collectionId === collectionId && item.status !== "hidden")
    .filter((item) => visibleMediaIds.has(item.mediaId) || actor.role === "super_admin" || actor.permissions.manageMedia);
}
