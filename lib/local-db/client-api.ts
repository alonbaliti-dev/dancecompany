/**
 * Browser-only — relative fetch("/api/...") only. No fs, no localhost.
 */
import type { LocalDatabase } from "./db-types";
import type { DatabaseLoadReport } from "./read-db-safe";
import { fetchWithHardTimeout } from "./fetch-with-timeout";

export const API_READ = "/api/local-db/read";
export const API_FALLBACK = "/api/local-db/fallback";
export const API_STATUS = "/api/local-db/status";
export const API_HEALTH = "/api/health";

export const CLIENT_DB_TIMEOUT_MS = 2_500;

type ApiPayload = {
  database?: LocalDatabase;
  db?: LocalDatabase;
  report?: DatabaseLoadReport;
  error?: string;
};

export function parseDatabaseApiPayload(json: unknown): {
  db: LocalDatabase | null;
  report?: DatabaseLoadReport;
  error?: string;
} {
  if (!json || typeof json !== "object") return { db: null, error: "תגובה ריקה" };
  const p = json as ApiPayload;
  if (p.error) return { db: null, error: p.error, report: p.report };
  const db = p.database ?? p.db;
  if (db && typeof db === "object" && "version" in db && db.version === 1) {
    console.log("DB parsed");
    return { db: db as LocalDatabase, report: p.report };
  }
  return { db: null, error: "תגובת שרת לא תקינה" };
}

export async function fetchDatabaseApi(
  apiPath: string,
  timeoutMs = CLIENT_DB_TIMEOUT_MS
): Promise<{ ok: boolean; status: number; json: unknown; error?: string }> {
  try {
    const res = await fetchWithHardTimeout(apiPath, { method: "GET" }, timeoutMs);
    console.log("DB fetch resolved", apiPath, res.status);
    const text = await res.text();
    let json: unknown = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      return { ok: false, status: res.status, json: null, error: "תגובת API אינה JSON תקין" };
    }
    if (!res.ok) {
      const err =
        json && typeof json === "object" && "error" in json
          ? String((json as ApiPayload).error)
          : `שגיאת שרת (${res.status})`;
      return { ok: false, status: res.status, json, error: err };
    }
    return { ok: true, status: res.status, json };
  } catch (e) {
    const msg =
      e instanceof Error &&
      (e.message.startsWith("FETCH_TIMEOUT_") || e.name === "AbortError")
        ? `תם הזמן (${timeoutMs / 1000}s)`
        : e instanceof Error
          ? e.message
          : "שגיאת רשת";
    return { ok: false, status: 0, json: null, error: msg };
  }
}
