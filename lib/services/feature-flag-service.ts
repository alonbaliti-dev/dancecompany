/**
 * Feature flags — mock merge global + studio overrides.
 * Supabase: `feature_flags` table with scope `global` | `studio`.
 */
import { seedGlobalFeatureFlags, seedStudioFeatureFlags } from "@/lib/platform-seed";
import type { FeatureFlags } from "@/lib/types";

export function mergeFeatureFlags(global: FeatureFlags, studio: FeatureFlags): FeatureFlags {
  return { ...global, ...studio };
}

export const featureFlagService = {
  getDefaults(studioId: string) {
    return mergeFeatureFlags(seedGlobalFeatureFlags(), seedStudioFeatureFlags(studioId));
  }
};
