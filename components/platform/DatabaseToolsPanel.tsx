"use client";

import { useRef, useState } from "react";
import { Database, Download, FolderDown, RefreshCw, Upload } from "lucide-react";
import { useLocalDatabase } from "@/context/LocalDatabaseContext";
import type { ImportMode } from "@/lib/local-db/db-service";
import { SectionEyebrow } from "../ui";

export function DatabaseToolsPanel() {
  const {
    reloadFromDisk,
    saveToProjectFolder,
    exportJsonFiles,
    exportBundle,
    importDatabase
  } = useLocalDatabase();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<"save" | "reload" | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const onImport = async (file: File, mode: ImportMode) => {
    try {
      const raw = JSON.parse(await file.text()) as unknown;
      importDatabase(raw, mode);
      setMessage(mode === "bundle" ? "חבילת מסד הנתונים יובאה בהצלחה" : "קבצי JSON יובאו בהצלחה");
    } catch {
      setMessage("ייבוא נכשל — בדקו שזה קובץ JSON תקין");
    }
  };

  return (
    <div className="mt-6">
      <SectionEyebrow>מסד נתונים מקומי</SectionEyebrow>
      <p className="mt-2 text-right text-xs leading-relaxed text-white/45">
        קבצי JSON בתיקיית <code className="text-white/60">/database</code>. בפרודקשן (Vercel) השמירה לדיסק חסומה — ייצוא/ייבוא דרך הדפדפן.
      </p>
      <div className="mt-3 grid gap-2">
        <DbButton icon={Download} label="ייצוא קבצי JSON" onClick={exportJsonFiles} />
        <DbButton icon={Database} label="ייצוא חבילה אחת (.json)" onClick={exportBundle} />
        <DbButton
          icon={FolderDown}
          label={busy === "save" ? "שומר…" : "שמירה לתיקיית /database"}
          disabled={busy !== null}
          onClick={async () => {
            setBusy("save");
            setMessage(null);
            try {
              await saveToProjectFolder();
              setMessage("נשמר בהצלחה (סביבת פיתוח)");
            } catch (e) {
              setMessage(e instanceof Error ? e.message : "שמירה נכשלה");
            } finally {
              setBusy(null);
            }
          }}
        />
        <DbButton
          icon={RefreshCw}
          label={busy === "reload" ? "טוען…" : "טעינה מחדש מהדיסק"}
          disabled={busy !== null}
          onClick={async () => {
            setBusy("reload");
            setMessage(null);
            try {
              await reloadFromDisk();
              setMessage("נטען מחדש מהדיסק");
            } catch (e) {
              setMessage(e instanceof Error ? e.message : "טעינה נכשלה");
            } finally {
              setBusy(null);
            }
          }}
        />
        <DbButton icon={Upload} label="ייבוא חבילה (.json)" onClick={() => fileRef.current?.click()} />
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) void onImport(file, "bundle");
          }}
        />
        <DbButton
          icon={Upload}
          label="ייבוא מפת קבצים (users.json וכו׳)"
          onClick={() => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "application/json,.json";
            input.onchange = () => {
              const file = input.files?.[0];
              if (file) void onImport(file, "files");
            };
            input.click();
          }}
        />
      </div>
      {message ? (
        <p className="mt-2 text-right text-xs text-emerald-200/80">{message}</p>
      ) : null}
    </div>
  );
}

function DbButton({
  icon: Icon,
  label,
  onClick,
  disabled
}: {
  icon: typeof Download;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex w-full items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-right transition active:scale-[0.99] disabled:opacity-50"
    >
      <Icon size={18} className="shrink-0 text-white/40" />
      <span className="text-sm font-medium text-white/90">{label}</span>
    </button>
  );
}
