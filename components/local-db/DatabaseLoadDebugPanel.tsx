"use client";

import type { ClientDatabaseLoadResult } from "@/lib/local-db/load-client-database";

type Props = {
  message: string;
  apiStatus: ClientDatabaseLoadResult["apiStatus"] | "pending";
  onRetry: () => void;
  onLoadDemo: () => void;
};

export function DatabaseLoadDebugPanel({ message, apiStatus, onRetry, onLoadDemo }: Props) {
  return (
    <div
      className="mt-4 w-full max-w-md rounded-2xl border border-rose-500/25 bg-rose-950/40 p-4 text-right text-xs text-rose-100/90"
      dir="rtl"
    >
      <p className="font-medium text-rose-200">שגיאת טעינת מסד</p>
      <p className="mt-1 text-white/55">{message}</p>
      <p className="mt-2 font-mono text-[11px] text-white/45">API: {apiStatus}</p>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          className="rounded-lg border border-white/15 px-3 py-1.5 text-white/80"
          onClick={onRetry}
        >
          ניסיון חוזר
        </button>
        <button
          type="button"
          className="rounded-lg border border-emerald-500/35 bg-emerald-500/10 px-3 py-1.5 text-emerald-100"
          onClick={onLoadDemo}
        >
          טען דמו
        </button>
      </div>
    </div>
  );
}
