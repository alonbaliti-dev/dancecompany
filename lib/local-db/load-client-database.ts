import type { LocalDatabase } from "./db-types";
import type { DatabaseLoadReport } from "./read-db-safe";
import { getSafeInitialDatabase } from "./safe-initial-database";
import {
  API_FALLBACK,
  API_READ,
  CLIENT_DB_TIMEOUT_MS,
  fetchDatabaseApi,
  parseDatabaseApiPayload
} from "./client-api";
import { DATABASE_MODULE_COUNT } from "./db-module-meta";

export {
  API_READ,
  API_FALLBACK,
  API_HEALTH,
  API_STATUS,
  CLIENT_DB_TIMEOUT_MS
} from "./client-api";

export function isDatabaseUsable(db: LocalDatabase): boolean {
  return Array.isArray(db.users) && db.users.length > 0;
}

export type ClientDatabaseLoadResult = {
  db: LocalDatabase;
  report: DatabaseLoadReport;
  usedFallback: boolean;
  apiStatus: "ok" | "error" | "timeout" | "skipped" | "embedded";
  errorMessage?: string;
};

function defaultReport(started: number, partial?: Partial<DatabaseLoadReport>): DatabaseLoadReport {
  return {
    source: "fallback",
    fileErrors: [],
    loadedAt: new Date().toISOString(),
    durationMs: Date.now() - started,
    databaseDirExists: false,
    ...partial
  };
}

function embeddedResult(started: number, reason: string): ClientDatabaseLoadResult {
  console.log("Fallback DB loaded");
  return {
    db: getSafeInitialDatabase(),
    report: defaultReport(started, {
      fileErrors: [{ file: "(embedded)", moduleKey: "*", message: reason }]
    }),
    usedFallback: true,
    apiStatus: "embedded",
    errorMessage: reason
  };
}

async function fetchFromApiRoute(
  apiPath: typeof API_READ | typeof API_FALLBACK,
  started: number,
  usedFallback: boolean,
  apiStatus: ClientDatabaseLoadResult["apiStatus"],
  timeoutMs: number
): Promise<ClientDatabaseLoadResult | null> {
  const res = await fetchDatabaseApi(apiPath, timeoutMs);
  if (!res.ok || !res.json) return null;
  const parsed = parseDatabaseApiPayload(res.json);
  if (!parsed.db) return null;
  return {
    db: parsed.db,
    report:
      parsed.report ??
      defaultReport(started, {
        source: usedFallback ? "fallback" : "disk",
        databaseDirExists: !usedFallback
      }),
    usedFallback,
    apiStatus,
    errorMessage: parsed.error
  };
}

export async function loadClientDatabase(timeoutMs = CLIENT_DB_TIMEOUT_MS): Promise<ClientDatabaseLoadResult> {
  const started = Date.now();

  const primary = await fetchDatabaseApi(API_READ, timeoutMs);
  if (primary.ok && primary.json) {
    const parsed = parseDatabaseApiPayload(primary.json);
    if (parsed.db) {
      console.log("DB load success");
      return {
        db: parsed.db,
        report:
          parsed.report ?? defaultReport(started, { source: "disk", databaseDirExists: true }),
        usedFallback: false,
        apiStatus: "ok"
      };
    }
  }

  console.log("DB load failed");
  const fromApi = await fetchFromApiRoute(API_FALLBACK, started, true, "error", Math.min(timeoutMs, 1500));
  if (fromApi) return { ...fromApi, errorMessage: primary.error ?? "read failed" };
  return embeddedResult(started, primary.error ?? "read failed");
}

export async function loadSafeDemoDatabase(timeoutMs = 1500): Promise<ClientDatabaseLoadResult> {
  const started = Date.now();
  const fromApi = await fetchFromApiRoute(API_FALLBACK, started, true, "skipped", timeoutMs);
  if (fromApi && isDatabaseUsable(fromApi.db)) return fromApi;
  return embeddedResult(started, "safe demo");
}

export function loadEmbeddedDemoDatabase(): ClientDatabaseLoadResult {
  return embeddedResult(Date.now(), "embedded");
}

export function getModuleLoadStats(db: LocalDatabase, report: DatabaseLoadReport | null) {
  return {
    totalModules: DATABASE_MODULE_COUNT,
    loadedModuleCount: Object.keys(db).filter((k) => k !== "version").length,
    failedModules: report?.fileErrors ?? [],
    failedCount: report?.fileErrors.length ?? 0
  };
}
