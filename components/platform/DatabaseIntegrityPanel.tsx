"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Info, RefreshCw } from "lucide-react";
import { runDatabaseIntegrityCheck, type IntegrityIssue } from "@/lib/local-db/integrity-check";
import { SectionEyebrow } from "../ui";

function SeverityIcon({ severity }: { severity: IntegrityIssue["severity"] }) {
  if (severity === "error") return <AlertTriangle className="text-rose-300/90" size={16} />;
  if (severity === "warning") return <AlertTriangle className="text-amber-300/85" size={16} />;
  return <Info className="text-sky-300/80" size={16} />;
}

export function DatabaseIntegrityPanel() {
  const [report, setReport] = useState(() => runDatabaseIntegrityCheck());
  const [running, setRunning] = useState(false);

  const grouped = useMemo(() => {
    const map = new Map<string, IntegrityIssue[]>();
    for (const i of report.issues) {
      const list = map.get(i.category) ?? [];
      list.push(i);
      map.set(i.category, list);
    }
    return map;
  }, [report.issues]);

  const rerun = () => {
    setRunning(true);
    setReport(runDatabaseIntegrityCheck());
    setRunning(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-right">
          <SectionEyebrow>בדיקת שלמות מסד נתונים</SectionEyebrow>
          <p className="mt-1 text-xs text-white/45">
            {report.errorCount} שגיאות · {report.warningCount} אזהרות · {report.issueCount} סה״כ
          </p>
        </div>
        <button
          type="button"
          disabled={running}
          onClick={rerun}
          className="flex items-center gap-2 rounded-xl border border-white/12 px-3 py-2 text-xs text-white/70"
        >
          <RefreshCw size={14} className={running ? "animate-spin" : ""} />
          בדיקה מחדש
        </button>
      </div>

      {report.issueCount === 0 ? (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.08] px-4 py-3 text-right text-sm text-emerald-100/85">
          <CheckCircle2 size={20} />
          לא נמצאו בעיות במבנה הנתונים הנוכחי.
        </div>
      ) : (
        <div className="space-y-4">
          {Array.from(grouped.entries()).map(([category, items]) => (
            <div key={category} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-right text-xs font-semibold uppercase tracking-wide text-white/40">{category}</p>
              <ul className="mt-3 space-y-2">
                {items.map((item) => (
                  <li key={item.id} className="flex gap-3 text-right text-sm text-white/55">
                    <SeverityIcon severity={item.severity} />
                    <span className="min-w-0 flex-1">{item.message}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
