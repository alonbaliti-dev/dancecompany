import type { LocalDatabase } from "@/lib/local-db/db-types";
import { seedBranding } from "@/lib/platform-seed";
import type { FeatureFlags, StudioBranding, StudioRecord, UserProfile } from "@/lib/types";
import { domainGuards } from "../core/permissions";
import type { DomainMutationInput } from "../core/types";

export function buildSetGlobalFlagMutation(
  actor: UserProfile,
  key: keyof FeatureFlags,
  value: boolean,
  studioId: string
): DomainMutationInput {
  return {
    actor,
    guard: domainGuards.manageFeatureFlags(actor),
    mutate: (db) => ({
      ...db,
      featureFlags: { ...db.featureFlags, global: { ...db.featureFlags.global, [key]: value } }
    }),
    audit: {
      studioId,
      action: `תכונה גלובלית · ${key}: ${value ? "הופעלה" : "כובתה"}`,
      targetType: "feature_flag",
      severity: "info"
    },
    activity: {
      kind: "system",
      messageHe: `דגל מערכת: ${key}`,
      visibility: "platform"
    }
  };
}

export function buildSetStudioFlagMutation(
  actor: UserProfile,
  studioId: string,
  key: keyof FeatureFlags,
  value: boolean
): DomainMutationInput {
  return {
    actor,
    guard: domainGuards.superAdmin(actor),
    mutate: (db) => ({
      ...db,
      featureFlags: {
        ...db.featureFlags,
        byStudio: {
          ...db.featureFlags.byStudio,
          [studioId]: {
            ...(db.featureFlags.byStudio[studioId] ?? db.featureFlags.global),
            [key]: value
          }
        }
      }
    }),
    audit: {
      studioId,
      action: `תכונת סטודיו · ${key}: ${value ? "הופעלה" : "כובתה"}`,
      targetType: "feature_flag",
      severity: "info"
    }
  };
}

export function buildUpdateBrandingMutation(
  actor: UserProfile,
  studioId: string,
  patch: Partial<StudioBranding>
): DomainMutationInput {
  return {
    actor,
    guard: domainGuards.management(actor),
    mutate: (db) => ({
      ...db,
      branding: {
        ...db.branding,
        [studioId]: { ...(db.branding[studioId] ?? seedBranding(studioId)), ...patch }
      }
    }),
    audit: {
      studioId,
      action: "מיתוג סטודיו עודכן",
      targetType: "studio",
      targetId: studioId,
      severity: "info"
    }
  };
}

export function buildSetStudioStatusMutation(
  actor: UserProfile,
  studioId: string,
  status: StudioRecord["status"]
): DomainMutationInput {
  return {
    actor,
    guard: domainGuards.superAdmin(actor),
    mutate: (db) => ({
      ...db,
      studios: db.studios.map((s) => (s.id === studioId ? { ...s, status } : s))
    }),
    audit: {
      studioId,
      action: `סטטוס סטודיו: ${status}`,
      targetType: "studio",
      targetId: studioId,
      severity: "warning"
    }
  };
}
