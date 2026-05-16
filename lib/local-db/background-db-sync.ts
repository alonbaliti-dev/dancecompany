import type { LocalDatabase } from "./db-types";
import type { DatabaseLoadReport } from "./read-db-safe";
import { API_READ, parseDatabaseApiPayload } from "./client-api";

export const BACKGROUND_SYNC_TIMEOUT_MS = 3_000;

export type BackgroundSyncResult =
  | { ok: true; db: LocalDatabase; report?: DatabaseLoadReport }
  | { ok: false; error: string };

export async function fetchDatabaseFromServer(
  signal?: AbortSignal
): Promise<BackgroundSyncResult> {
  const timeoutMs = BACKGROUND_SYNC_TIMEOUT_MS;
  const controller = new AbortController();
  const onAbort = () => controller.abort();
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener("abort", onAbort, { once: true });
  }
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(API_READ, { method: "GET", cache: "no-store", signal: controller.signal });
    clearTimeout(timer);
    const text = await res.text();
    let json: unknown = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      return { ok: false, error: "JSON parse failed" };
    }
    if (!res.ok) {
      const err =
        json && typeof json === "object" && "error" in json
          ? String((json as { error: string }).error)
          : `HTTP ${res.status}`;
      return { ok: false, error: err };
    }
    const parsed = parseDatabaseApiPayload(json);
    if (!parsed.db || !Array.isArray(parsed.db.users) || parsed.db.users.length === 0) {
      return { ok: false, error: parsed.error ?? "empty database" };
    }
    return { ok: true, db: parsed.db, report: parsed.report };
  } catch (e) {
    clearTimeout(timer);
    const msg =
      e instanceof Error && (e.name === "AbortError" || e.message.includes("abort"))
        ? "timeout"
        : e instanceof Error
          ? e.message
          : "network error";
    return { ok: false, error: msg };
  } finally {
    if (signal) signal.removeEventListener("abort", onAbort);
  }
}
