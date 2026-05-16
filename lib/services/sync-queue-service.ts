import type { LocalDatabase } from "@/lib/local-db/db-types";
import type { QueuedAction, SyncActionStatus } from "@/lib/platform-os/types";

export type SyncUiState = "offline" | "pending" | "syncing" | "synced" | "failed";

export function syncUiLabel(status: SyncActionStatus, online: boolean): string {
  if (!online) return "אין חיבור";
  if (status === "pending") return "ממתין לסנכרון";
  if (status === "syncing") return "מסנכרן…";
  if (status === "synced") return "סונכרן";
  if (status === "failed") return "ננסה שוב אוטומטית";
  return "";
}

export function enqueueAction(
  db: LocalDatabase,
  action: Omit<QueuedAction, "id" | "status" | "createdAt" | "retryCount">
): LocalDatabase {
  const item: QueuedAction = {
    ...action,
    id: `sync_${Date.now().toString(36)}`,
    status: "pending",
    createdAt: new Date().toISOString(),
    retryCount: 0
  };
  const pending = db.platformOs.syncQueue.filter((q) => q.status === "pending" || q.status === "failed").length + 1;
  return {
    ...db,
    platformOs: {
      ...db.platformOs,
      syncQueue: [item, ...db.platformOs.syncQueue].slice(0, 100),
      systemStatus: {
        ...db.platformOs.systemStatus,
        syncQueuePending: pending,
        updatedAt: new Date().toISOString()
      }
    }
  };
}

export function processSyncQueue(db: LocalDatabase, online: boolean): LocalDatabase {
  if (!online) return db;
  let queue = [...db.platformOs.syncQueue];
  let changed = false;
  queue = queue.map((item) => {
    if (item.status !== "pending" && item.status !== "failed") return item;
    if (item.retryCount >= 5) return { ...item, status: "failed" as const };
    changed = true;
    return {
      ...item,
      status: "synced" as const,
      lastAttemptAt: new Date().toISOString(),
      retryCount: item.retryCount + 1
    };
  });
  if (!changed) return db;
  const pending = queue.filter((q) => q.status === "pending" || q.status === "failed").length;
  return {
    ...db,
    platformOs: {
      ...db.platformOs,
      syncQueue: queue,
      systemStatus: { ...db.platformOs.systemStatus, syncQueuePending: pending, updatedAt: new Date().toISOString() }
    }
  };
}

export function syncStateLabel(state: SyncUiState): string {
  if (state === "offline") return "אין חיבור";
  if (state === "pending") return "ממתין לסנכרון";
  if (state === "syncing") return "מסנכרן…";
  if (state === "failed") return "ננסה שוב אוטומטית";
  return "סונכרן";
}

export function getSyncStateForUser(db: LocalDatabase, userId: string, online: boolean): SyncUiState {
  const mine = db.platformOs.syncQueue.filter((q) => q.userId === userId);
  if (!online) return "offline";
  if (mine.some((q) => q.status === "failed")) return "failed";
  if (mine.some((q) => q.status === "pending")) return "pending";
  if (mine.some((q) => q.status === "syncing")) return "syncing";
  if (mine.length > 0 && mine.every((q) => q.status === "synced")) return "synced";
  return "synced";
}
