/**
 * Studio service — mock. Supabase: `from('studios')`, RLS by studio_id.
 */
import { seedBranding, seedStudios, seedStudioBilling } from "@/lib/platform-seed";
import type { PlatformBillingSummary, StudioBranding, StudioRecord } from "@/lib/types";

export const studioService = {
  list(): StudioRecord[] {
    return seedStudios();
  },
  getBranding(studioId: string): StudioBranding {
    return seedBranding(studioId);
  },
  getBilling(studioId: string): PlatformBillingSummary {
    return seedStudioBilling(studioId);
  }
};
