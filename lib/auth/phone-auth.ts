import "server-only";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { AuthCredentialRow, RecordStatus } from "@/lib/supabase/types";
import { resolveVerifiedAcademyProfileById, type AcademySessionResult } from "./academy-session";
import { hashPassword, normalizePhoneForAuth, verifyPassword } from "./password-hashing";
import type { RepositoryWriteContext } from "@/lib/repositories/repository-context";
import { requireAcademyScope, isSuperAdminActor } from "@/lib/security/academy-scope";

type PhoneLoginInput = {
  academyId: string;
  phone: string;
  password: string;
};

type CredentialUpsertInput = {
  academyId: string;
  userProfileId: string;
  phone: string;
  password?: string;
  temporaryPasswordFlag?: boolean;
  mustChangePassword?: boolean;
  status?: RecordStatus;
};

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const loginAttempts = new Map<string, RateLimitBucket>();
const LOGIN_WINDOW_MS = 10 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 8;

function rateLimitKey(academyId: string, phone: string) {
  return `${academyId}:${phone}`;
}

function checkLoginRateLimit(academyId: string, phone: string) {
  const now = Date.now();
  const key = rateLimitKey(academyId, phone);
  const bucket = loginAttempts.get(key);
  if (!bucket || bucket.resetAt <= now) {
    loginAttempts.set(key, { count: 1, resetAt: now + LOGIN_WINDOW_MS });
    return true;
  }

  bucket.count += 1;
  return bucket.count <= LOGIN_MAX_ATTEMPTS;
}

function resetLoginRateLimit(academyId: string, phone: string) {
  loginAttempts.delete(rateLimitKey(academyId, phone));
}

function invalidLogin(): AcademySessionResult {
  return {
    ok: false,
    code: "invalid_session",
    status: 401,
    message: "Invalid phone or password."
  };
}

async function auditAuthAttempt(input: { academyId: string; userProfileId?: string; action: string; success: boolean }) {
  const supabase = getSupabaseServerClient({ preferServiceRole: true });
  if (supabase.enabled === false) return;

  await supabase.client
    .from("audit_logs")
    .insert({
      id: `audit_auth_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
      academy_id: input.academyId,
      actor_user_id: input.userProfileId ?? null,
      action: input.action,
      target: input.userProfileId ?? "phone-login",
      metadata: {
        success: input.success,
        source: "academy_phone"
      }
    })
    .then(() => undefined);
}

export async function authenticateWithPhonePassword(input: PhoneLoginInput): Promise<AcademySessionResult> {
  const academyId = input.academyId.trim();
  const phone = normalizePhoneForAuth(input.phone);
  const password = input.password;

  if (!academyId || !phone || !password) return invalidLogin();
  if (!checkLoginRateLimit(academyId, phone)) return invalidLogin();

  const supabase = getSupabaseServerClient({ preferServiceRole: true });
  if (supabase.enabled === false) {
    return { ok: false, code: "supabase_not_configured", status: 503, message: supabase.reason };
  }

  const { data, error } = await supabase.client
    .from("auth_credentials")
    .select("*")
    .eq("academy_id", academyId)
    .eq("phone_normalized", phone)
    .eq("status", "active")
    .maybeSingle();

  if (error || !data) {
    await auditAuthAttempt({ academyId, action: "auth.phone_login_failed", success: false });
    return invalidLogin();
  }

  const credential = data as AuthCredentialRow;
  const verified = await verifyPassword(password, credential.password_hash);
  if (!verified) {
    await auditAuthAttempt({ academyId, userProfileId: credential.user_profile_id, action: "auth.phone_login_failed", success: false });
    return invalidLogin();
  }

  const session = await resolveVerifiedAcademyProfileById(credential.user_profile_id, academyId, {
    authCredentialId: credential.id
  });
  if (session.ok === false) return session;

  await supabase.client
    .from("auth_credentials")
    .update({ last_login_at: new Date().toISOString() })
    .eq("id", credential.id);
  await auditAuthAttempt({ academyId, userProfileId: credential.user_profile_id, action: "auth.phone_login_succeeded", success: true });
  resetLoginRateLimit(academyId, phone);

  return session;
}

export async function upsertPhoneCredential(context: RepositoryWriteContext, input: CredentialUpsertInput) {
  const academyId = requireAcademyScope(context);
  if (academyId !== input.academyId && !isSuperAdminActor(context.actor)) {
    throw new Error("Credential academy scope mismatch.");
  }

  const phone = normalizePhoneForAuth(input.phone);
  if (!phone) throw new Error("Phone is required for academy credentials.");

  const supabase = getSupabaseServerClient({ preferServiceRole: true });
  if (supabase.enabled === false) throw new Error(supabase.reason);

  const row: Partial<AuthCredentialRow> & Pick<AuthCredentialRow, "academy_id" | "user_profile_id" | "phone_normalized"> = {
    academy_id: input.academyId,
    user_profile_id: input.userProfileId,
    phone_normalized: phone,
    temporary_password_flag: input.temporaryPasswordFlag ?? false,
    must_change_password: input.mustChangePassword ?? false,
    status: input.status ?? "active"
  };

  if (input.password) {
    row.password_hash = await hashPassword(input.password);
    row.temporary_password_flag = input.temporaryPasswordFlag ?? true;
    row.must_change_password = input.mustChangePassword ?? true;
  }

  const { data: existing } = await supabase.client
    .from("auth_credentials")
    .select("id")
    .eq("academy_id", input.academyId)
    .eq("user_profile_id", input.userProfileId)
    .maybeSingle();

  if (!existing?.id && !row.password_hash) {
    throw new Error("A temporary password is required when creating a new phone credential.");
  }

  const query = existing?.id
    ? supabase.client.from("auth_credentials").update(row).eq("id", existing.id).select("*").single()
    : supabase.client
        .from("auth_credentials")
        .insert(row as Partial<AuthCredentialRow> & Pick<AuthCredentialRow, "academy_id" | "user_profile_id" | "phone_normalized" | "password_hash">)
        .select("*")
        .single();

  const { data, error } = await query;
  if (error) throw error;
  return data as AuthCredentialRow;
}

export async function updateCredentialPhoneForUser(context: RepositoryWriteContext, input: { academyId: string; userProfileId: string; phone: string; status?: RecordStatus }) {
  const academyId = requireAcademyScope(context);
  if (academyId !== input.academyId && !isSuperAdminActor(context.actor)) {
    throw new Error("Credential academy scope mismatch.");
  }

  const supabase = getSupabaseServerClient({ preferServiceRole: true });
  if (supabase.enabled === false) throw new Error(supabase.reason);

  await supabase.client
    .from("auth_credentials")
    .update({
      phone_normalized: normalizePhoneForAuth(input.phone),
      status: input.status ?? "active"
    })
    .eq("academy_id", input.academyId)
    .eq("user_profile_id", input.userProfileId);
}
