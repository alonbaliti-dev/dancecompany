/**
 * Auth service — mock implementation.
 *
 * Supabase Auth (production):
 * - `supabase.auth.signInWithPassword({ phone, password })`
 * - Session from `supabase.auth.getSession()` / `onAuthStateChange`
 * - Profile from `profiles` joined with permissions — never store password in profile row
 */
import type { UserProfile } from "@/lib/types";
import {
  signInWithPhonePassword,
  changePasswordForUser,
  requestPasswordReset,
  buildLoginAudit,
  buildLogoutAudit
} from "@/lib/auth/auth-client";
import { loadSession, clearSession, saveSession, createSession, isSessionExpired, toPublicProfile } from "@/lib/security/session";
import { getDirectoryUsers } from "@/lib/directory-store";

export const authService = {
  signIn(phone: string, password: string) {
    return signInWithPhonePassword(phone, password);
  },

  changePassword(params: { user: UserProfile; currentPassword: string; newPassword: string; confirmPassword: string }) {
    return changePasswordForUser(params);
  },

  requestPasswordReset(phone: string) {
    return requestPasswordReset(phone);
  },

  persistSession(user: UserProfile) {
    saveSession(createSession(user));
  },

  clearSession() {
    clearSession();
  },

  buildLoginAudit,
  buildLogoutAudit,

  /** Restore user from mock session + profile seed. */
  restoreUserFromSession(): UserProfile | null {
    const session = loadSession();
    if (!session || isSessionExpired(session)) {
      clearSession();
      return null;
    }
    const profile = getDirectoryUsers().find((u) => u.id === session.userId);
    if (!profile || profile.studioId !== session.studioId || profile.status === "inactive") {
      clearSession();
      return null;
    }
    return toPublicProfile(profile);
  },

  async getSession(): Promise<UserProfile | null> {
    // Supabase: const { data } = await supabase.auth.getSession(); then load profile
    return this.restoreUserFromSession();
  }
};
