import type { LocalDatabase } from "./db-types";
import { downloadDatabaseBundle, downloadDatabaseExport } from "./export-db";
import type { ImportMode } from "./import-db";
import { parseDatabaseImport } from "./import-db";
import { getSafeInitialDatabase } from "./safe-initial-database";

export type { ImportMode };

const API_WRITE = "/api/local-db/write";

export function loadEmbeddedDemoDatabase() {
  const db = getSafeInitialDatabase();
  return {
    db,
    report: {
      source: "fallback" as const,
      fileErrors: [],
      loadedAt: new Date().toISOString(),
      durationMs: 0,
      databaseDirExists: false
    },
    usedFallback: true,
    apiStatus: "embedded" as const
  };
}

export async function saveLocalDatabaseToProject(db: LocalDatabase): Promise<void> {
  const res = await fetch(API_WRITE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(db)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? `Save failed (${res.status})`);
  }
}

export { downloadDatabaseExport, downloadDatabaseBundle, parseDatabaseImport };
