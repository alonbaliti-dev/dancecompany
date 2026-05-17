import "server-only";

import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import type { Session, User } from "@supabase/supabase-js";
import { getAuthMode } from "@/lib/auth/auth-mode";
import { createAcademyScope, type AcademyScope, type AcademyScopedActor } from "@/lib/security/academy-scope";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { PlatformRole, UserProfileRow, UserRole, UserRoleRow } from "@/lib/supabase/types";
import { DEFAULT_ACADEMY_ID } from "@/lib/v6/seed";

export const SUPABASE_ACCESS_TOKEN_COOKIE = "lk_supabase_access_token";
export const SUPABASE_REFRESH_TOKEN_COOKIE = "lk_supabase_refresh_token";
export const ACADEMY_APP_SESSION_COOKIE = "lk_academy_session";

type SessionErrorCode =
  | "local_demo"
  | "supabase_not_configured"
  | "missing_session"
  | "invalid_session"
  | "profile_not_found"
  | "academy_forbidden"
  | "session_secret_missing";

export type VerifiedAcademySession = {
  authMethod: "academy_phone" | "supabase_auth";
  authUserId?: string;
  authCredentialId?: string;
  email?: string;
  profile: UserProfileRow;
  actor: AcademyScopedActor;
  academyId: string;
  academyIds: string[];
  role: UserRole;
  platformRole?: PlatformRole;
  scope: AcademyScope;
};

export type AcademySessionResult =
  | { ok: true; session: VerifiedAcademySession }
  | { ok: false; code: SessionErrorCode; message: string; status: 401 | 403 | 503 };

type ProfileWithRoles = UserProfileRow & {
  user_roles?: Array<Pick<UserRoleRow, "academy_id" | "role" | "status">> | null;
};

type AppSessionPayload = {
  version: 1;
  sessionId: string;
  userProfileId: string;
  academyId: string;
  authCredentialId?: string;
  issuedAt: number;
  expiresAt: number;
};

const APP_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 14;

function readCookie(header: string | null, name: string) {
  if (!header) return null;

  const match = header
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));

  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

function base64UrlEncode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sessionSecret() {
  return process.env.APP_SESSION_SECRET?.trim() || process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || null;
}

function signSessionPayload(payload: AppSessionPayload, secret: string) {
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = createHmac("sha256", secret).update(encodedPayload).digest("base64url");
  return `${encodedPayload}.${signature}`;
}

function verifySessionToken(token: string): AppSessionPayload | null {
  const secret = sessionSecret();
  if (!secret) return null;

  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return null;

  const expected = createHmac("sha256", secret).update(encodedPayload).digest("base64url");
  const signatureBuffer = Buffer.from(signature, "base64url");
  const expectedBuffer = Buffer.from(expected, "base64url");
  if (signatureBuffer.length !== expectedBuffer.length || !timingSafeEqual(signatureBuffer, expectedBuffer)) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as AppSessionPayload;
    if (payload.version !== 1 || payload.expiresAt <= Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

function getAppSessionTokenFromRequest(request: Request) {
  return readCookie(request.headers.get("cookie"), ACADEMY_APP_SESSION_COOKIE);
}

function getAccessTokenFromRequest(request: Request) {
  const authorization = request.headers.get("authorization");
  if (authorization?.toLowerCase().startsWith("bearer ")) {
    return authorization.slice("bearer ".length).trim();
  }

  return readCookie(request.headers.get("cookie"), SUPABASE_ACCESS_TOKEN_COOKIE);
}

function getRefreshTokenFromRequest(request: Request) {
  return readCookie(request.headers.get("cookie"), SUPABASE_REFRESH_TOKEN_COOKIE);
}

function activeRoles(profile: ProfileWithRoles) {
  return (profile.user_roles ?? []).filter((role) => role.status === "active");
}

function selectAcademyId(profile: ProfileWithRoles, requestedAcademyId?: string | null) {
  const roles = activeRoles(profile);
  return requestedAcademyId ?? profile.active_academy_id ?? profile.academy_id ?? roles[0]?.academy_id ?? DEFAULT_ACADEMY_ID;
}

function selectRole(profile: ProfileWithRoles, academyId: string): UserRole {
  if (profile.platform_role === "super_admin") return "super_admin";
  return activeRoles(profile).find((role) => role.academy_id === academyId)?.role ?? "student";
}

function canAccessAcademy(profile: ProfileWithRoles, academyId: string) {
  if (profile.platform_role === "super_admin") return true;
  if (profile.academy_id === academyId) return true;
  return activeRoles(profile).some((role) => role.academy_id === academyId);
}

function verifiedSessionFromProfile(
  profile: ProfileWithRoles,
  auth: { method: "academy_phone"; credentialId?: string } | { method: "supabase_auth"; userId: string },
  requestedAcademyId?: string | null
): AcademySessionResult {
  const academyId = selectAcademyId(profile, requestedAcademyId);

  if (!canAccessAcademy(profile, academyId)) {
    return {
      ok: false,
      code: "academy_forbidden",
      status: 403,
      message: "Signed-in user is not assigned to the requested academy."
    };
  }

  const academyIds = [...new Set([profile.academy_id, profile.active_academy_id, ...activeRoles(profile).map((role) => role.academy_id)].filter(Boolean) as string[])];
  const role = selectRole(profile, academyId);
  const actor: AcademyScopedActor = {
    userId: profile.id,
    academyId,
    academyIds,
    role,
    platformRole: profile.platform_role ?? undefined
  };

  return {
    ok: true,
    session: {
      authMethod: auth.method,
      authUserId: auth.method === "supabase_auth" ? auth.userId : profile.auth_user_id ?? undefined,
      authCredentialId: auth.method === "academy_phone" ? auth.credentialId : undefined,
      email: profile.email ?? undefined,
      profile,
      actor,
      academyId,
      academyIds,
      role,
      platformRole: profile.platform_role ?? undefined,
      scope: createAcademyScope({ academyId, actor })
    }
  };
}

export async function resolveVerifiedAcademyProfile(authUserId: string, requestedAcademyId?: string | null): Promise<AcademySessionResult> {
  const supabase = getSupabaseServerClient({ preferServiceRole: true });

  if (supabase.enabled === false) {
    return {
      ok: false,
      code: "supabase_not_configured",
      status: 503,
      message: supabase.reason
    };
  }

  const { data, error } = await supabase.client
    .from("users_profile")
    .select("*, user_roles(academy_id, role, status)")
    .eq("auth_user_id", authUserId)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    return { ok: false, code: "profile_not_found", status: 403, message: error.message };
  }

  if (!data) {
    return {
      ok: false,
      code: "profile_not_found",
      status: 403,
      message: "Supabase user is signed in, but no active academy profile is bound to this auth user."
    };
  }

  const profile = data as ProfileWithRoles;
  return verifiedSessionFromProfile(profile, { method: "supabase_auth", userId: authUserId }, requestedAcademyId);
}

export async function resolveVerifiedAcademyProfileById(
  userProfileId: string,
  requestedAcademyId?: string | null,
  options: { authCredentialId?: string } = {}
): Promise<AcademySessionResult> {
  const supabase = getSupabaseServerClient({ preferServiceRole: true });

  if (supabase.enabled === false) {
    return {
      ok: false,
      code: "supabase_not_configured",
      status: 503,
      message: supabase.reason
    };
  }

  const { data, error } = await supabase.client
    .from("users_profile")
    .select("*, user_roles(academy_id, role, status)")
    .eq("id", userProfileId)
    .eq("status", "active")
    .maybeSingle();

  if (error || !data) {
    return {
      ok: false,
      code: "profile_not_found",
      status: 403,
      message: error instanceof Error ? error.message : "No active academy profile is bound to this phone credential."
    };
  }

  return verifiedSessionFromProfile(data as ProfileWithRoles, { method: "academy_phone", credentialId: options.authCredentialId }, requestedAcademyId);
}

export async function requireVerifiedAcademySession(request: Request, options: { academyId?: string | null } = {}): Promise<AcademySessionResult> {
  if (getAuthMode() !== "supabase") {
    return {
      ok: false,
      code: "local_demo",
      status: 503,
      message: "Production academy sessions are not active in local demo mode."
    };
  }

  const appSessionToken = getAppSessionTokenFromRequest(request);
  if (appSessionToken) {
    const payload = verifySessionToken(appSessionToken);
    if (!payload) {
      await clearAcademySessionCookies();
      return { ok: false, code: "invalid_session", status: 401, message: "Academy session is missing, expired, or invalid." };
    }

    return resolveVerifiedAcademyProfileById(payload.userProfileId, options.academyId ?? payload.academyId, {
      authCredentialId: payload.authCredentialId
    });
  }

  const token = getAccessTokenFromRequest(request);
  const refreshToken = getRefreshTokenFromRequest(request);
  if (!token && !refreshToken) {
    return { ok: false, code: "missing_session", status: 401, message: "A verified academy session is required." };
  }

  const supabase = getSupabaseServerClient();
  if (supabase.enabled === false) {
    return { ok: false, code: "supabase_not_configured", status: 503, message: supabase.reason };
  }

  let user: User | null = null;

  if (token) {
    const verified = await supabase.client.auth.getUser(token);
    user = verified.data.user;
  }

  if (!user && refreshToken) {
    const refreshed = await supabase.client.auth.refreshSession({ refresh_token: refreshToken });
    if (refreshed.data.session) {
      await setSupabaseSessionCookies(refreshed.data.session);
      const verified = await supabase.client.auth.getUser(refreshed.data.session.access_token);
      user = verified.data.user;
    }
  }

  if (!user) {
    await clearAcademySessionCookies();
    return { ok: false, code: "invalid_session", status: 401, message: "Academy session is missing, expired, or invalid." };
  }

  return resolveVerifiedAcademyProfile(user.id, options.academyId);
}

export async function signOutVerifiedAcademySession(request: Request) {
  const token = getAccessTokenFromRequest(request);
  const supabase = getSupabaseServerClient({ preferServiceRole: true });

  if (token && supabase.enabled) {
    await supabase.client.auth.admin.signOut(token, "local").catch(() => undefined);
  }

  await clearAcademySessionCookies();
}

export async function setAcademyAppSessionCookie(session: VerifiedAcademySession) {
  const secret = sessionSecret();
  if (!secret) {
    return {
      ok: false as const,
      code: "session_secret_missing",
      status: 503 as const,
      message: "Server session signing secret is missing."
    };
  }

  const cookieStore = await cookies();
  const secure = process.env.NODE_ENV === "production";
  const now = Date.now();
  const token = signSessionPayload(
    {
      version: 1,
      sessionId: randomBytes(18).toString("base64url"),
      userProfileId: session.profile.id,
      academyId: session.academyId,
      authCredentialId: session.authCredentialId,
      issuedAt: now,
      expiresAt: now + APP_SESSION_MAX_AGE_SECONDS * 1000
    },
    secret
  );

  cookieStore.set(ACADEMY_APP_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: APP_SESSION_MAX_AGE_SECONDS
  });

  return { ok: true as const };
}

export async function setSupabaseSessionCookies(session: Session) {
  const cookieStore = await cookies();
  const secure = process.env.NODE_ENV === "production";

  cookieStore.set(SUPABASE_ACCESS_TOKEN_COOKIE, session.access_token, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: session.expires_in
  });

  cookieStore.set(SUPABASE_REFRESH_TOKEN_COOKIE, session.refresh_token, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });
}

export async function clearSupabaseSessionCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(SUPABASE_ACCESS_TOKEN_COOKIE);
  cookieStore.delete(SUPABASE_REFRESH_TOKEN_COOKIE);
}

export async function clearAcademySessionCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(ACADEMY_APP_SESSION_COOKIE);
  cookieStore.delete(SUPABASE_ACCESS_TOKEN_COOKIE);
  cookieStore.delete(SUPABASE_REFRESH_TOKEN_COOKIE);
}
