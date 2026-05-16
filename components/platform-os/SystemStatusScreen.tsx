"use client";

import { useEffect } from "react";
import { useLocalDatabase } from "@/context/LocalDatabaseContext";
import { usePlatformOS } from "@/context/PlatformOSContext";
import { Header, screenClass, SectionEyebrow } from "../ui";

export function SystemStatusScreen() {
  const { db } = useLocalDatabase();
  const { refreshSystemStatus } = usePlatformOS();
  const s = db.platformOs.systemStatus;

  useEffect(() => {
    refreshSystemStatus();
  }, [refreshSystemStatus]);

  const rows = [
    { label: "גרסת אפליקציה", value: s.appVersion },
    { label: "מצב מסד נתונים", value: s.databaseStatus },
    { label: "אחסון", value: `${s.storageUsedMb} / ${s.storageLimitMb} MB` },
    { label: "העלאות שנכשלו", value: String(s.failedUploads) },
    { label: "קישורי מדיה שבורים", value: String(s.brokenMediaLinks) },
    { label: "תשלומים", value: s.paymentProviderStatus },
    { label: "התראות", value: s.notificationDeliveryStatus },
    { label: "תור סנכרון", value: String(s.syncQueuePending) },
    {
      label: "גיבוי אחרון",
      value: s.lastBackupAt ? new Date(s.lastBackupAt).toLocaleString("he-IL") : "—"
    },
    { label: "סכימה", value: String(db.systemSettings.databaseSchemaVersion) }
  ];

  return (
    <div className={screenClass}>
      <Header title="סטטוס מערכת" subtitle="בריאות פלטפורמה — גיבוי, אחסון, סנכרון ותשלומים" />
      <ul className="space-y-2">
        {rows.map((r) => (
          <li
            key={r.label}
            className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3"
          >
            <span className="text-sm text-white/70">{r.value}</span>
            <span className="text-right text-sm text-white/45">{r.label}</span>
          </li>
        ))}
      </ul>
      <SectionEyebrow>יומן שגיאות</SectionEyebrow>
      <p className="text-right text-xs text-white/40">
        {s.lastError ?? "אין שגיאות מתועדות (מצב הדגמה)."}
      </p>
    </div>
  );
}
