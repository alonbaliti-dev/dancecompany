import type { LocalDatabase } from "@/lib/local-db/db-types";
import { validateAndRecoverDatabase } from "@/lib/local-db/db-validator";
import { getSafeInitialDatabase } from "@/lib/local-db/safe-initial-database";
import type { AppAction } from "./app-actions";
import type { AppState } from "./app-types";
import { initialAppMeta as meta } from "./app-types";

function bootDatabase(): LocalDatabase {
  return validateAndRecoverDatabase(getSafeInitialDatabase()).database;
}

export function createInitialAppState(): AppState {
  return {
    appReady: true,
    database: bootDatabase(),
    currentUser: null,
    activeStudioId: meta.activeStudioId,
    language: meta.language,
    syncStatus: "syncing",
    viewMode: meta.viewMode,
    editMode: meta.editMode,
    loadReport: meta.loadReport,
    errors: []
  };
}

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "APP_BOOT":
      return { ...state, appReady: true };
    case "SET_DATABASE": {
      const raw =
        typeof action.database === "function" ? action.database(state.database) : action.database;
      const { database } = validateAndRecoverDatabase(raw);
      return {
        ...state,
        database,
        loadReport: action.report ?? state.loadReport,
        appReady: true
      };
    }
    case "PATCH_DATABASE": {
      const { database } = validateAndRecoverDatabase({ ...state.database, ...action.patch });
      return { ...state, database, appReady: true };
    }
    case "SET_CURRENT_USER":
      return {
        ...state,
        currentUser: action.user,
        activeStudioId: action.user?.studioId ?? state.activeStudioId
      };
    case "SET_ACTIVE_STUDIO":
      return { ...state, activeStudioId: action.studioId };
    case "SET_SYNC_STATUS":
      return { ...state, syncStatus: action.status };
    case "SET_LANGUAGE":
      return { ...state, language: action.language };
    case "SET_VIEW_MODE":
      return { ...state, viewMode: action.viewMode };
    case "SET_EDIT_MODE":
      return { ...state, editMode: action.editMode };
    case "PUSH_ERROR":
      return { ...state, errors: [...state.errors, action.message] };
    case "CLEAR_ERRORS":
      return { ...state, errors: [] };
    default:
      return state;
  }
}
