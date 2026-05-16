export type V6OfflineQueueItem = {
  id: string;
  label: string;
  createdAt: string;
  status: "queued" | "syncing" | "failed";
};

export function summarizeV6OfflineQueue(queue: V6OfflineQueueItem[] = []) {
  return {
    queued: queue.filter((item) => item.status === "queued").length,
    failed: queue.filter((item) => item.status === "failed").length,
    syncLabel: queue.length ? "פעולות ממתינות לסנכרון" : "מסונכרן"
  };
}
