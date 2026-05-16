"use client";

import { DatabaseLoadDebugPanel } from "./DatabaseLoadDebugPanel";
import type { ClientDatabaseLoadResult } from "@/lib/local-db/load-client-database";

type Props = {
  message?: string;
  debugMessage?: string | null;
  apiStatus?: ClientDatabaseLoadResult["apiStatus"] | "pending";
  onRetry?: () => void;
  onSafeDemo?: () => void;
  onSkipDemo?: () => void;
};

export function DatabaseLoadScreen({
  message = "טוען מסד נתונים מקומי…",
  debugMessage,
  apiStatus = "pending",
  onRetry,
  onSafeDemo,
  onSkipDemo
}: Props) {
  return (
    <div className="pointer-events-auto flex min-h-app flex-col items-center justify-center gap-4 px-6 text-sm text-white/40" dir="rtl">
      <div className="h-9 w-9 animate-pulse rounded-2xl border border-white/10 bg-white/[0.06]" aria-hidden />
      <p>{message}</p>
      {onSkipDemo ? (
        <button
          type="button"
          className="min-h-[3rem] touch-manipulation rounded-xl border border-amber-400/40 bg-amber-500/15 px-5 py-3 text-base text-amber-100 active:opacity-90"
          onClick={onSkipDemo}
        >
          דלג ופתח דמו
        </button>
      ) : null}
      {debugMessage ? (
        <DatabaseLoadDebugPanel
          message={debugMessage}
          apiStatus={apiStatus}
          onRetry={onRetry ?? (() => {})}
          onLoadDemo={onSafeDemo ?? (() => {})}
        />
      ) : null}
    </div>
  );
}
