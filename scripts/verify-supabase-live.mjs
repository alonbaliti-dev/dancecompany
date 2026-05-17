import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const root = process.cwd();

function loadEnvFile(fileName) {
  const path = join(root, fileName);
  if (!existsSync(path)) return false;

  const lines = readFileSync(path, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^['"]|['"]$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }

  return true;
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

const result = {
  env: {
    url: Boolean(url),
    anonKey: Boolean(anonKey),
    serviceRoleKey: Boolean(serviceKey),
    authMode: process.env.AUTH_MODE === "supabase" ? "supabase" : "local_demo"
  },
  tables: {},
  seed: {},
  profile: {},
  role: {},
  isolation: {},
  auth: {},
  warnings: []
};

function printResult() {
  console.log(JSON.stringify(result, null, 2));
}

if (!url || !anonKey) {
  result.warnings.push("Supabase public env is missing; live verification skipped.");
  printResult();
  process.exit(0);
}

const client = createClient(url, serviceKey || anonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

const expectedTables = [
  "academies",
  "academy_branding",
  "users_profile",
  "user_roles",
  "attendance_records",
  "shop_products",
  "media_items",
  "audit_logs"
];

for (const table of expectedTables) {
  const { error, count } = await client.from(table).select("id", { head: true, count: "exact" });
  result.tables[table] = {
    exists: !error,
    readable: !error,
    countKnown: typeof count === "number"
  };
  if (error) {
    result.tables[table].errorCode = error.code ?? "unknown";
  }
}

const academy = await client
  .from("academies")
  .select("id, name, slug, status")
  .eq("slug", "lk-studio")
  .maybeSingle();

result.seed.lkStudio = {
  exists: Boolean(academy.data),
  active: academy.data?.status === "active",
  nameMatches: academy.data?.name === "LK Studio by Liat Kaplinski"
};
if (academy.error) result.seed.lkStudio.errorCode = academy.error.code ?? "unknown";

const profile = await client
  .from("users_profile")
  .select("id, academy_id, full_name, full_name_he, platform_role, active_academy_id, status, auth_user_id")
  .eq("id", "alon")
  .maybeSingle();

result.profile.alon = {
  exists: Boolean(profile.data),
  active: profile.data?.status === "active",
  academyMatches: profile.data?.academy_id === "lk-studio",
  activeAcademyMatches: profile.data?.active_academy_id === "lk-studio",
  platformSuperAdmin: profile.data?.platform_role === "super_admin",
  hebrewNameMatches: profile.data?.full_name_he === "אלון בליטי",
  authBound: Boolean(profile.data?.auth_user_id)
};
if (profile.error) result.profile.alon.errorCode = profile.error.code ?? "unknown";

const role = await client
  .from("user_roles")
  .select("academy_id, user_id, role, status")
  .eq("academy_id", "lk-studio")
  .eq("user_id", "alon")
  .eq("role", "super_admin")
  .maybeSingle();

result.role.alon = {
  exists: Boolean(role.data),
  active: role.data?.status === "active"
};
if (role.error) result.role.alon.errorCode = role.error.code ?? "unknown";

const scopedUsers = await client
  .from("users_profile")
  .select("id", { count: "exact", head: true })
  .eq("academy_id", "lk-studio");
const otherUsers = await client
  .from("users_profile")
  .select("id", { count: "exact", head: true })
  .eq("academy_id", "nonexistent-academy");

result.isolation.lkStudioCountKnown = typeof scopedUsers.count === "number";
result.isolation.lkStudioHasUsers = (scopedUsers.count ?? 0) > 0;
result.isolation.nonexistentAcademyEmpty = (otherUsers.count ?? 0) === 0;
if (scopedUsers.error) result.isolation.lkStudioErrorCode = scopedUsers.error.code ?? "unknown";
if (otherUsers.error) result.isolation.otherErrorCode = otherUsers.error.code ?? "unknown";

if (serviceKey && profile.data?.auth_user_id) {
  const authUser = await client.auth.admin.getUserById(profile.data.auth_user_id);
  result.auth.alonBoundUserExists = Boolean(authUser.data.user);
  if (authUser.error) result.auth.alonBoundUserError = authUser.error.status ?? "unknown";
} else {
  result.auth.alonBoundUserExists = false;
  result.auth.reason = serviceKey ? "profile_auth_user_id_missing" : "service_role_key_missing";
}

printResult();
