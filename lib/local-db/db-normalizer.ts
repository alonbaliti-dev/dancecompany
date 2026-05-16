import { ensureAuthCredentials } from "@/lib/auth/credentials";
import { EMPTY_DATABASE, type LocalDatabase } from "./db-types";
import { DATABASE_SCHEMA_VERSION } from "./db-schema";

function clone<T>(value: T): T {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value)) as T;
}

/** Fill missing top-level modules and coerce version — never throws. */
export function normalizeDatabase(input: unknown): LocalDatabase {
  const base = clone(EMPTY_DATABASE);
  if (!input || typeof input !== "object") {
    console.warn("[lk-db] normalize: invalid input, using empty shell");
    return base;
  }

  const raw = input as Partial<LocalDatabase>;
  const out = { ...base, ...raw, version: DATABASE_SCHEMA_VERSION as 1 };

  for (const key of Object.keys(EMPTY_DATABASE) as (keyof LocalDatabase)[]) {
    if (key === "version") continue;
    if (out[key] === undefined || out[key] === null) {
      (out as Record<string, unknown>)[key] = clone(EMPTY_DATABASE[key]);
    }
  }

  if (!Array.isArray(out.users)) out.users = [];
  if (!Array.isArray(out.studios)) out.studios = [];
  if (!out.attendance?.sessions) {
    out.attendance = clone(EMPTY_DATABASE.attendance);
  }
  if (!out.messages?.studioUpdates) {
    out.messages = clone(EMPTY_DATABASE.messages);
  }
  if (!out.privateLessons?.products) {
    out.privateLessons = clone(EMPTY_DATABASE.privateLessons);
  }
  if (!out.featureFlags?.global) {
    out.featureFlags = clone(EMPTY_DATABASE.featureFlags);
  }
  if (!Array.isArray(out.authCredentials)) out.authCredentials = [];

  return ensureAuthCredentials(out);
}
