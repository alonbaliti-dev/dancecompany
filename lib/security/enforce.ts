/**
 * Runtime enforcement helpers — call before mutations and sensitive reads.
 * UI visibility is not security; always mirror in RLS + Edge Functions.
 */
import type { UserProfile } from "@/lib/types";
import { assertStudioScope } from "./studio-isolation";

export type AuthzResult = { ok: true } | { ok: false; code: string; message: string };

export function ok(): AuthzResult {
  return { ok: true };
}

export function deny(code: string, message: string): AuthzResult {
  return { ok: false, code, message };
}

export function requireStudioRow(user: UserProfile, rowStudioId: string): AuthzResult {
  return assertStudioScope(user, rowStudioId) ? ok() : deny("STUDIO_SCOPE", "אין גישה לנתוני סטודיו אחר");
}

export function requireRole(
  user: UserProfile,
  allowed: Array<"student" | "teacher" | "management" | "super_admin">
): AuthzResult {
  if (allowed.includes("super_admin") && user.permissions.isSuperAdmin) return ok();
  if (allowed.includes("management") && user.permissions.isManagement) return ok();
  if (allowed.includes("teacher") && user.permissions.isTeacher) return ok();
  if (allowed.includes("student") && user.permissions.isStudent) return ok();
  return deny("ROLE_DENIED", "אין הרשאה לפעולה זו");
}

export function requireTeacherOrAbove(user: UserProfile): AuthzResult {
  if (user.permissions.isTeacher || user.permissions.isManagement || user.permissions.isSuperAdmin) return ok();
  return deny("TEACHER_REQUIRED", "נדרשת הרשאת מורה או הנהלה");
}

export function requireManagement(user: UserProfile): AuthzResult {
  if (user.permissions.isManagement || user.permissions.isSuperAdmin) return ok();
  return deny("MANAGEMENT_REQUIRED", "נדרשת הרשאת הנהלה");
}

export function assertAuthz(result: AuthzResult): void {
  if (!result.ok) {
    const fail = result as Extract<AuthzResult, { ok: false }>;
    throw new Error(`[${fail.code}] ${fail.message}`);
  }
}
