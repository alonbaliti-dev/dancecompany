"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { useLocalDatabase } from "@/context/LocalDatabaseContext";
import type { BackupSnapshot } from "@/lib/platform-os/types";
import {
  compareBackupMetadata,
  createBackupSnapshot,
  downloadBackupJson,
  restoreFromBackup
} from "@/lib/services/backup-service";
import { filterActivityForUser, logActivity } from "@/lib/services/activity-feed-service";
import { enqueueAction, getSyncStateForUser, processSyncQueue, syncStateLabel } from "@/lib/services/sync-queue-service";
import { buildOnboardingProgress, completeOnboardingStep } from "@/lib/services/onboarding-service";
import { refreshAnalyticsInDb } from "@/lib/services/analytics-service";
import { runDatabaseIntegrityCheck } from "@/lib/local-db/integrity-check";
import type { UserProfile } from "@/lib/types";
import { inferUserType } from "@/lib/users/user-type";

type PlatformOSCtx = {
  activityForUser: ReturnType<typeof filterActivityForUser>;
  backups: BackupSnapshot[];
  restorePoints: import("@/lib/platform-os/types").RestorePoint[];
  syncLabel: string;
  syncState: ReturnType<typeof getSyncStateForUser>;
  online: boolean;
  setOnline: (v: boolean) => void;
  createBackup: (label: string, scope?: "platform" | "studio") => void;
  restoreBackup: (backupId: string) => boolean;
  downloadBackup: (backupId: string) => void;
  compareBackups: (aId: string, bId: string) => ReturnType<typeof compareBackupMetadata> | null;
  logActivity: (
    studioId: string,
    kind: import("@/lib/platform-os/types").ActivityFeedKind,
    messageHe: string,
    opts?: Parameters<typeof logActivity>[4]
  ) => void;
  enqueueSync: (actionType: string, payload: unknown) => void;
  refreshSystemStatus: () => void;
  onboarding: import("@/lib/platform-os/types").RoleOnboardingProgress | null;
  completeOnboardingStep: (stepId: string) => void;
};

const PlatformOSContext = createContext<PlatformOSCtx | null>(null);

export function PlatformOSProvider({ user, children }: { user: UserProfile; children: ReactNode }) {
  const { db, setDb } = useLocalDatabase();
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    setOnline(typeof navigator !== "undefined" ? navigator.onLine : true);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  useEffect(() => {
    if (!online) return;
    setDb((prev) => processSyncQueue(prev, true));
  }, [online, setDb]);

  const activityForUser = useMemo(
    () => filterActivityForUser(user, db.platformOs.activityFeed),
    [user, db.platformOs.activityFeed]
  );

  const syncState = useMemo(() => getSyncStateForUser(db, user.id, online), [db, user.id, online]);
  const syncLabel = syncStateLabel(syncState);

  const onboarding = useMemo(() => {
    const role = inferUserType(user);
    return db.platformOs.onboardingByUserId[user.id] ?? buildOnboardingProgress(user.id, role);
  }, [db.platformOs.onboardingByUserId, user]);

  const createBackup = useCallback(
    (label: string, scope: "platform" | "studio" = "platform") => {
      setDb((prev) => {
        let next = createBackupSnapshot(prev, user, label, scope, scope === "studio" ? user.studioId : undefined);
        next = logActivity(next, user.studioId, "backup", `נוצר גיבוי: ${label}`, {
          actorUserId: user.id,
          actorName: user.name,
          visibility: scope === "platform" ? "platform" : "studio"
        });
        return next;
      });
    },
    [setDb, user]
  );

  const restoreBackup = useCallback(
    (backupId: string) => {
      let ok = false;
      setDb((prev) => {
        const next = restoreFromBackup(prev, user, backupId);
        if (next) {
          ok = true;
          return next;
        }
        return prev;
      });
      return ok;
    },
    [setDb, user]
  );

  const downloadBackup = useCallback(
    (backupId: string) => {
      const b = db.platformOs.backups.find((x) => x.id === backupId);
      if (b) downloadBackupJson(b);
    },
    [db.platformOs.backups]
  );

  const compareBackups = useCallback(
    (aId: string, bId: string) => {
      const a = db.platformOs.backups.find((x) => x.id === aId);
      const b = db.platformOs.backups.find((x) => x.id === bId);
      if (!a || !b) return null;
      return compareBackupMetadata(a, b);
    },
    [db.platformOs.backups]
  );

  const logActivityFn = useCallback(
    (
      studioId: string,
      kind: import("@/lib/platform-os/types").ActivityFeedKind,
      messageHe: string,
      opts?: Parameters<typeof logActivity>[4]
    ) => {
      setDb((prev) => logActivity(prev, studioId, kind, messageHe, opts));
    },
    [setDb]
  );

  const enqueueSync = useCallback(
    (actionType: string, payload: unknown) => {
      setDb((prev) =>
        enqueueAction(prev, {
          studioId: user.studioId,
          userId: user.id,
          actionType,
          payload
        })
      );
    },
    [setDb, user]
  );

  const refreshSystemStatus = useCallback(() => {
    const report = runDatabaseIntegrityCheck(db);
    setDb((prev) => {
      let next = refreshAnalyticsInDb(prev, user.studioId);
      next = {
        ...next,
        platformOs: {
          ...next.platformOs,
          systemStatus: {
            ...next.platformOs.systemStatus,
            databaseStatus: report.errorCount > 0 ? "degraded" : "ok",
            brokenMediaLinks: report.issues.filter((i) => i.category === "media").length,
            syncQueuePending: next.platformOs.syncQueue.filter(
              (q) => q.status === "pending" || q.status === "failed"
            ).length,
            updatedAt: new Date().toISOString()
          }
        }
      };
      return next;
    });
  }, [db, setDb, user.studioId]);

  const completeOnboardingStepFn = useCallback(
    (stepId: string) => {
      setDb((prev) => {
        const role = inferUserType(user);
        const current = prev.platformOs.onboardingByUserId[user.id] ?? buildOnboardingProgress(user.id, role);
        const updated = completeOnboardingStep(current, stepId);
        return {
          ...prev,
          platformOs: {
            ...prev.platformOs,
            onboardingByUserId: { ...prev.platformOs.onboardingByUserId, [user.id]: updated }
          }
        };
      });
    },
    [setDb, user]
  );

  const value = useMemo(
    (): PlatformOSCtx => ({
      activityForUser,
      backups: db.platformOs.backups,
      restorePoints: db.platformOs.restorePoints,
      syncLabel,
      syncState,
      online,
      setOnline,
      createBackup,
      restoreBackup,
      downloadBackup,
      compareBackups,
      logActivity: logActivityFn,
      enqueueSync,
      refreshSystemStatus,
      onboarding,
      completeOnboardingStep: completeOnboardingStepFn
    }),
    [
      activityForUser,
      db.platformOs.backups,
      db.platformOs.restorePoints,
      syncLabel,
      syncState,
      online,
      createBackup,
      restoreBackup,
      downloadBackup,
      compareBackups,
      logActivityFn,
      enqueueSync,
      refreshSystemStatus,
      onboarding,
      completeOnboardingStepFn
    ]
  );

  return <PlatformOSContext.Provider value={value}>{children}</PlatformOSContext.Provider>;
}

export function usePlatformOS() {
  const ctx = useContext(PlatformOSContext);
  if (!ctx) throw new Error("usePlatformOS must be used within PlatformOSProvider");
  return ctx;
}
