/**
 * Central permission guards — call before mutating state or opening sensitive UI.
 * Re-exports and wraps lib/security/permissions.ts for consistent usage.
 */
import type { UserProfile } from "@/lib/types";
import * as perms from "./permissions";

export type GuardResult = { allowed: true } | { allowed: false; reason: string };

export function guard(
  allowed: boolean,
  reason = "אין הרשאה לפעולה זו"
): GuardResult {
  if (allowed) return { allowed: true };
  return { allowed: false, reason };
}

export function requireSuperAdmin(user: Pick<UserProfile, "permissions"> | null): GuardResult {
  if (!user) return { allowed: false, reason: "נדרשת התחברות" };
  return guard(perms.canViewSuperAdmin(user));
}

export function requireManagement(user: UserProfile | null): GuardResult {
  if (!user) return { allowed: false, reason: "נדרשת התחברות" };
  return guard(user.permissions.isManagement || user.permissions.isSuperAdmin);
}

export function requireTeacher(user: UserProfile | null): GuardResult {
  if (!user) return { allowed: false, reason: "נדרשת התחברות" };
  return guard(perms.canViewTeacherDashboard(user));
}

export function requireShopAccess(user: UserProfile | null, studioId: string): GuardResult {
  if (!user) return { allowed: false, reason: "נדרשת התחברות" };
  return guard(perms.canManageShop(user, studioId) || perms.canViewShopAnalytics(user, studioId));
}

export function assertGuard(result: GuardResult): asserts result is { allowed: true } {
  if (result.allowed === false) throw new Error(result.reason);
}

export { perms as permissions };
