import type { FeatureFlags } from "@/lib/types";

/**
 * MVP product policy — core surfaces stay enabled regardless of stale flag JSON.
 * Super Admin can still toggle flags in DB; effective UI uses this overlay.
 */
export function applyMvpProductFlags(flags: FeatureFlags): FeatureFlags {
  return {
    ...flags,
    shop: true,
    gallery: true,
    achievementsBoard: true,
    reports: true,
    staffChat: true,
    videoUploads: true,
    studioIdentity: true,
    payments: true
  };
}

export const PERMISSIONS_STRIP_STORAGE_KEY = "lk-mvp-permissions-dismissed";
