import type { LocalDatabase } from "@/lib/local-db/db-types";
import type { DatabaseLoadReport } from "@/lib/local-db/read-db-safe";
import type { UserProfile } from "@/lib/types";
import type { AppLanguage, AppSyncStatus, AppViewMode } from "./app-types";

export type AppAction =
  | { type: "APP_BOOT" }
  | {
      type: "SET_DATABASE";
      database: LocalDatabase | ((prev: LocalDatabase) => LocalDatabase);
      report?: DatabaseLoadReport | null;
    }
  | { type: "PATCH_DATABASE"; patch: Partial<LocalDatabase> }
  | { type: "SET_CURRENT_USER"; user: UserProfile | null }
  | { type: "SET_ACTIVE_STUDIO"; studioId: string }
  | { type: "SET_SYNC_STATUS"; status: AppSyncStatus }
  | { type: "SET_LANGUAGE"; language: AppLanguage }
  | { type: "SET_VIEW_MODE"; viewMode: AppViewMode }
  | { type: "SET_EDIT_MODE"; editMode: boolean }
  | { type: "PUSH_ERROR"; message: string }
  | { type: "CLEAR_ERRORS" };
