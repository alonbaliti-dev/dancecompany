"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type Dispatch,
  type ReactNode
} from "react";
import type { LocalDatabase } from "@/lib/local-db/db-types";
import {
  downloadDatabaseBundle,
  downloadDatabaseExport,
  parseDatabaseImport,
  saveLocalDatabaseToProject,
  type ImportMode
} from "@/lib/local-db/db-service";
import { getSafeInitialDatabase } from "@/lib/local-db/safe-initial-database";
import { validateAndRecoverDatabase } from "@/lib/local-db/db-validator";
import { fetchDatabaseFromServer } from "@/lib/local-db/background-db-sync";
import { authService } from "@/lib/services/auth-service";
import { PlatformProvider } from "@/context/PlatformContext";
import { UserDirectoryProvider } from "@/context/UserDirectoryContext";
import { DatabaseSyncStatusBadge } from "@/components/local-db/DatabaseSyncStatusBadge";
import type { UserProfile } from "@/lib/types";
import type { AppAction } from "./app-actions";
import { appReducer, createInitialAppState } from "./app-reducer";
import { applyDatabaseSideEffects, loadClientBootDatabase } from "./boot";
import { clearSessionDatabase, persistSessionDatabase } from "@/lib/local-db/session-persistence";
import type { AppState } from "./app-types";
import { selectEffectiveFeatureFlags } from "./app-selectors";
import { shouldRunBackgroundDatabaseSync } from "./should-run-background-sync";

type AppContextValue = AppState & {
  loading: boolean;
  featureFlags: ReturnType<typeof selectEffectiveFeatureFlags>;
  dispatch: Dispatch<AppAction>;
  setDatabase: (next: LocalDatabase | ((prev: LocalDatabase) => LocalDatabase)) => void;
  patchDatabase: (patch: Partial<LocalDatabase>) => void;
  setCurrentUser: (user: UserProfile | null) => void;
  reloadFromDisk: () => void;
  saveToProjectFolder: () => Promise<void>;
  exportJsonFiles: () => void;
  exportBundle: () => void;
  importDatabase: (raw: unknown, mode: ImportMode) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, undefined, () => {
    const database = loadClientBootDatabase();
    return { ...createInitialAppState(), database, appReady: true };
  });

  const syncGen = useRef(0);
  const hasLocalEditsRef = useRef(false);

  useEffect(() => {
    console.log("appReady true");
    console.log("loading false");
    const restored = authService.restoreUserFromSession();
    if (restored) dispatch({ type: "SET_CURRENT_USER", user: restored });
  }, []);

  useEffect(() => {
    applyDatabaseSideEffects(state.database);
  }, [state.database]);

  const commitDatabase = useCallback(
    (next: LocalDatabase, opts?: { persistSession?: boolean; fromSync?: boolean }) => {
      if (!opts?.fromSync) {
        hasLocalEditsRef.current = true;
      }
      dispatch({ type: "SET_DATABASE", database: next });
      if (opts?.persistSession !== false && !opts?.fromSync) {
        persistSessionDatabase(next);
      }
    },
    []
  );

  const setDatabase = useCallback(
    (next: LocalDatabase | ((prev: LocalDatabase) => LocalDatabase)) => {
      if (typeof next === "function") {
        dispatch({
          type: "SET_DATABASE",
          database: (prev) => {
            const updated = next(prev);
            hasLocalEditsRef.current = true;
            persistSessionDatabase(updated);
            return updated;
          }
        });
      } else {
        commitDatabase(next);
      }
    },
    [commitDatabase]
  );

  const patchDatabase = useCallback(
    (patch: Partial<LocalDatabase>) => {
      setDatabase((prev) => ({ ...prev, ...patch }));
    },
    [setDatabase]
  );

  const setCurrentUser = useCallback((user: UserProfile | null) => {
    dispatch({ type: "SET_CURRENT_USER", user });
  }, []);

  const runBackgroundSync = useCallback(() => {
    const gen = ++syncGen.current;
    dispatch({ type: "SET_SYNC_STATUS", status: "syncing" });
    console.log("Background DB sync started");

    const controller = new AbortController();

    void (async () => {
      try {
        const result = await fetchDatabaseFromServer(controller.signal);
        if (gen !== syncGen.current) return;

        if (result.ok) {
          if (hasLocalEditsRef.current) {
            console.log("Background DB sync skipped — keeping local edits");
            dispatch({ type: "SET_SYNC_STATUS", status: "idle" });
            return;
          }
          const { database } = validateAndRecoverDatabase(result.db);
          dispatch({ type: "SET_DATABASE", database, report: result.report ?? null });
          dispatch({ type: "SET_SYNC_STATUS", status: "synced" });
          console.log("Background DB sync success");
          window.setTimeout(() => {
            if (gen === syncGen.current) dispatch({ type: "SET_SYNC_STATUS", status: "idle" });
          }, 4000);
          return;
        }

        console.log("Background DB sync failed, keeping bundled database");
        dispatch({ type: "SET_SYNC_STATUS", status: "demo" });
      } catch {
        if (gen !== syncGen.current) return;
        console.log("Background DB sync failed, keeping bundled database");
        dispatch({ type: "SET_SYNC_STATUS", status: "error" });
        window.setTimeout(() => {
          if (gen === syncGen.current) dispatch({ type: "SET_SYNC_STATUS", status: "demo" });
        }, 5000);
      }
    })();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!shouldRunBackgroundDatabaseSync()) {
      dispatch({ type: "SET_SYNC_STATUS", status: "idle" });
      return;
    }
    const cancel = runBackgroundSync();
    return cancel;
  }, [runBackgroundSync]);

  const reloadFromDisk = useCallback(() => {
    hasLocalEditsRef.current = false;
    clearSessionDatabase();
    runBackgroundSync();
  }, [runBackgroundSync]);

  const saveToProjectFolder = useCallback(async () => {
    await saveLocalDatabaseToProject(state.database);
  }, [state.database]);

  const exportJsonFiles = useCallback(() => {
    downloadDatabaseExport(state.database);
  }, [state.database]);

  const exportBundle = useCallback(() => {
    downloadDatabaseBundle(state.database);
  }, [state.database]);

  const importDatabase = useCallback(
    (raw: unknown, mode: ImportMode) => {
      try {
        const database = parseDatabaseImport(raw, mode);
        hasLocalEditsRef.current = true;
        persistSessionDatabase(database);
        dispatch({ type: "SET_DATABASE", database });
      } catch (e) {
        dispatch({
          type: "PUSH_ERROR",
          message: e instanceof Error ? e.message : "ייבוא נכשל"
        });
      }
    },
    []
  );

  const featureFlags = useMemo(() => selectEffectiveFeatureFlags(state), [state]);

  const setPlatformUser = useCallback((user: UserProfile | null) => {
    dispatch({ type: "SET_CURRENT_USER", user });
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      ...state,
      loading: false,
      featureFlags,
      dispatch,
      setDatabase,
      patchDatabase,
      setCurrentUser,
      reloadFromDisk,
      saveToProjectFolder,
      exportJsonFiles,
      exportBundle,
      importDatabase
    }),
    [
      state,
      featureFlags,
      setDatabase,
      patchDatabase,
      setCurrentUser,
      reloadFromDisk,
      saveToProjectFolder,
      exportJsonFiles,
      exportBundle,
      importDatabase
    ]
  );

  return (
    <AppContext.Provider value={value}>
      <DatabaseSyncStatusBadge status={state.syncStatus} />
      <PlatformProvider user={state.currentUser} setUser={setPlatformUser}>
        <UserDirectoryProvider>{children}</UserDirectoryProvider>
      </PlatformProvider>
    </AppContext.Provider>
  );
}

export function useAppState(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppState requires AppProvider");
  return ctx;
}

export function useSkipToBundledDatabase(): () => void {
  const { setDatabase } = useAppState();
  return useCallback(() => {
    clearSessionDatabase();
    setDatabase(validateAndRecoverDatabase(getSafeInitialDatabase()).database);
  }, [setDatabase]);
}
