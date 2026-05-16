/**
 * Session model — mock client persistence.
 *
 * Production (Supabase Auth):
 * - Passwords handled only by Supabase Auth (`signInWithPassword`, `resetPasswordForEmail`).
 * - App loads `profiles` + permissions after `supabase.auth.getSession()`.
 * - Refresh via `onAuthStateChange`; short-lived JWT + httpOnly cookies when using SSR.
 * - Never put `SUPABASE_SERVICE_ROLE_KEY` in the client bundle.
 */
import { normalizePermissions } from "@/lib/permissions";
import type { UserProfile } from "@/lib/types";
import type { AppSession } from "./types";

export type { AppSession };

const STORAGE_KEY = "lk_ss_session_v1";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days — tune with Supabase session policy

export function createSession(user: UserProfile, now = Date.now()): AppSession {
  return {
    userId: user.id,
    studioId: user.studioId,
    permissions: user.permissions,
    issuedAt: new Date(now).toISOString(),
    expiresAt: new Date(now + SESSION_TTL_MS).toISOString()
  };
}

export function isSessionExpired(session: AppSession, now = Date.now()): boolean {
  return now >= new Date(session.expiresAt).getTime();
}

/** Strip sensitive fields — UserProfile must never carry password material. */
export function toPublicProfile(user: UserProfile): UserProfile {
  return {
    ...user,
    permissions: normalizePermissions({
      isTeacher: user.permissions.isTeacher,
      isManagement: user.permissions.isManagement,
      isSuperAdmin: user.permissions.isSuperAdmin,
      isStudent: user.permissions.isStudent,
      ...user.permissions
    })
  };
}

export function saveSession(session: AppSession): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    /* quota / private mode */
  }
}

export function loadSession(): AppSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AppSession;
    if (!parsed?.userId || !parsed.expiresAt) return null;
    if (isSessionExpired(parsed)) {
      clearSession();
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function sessionMatchesUser(session: AppSession, user: UserProfile): boolean {
  return session.userId === user.id && session.studioId === user.studioId;
}
