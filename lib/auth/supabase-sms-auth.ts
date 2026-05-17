import "server-only";

import type { Session, User } from "@supabase/supabase-js";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { RecordStatus, UserProfileRow, UserRoleRow } from "@/lib/supabase/types";
import { normalizePhoneForAuth, legacyIsraeliPhoneForAuth, isSupportedIsraeliPhone } from "@/lib/auth/password-hashing";
import { resolveVerifiedAcademyProfile, type AcademySessionResult } from "@/lib/auth/academy-session";

type OtpBucket = {
  count: number;
  resetAt: number;
};

const sendBuckets = new Map<string, OtpBucket>();
const SEND_WINDOW_MS = 10 * 60 * 1000;
const SEND_MAX_ATTEMPTS = 4;

function rateLimit(key: string) {
  const now = Date.now();
  const bucket = sendBuckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    sendBuckets.set(key, { count: 1, resetAt: now + SEND_WINDOW_MS });
    return true;
  }
  bucket.count += 1;
  return bucket.count <= SEND_MAX_ATTEMPTS;
}

function phoneTail(phone: string) {
  return phone.slice(-4);
}

function invalidOtp(): AcademySessionResult {
  return { ok: false, code: "invalid_session", status: 401, message: "Invalid or expired SMS code." };
}

async function auditOtp(input: { academyId: string; userProfileId?: string | null; action: string; success: boolean }) {
  const supabase = getSupabaseServerClient({ preferServiceRole: true });
  if (supabase.enabled === false) return;

  await supabase.client
    .from("audit_logs")
    .insert({
      id: `audit_supabase_sms_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
      academy_id: input.academyId,
      actor_user_id: input.userProfileId ?? null,
      action: input.action,
      target: input.userProfileId ?? "supabase-sms-otp",
      metadata: {
        success: input.success,
        source: "supabase_auth_sms_otp"
      }
    })
    .then(() => undefined);
}

async function bindOrCreateProfileForSupabasePhone(user: User, academyId: string) {
  const phone = normalizePhoneForAuth(user.phone ?? "");
  const legacyPhone = legacyIsraeliPhoneForAuth(phone);
  const phoneCandidates = [...new Set([phone, legacyPhone].filter(Boolean))];
  const supabase = getSupabaseServerClient({ preferServiceRole: true });
  if (supabase.enabled === false) throw new Error(supabase.reason);

  const { data: boundProfile, error: boundError } = await supabase.client
    .from("users_profile")
    .select("id, auth_user_id")
    .eq("auth_user_id", user.id)
    .eq("status", "active")
    .maybeSingle();
  if (boundError) throw boundError;
  if (boundProfile?.id) return boundProfile.id;

  const { data: existingProfile, error: profileError } = await supabase.client
    .from("users_profile")
    .select("*")
    .eq("academy_id", academyId)
    .in("phone", phoneCandidates)
    .neq("status", "archived")
    .limit(1)
    .maybeSingle();
  if (profileError) throw profileError;

  if (existingProfile) {
    const profile = existingProfile as UserProfileRow;
    if (profile.auth_user_id && profile.auth_user_id !== user.id) {
      throw new Error("phone_profile_bound_to_another_auth_user");
    }
    const { error } = await supabase.client
      .from("users_profile")
      .update({
        auth_user_id: user.id,
        phone,
        active_academy_id: profile.active_academy_id ?? academyId,
        status: profile.status === "inactive" ? "active" : profile.status
      })
      .eq("id", profile.id);
    if (error) throw error;
    return profile.id;
  }

  const digits = phone.replace(/\D/g, "");
  const profileId = `profile_${academyId}_${digits}`;
  const profileRow = {
    id: profileId,
    academy_id: academyId,
    auth_user_id: user.id,
    full_name: "New studio member",
    full_name_he: "משתמש חדש",
    phone,
    active_academy_id: academyId,
    status: "active" as RecordStatus,
    metadata: {
      auto_created: true,
      source: "supabase_sms_otp",
      requires_management_review: true
    }
  } satisfies Partial<UserProfileRow> & Pick<UserProfileRow, "id" | "full_name">;

  const { error: createError } = await supabase.client
    .from("users_profile")
    .upsert(profileRow, { onConflict: "id" });
  if (createError) throw createError;

  const roleRow = {
    academy_id: academyId,
    user_id: profileId,
    role: "student",
    status: "active" as RecordStatus
  } satisfies Partial<UserRoleRow> & Pick<UserRoleRow, "academy_id" | "user_id" | "role">;

  const { error: roleError } = await supabase.client
    .from("user_roles")
    .upsert(roleRow, { onConflict: "academy_id,user_id,role" });
  if (roleError) throw roleError;

  await auditOtp({ academyId, userProfileId: profileId, action: "auth.profile_auto_created_from_supabase_sms", success: true });
  return profileId;
}

export async function sendSupabaseSmsOtp(input: { academyId: string; phone: string }) {
  const academyId = input.academyId.trim();
  const phone = normalizePhoneForAuth(input.phone);

  if (!academyId || !isSupportedIsraeliPhone(phone)) {
    return { ok: false as const, status: 400, error: "invalid_phone" };
  }
  if (!rateLimit(`${academyId}:${phone}`)) {
    return { ok: false as const, status: 429, error: "too_many_attempts" };
  }

  const supabase = getSupabaseServerClient();
  if (supabase.enabled === false) {
    return { ok: false as const, status: 503, error: "supabase_not_configured" };
  }

  const { error } = await supabase.client.auth.signInWithOtp({ phone });
  if (error) {
    await auditOtp({ academyId, action: "auth.supabase_sms_send_failed", success: false });
    return { ok: false as const, status: 503, error: "sms_send_failed" };
  }

  await auditOtp({ academyId, action: "auth.supabase_sms_sent", success: true });
  return { ok: true as const, phone, phoneTail: phoneTail(phone) };
}

export async function verifySupabaseSmsOtp(input: {
  academyId: string;
  phone: string;
  token: string;
}): Promise<(AcademySessionResult & { supabaseSession?: Session })> {
  const academyId = input.academyId.trim();
  const phone = normalizePhoneForAuth(input.phone);
  const token = input.token.replace(/\D/g, "");

  if (!academyId || !isSupportedIsraeliPhone(phone) || token.length !== 6) return invalidOtp();

  const supabase = getSupabaseServerClient();
  if (supabase.enabled === false) {
    return { ok: false, code: "supabase_not_configured", status: 503, message: supabase.reason };
  }

  const { data, error } = await supabase.client.auth.verifyOtp({
    phone,
    token,
    type: "sms"
  });

  if (error || !data.user || !data.session) {
    await auditOtp({ academyId, action: "auth.supabase_sms_verify_failed", success: false });
    return invalidOtp();
  }

  try {
    await bindOrCreateProfileForSupabasePhone(data.user, academyId);
  } catch {
    await auditOtp({ academyId, action: "auth.supabase_sms_profile_bind_failed", success: false });
    return { ok: false, code: "profile_not_found", status: 403, message: "Could not bind the verified phone to an academy profile." };
  }

  const session = await resolveVerifiedAcademyProfile(data.user.id, academyId);
  if (session.ok === false) return session;

  await auditOtp({ academyId, userProfileId: session.session.profile.id, action: "auth.supabase_sms_succeeded", success: true });

  return {
    ...session,
    supabaseSession: data.session
  };
}
