"use client";

import type { DbSyncStatus } from "@/context/LocalDatabaseContext";

const LABELS: Record<DbSyncStatus, string> = {
  syncing: "מסד נתונים נטען",
  synced: "סונכרן",
  demo: "עובד על נתוני דמו",
  error: "שגיאת סנכרון",
  idle: ""
};

const STYLES: Record<DbSyncStatus, string> = {
  syncing: "border-sky-500/25 bg-sky-500/10 text-sky-100/85",
  synced: "border-emerald-500/25 bg-emerald-500/10 text-emerald-100/85",
  demo: "border-amber-500/25 bg-amber-500/10 text-amber-100/85",
  error: "border-rose-500/25 bg-rose-500/10 text-rose-100/85",
  idle: ""
};

export function DatabaseSyncStatusBadge({ status }: { status: DbSyncStatus }) {
  if (status === "idle" || status === "synced") return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`sync-status-badge fixed left-3 rounded-full border px-3 py-1 text-[11px] shadow-lg backdrop-blur-sm ${STYLES[status]}`}
      dir="rtl"
    >
      {LABELS[status]}
    </div>
  );
}
