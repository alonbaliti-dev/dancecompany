import type { LocalDatabase } from "./db-types";
import { validateAndRecoverDatabase } from "./db-validator";

const SESSION_KEY = "lk-session-db-v1";

/** Restore in-memory edits from this browser session (survives refresh on same device). */
export function loadSessionDatabase(): LocalDatabase | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    const { database } = validateAndRecoverDatabase(parsed);
    if (!database.users?.length) return null;
    return database;
  } catch {
    return null;
  }
}

export function persistSessionDatabase(db: LocalDatabase): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(db));
  } catch {
    /* quota / private mode */
  }
}

export function clearSessionDatabase(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}
