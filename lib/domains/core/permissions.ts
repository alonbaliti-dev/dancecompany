/**
 * Domain action → permission guard mapping (single registry).
 */
import * as perms from "@/lib/security/permissions";
import { guard, requireManagement, requireSuperAdmin, requireTeacher } from "@/lib/security/guards";
import type { UserProfile } from "@/lib/types";
import type { GuardResult } from "@/lib/security/guards";
import type { ShopOrder, ShopProduct } from "@/lib/types";

export const domainGuards = {
  superAdmin: (user: UserProfile | null) =>
    user ? requireSuperAdmin(user) : { allowed: false as const, reason: "נדרשת התחברות" },

  management: (user: UserProfile | null) =>
    user ? requireManagement(user) : { allowed: false as const, reason: "נדרשת התחברות" },

  teacherOrManagement: (user: UserProfile | null) =>
    user ? requireTeacher(user) : { allowed: false as const, reason: "נדרשת התחברות" },

  manageFeatureFlags: (user: UserProfile | null): GuardResult =>
    user?.permissions.canManageFeatureFlags || user?.permissions.isSuperAdmin
      ? guard(true)
      : guard(false, "אין הרשאה לניהול תכונות"),

  createTask: (user: UserProfile | null): GuardResult =>
    user?.permissions.isTeacher || user?.permissions.isManagement
      ? guard(true)
      : guard(false, "רק צוות יכול ליצור משימות"),

  sendStudioUpdate: (user: UserProfile | null): GuardResult =>
    user?.permissions.canSendNotifications
      ? guard(true)
      : guard(false, "אין הרשאה לשלוח עדכונים"),

  manageGallery: (user: UserProfile | null): GuardResult =>
    user?.permissions.isTeacher || user?.permissions.isManagement
      ? guard(true)
      : guard(false, "אין הרשאה לגלריה"),

  manageShop: (user: UserProfile | null, studioId: string): GuardResult =>
    user ? guard(perms.canManageShop(user, studioId)) : guard(false, "נדרשת התחברות"),

  purchaseShop: (user: UserProfile | null, product: ShopProduct): GuardResult =>
    user ? guard(perms.canPurchaseShopProduct(user, product)) : guard(false, "נדרשת התחברות"),

  viewShopOrder: (user: UserProfile | null, order: ShopOrder): GuardResult =>
    user ? guard(perms.canViewShopOrder(user, order)) : guard(false, "נדרשת התחברות"),

  eventOperatingMode: (user: UserProfile | null): GuardResult =>
    user
      ? guard(
          user.permissions.canManageEvents ||
            user.permissions.isTeacher ||
            user.permissions.isManagement ||
            user.permissions.isSuperAdmin
        )
      : guard(false, "נדרשת התחברות"),

  attendanceIntelligence: (user: UserProfile | null): GuardResult =>
    user ? guard(perms.canViewAttendanceIntelligence(user)) : guard(false, "צוות בלבד"),

  importDatabase: (user: UserProfile | null): GuardResult => requireSuperAdmin(user),

  exportDatabase: (user: UserProfile | null): GuardResult =>
    user?.permissions.isSuperAdmin || user?.permissions.isManagement
      ? guard(true)
      : guard(false, "אין הרשאה לייצוא")
};
