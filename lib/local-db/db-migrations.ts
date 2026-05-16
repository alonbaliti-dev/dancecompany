import type { LocalDatabase } from "./db-types";
import { DATABASE_SCHEMA_VERSION } from "./db-schema";
import { normalizeDatabase } from "./db-normalizer";

/** Apply version migrations then normalize. Safe on any input. */
export function migrateDatabase(input: unknown): LocalDatabase {
  const db = normalizeDatabase(input);
  if (db.version === DATABASE_SCHEMA_VERSION) return db;
  console.warn("[lk-db] migrate: coerced version to", DATABASE_SCHEMA_VERSION);
  return { ...db, version: DATABASE_SCHEMA_VERSION };
}
