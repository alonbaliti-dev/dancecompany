import { PLATFORM_OWNER_BADGE, PLATFORM_OWNER_NAME } from "@/lib/demo/identity";
import type { UserProfile } from "@/lib/types";

/** Primary experience tier for navigation and copy. */
export type RoleTier = "platform" | "management" | "teacher" | "student" | "parent";

export function resolveRoleTier(user: Pick<UserProfile, "permissions" | "isParent">): RoleTier {
  if (user.permissions.isSuperAdmin) return "platform";
  if (user.permissions.isManagement) return "management";
  if (user.permissions.isTeacher) return "teacher";
  if (user.isParent) return "parent";
  return "student";
}

const ROLE_LABEL: Record<RoleTier, string> = {
  platform: PLATFORM_OWNER_NAME,
  management: "הנהלת סטודיו",
  teacher: "מורה",
  student: "תלמיד/ה",
  parent: "הורה"
};

export { PLATFORM_OWNER_BADGE };

export function getRoleLabel(user: Pick<UserProfile, "permissions" | "isParent">): string {
  return ROLE_LABEL[resolveRoleTier(user)];
}

export function getRoleHeaderLines(
  user: Pick<UserProfile, "permissions" | "isParent">,
  opts?: { activeStudioName?: string; impersonating?: boolean }
): { primary: string; secondary: string } {
  const tier = resolveRoleTier(user);
  const studio = opts?.activeStudioName?.trim();

  if (tier === "platform") {
    if (opts?.impersonating && studio) {
      return { primary: PLATFORM_OWNER_NAME, secondary: `${PLATFORM_OWNER_BADGE} · צפייה כהנהלה · ${studio}` };
    }
    if (studio) {
      return { primary: PLATFORM_OWNER_NAME, secondary: `${PLATFORM_OWNER_BADGE} · סטודיו פעיל · ${studio}` };
    }
    return { primary: PLATFORM_OWNER_NAME, secondary: `${PLATFORM_OWNER_BADGE} · כל הסטודיואים` };
  }

  if (tier === "management") {
    return { primary: ROLE_LABEL.management, secondary: studio ? studio : "משתמשים, דוחות ותפעול" };
  }
  if (tier === "teacher") {
    return { primary: ROLE_LABEL.teacher, secondary: "שיעורים, משימות וקבוצות" };
  }
  if (tier === "parent") {
    return { primary: ROLE_LABEL.parent, secondary: "מעקב התקדמות ועדכונים" };
  }
  return { primary: ROLE_LABEL.student, secondary: "שיעורים, חזרות וצמיחה אמנותית ב-LK" };
}

export function getMoreScreenSubtitle(user: Pick<UserProfile, "permissions" | "isParent">): string {
  const tier = resolveRoleTier(user);
  if (tier === "platform") return `${PLATFORM_OWNER_BADGE} · סטודיואים, הרשאות ותכונות.`;
  if (tier === "management") return "הנהלה, תקשורת וחשבון — לפי ההרשאות שלך.";
  if (tier === "teacher") return "כלי הוראה, תקשורת וחשבון.";
  if (tier === "parent") return "מעקב רגוע אחרי ההתקדמות.";
  return "כל מה שחשוב לסטודיו — מסודר לפי נושאים.";
}

export function showPlatformAdminMenu(user: Pick<UserProfile, "permissions">): boolean {
  return user.permissions.isSuperAdmin;
}

export function showStudioManagementMenu(user: Pick<UserProfile, "permissions">): boolean {
  return user.permissions.isManagement && user.permissions.canManageUsers;
}

export function showStudioTeacherMenu(user: Pick<UserProfile, "permissions">): boolean {
  return user.permissions.isTeacher;
}

export function showStudentLearningMenu(user: Pick<UserProfile, "permissions" | "isParent">): boolean {
  const tier = resolveRoleTier(user);
  return tier === "student" || tier === "parent" || tier === "teacher" || tier === "management";
}
