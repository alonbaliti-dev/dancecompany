import { DB_FILES } from "./paths";
import type { LocalDatabase } from "./db-types";
import { splitDatabaseToFiles } from "./serialize";

/** Split in-memory DB into filename → JSON payload map. */
export function exportDatabaseToFiles(db: LocalDatabase): Record<string, unknown> {
  return splitDatabaseToFiles(db);
}

/** Trigger browser download of each `/database/*.json` file. */
export function downloadDatabaseExport(db: LocalDatabase): void {
  const files = exportDatabaseToFiles(db);
  for (const [name, data] of Object.entries(files)) {
    const blob = new Blob([`${JSON.stringify(data, null, 2)}\n`], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }
}

/** Single-bundle export for backup / re-import. */
export function downloadJsonFile(filename: string, data: unknown): void {
  const blob = new Blob([`${JSON.stringify(data, null, 2)}\n`], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadDatabaseBundle(db: LocalDatabase): void {
  const blob = new Blob([`${JSON.stringify(db, null, 2)}\n`], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "lk-database-bundle.json";
  a.click();
  URL.revokeObjectURL(url);
}

export function listDatabaseFileNames(): string[] {
  return Object.values(DB_FILES);
}
