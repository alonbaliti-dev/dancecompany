import { mergeFeatureFlags } from "@/lib/services/feature-flag-service";
import { seedStudioFeatureFlags } from "@/lib/platform-seed";
import type { AppState } from "./app-types";
import type { FeatureFlags } from "@/lib/types";

export function selectEffectiveFeatureFlags(state: AppState): FeatureFlags {
  const studioId = state.currentUser?.permissions.isSuperAdmin
    ? state.activeStudioId
    : state.currentUser?.studioId ?? state.activeStudioId;
  const global = state.database.featureFlags.global;
  const studio = state.database.featureFlags.byStudio[studioId] ?? seedStudioFeatureFlags(studioId);
  return mergeFeatureFlags(global, studio);
}

export function selectIsAuthenticated(state: AppState): boolean {
  return state.currentUser !== null;
}

export function selectSyncLabel(state: AppState): string {
  switch (state.syncStatus) {
    case "syncing":
      return "מסד נתונים נטען";
    case "synced":
      return "סונכרן";
    case "demo":
      return "עובד על נתוני דמו";
    case "error":
      return "שגיאת סנכרון";
    default:
      return "";
  }
}
