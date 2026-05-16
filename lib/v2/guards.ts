import type { V2PermissionKey, V2Role, V2User } from "./types";

export const roleLabel: Record<V2Role, string> = {
  student: "תלמיד/ה",
  parent: "הורה",
  teacher: "מורה",
  management: "הנהלה",
  super_admin: "מנהל מערכת"
};

export const permissionLabel: Record<V2PermissionKey, string> = {
  manage_users: "ניהול משתמשים",
  edit_credentials: "עריכת טלפון/סיסמה",
  edit_permissions: "עריכת הרשאות",
  export_import_db: "ייצוא/ייבוא מסד",
  edit_text: "עריכת טקסטים",
  view_audit: "צפייה באודיט",
  manage_feature_flags: "ניהול פיצ׳רים",
  manage_studio: "ניהול סטודיו",
  manage_attendance: "ניהול נוכחות",
  manage_shop: "ניהול חנות",
  manage_private_lessons: "ניהול שיעורים פרטיים",
  teacher_dashboard: "דשבורד מורה"
};

export function can(user: V2User | null | undefined, key: V2PermissionKey): boolean {
  if (!user || !user.isActive) return false;
  if (user.role === "super_admin") return true;
  return Boolean(user.permissions[key]);
}

export function canAccessTeacherDashboard(user: V2User): boolean {
  return user.role === "teacher" || user.role === "management" || user.role === "super_admin" || can(user, "teacher_dashboard");
}

export function canAccessManagement(user: V2User): boolean {
  return user.role === "management" || user.role === "super_admin" || can(user, "manage_studio");
}

export function canAccessSuperAdmin(user: V2User): boolean {
  return user.role === "super_admin";
}

export function canSeeUser(actor: V2User, target: V2User): boolean {
  if (actor.role === "super_admin") return true;
  if (actor.studioId !== target.studioId) return false;
  if (can(actor, "manage_users")) return true;
  if (actor.id === target.id) return true;
  if (actor.role === "parent") return actor.linkedStudentIds.includes(target.id);
  if (actor.role === "teacher") return target.groupIds.some((gid) => actor.groupIds.includes(gid));
  return false;
}
