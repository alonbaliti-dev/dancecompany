"use client";

import { useState } from "react";
import type { DatabaseLoadReport } from "@/lib/local-db/read-db-safe";

type Props = {
  title: string;
  message: string;
  report?: DatabaseLoadReport;
  showTechnical: boolean;
  onRetry: () => void;
  onReset: () => void;
  onSafeDemo: () => void;
};

export function DatabaseLoadErrorScreen({
  title,
  message,
  report,
  showTechnical,
  onRetry,
  onReset,
  onSafeDemo
}: Props) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  return (
    <div
      className="flex min-h-app flex-col items-center justify-center gap-4 px-6 text-center text-sm text-rose-100/90"
      dir="rtl"
    >
      <h1 className="text-base font-medium text-white/90">{title}</h1>
      <p className="max-w-md text-white/60">{message}</p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          className="rounded-xl border border-white/15 bg-white/[0.06] px-4 py-2 text-white/80"
          onClick={onRetry}
        >
          ניסיון חוזר
        </button>
        <button
          type="button"
          className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-emerald-100/90"
          onClick={onSafeDemo}
        >
          טעינת דמו בטוח
        </button>
        <button
          type="button"
          className="rounded-xl border border-white/10 px-4 py-2 text-white/55"
          onClick={onReset}
        >
          איפוס מטמון וטעינה מחדש
        </button>
      </div>
      {showTechnical && report ? (
        <div className="w-full max-w-lg text-right">
          <button
            type="button"
            className="text-xs text-white/45 underline-offset-2 hover:underline"
            onClick={() => setDetailsOpen((v) => !v)}
          >
            {detailsOpen ? "הסתר פרטים טכניים" : "פרטים טכניים"}
          </button>
          {detailsOpen ? (
            <pre className="mt-2 max-h-48 overflow-auto rounded-xl border border-white/10 bg-black/40 p-3 text-left text-[11px] text-white/50">
              {JSON.stringify(report, null, 2)}
            </pre>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
