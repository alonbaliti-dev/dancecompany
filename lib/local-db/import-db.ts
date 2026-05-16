import type { LocalDatabase } from "./db-types";
import { validateAndRecoverDatabase } from "./db-validator";
import { mergeFilesToDatabase } from "./serialize";

export type ImportMode = "bundle" | "files";

/** Parse imported JSON (full bundle or map of file names), validate, normalize. */
export function parseDatabaseImport(raw: unknown, mode: ImportMode): LocalDatabase {
  let parsed: LocalDatabase;
  if (mode === "bundle") {
    const db = raw as LocalDatabase;
    if (!db || db.version !== 1) {
      throw new Error("Invalid bundle: expected { version: 1, ... }");
    }
    parsed = db;
  } else if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    parsed = mergeFilesToDatabase(raw as Record<string, unknown>);
  } else {
    throw new Error("Invalid import format");
  }
  return validateAndRecoverDatabase(parsed).database;
}

export { mergeFilesToDatabase };
