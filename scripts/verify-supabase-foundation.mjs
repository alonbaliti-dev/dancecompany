import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const checks = [];

function file(path) {
  const absolutePath = join(root, path);
  if (!existsSync(absolutePath)) {
    throw new Error(`Missing required file: ${path}`);
  }
  return readFileSync(absolutePath, "utf8");
}

function assertCheck(name, condition) {
  checks.push({ name, ok: Boolean(condition) });
  if (!condition) {
    throw new Error(`Supabase foundation check failed: ${name}`);
  }
}

const envExample = file(".env.example");
const config = file("supabase/config.toml");
const migration = file("supabase/migrations/20260517180000_phase_2_backend_foundation.sql");
const hardeningMigration = file("supabase/migrations/20260517200000_harden_updated_at_function.sql");
const seed = file("supabase/seed.sql");
const authSession = file("lib/auth/academy-session.ts");
const authMode = file("lib/auth/auth-mode.ts");
const productionHardening = file("lib/security/production-hardening.ts");
const repositoryContext = file("lib/repositories/repository-context.ts");

assertCheck("AUTH_MODE documented in env example", envExample.includes("AUTH_MODE=local_demo"));
assertCheck("service role remains server-only", !envExample.includes("NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY"));
assertCheck("local Supabase config includes seed", config.includes("[db.seed]") && config.includes("./seed.sql"));
assertCheck("auth signup disabled locally by default", config.includes("enable_signup = false"));
assertCheck("academy table exists", migration.includes("create table public.academies"));
assertCheck("profiles table supports auth binding", migration.includes("auth_user_id uuid unique"));
assertCheck("roles table exists", migration.includes("create table public.user_roles"));
assertCheck("RLS enabled on profiles", migration.includes("alter table public.users_profile enable row level security"));
assertCheck("RLS enabled on attendance", migration.includes("alter table public.attendance_records enable row level security"));
assertCheck("RLS enabled on audit", migration.includes("alter table public.audit_logs enable row level security"));
assertCheck("public login shell policy exists", migration.includes("Public can read active academy login shells"));
assertCheck("updated_at function hardens search_path", hardeningMigration.includes("set search_path = ''"));
assertCheck("LK Studio seeded", seed.includes("LK Studio by Liat Kaplinski") && seed.includes("lk-studio"));
assertCheck("Alon Super Admin seeded", seed.includes("Alon Baliti") && seed.includes("super_admin"));
assertCheck("seed does not create auth users", !/insert\s+into\s+auth\.users/i.test(seed));
assertCheck("seed does not include password material", !/password\s*[:=]/i.test(seed));
assertCheck("Supabase mode can fail closed", authMode.includes("SUPABASE_SERVICE_ROLE_KEY") && authMode.includes("enabled: false"));
assertCheck("server auth validates token", authSession.includes("auth.getUser"));
assertCheck("server auth refreshes token", authSession.includes("refreshSession"));
assertCheck("production gate uses verified session", productionHardening.includes("requireVerifiedAcademySession"));
assertCheck("repository writes require verification", repositoryContext.includes("Verified repository context is required"));

console.log(`Supabase foundation checks passed (${checks.length}).`);
