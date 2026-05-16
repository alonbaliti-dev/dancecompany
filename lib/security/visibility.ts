/**
 * Content visibility rules by role — use alongside permission guards.
 */
import type { DirectoryUser, GalleryItem, UserProfile } from "@/lib/types";
import { galleryItemAppliesToUser } from "@/lib/gallery-permissions";
import { assertStudioScope } from "./studio-isolation";
import { isStudentRole, teacherSharesGroupWithStudent } from "@/lib/studio-roster";

export function canViewStudioContent(
  viewer: UserProfile | null,
  studioId: string
): boolean {
  if (!viewer) return false;
  if (viewer.permissions.isSuperAdmin) return true;
  return assertStudioScope(viewer, studioId);
}

export function canViewGalleryItem(viewer: UserProfile | null, item: GalleryItem): boolean {
  if (!viewer) return false;
  if (!assertStudioScope(viewer, item.studioId)) return false;
  if (viewer.permissions.isSuperAdmin) return true;
  return galleryItemAppliesToUser(item, viewer);
}

export function canViewStudentRecord(
  viewer: UserProfile | null,
  student: Pick<DirectoryUser, "id" | "studioId" | "permissions">
): boolean {
  if (!viewer) return false;
  if (viewer.id === student.id) return true;
  if (!assertStudioScope(viewer, student.studioId)) return false;
  if (viewer.permissions.isSuperAdmin || viewer.permissions.isManagement) return true;
  if (viewer.permissions.isTeacher && isStudentRole(student.permissions)) {
    return teacherSharesGroupWithStudent(viewer, student as DirectoryUser);
  }
  if (viewer.isParent || viewer.type === "parent") {
    return (viewer.linkedStudentIds ?? []).includes(student.id);
  }
  return false;
}

export function canBroadcastNotification(viewer: UserProfile | null): boolean {
  if (!viewer) return false;
  return viewer.permissions.isManagement || viewer.permissions.isSuperAdmin;
}

export function canStudentBroadcast(_viewer: UserProfile | null): boolean {
  return false;
}
