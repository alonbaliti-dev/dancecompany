"use client";

import { Cloud, CloudOff, RefreshCw } from "lucide-react";
import { usePlatformOS } from "@/context/PlatformOSContext";

export function SyncStatusBanner() {
  const { syncState, syncLabel, online } = usePlatformOS();
  if (syncState === "synced" && online) return null;

  const icon =
    syncState === "offline" ? (
      <CloudOff size={16} className="text-amber-300/90" aria-hidden />
    ) : syncState === "failed" ? (
      <RefreshCw size={16} className="text-rose-300/90" aria-hidden />
    ) : (
      <Cloud size={16} className="text-sky-300/85" aria-hidden />
    );

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center justify-center gap-2 border-b border-white/8 bg-white/[0.04] px-4 py-2 text-center text-xs text-white/60"
    >
      {icon}
      <span>{syncLabel}</span>
    </div>
  );
}
