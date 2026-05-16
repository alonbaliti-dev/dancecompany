"use client";

import { useEffect, useState } from "react";
import type { LocalDatabase } from "@/lib/local-db/db-types";
import type { ClientDatabaseLoadResult } from "@/lib/local-db/load-client-database";
import { API_HEALTH, API_STATUS } from "@/lib/local-db/load-client-database";
import type { DatabaseLoadReport, DatabaseStatusPayload } from "@/lib/local-db/read-db-safe";
import { fetchDatabaseApi } from "@/lib/local-db/client-api";

type Props = {
  apiStatus: ClientDatabaseLoadResult["apiStatus"] | "pending";
  report: DatabaseLoadReport | null;
  db: LocalDatabase;
  onRetry: () => void;
  onReset: () => void;
  onSafeDemo: () => void;
};

export function DatabaseLoadDiagnostics({
  apiStatus,
  report,
  db,
  onRetry,
  onReset,
  onSafeDemo
}: Props) {
  const [healthOk, setHealthOk] = useState<boolean | null>(null);
  const [serverStatus, setServerStatus] = useState<DatabaseStatusPayload | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const health = await fetchDatabaseApi(API_HEALTH, 4000);
      if (cancelled) return;
      if (health.ok && health.json && typeof health.json === "object" && "ok" in health.json) {
        setHealthOk(Boolean((health.json as { ok?: boolean }).ok));
      } else {
        setHealthOk(false);
      }

      const status = await fetchDatabaseApi(API_STATUS, 6000);
      if (cancelled) return;
      if (status.ok && status.json) {
        setServerStatus(status.json as DatabaseStatusPayload);
        setStatusError(null);
      } else {
        setServerStatus(null);
        setStatusError(status.error ?? "status failed");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [apiStatus]);

  return (
    <div
      className="fixed bottom-3 left-3 z-[9999] max-w-sm rounded-2xl border border-amber-500/25 bg-[#0c0c0e]/95 p-3 text-right text-[11px] text-white/70 shadow-xl backdrop-blur-md"
      dir="rtl"
    >
      <p className="mb-2 font-medium text-amber-200/90">אבחון מסד (פיתוח)</p>
      <dl className="space-y-1">
        <div className="flex justify-between gap-3">
          <dt className="text-white/45">שרת</dt>
          <dd className="font-mono text-white/80">{origin}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-white/45">/api/health</dt>
          <dd className="font-mono text-white/80">
            {healthOk === null ? "…" : healthOk ? "ok" : "fail"}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-white/45">/api/local-db/read</dt>
          <dd className="font-mono text-white/80">{apiStatus}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-white/45">משתמשים (לקוח)</dt>
          <dd className="font-mono text-white/80">{db.users.length}</dd>
        </div>
        {serverStatus ? (
          <>
            <div className="flex justify-between gap-3">
              <dt className="text-white/45">תיקיית database</dt>
              <dd className="font-mono text-white/80">
                {serverStatus.databaseFolderExists ? "כן" : "לא"}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-white/45">מודולים בשרת</dt>
              <dd className="font-mono text-white/80">
                {serverStatus.totalModulesLoaded} / {serverStatus.totalModulesExpected}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-white/45">קבצי JSON</dt>
              <dd className="font-mono text-white/80">{serverStatus.jsonFilesFound.length}</dd>
            </div>
          </>
        ) : (
          <div className="text-rose-300/80">{statusError ?? "טוען status…"}</div>
        )}
      </dl>
      {serverStatus && serverStatus.failed.length > 0 ? (
        <ul className="mt-2 max-h-20 list-none space-y-1 overflow-auto border-t border-white/10 pt-2 text-rose-200/80">
          {serverStatus.failed.map((err) => (
            <li key={`${err.file}-${err.moduleKey}`}>
              <span className="font-mono">{err.file}</span>: {err.message}
            </li>
          ))}
        </ul>
      ) : null}
      <p className="mt-2 border-t border-white/10 pt-2 text-[10px] text-white/40">
        בדיקה מ-iPhone: {origin}
        {API_HEALTH} · {API_STATUS} · /api/local-db/read
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <button
          type="button"
          className="rounded-lg border border-white/15 px-2 py-1 text-white/75"
          onClick={onRetry}
        >
          ניסיון חוזר
        </button>
        <button
          type="button"
          className="rounded-lg border border-emerald-500/30 px-2 py-1 text-emerald-100/85"
          onClick={onSafeDemo}
        >
          דמו בטוח
        </button>
        <button
          type="button"
          className="rounded-lg border border-white/10 px-2 py-1 text-white/50"
          onClick={onReset}
        >
          איפוס
        </button>
      </div>
    </div>
  );
}
