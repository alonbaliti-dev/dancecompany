"use client";

import { useState } from "react";
import { Archive, Download, RotateCcw } from "lucide-react";
import { usePlatformOS } from "@/context/PlatformOSContext";
import { useToast } from "@/context/ToastContext";
import { canExportDatabase, canImportDatabase } from "@/lib/security/permissions";
import type { UserProfile } from "@/lib/types";
import { SectionEyebrow } from "../ui";

export function BackupRestorePanel({ user }: { user: UserProfile }) {
  const { backups, restorePoints, createBackup, restoreBackup, downloadBackup, compareBackups } = usePlatformOS();
  const { showToast } = useToast();
  const [compareA, setCompareA] = useState("");
  const [compareB, setCompareB] = useState("");
  const canBackup = canExportDatabase(user);
  const canRestore = canImportDatabase(user);

  const comparison = compareA && compareB ? compareBackups(compareA, compareB) : null;

  return (
    <div className="space-y-4">
      <SectionEyebrow>גיבוי ושחזור</SectionEyebrow>
      {canBackup ? (
        <button
          type="button"
          aria-label="יצירת גיבוי"
          onClick={() => {
            createBackup(`גיבוי ${new Date().toLocaleString("he-IL")}`);
            showToast("גיבוי נוצר ונשמר במערכת");
          }}
          className="flex w-full items-center justify-between gap-3 rounded-2xl border border-violet-400/20 bg-violet-500/[0.08] px-4 py-3.5 text-right"
        >
          <Archive size={20} className="text-violet-200/80" />
          <span className="text-sm font-semibold text-white">יצירת גיבוי ידני</span>
        </button>
      ) : null}

      {backups.length === 0 ? (
        <p className="text-right text-xs text-white/40">אין גיבויים עדיין.</p>
      ) : (
        <ul className="space-y-2">
          {backups.map((b) => (
            <li key={b.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-right">
              <p className="text-sm font-medium text-white">{b.label}</p>
              <p className="mt-1 text-xs text-white/45">
                {new Date(b.createdAt).toLocaleString("he-IL")} · {(b.byteSize / 1024).toFixed(0)} KB · {b.createdByName}
              </p>
              <div className="mt-2 flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  aria-label="הורדת גיבוי"
                  onClick={() => downloadBackup(b.id)}
                  className="inline-flex items-center gap-1 rounded-lg border border-white/12 px-2 py-1 text-xs text-white/70"
                >
                  <Download size={12} />
                  הורדה
                </button>
                {canRestore ? (
                  <button
                    type="button"
                    aria-label="שחזור גיבוי"
                    onClick={() => {
                      if (!confirm("לשחזר את המסד מגיבוי זה? פעולה זו תחליף את הנתונים הנוכחיים.")) return;
                      const ok = restoreBackup(b.id);
                      showToast(ok ? "שחזור הושלם" : "שחזור נכשל");
                    }}
                    className="inline-flex items-center gap-1 rounded-lg border border-amber-400/25 px-2 py-1 text-xs text-amber-100/85"
                  >
                    <RotateCcw size={12} />
                    שחזור
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}

      {restorePoints.length > 0 ? (
        <div>
          <p className="text-right text-xs font-medium text-white/40">נקודות שחזור</p>
          <ul className="mt-2 space-y-1 text-right text-xs text-white/50">
            {restorePoints.slice(0, 5).map((p) => (
              <li key={p.id}>
                {p.label}
                {p.restoredAt ? ` · שוחזר ${new Date(p.restoredAt).toLocaleDateString("he-IL")}` : ""}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {canBackup && backups.length >= 2 ? (
        <div className="rounded-2xl border border-white/10 p-3">
          <p className="text-right text-xs text-white/50">השוואת מטא-דאטה</p>
          <div className="mt-2 flex gap-2">
            <select
              value={compareA}
              onChange={(e) => setCompareA(e.target.value)}
              className="flex-1 rounded-lg border border-white/12 bg-black/30 px-2 py-1 text-xs text-white"
              aria-label="גיבוי א"
            >
              <option value="">גיבוי א</option>
              {backups.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.label}
                </option>
              ))}
            </select>
            <select
              value={compareB}
              onChange={(e) => setCompareB(e.target.value)}
              className="flex-1 rounded-lg border border-white/12 bg-black/30 px-2 py-1 text-xs text-white"
              aria-label="גיבוי ב"
            >
              <option value="">גיבוי ב</option>
              {backups.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.label}
                </option>
              ))}
            </select>
          </div>
          {comparison ? (
            <ul className="mt-2 space-y-1 text-right text-[11px] text-white/45">
              {comparison.map((row) => (
                <li key={row.key}>
                  {row.key}: {row.a} → {row.b}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
