import { getStudioGroups } from "@/lib/studio-groups-access";
import { isStudentRole, userGroupIds } from "@/lib/studio-roster";
import type { GalleryItem, GalleryVisibility, UserProfile } from "@/lib/types";

export function visibilityLabel(v: GalleryVisibility): string {
  switch (v) {
    case "student_group":
      return "לתלמידים";
    case "specific_students":
      return "לתלמידים נבחרים";
    case "teachers_only":
      return "למורים בלבד";
    case "staff_only":
      return "צוות בלבד";
    case "management_only":
      return "הנהלה בלבד";
    default:
      return "";
  }
}

export function canManageGallery(user: UserProfile): boolean {
  return user.permissions.isTeacher || user.permissions.isManagement;
}

export function galleryItemAppliesToUser(item: GalleryItem, user: UserProfile): boolean {
  if (user.permissions.isManagement) return true;

  if (item.visibility === "management_only") return false;

  if (item.visibility === "staff_only" || item.visibility === "teachers_only") {
    return user.permissions.isTeacher || user.permissions.isManagement;
  }

  if (isStudentRole(user.permissions)) {
    if (item.visibility === "specific_students") {
      return item.assignedStudentIds?.includes(user.id) ?? false;
    }
    if (item.visibility === "student_group") {
      const gids = userGroupIds(user);
      return (item.assignedGroupIds ?? []).some((gid) => gids.includes(gid));
    }
    return false;
  }

  if (user.permissions.isTeacher) {
    if (item.visibility === "student_group" || item.visibility === "specific_students") {
      const teacherGids = new Set(userGroupIds(user));
      if ((item.assignedGroupIds ?? []).some((gid) => teacherGids.has(gid))) return true;
      return false;
    }
  }

  return false;
}

export function groupNameForGalleryItem(item: GalleryItem): string {
  const gid = item.assignedGroupIds?.[0];
  if (!gid) return "—";
  return getStudioGroups().find((g) => g.id === gid)?.name ?? "—";
}

export type GallerySectionId =
  | "my_group"
  | "choreography"
  | "technique"
  | "tasks"
  | "staff_only";

export function gallerySectionForItem(item: GalleryItem): GallerySectionId {
  if (item.visibility === "teachers_only" || item.visibility === "staff_only" || item.visibility === "management_only") {
    return "staff_only";
  }
  if (item.relatedTaskId) return "tasks";
  if (item.tags.some((t) => /כוריאוגרפיה|חזרה/i.test(t))) return "choreography";
  if (item.tags.some((t) => /טכניקה|גמישות/i.test(t))) return "technique";
  return "my_group";
}

export const GALLERY_SECTIONS: { id: GallerySectionId; title: string; subtitle: string; staffOnly?: boolean }[] = [
  { id: "my_group", title: "חומרים לקבוצה שלי", subtitle: "מה שהוקצה לקבוצות שלך" },
  { id: "choreography", title: "חזרות וכוריאוגרפיה", subtitle: "קומבינציות, חזרות וסרטוני ביצוע" },
  { id: "technique", title: "טכניקה וגמישות", subtitle: "תרגילים, מתיחות ויסודות" },
  { id: "tasks", title: "משימות מצולמות", subtitle: "חומרים שקשורים למשימות פעילות" },
  { id: "staff_only", title: "שמורים למורים בלבד", subtitle: "חומר פנימי לצוות", staffOnly: true }
];
