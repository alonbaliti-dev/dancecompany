/**
 * Management reports — mock aggregates. Supabase: materialized views or Edge Function rollups.
 */
import type { UserProfile } from "@/lib/types";

export type StudioReportSummary = {
  engagementPct: number;
  attendancePct: number;
  practiceCompletionPct: number;
  atRiskCount: number;
};

export const reportService = {
  /** Server-side only in production — never expose raw student PII cross-group to teachers */
  getStudioSummary(studioId: string, actor: UserProfile): Promise<StudioReportSummary | null> {
    if (!actor.permissions.isManagement && !actor.permissions.isSuperAdmin) return Promise.resolve(null);
    if (!actor.permissions.isSuperAdmin && actor.studioId !== studioId) return Promise.resolve(null);
    return Promise.resolve({
      engagementPct: 78,
      attendancePct: 91,
      practiceCompletionPct: 74,
      atRiskCount: 3
    });
  }
};
