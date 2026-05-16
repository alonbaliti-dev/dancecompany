import type { LocalDatabase } from "@/lib/local-db/db-types";
import type { DatabaseLoadReport } from "@/lib/local-db/read-db-safe";
import type { UserProfile } from "@/lib/types";
import { STUDIO_LK } from "@/lib/platform/constants";

export type AppSyncStatus = "idle" | "syncing" | "synced" | "demo" | "error";

export type AppLanguage = "he" | "en";

export type AppViewMode = "auto" | "mobile" | "tablet" | "desktop";

export type AppState = {
  appReady: boolean;
  database: LocalDatabase;
  currentUser: UserProfile | null;
  activeStudioId: string;
  language: AppLanguage;
  syncStatus: AppSyncStatus;
  viewMode: AppViewMode;
  editMode: boolean;
  loadReport: DatabaseLoadReport | null;
  errors: string[];
};

export const initialAppMeta = {
  activeStudioId: STUDIO_LK,
  language: "he" as AppLanguage,
  viewMode: "auto" as AppViewMode,
  editMode: false,
  loadReport: null as DatabaseLoadReport | null,
  errors: [] as string[]
};
