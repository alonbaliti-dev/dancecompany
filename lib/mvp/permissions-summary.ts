import type { UserProfile } from "@/lib/types";
import { inferUserType, USER_TYPE_LABELS } from "@/lib/users/user-type";

/** Human-readable capability list for post-login / dashboard strip. */
export function summarizeUserPermissions(user: UserProfile): { roleLabel: string; capabilities: string[] } {
  const type = inferUserType(user);
  const roleLabel = USER_TYPE_LABELS[type];
  const caps: string[] = [];

  if (user.permissions.isSuperAdmin) {
    caps.push("ניהול כל המערכת והסטודיואים", "משתמשים, סיסמאות והרשאות", "ייצוא/ייבוא מסד נתונים", "דגלי תכונות ויומן ביקורת");
    return { roleLabel, capabilities: caps };
  }

  if (user.permissions.isManagement) {
    if (user.permissions.canManageUsers) caps.push("ניהול תלמידים, הורים ומורים");
    if (user.permissions.canManageShop) caps.push("חנות והזמנות");
    if (user.permissions.canManageEvents) caps.push("אירועים והישגים");
    if (user.permissions.canViewReports) caps.push("דוחות ותובנות");
    if (user.permissions.canManageGallery) caps.push("גלריה ומדיה");
    caps.push("נוכחות, משימות והודעות בסטודיו");
    return { roleLabel, capabilities: caps.length ? caps : ["גישת הנהלה לסטודיו"] };
  }

  if (user.permissions.isTeacher) {
    caps.push("קבוצות משויכות", "נוכחות ומשימות", "שיעורים פרטיים");
    if (user.permissions.canManageGallery) caps.push("גלריה");
    if (user.permissions.canSendNotifications) caps.push("שליחת עדכונים");
    return { roleLabel, capabilities: caps };
  }

  if (user.isParent || type === "parent") {
    caps.push("מעקב ילדים מקושרים", "הודעות והרשמה לשיעורים פרטיים");
    return { roleLabel, capabilities: caps };
  }

  caps.push("משימות, שיעורים והודעות אישיות", "חנות וכרטיסים");
  return { roleLabel, capabilities: caps };
}
