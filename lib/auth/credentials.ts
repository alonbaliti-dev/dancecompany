import type { DbUserRecord, LocalDatabase } from "@/lib/local-db/db-types";
import { normalizeIsraeliMobile } from "./phone";

/**
 * LOCAL / DEV ONLY credential row.
 *
 * NEVER store plain passwords in frontend JSON or `/database` in production.
 * Production must use Supabase Auth or a secure backend — passwords never touch client state.
 */
export type LocalAuthCredential = {
  userId: string;
  phone: string;
  /** Dev: plain password for mock login. Production: server-side hash only. */
  passwordHashOrDevPassword: string;
  passwordUpdatedAt: string;
};

export function usersWithoutLegacyPasswords(users: DbUserRecord[]): DbUserRecord[] {
  return users.map(({ initialPassword: _p, ...u }) => u);
}

export function upsertAuthCredential(
  db: LocalDatabase,
  userId: string,
  phone: string,
  password: string
): LocalDatabase {
  const normalizedPhone = normalizeIsraeliMobile(phone.trim()) || phone.trim();
  const now = new Date().toISOString();
  const creds = [...(db.authCredentials ?? [])];
  const idx = creds.findIndex((c) => c.userId === userId);
  const row: LocalAuthCredential = {
    userId,
    phone: normalizedPhone,
    passwordHashOrDevPassword: password,
    passwordUpdatedAt: now
  };
  if (idx >= 0) creds[idx] = row;
  else creds.push(row);
  return { ...db, authCredentials: creds };
}

export function updateCredentialPhone(db: LocalDatabase, userId: string, phone: string): LocalDatabase {
  const creds = db.authCredentials ?? [];
  const idx = creds.findIndex((c) => c.userId === userId);
  if (idx < 0) return db;
  const next = [...creds];
  next[idx] = {
    ...next[idx],
    phone: normalizeIsraeliMobile(phone.trim()) || phone.trim()
  };
  return { ...db, authCredentials: next };
}

/** Build credentials from legacy `initialPassword` on user rows (one-time migration). */
export function migrateAuthCredentialsFromUsers(db: LocalDatabase): LocalDatabase {
  const existing = new Map((db.authCredentials ?? []).map((c) => [c.userId, c]));
  const users = db.users ?? [];

  for (const u of users) {
    if (!u.initialPassword) continue;
    if (existing.has(u.id)) continue;
    existing.set(u.id, {
      userId: u.id,
      phone: normalizeIsraeliMobile(u.phone) || u.phone,
      passwordHashOrDevPassword: u.initialPassword,
      passwordUpdatedAt: u.passwordLastChangedAt ?? u.createdAt ?? new Date().toISOString()
    });
  }

  return {
    ...db,
    authCredentials: [...existing.values()],
    users: usersWithoutLegacyPasswords(users)
  };
}

export function ensureAuthCredentials(db: LocalDatabase): LocalDatabase {
  const hasLegacy = (db.users ?? []).some((u) => u.initialPassword);
  const hasCreds = (db.authCredentials ?? []).length > 0;
  if (!hasLegacy && hasCreds) return db;
  if (!hasLegacy && !hasCreds) return { ...db, authCredentials: db.authCredentials ?? [] };
  return migrateAuthCredentialsFromUsers(db);
}
