"use client";

/**
 * Compatibility layer — database boot/sync is centralized in AppProvider.
 */
import { AppProvider, useAppState } from "@/lib/app/AppProvider";
import { getSafeInitialDatabase } from "@/lib/local-db/safe-initial-database";
import { validateAndRecoverDatabase } from "@/lib/local-db/db-validator";

export type DbSyncStatus = "idle" | "syncing" | "synced" | "demo" | "error";

export { AppProvider as LocalDatabaseProvider };

export function useLocalDatabase() {
  const app = useAppState();
  const resetToBundled = () => {
    app.setDatabase(validateAndRecoverDatabase(getSafeInitialDatabase()).database);
  };
  return {
    db: app.database,
    appReady: app.appReady,
    loading: false,
    error: app.errors[0] ?? null,
    loadWarning: null,
    loadReport: app.loadReport,
    apiStatus:
      app.syncStatus === "syncing"
        ? ("pending" as const)
        : app.syncStatus === "idle"
          ? ("ok" as const)
          : app.syncStatus,
    setDb: app.setDatabase,
    patchDb: app.patchDatabase,
    reloadFromDisk: app.reloadFromDisk,
    loadSafeDemo: resetToBundled,
    skipToDemo: resetToBundled,
    saveToProjectFolder: app.saveToProjectFolder,
    exportJsonFiles: app.exportJsonFiles,
    exportBundle: app.exportBundle,
    importDatabase: app.importDatabase
  };
}

export function useLocalDatabaseOptional() {
  try {
    return useLocalDatabase();
  } catch {
    return null;
  }
}
