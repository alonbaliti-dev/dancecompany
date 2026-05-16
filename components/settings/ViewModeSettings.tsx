"use client";

import { Check, Monitor, Smartphone, Tablet } from "lucide-react";
import { useDeviceLayout } from "@/context/DeviceLayoutContext";
import {
  deviceTypeLabelHe,
  previewRoleLabelHe,
  runtimeLabelHe,
  type PreviewRole,
  type ResolvedLayoutMode,
  type ViewMode
} from "@/lib/device/device-detection";
import type { UserProfile } from "@/lib/types";
import { Card, Header, SectionEyebrow, cx, screenClass } from "../ui";

const PREVIEW_LAYOUTS: { id: ResolvedLayoutMode | null; label: string }[] = [
  { id: null, label: "מכשיר אמיתי" },
  { id: "mobile", label: "טלפון" },
  { id: "tablet", label: "טאבלט" },
  { id: "desktop", label: "מחשב" }
];

const PREVIEW_ROLES: { id: PreviewRole; label: string }[] = [
  { id: null, label: "ללא" },
  { id: "student", label: "תלמיד/ה" },
  { id: "teacher", label: "מורה" },
  { id: "management", label: "הנהלה" }
];

const VIEW_OPTIONS: { id: ViewMode; label: string; sub: string; icon: typeof Smartphone }[] = [
  { id: "auto", label: "מצב אוטומטי", sub: "התאמה לפי גודל המסך", icon: Monitor },
  { id: "mobile", label: "תצוגת טלפון", sub: "פריסה קומפקטית עם ניווט תחתון", icon: Smartphone },
  { id: "tablet", label: "תצוגת טאבלט", sub: "עמודות ופאנלים מפוצלים", icon: Tablet },
  { id: "desktop", label: "תצוגת מחשב", sub: "סרגל צד ולוח בקרה רחב", icon: Monitor }
];

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5">
      <span className="text-sm font-medium text-white/80">{value}</span>
      <span className="text-[12px] text-white/40">{label}</span>
    </div>
  );
}

export function ViewModeSettings({ user }: { user?: UserProfile }) {
  const { snapshot, prefs, layoutMode, setViewMode, setPreviewLayout, setPreviewRole, mounted } = useDeviceLayout();

  if (!mounted) {
    return (
      <div className={screenClass}>
        <Header title="הגדרות תצוגה" subtitle="טוען מידע על המכשיר…" />
        <div className="h-40 animate-pulse rounded-[22px] bg-white/[0.06]" />
      </div>
    );
  }

  const installed = snapshot.runtime === "pwa" || snapshot.runtime === "native_shell";

  return (
    <div className={screenClass}>
      <Header
        title="הגדרות תצוגה"
        subtitle="בחרו איך המרחב נראה — בטלפון, טאבלט או מחשב. ההעדפה נשמרת במכשיר."
      />

      <Card animated={false} className="space-y-2">
        <SectionEyebrow>מכשיר נוכחי</SectionEyebrow>
        <StatusRow label="סוג מכשיר" value={deviceTypeLabelHe(snapshot.deviceType)} />
        <StatusRow label="תצוגה פעילה" value={deviceTypeLabelHe(layoutMode)} />
        <StatusRow
          label="סביבה"
          value={installed ? "מותקן כאפליקציה" : runtimeLabelHe(snapshot.runtime)}
        />
        <StatusRow label="רוחב מסך" value={`${snapshot.viewportWidth}px`} />
        {snapshot.touchCapable ? <StatusRow label="מגע" value="נתמך" /> : null}
      </Card>

      <div>
        <SectionEyebrow>מצב תצוגה</SectionEyebrow>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {VIEW_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const active = prefs.viewMode === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setViewMode(opt.id)}
                className={cx(
                  "flex items-start justify-between gap-3 rounded-[18px] border px-4 py-3.5 text-right transition",
                  active
                    ? "border-emerald-400/30 bg-emerald-500/10"
                    : "border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.05]"
                )}
              >
                {active ? <Check className="shrink-0 text-emerald-300" size={18} /> : <span className="w-[18px]" />}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-white">{opt.label}</p>
                  <p className="mt-1 text-[12px] text-white/42">{opt.sub}</p>
                </div>
                <Icon className="shrink-0 text-white/35" size={20} />
              </button>
            );
          })}
        </div>
      </div>

      {installed ? (
        <Card animated={false} tone="success" className="text-right">
          <p className="font-semibold text-white">מותקן כאפליקציה</p>
          <p className="mt-2 text-sm text-white/50">המרחב פועל במצב מסך מלא עם תמיכה ב-safe area.</p>
        </Card>
      ) : null}

      {user?.permissions.isSuperAdmin ? (
        <div>
          <SectionEyebrow tone="warning">תצוגה מקדימה (מנהל על)</SectionEyebrow>
          <p className="mt-2 text-right text-sm text-white/45">
            בדקו איך המערכת נראית לתפקידים ולגדלי מסך שונים — ללא שינוי הרשאות אמיתיות.
          </p>
          <Card animated={false} className="mt-3 space-y-4">
            <div>
              <p className="mb-2 text-right text-[12px] font-semibold text-white/55">מכשיר מדומה</p>
              <div className="flex flex-wrap justify-end gap-2">
                {PREVIEW_LAYOUTS.map((l) => (
                  <button
                    key={l.label}
                    type="button"
                    onClick={() => setPreviewLayout(l.id)}
                    className={cx(
                      "rounded-xl border px-3 py-2 text-[12px] font-semibold transition",
                      prefs.previewLayout === l.id || (l.id === null && !prefs.previewLayout)
                        ? "border-amber-400/35 bg-amber-500/15 text-amber-50"
                        : "border-white/10 bg-white/[0.03] text-white/50 hover:bg-white/[0.06]"
                    )}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-right text-[12px] font-semibold text-white/55">תפקיד מדומה (תווית בלבד)</p>
              <div className="flex flex-wrap justify-end gap-2">
                {PREVIEW_ROLES.map((r) => (
                  <button
                    key={r.label}
                    type="button"
                    onClick={() => setPreviewRole(r.id)}
                    className={cx(
                      "rounded-xl border px-3 py-2 text-[12px] font-semibold transition",
                      prefs.previewRole === r.id
                        ? "border-amber-400/35 bg-amber-500/15 text-amber-50"
                        : "border-white/10 bg-white/[0.03] text-white/50 hover:bg-white/[0.06]"
                    )}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
            {prefs.previewLayout || prefs.previewRole ? (
              <p className="text-[11px] text-amber-200/70">
                פעיל: {deviceTypeLabelHe(layoutMode)}
                {prefs.previewRole ? ` · ${previewRoleLabelHe(prefs.previewRole)}` : ""}
              </p>
            ) : null}
          </Card>
        </div>
      ) : null}
    </div>
  );
}
