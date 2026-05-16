"use client";

import { createContext, useCallback, useContext, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { STUDIO_LK } from "@/lib/platform/constants";
import { useLocalDatabase } from "@/context/LocalDatabaseContext";
import { useDomainMutation } from "@/lib/hooks/useDomainMutation";
import * as platformOps from "@/lib/domains/platform/operations";
import { applyMvpProductFlags } from "@/lib/mvp/mvp-policy";
import { mergeFeatureFlags } from "@/lib/services/feature-flag-service";
import { seedStudioFeatureFlags, seedBranding } from "@/lib/platform-seed";
import { EMPTY_DATABASE } from "@/lib/local-db/db-types";
import type {
  AuditLogEntry,
  FeatureFlags,
  PlatformBillingSummary,
  ReleaseNote,
  StudioBranding,
  StudioRecord,
  UserProfile
} from "@/lib/types";

type PlatformCtx = {
  user: UserProfile | null;
  activeStudioId: string;
  studios: StudioRecord[];
  branding: StudioBranding;
  effectiveFlags: FeatureFlags;
  globalFlags: FeatureFlags;
  studioFlags: FeatureFlags;
  auditLog: AuditLogEntry[];
  releaseNotes: ReleaseNote[];
  platformBilling: PlatformBillingSummary;
  studioBilling: PlatformBillingSummary;
  impersonating: boolean;
  setUser: (u: UserProfile | null) => void;
  setActiveStudioId: (id: string) => void;
  setGlobalFlag: (key: keyof FeatureFlags, value: boolean) => void;
  setStudioFlag: (key: keyof FeatureFlags, value: boolean) => void;
  updateBranding: (patch: Partial<StudioBranding>) => void;
  appendAudit: (entry: Omit<AuditLogEntry, "id" | "timestamp">) => void;
  setStudioStatus: (studioId: string, status: StudioRecord["status"]) => void;
  startImpersonation: (studioId: string) => void;
  stopImpersonation: () => void;
  forceRefreshMock: () => void;
};

const PlatformContext = createContext<PlatformCtx | null>(null);

function newId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}`;
}

export function PlatformProvider({
  user,
  setUser,
  children
}: {
  user: UserProfile | null;
  setUser: (u: UserProfile | null) => void;
  children: ReactNode;
}) {
  const { db, setDb, reloadFromDisk } = useLocalDatabase();
  const mutate = useDomainMutation();
  const [activeStudioId, setActiveStudioId] = useState(STUDIO_LK);
  const [impersonating, setImpersonating] = useState(false);

  const studios = db.studios;
  const globalFlags = db.featureFlags.global;
  const studioFlagsByStudio = db.featureFlags.byStudio;
  const brandingByStudio = db.branding;
  const auditLog = db.auditLog;
  const releaseNotes = db.platformMeta.releaseNotes;
  const platformBilling = db.platformMeta.platformBilling;

  const resolvedStudioId = useMemo(() => {
    if (!user) return activeStudioId;
    if (user.permissions.isSuperAdmin) return activeStudioId;
    return user.studioId;
  }, [user, activeStudioId]);

  const studioFlags = studioFlagsByStudio[resolvedStudioId] ?? seedStudioFeatureFlags(resolvedStudioId);
  const effectiveFlags = useMemo(
    () => applyMvpProductFlags(mergeFeatureFlags(globalFlags, studioFlags)),
    [globalFlags, studioFlags]
  );
  const branding = brandingByStudio[resolvedStudioId] ?? seedBranding(resolvedStudioId);

  const appendAudit = useCallback(
    (entry: Omit<AuditLogEntry, "id" | "timestamp">) => {
      setDb((prev) => ({
        ...prev,
        auditLog: [
          {
            ...entry,
            id: newId("aud"),
            timestamp: new Date().toISOString()
          },
          ...prev.auditLog
        ]
      }));
    },
    [setDb]
  );

  const setGlobalFlag = useCallback(
    (key: keyof FeatureFlags, value: boolean) => {
      if (!user) return;
      mutate(platformOps.buildSetGlobalFlagMutation(user, key, value, resolvedStudioId));
    },
    [user, resolvedStudioId, mutate]
  );

  const setStudioFlag = useCallback(
    (key: keyof FeatureFlags, value: boolean) => {
      if (!user) return;
      mutate(platformOps.buildSetStudioFlagMutation(user, resolvedStudioId, key, value));
    },
    [user, resolvedStudioId, mutate]
  );

  const updateBranding = useCallback(
    (patch: Partial<StudioBranding>) => {
      if (!user) return;
      mutate(platformOps.buildUpdateBrandingMutation(user, resolvedStudioId, patch));
    },
    [user, resolvedStudioId, mutate]
  );

  const setStudioStatus = useCallback(
    (studioId: string, status: StudioRecord["status"]) => {
      if (!user) return;
      mutate(platformOps.buildSetStudioStatusMutation(user, studioId, status));
    },
    [user, mutate]
  );

  const startImpersonation = useCallback(
    (studioId: string) => {
      if (!user?.permissions.isSuperAdmin) return;
      setActiveStudioId(studioId);
      setImpersonating(true);
    },
    [user]
  );

  const stopImpersonation = useCallback(() => {
    setImpersonating(false);
    if (user?.studioId) setActiveStudioId(user.studioId);
  }, [user]);

  const handleSetActiveStudioId = useCallback(
    (id: string) => {
      if (!user?.permissions.isSuperAdmin) return;
      setActiveStudioId(id);
      setDb((prev) => {
        const flags = prev.featureFlags.byStudio[id] ?? seedStudioFeatureFlags(id);
        const brand = prev.branding[id] ?? seedBranding(id);
        return {
          ...prev,
          featureFlags: { ...prev.featureFlags, byStudio: { ...prev.featureFlags.byStudio, [id]: flags } },
          branding: { ...prev.branding, [id]: brand }
        };
      });
    },
    [user, setDb]
  );

  const value = useMemo(
    () => ({
      user,
      activeStudioId: resolvedStudioId,
      studios,
      branding,
      effectiveFlags,
      globalFlags,
      studioFlags,
      auditLog,
      releaseNotes,
      platformBilling,
      studioBilling:
        db.platformMeta.studioBillingByStudio[resolvedStudioId] ?? EMPTY_DATABASE.platformMeta.platformBilling,
      impersonating,
      setUser,
      setActiveStudioId: handleSetActiveStudioId,
      setGlobalFlag,
      setStudioFlag,
      updateBranding,
      appendAudit,
      setStudioStatus,
      startImpersonation,
      stopImpersonation,
      forceRefreshMock: () => void reloadFromDisk()
    }),
    [
      user,
      resolvedStudioId,
      studios,
      branding,
      effectiveFlags,
      globalFlags,
      studioFlags,
      auditLog,
      releaseNotes,
      impersonating,
      setUser,
      handleSetActiveStudioId,
      setGlobalFlag,
      setStudioFlag,
      updateBranding,
      appendAudit,
      setStudioStatus,
      startImpersonation,
      stopImpersonation,
      reloadFromDisk,
      platformBilling,
      db.platformMeta.studioBillingByStudio
    ]
  );

  return <PlatformContext.Provider value={value}>{children}</PlatformContext.Provider>;
}

export function usePlatform(): PlatformCtx {
  const ctx = useContext(PlatformContext);
  if (!ctx) throw new Error("usePlatform requires PlatformProvider");
  return ctx;
}

export function useBrandingStyle(branding: StudioBranding): CSSProperties {
  return useMemo(
    () =>
      ({
        ["--studio-primary" as string]: branding.primaryColor,
        ["--studio-accent" as string]: branding.accentColor
      }) as CSSProperties,
    [branding]
  );
}
