import { validateAndRecoverDatabase } from "@/lib/local-db/db-validator";
import { loadSessionDatabase } from "@/lib/local-db/session-persistence";
import { getSafeInitialDatabase } from "@/lib/local-db/safe-initial-database";
import { setDirectorySnapshot } from "@/lib/directory-store";
import { syncRelationshipLinks } from "@/lib/users/user-type";
import { ensureAuthCredentials } from "@/lib/auth/credentials";
import { rebuildAuthPasswordMap } from "@/lib/auth/mock-auth-store";
import { setRuntimeDatabase } from "@/lib/local-db/runtime-store";
import type { LocalDatabase } from "@/lib/local-db/db-types";

/** Synchronous boot — safe bundled database, validated. */
export function loadSafeInitialDatabase(): LocalDatabase {
  const { database } = validateAndRecoverDatabase(getSafeInitialDatabase());
  applyDatabaseSideEffects(database);
  console.log("App booted with bundled database");
  return database;
}

/** Client boot: bundled DB, or last session snapshot from this device if present. */
export function loadClientBootDatabase(): LocalDatabase {
  const session = loadSessionDatabase();
  if (session) {
    const { database } = validateAndRecoverDatabase(session);
    applyDatabaseSideEffects(database);
    console.log("App booted with session database");
    return database;
  }
  return loadSafeInitialDatabase();
}

export function applyDatabaseSideEffects(db: LocalDatabase): void {
  try {
    const withCreds = ensureAuthCredentials(db);
    const users = syncRelationshipLinks(withCreds.users ?? []);
    const next = { ...withCreds, users };
    setRuntimeDatabase(next);
    setDirectorySnapshot(users);
    rebuildAuthPasswordMap(next.authCredentials ?? []);
  } catch (e) {
    console.warn("[lk-app] applyDatabaseSideEffects failed", e);
  }
}
