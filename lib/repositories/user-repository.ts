import "server-only";

import { requireAcademyScope, type AcademyScopedQuery } from "@/lib/security/academy-scope";
import { requireRepositoryWriteContext, type RepositoryWriteContext } from "@/lib/repositories/repository-context";
import { updateCredentialPhoneForUser, upsertPhoneCredential } from "@/lib/auth/phone-auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { UserProfileRow, UserRole, UserRoleRow } from "@/lib/supabase/types";
import { safeInitialV6Database } from "@/lib/v6/seed";
import type { V6User } from "@/lib/v6/types";

type UserProfileWithRoles = UserProfileRow & {
  user_roles?: Array<Pick<UserRoleRow, "role" | "academy_id" | "status">> | null;
};

type UserProfileQueryBuilder = {
  select: (columns?: string) => UserProfileQueryBuilder;
  eq: (column: string, value: unknown) => UserProfileQueryBuilder;
  maybeSingle: () => Promise<{ data: Pick<UserProfileRow, "id"> | null; error: unknown }>;
  then: Promise<{ data: UserProfileWithRoles[] | null; error: unknown }>["then"];
};

function userProfilesTable(supabase: { client: { from: (table: string) => unknown } }) {
  return supabase.client.from("users_profile") as UserProfileQueryBuilder;
}

function normalizeUserStatus(status: UserProfileRow["status"]): V6User["status"] {
  return status === "active" || status === "inactive" || status === "pending" || status === "paused" ? status : "inactive";
}

function toV6User(profile: UserProfileWithRoles, academyId: string): V6User {
  const roleRow = Array.isArray(profile.user_roles) ? profile.user_roles.find((role) => role.academy_id === academyId && role.status === "active") : undefined;

  return {
    id: profile.id,
    studioId: academyId,
    academyId,
    name: profile.full_name_he ?? profile.full_name,
    role: roleRow?.role ?? (profile.platform_role === "super_admin" ? "super_admin" : "student"),
    platformRole: profile.platform_role ?? undefined,
    academyIds: [academyId],
    activeAcademyId: profile.active_academy_id ?? academyId,
    phone: profile.phone ?? "",
    permissions: safeInitialV6Database.users.find((user) => user.id === profile.id)?.permissions ?? safeInitialV6Database.users[0]?.permissions,
    groupIds: [] as string[],
    linkedStudentIds: [] as string[],
    active: profile.status === "active",
    status: normalizeUserStatus(profile.status)
  } satisfies V6User;
}

export async function listUsersByAcademy(scope: AcademyScopedQuery): Promise<V6User[]> {
  const academyId = requireAcademyScope(scope);
  const supabase = getSupabaseServerClient();

  if (supabase.enabled === false) {
    return safeInitialV6Database.users.filter((user) => (user.academyId ?? user.studioId) === academyId || user.academyIds?.includes(academyId));
  }

  const { data, error } = await userProfilesTable(supabase)
    .select("*, user_roles(role, academy_id, status)")
    .eq("academy_id", academyId)
    .eq("status", "active");

  if (error) throw error;

  return (data ?? []).map((profile) => toV6User(profile, academyId));
}

export async function getUserProfileByAuthId(authUserId: string, scope: AcademyScopedQuery): Promise<V6User | null> {
  const academyId = requireAcademyScope(scope);
  const supabase = getSupabaseServerClient();

  if (supabase.enabled === false) {
    return safeInitialV6Database.users.find((user) => (user.academyId ?? user.studioId) === academyId) ?? null;
  }

  const { data, error } = await userProfilesTable(supabase)
    .select("id")
    .eq("academy_id", academyId)
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return (await listUsersByAcademy(scope)).find((user) => user.id === data.id) ?? null;
}

export type UserProfileDraft = {
  id: string;
  fullName: string;
  fullNameHe?: string;
  email?: string;
  phone?: string;
  role: UserRole;
  status?: UserProfileRow["status"];
  initialPassword?: string;
  mustChangePassword?: boolean;
  temporaryPasswordFlag?: boolean;
};

export async function upsertUserProfile(context: RepositoryWriteContext, draft: UserProfileDraft): Promise<V6User> {
  const verified = requireRepositoryWriteContext(context);
  const academyId = requireAcademyScope(verified);
  const supabase = getSupabaseServerClient({ preferServiceRole: true });

  if (supabase.enabled === false) {
    throw new Error("Supabase service-role client is required for user persistence.");
  }

  const profileRow = {
    id: draft.id,
    academy_id: academyId,
    full_name: draft.fullName,
    full_name_he: draft.fullNameHe ?? draft.fullName,
    email: draft.email ?? null,
    phone: draft.phone ?? null,
    platform_role: draft.role === "super_admin" ? "super_admin" : null,
    active_academy_id: academyId,
    status: draft.status ?? "active",
    metadata: {}
  } satisfies Partial<UserProfileRow> & Pick<UserProfileRow, "id" | "full_name">;

  const { data, error } = await supabase.client
    .from("users_profile")
    .upsert(profileRow, { onConflict: "id" })
    .select("*, user_roles(role, academy_id, status)")
    .single();

  if (error) throw error;

  const { error: roleError } = await supabase.client
    .from("user_roles")
    .upsert(
      {
        academy_id: academyId,
        user_id: draft.id,
        role: draft.role,
        status: draft.status ?? "active"
      },
      { onConflict: "academy_id,user_id,role" }
    );

  if (roleError) throw roleError;

  if (draft.phone) {
    if (draft.initialPassword) {
      await upsertPhoneCredential(verified, {
        academyId,
        userProfileId: draft.id,
        phone: draft.phone,
        password: draft.initialPassword,
        temporaryPasswordFlag: draft.temporaryPasswordFlag ?? true,
        mustChangePassword: draft.mustChangePassword ?? true,
        status: draft.status ?? "active"
      });
    } else {
      await updateCredentialPhoneForUser(verified, {
        academyId,
        userProfileId: draft.id,
        phone: draft.phone,
        status: draft.status ?? "active"
      });
    }
  }

  await supabase.client.from("audit_logs").insert({
    id: `audit_user_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    academy_id: academyId,
    actor_user_id: verified.actor.userId,
    action: "user.updated",
    target: draft.id,
    metadata: {
      role: draft.role,
      source: verified.source
    }
  });

  return toV6User(data as UserProfileWithRoles, academyId);
}
