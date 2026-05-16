import type { LocalDatabase } from "./db-types";
import { EMPTY_DATABASE } from "./db-types";
import { getSafeInitialDatabase } from "./safe-initial-database";
import { migrateDatabase } from "./db-migrations";
import type { DatabaseModuleKey } from "./db-schema";
import { DATABASE_MODULE_KEYS } from "./db-schema";

export type ValidationIssue = {
  module: DatabaseModuleKey | "*";
  message: string;
  recovered: boolean;
};

export type ValidationResult = {
  database: LocalDatabase;
  issues: ValidationIssue[];
};

function cloneModule<K extends DatabaseModuleKey>(key: K, source: LocalDatabase): LocalDatabase[K] {
  const value = source[key];
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value)) as LocalDatabase[K];
}

function isModuleValid(key: DatabaseModuleKey, value: unknown): boolean {
  if (value === undefined || value === null) return false;
  if (key === "users" || key === "studios" || key === "groups" || key === "authCredentials") {
    return Array.isArray(value);
  }
  if (key === "attendance" || key === "messages" || key === "privateLessons") {
    return typeof value === "object";
  }
  return true;
}

/**
 * Validate and recover broken modules individually.
 * App always receives a usable database.
 */
export function validateAndRecoverDatabase(input: unknown): ValidationResult {
  const migrated = migrateDatabase(input);
  const fallback = getSafeInitialDatabase();
  const issues: ValidationIssue[] = [];
  const out = { ...migrated };

  for (const key of DATABASE_MODULE_KEYS) {
    try {
      if (!isModuleValid(key, out[key])) {
        throw new Error("missing or invalid module");
      }
      JSON.stringify(out[key]);
    } catch (e) {
      const message = e instanceof Error ? e.message : "invalid module";
      issues.push({ module: key, message, recovered: true });
      (out as Record<string, unknown>)[key] = cloneModule(key, fallback);
      console.warn("[lk-db] recovered module", key, message);
    }
  }

  if (!out.users.length) {
    issues.push({ module: "users", message: "empty users", recovered: true });
    out.users = fallback.users;
  }

  return { database: out, issues };
}

export function validateImportPayload(raw: unknown): ValidationResult {
  if (!raw || typeof raw !== "object") {
    return {
      database: getSafeInitialDatabase(),
      issues: [{ module: "*", message: "import not an object", recovered: true }]
    };
  }
  const bundle = raw as Partial<LocalDatabase>;
  if (bundle.version !== 1) {
    return validateAndRecoverDatabase({ ...bundle, version: 1 });
  }
  return validateAndRecoverDatabase(bundle);
}
