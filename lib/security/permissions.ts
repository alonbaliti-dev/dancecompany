/**
 * Authorization guards — use in UI AND before mutating mock state.
 * Production: mirror these checks in RLS policies + Edge Functions.
 */
import { getDirectoryUsers } from "@/lib/directory-store";
import { canEditUser as canEditUserGuard } from "@/lib/users/user-guards";
import { canAccessGroupChat, canModerateChat as chatCanModerate, isStaffChat } from "@/lib/communication-permissions";
import { galleryItemAppliesToUser } from "@/lib/gallery-permissions";
import { getStudentsForTeacher, isStudentRole, teacherSharesGroupWithStudent, userGroupIds } from "@/lib/studio-roster";
import type {
  DanceGroupChat,
  DirectoryUser,
  GalleryItem,
  NotificationTargetType,
  ShopOrder,
  ShopProduct,
  UserProfile
} from "@/lib/types";
import { assertStudioScope } from "./studio-isolation";
import type { NotificationSendTarget } from "./types";

export function canViewSuperAdmin(user: Pick<UserProfile, "permissions">): boolean {
  return user.permissions.isSuperAdmin;
}

export function canViewManagementDashboard(user: Pick<UserProfile, "permissions">): boolean {
  return user.permissions.isManagement && user.permissions.canManageUsers;
}

export function canViewTeacherDashboard(user: Pick<UserProfile, "permissions">): boolean {
  return user.permissions.isTeacher || user.permissions.isManagement || user.permissions.isSuperAdmin;
}

/** Full studio attendance analytics (teachers, management, super admin). */
export function canViewAttendanceIntelligenceStaff(
  user: Pick<UserProfile, "permissions">
): boolean {
  return user.permissions.isTeacher || user.permissions.isManagement || user.permissions.isSuperAdmin;
}

/** Staff-only analytics screen. Parents use parent_peace; students use dashboard summary. */
export function canViewAttendanceIntelligence(
  user: Pick<UserProfile, "permissions" | "isParent" | "type" | "linkedStudentIds">
): boolean {
  return canViewAttendanceIntelligenceStaff(user);
}

export function canViewOwnProfile(user: UserProfile, profileUserId: string): boolean {
  if (user.id === profileUserId) return true;
  if (user.permissions.isManagement && user.permissions.canManageUsers) {
    const target = getDirectoryUsers().find((u) => u.id === profileUserId);
    return target ? assertStudioScope(user, target.studioId) : false;
  }
  if (user.permissions.isTeacher) {
    const target = getDirectoryUsers().find((u) => u.id === profileUserId);
    if (!target || !assertStudioScope(user, target.studioId)) return false;
    if (isStudentRole(target.permissions)) return teacherSharesGroupWithStudent(user, target);
    return false;
  }
  return false;
}

export function canViewStudentFile(user: UserProfile, studentId: string): boolean {
  if (user.id === studentId) return true;
  if (user.permissions.isSuperAdmin) return true;
  const student = getDirectoryUsers().find((u) => u.id === studentId);
  if (!student || !isStudentRole(student.permissions)) return false;
  if (!assertStudioScope(user, student.studioId)) return false;
  if (user.permissions.isManagement) return true;
  if (user.permissions.isTeacher) return teacherSharesGroupWithStudent(user, student);
  return false;
}

export function canManageGalleryItem(user: UserProfile, item: Pick<GalleryItem, "studioId" | "createdByUserId">): boolean {
  if (!assertStudioScope(user, item.studioId)) return false;
  if (user.permissions.isManagement) return user.permissions.canManageGallery;
  if (user.permissions.isTeacher) return user.permissions.canManageGallery;
  return false;
}

export function canViewGalleryItem(user: UserProfile, item: GalleryItem): boolean {
  if (!assertStudioScope(user, item.studioId)) return false;
  return galleryItemAppliesToUser(item, user);
}

export function canModerateChat(user: UserProfile, chat: DanceGroupChat): boolean {
  if (!assertStudioScope(user, chat.studioId)) return false;
  if (user.permissions.isSuperAdmin) return true;
  if (user.permissions.isManagement) return true;
  return chatCanModerate(user, chat);
}

export function canPostInGroupChat(user: UserProfile, chat: DanceGroupChat): boolean {
  if (!assertStudioScope(user, chat.studioId)) return false;
  if (isStaffChat(chat)) return user.permissions.isTeacher || user.permissions.isManagement;
  if (isStudentRole(user.permissions)) return chat.studentIds.includes(user.id);
  return canAccessGroupChat(user, chat);
}

/** Students cannot DM each other — only group/staff channels. */
export function canDirectMessage(user: UserProfile, targetUserId: string): boolean {
  if (isStudentRole(user.permissions)) return false;
  if (user.id === targetUserId) return false;
  const target = getDirectoryUsers().find((u) => u.id === targetUserId);
  if (!target || !assertStudioScope(user, target.studioId)) return false;
  if (user.permissions.isManagement || user.permissions.isSuperAdmin) return true;
  if (user.permissions.isTeacher && isStudentRole(target.permissions)) {
    return teacherSharesGroupWithStudent(user, target);
  }
  return false;
}

export function canEditUserPermissions(actor: UserProfile, target: DirectoryUser): boolean {
  return canEditUserGuard(actor, target);
}

export function canViewAuditLog(user: UserProfile, studioId: string): boolean {
  if (user.permissions.isSuperAdmin) return true;
  return user.permissions.isManagement && assertStudioScope(user, studioId);
}

function teacherMayTargetGroup(user: UserProfile, groupId: string): boolean {
  const gids = new Set(userGroupIds(user));
  return gids.has(groupId) || user.permissions.isManagement;
}

function teacherMayNotifyUserId(user: UserProfile, targetUserId: string): boolean {
  if (canViewStudentFile(user, targetUserId)) return true;
  const target = getDirectoryUsers().find((u) => u.id === targetUserId);
  if (!target || (!target.isParent && target.type !== "parent")) return false;
  if (!assertStudioScope(user, target.studioId)) return false;
  return (target.linkedStudentIds ?? []).some((sid) => canViewStudentFile(user, sid));
}

export function canSendNotification(user: UserProfile, target: NotificationSendTarget): boolean {
  if (!assertStudioScope(user, target.studioId)) return false;
  if (isStudentRole(user.permissions)) return false;

  if (user.permissions.isSuperAdmin) {
    return ["studio", "all_students", "all_teachers", "staff", "dance_group", "students", "teachers", "student", "teacher"].includes(
      target.targetType
    );
  }

  if (!user.permissions.canSendNotifications) return false;

  switch (target.targetType) {
    case "student":
    case "students":
      if (user.permissions.isManagement) return true;
      if (user.permissions.isTeacher) {
        const ids = target.targetUserIds ?? [];
        return ids.every((id) => teacherMayNotifyUserId(user, id));
      }
      return false;
    case "dance_group":
      return (target.targetGroupIds ?? []).every((gid) => teacherMayTargetGroup(user, gid));
    case "studio":
    case "all_students":
      return user.permissions.isManagement;
    case "teacher":
    case "teachers":
    case "all_teachers":
    case "staff":
      return user.permissions.isManagement;
    default:
      return false;
  }
}

/** @deprecated use canSendNotification — kept for explicit import name in spec */
export { canSendNotification as canSendNotificationToTarget };

export function canBroadcastAsRole(user: UserProfile): boolean {
  return !isStudentRole(user.permissions) && user.permissions.canSendNotifications;
}

export function filterDirectoryForUser(user: UserProfile, rows: DirectoryUser[]): DirectoryUser[] {
  if (user.permissions.isSuperAdmin) return rows;
  return rows.filter((r) => r.studioId === user.studioId);
}

export function canTeacherAccessGroup(user: UserProfile, groupId: string): boolean {
  if (user.permissions.isManagement || user.permissions.isSuperAdmin) return assertStudioScope(user, user.studioId);
  return teacherMayTargetGroup(user, groupId);
}

export function canStudentAccessGroup(user: UserProfile, groupId: string, memberStudentIds: string[]): boolean {
  if (!memberStudentIds.includes(user.id)) return false;
  const gids = userGroupIds(user);
  return gids.includes(groupId);
}

export function studentsVisibleToTeacher(user: UserProfile): DirectoryUser[] {
  if (user.permissions.isManagement || user.permissions.isSuperAdmin) {
    return getDirectoryUsers().filter((u) => assertStudioScope(user, u.studioId) && isStudentRole(u.permissions));
  }
  return getStudentsForTeacher(user);
}

/** Read receipts: only sender, management, and the reader themselves (production: server-side). */
export function canViewNotificationReadReceipts(user: UserProfile, notificationCreatorId: string): boolean {
  if (user.id === notificationCreatorId) return true;
  return user.permissions.isManagement || user.permissions.isSuperAdmin;
}

/** Catalog edits — studio management only, same studio scope. */
export function canManageShopCatalog(user: UserProfile, studioId: string): boolean {
  if (!assertStudioScope(user, studioId)) return false;
  if (user.permissions.isSuperAdmin) return true;
  return user.permissions.isManagement && user.permissions.canManageShop;
}

export function canViewShopProduct(user: UserProfile, product: ShopProduct): boolean {
  if (!assertStudioScope(user, product.studioId)) return false;
  return product.isActive || canManageShopCatalog(user, product.studioId);
}

export function canPurchaseShopProduct(user: UserProfile, product: ShopProduct): boolean {
  if (!canViewShopProduct(user, product)) return false;
  if (!product.isActive || product.stockStatus === "sold_out") return false;
  return true;
}

export function canViewShopOrder(user: UserProfile, order: ShopOrder): boolean {
  if (!assertStudioScope(user, order.studioId)) return false;
  if (user.id === order.userId) return true;
  return canManageShopCatalog(user, order.studioId);
}

export function canManageShopOrder(user: UserProfile, order: ShopOrder): boolean {
  return canManageShopCatalog(user, order.studioId);
}

export function canViewPlatformShopAnalytics(user: Pick<UserProfile, "permissions">): boolean {
  return user.permissions.isSuperAdmin;
}

export function canViewUser(actor: UserProfile, targetId: string): boolean {
  return canViewOwnProfile(actor, targetId);
}

export function canEditUser(actor: UserProfile, target: DirectoryUser): boolean {
  return canEditUserGuard(actor, target);
}

export function canManageUsers(actor: Pick<UserProfile, "permissions" | "studioId">): boolean {
  return actor.permissions.isSuperAdmin || (actor.permissions.isManagement && actor.permissions.canManageUsers);
}

export function canEditText(actor: Pick<UserProfile, "permissions">): boolean {
  return actor.permissions.isSuperAdmin;
}

export function canEditStudio(actor: UserProfile, studioId: string): boolean {
  if (actor.permissions.isSuperAdmin) return true;
  return actor.permissions.isManagement && assertStudioScope(actor, studioId);
}

export function canManageShop(user: UserProfile, studioId: string): boolean {
  return canManageShopCatalog(user, studioId);
}

export function canViewShopAnalytics(user: UserProfile, studioId: string): boolean {
  if (user.permissions.isSuperAdmin) return true;
  return user.permissions.isManagement && assertStudioScope(user, studioId) && user.permissions.canManageShop;
}

export function canManagePrivateLessons(user: UserProfile, studioId: string): boolean {
  if (!assertStudioScope(user, studioId)) return false;
  if (user.permissions.isSuperAdmin) return true;
  return user.permissions.isManagement || user.permissions.isTeacher;
}

export function canManageAttendance(user: UserProfile, studioId: string): boolean {
  if (!assertStudioScope(user, studioId)) return false;
  if (user.permissions.isSuperAdmin) return true;
  return user.permissions.canManageAttendance && (user.permissions.isTeacher || user.permissions.isManagement);
}

export function canManageAchievements(user: UserProfile, studioId: string): boolean {
  if (!assertStudioScope(user, studioId)) return false;
  return user.permissions.isSuperAdmin || user.permissions.isManagement;
}

export function canManageFeatureFlags(user: Pick<UserProfile, "permissions">): boolean {
  return user.permissions.isSuperAdmin || user.permissions.canManageFeatureFlags;
}

export function canExportDatabase(user: Pick<UserProfile, "permissions">): boolean {
  return user.permissions.isSuperAdmin;
}

export function canImportDatabase(user: Pick<UserProfile, "permissions">): boolean {
  return user.permissions.isSuperAdmin;
}

export function canRunIntegrityCheck(user: Pick<UserProfile, "permissions">): boolean {
  return user.permissions.isSuperAdmin;
}

export type { NotificationTargetType };
