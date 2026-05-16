import type { UserProfile } from "@/lib/types";
import { auditActorFromUser, createAuditLog } from "@/lib/security/audit";
import { checkRateLimit, resetRateLimit } from "@/lib/security/rate-limits";
import { createSession, toPublicProfile, type AppSession } from "@/lib/security/session";
import { validatePassword, validatePhone } from "@/lib/security/validation";
import { getDirectoryUsers } from "@/lib/directory-store";
import type { DbUserRecord } from "@/lib/local-db/db-types";
import { getStoredPassword, setStoredPassword } from "./mock-auth-store";
import { normalizeIsraeliMobile } from "./phone";

export type SignInResult =
  | { kind: "success"; user: UserProfile; session: AppSession }
  | { kind: "failure"; code: "invalid" | "inactive" | "rate_limited" };

export type ForgotPasswordResult =
  | { kind: "success"; message: string }
  | { kind: "failure"; code: "not_found" | "rate_limited" };

export type ChangePasswordResult =
  | { kind: "success"; passwordLastChangedAt: string }
  | { kind: "failure"; reason: "current" | "length" | "mismatch" | "rate_limited" };

const MIN_LEN = 6;

/**
 * Mock sign-in.
 *
 * Production: `supabase.auth.signInWithPassword({ phone, password })` — passwords never touch app state.
 * Profile + permissions loaded from `profiles` table after auth session is established.
 */
export function signInWithPhonePassword(phoneRaw: string, passwordRaw: string): SignInResult {
  const phoneCheck = validatePhone(phoneRaw.trim());
  const phone = phoneCheck.ok ? normalizeIsraeliMobile(phoneCheck.normalized) : normalizeIsraeliMobile(phoneRaw.trim());
  const password = passwordRaw;
  if (!phone || !password) return { kind: "failure", code: "invalid" };

  const rate = checkRateLimit(phone, "login");
  if (!rate.allowed) return { kind: "failure", code: "rate_limited" };

  const account = findAccountByPhone(phone);
  if (!account) return { kind: "failure", code: "invalid" };
  if (account.status === "inactive") return { kind: "failure", code: "inactive" };

  if (getStoredPassword(account.id) !== password) return { kind: "failure", code: "invalid" };

  resetRateLimit(phone, "login");

  const user = toPublicProfile({
    ...account,
    lastLoginAt: "עכשיו"
  });
  const session = createSession(user);
  return { kind: "success", user, session };
}

/**
 * Placeholder — production: `supabase.auth.resetPasswordForEmail` or SMS OTP flow.
 */
export function requestPasswordReset(phoneRaw: string): ForgotPasswordResult {
  const phone = normalizeIsraeliMobile(phoneRaw.trim());
  if (!phone) return { kind: "failure", code: "not_found" };

  const rate = checkRateLimit(phone, "passwordReset");
  if (!rate.allowed) return { kind: "failure", code: "rate_limited" };

  const account = findAccountByPhone(phone);
  if (!account) {
    // Do not reveal whether account exists
    return { kind: "success", message: "אם החשבון קיים, נשלחו הוראות לאיפוס סיסמה." };
  }

  return {
    kind: "success",
    message: "אם החשבון קיים, נשלחו הוראות לאיפוס סיסמה. (מצב פיתוח — אין שליחה אמיתית)"
  };
}

/**
 * Mock password change.
 * Production: Supabase `updateUser({ password })` + audit log via server route.
 */
export function changePasswordForUser(params: {
  user: UserProfile;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): ChangePasswordResult & { auditEntry?: ReturnType<typeof createAuditLog> } {
  const { user, currentPassword, newPassword, confirmPassword } = params;

  const rate = checkRateLimit(user.id, "passwordReset");
  if (!rate.allowed) return { kind: "failure", reason: "rate_limited" };

  if (getStoredPassword(user.id) !== currentPassword) return { kind: "failure", reason: "current" };

  const lenCheck = validatePassword(newPassword, MIN_LEN);
  if (!lenCheck.ok) return { kind: "failure", reason: "length" };

  if (newPassword !== confirmPassword) return { kind: "failure", reason: "mismatch" };

  setStoredPassword(user.id, newPassword);

  const auditEntry = createAuditLog({
    action: "password_changed",
    actor: auditActorFromUser(user),
    target: { type: "user", id: user.id, studioId: user.studioId },
    severity: "warning"
  });

  return {
    kind: "success",
    passwordLastChangedAt: new Date().toLocaleDateString("he-IL"),
    auditEntry
  };
}

export function buildLogoutAudit(user: UserProfile) {
  return createAuditLog({
    action: "logout",
    actor: auditActorFromUser(user),
    severity: "info"
  });
}

export function buildLoginAudit(user: UserProfile) {
  return createAuditLog({
    action: "login",
    actor: auditActorFromUser(user),
    severity: "info"
  });
}

function findAccountByPhone(normalizedPhone: string): DbUserRecord | undefined {
  return getDirectoryUsers().find((u) => normalizeIsraeliMobile(u.phone) === normalizedPhone) as DbUserRecord | undefined;
}
