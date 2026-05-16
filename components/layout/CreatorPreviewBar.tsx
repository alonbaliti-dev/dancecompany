"use client";

import { Eye, X } from "lucide-react";
import { useDeviceLayout } from "@/context/DeviceLayoutContext";
import {
  layoutModeLabelHe,
  previewRoleLabelHe,
  type PreviewRole,
  type ResolvedLayoutMode
} from "@/lib/device/device-detection";
import type { UserProfile } from "@/lib/types";
import { cx } from "../ui";

const ROLES: { id: PreviewRole; label: string }[] = [
  { id: null, label: "משתמש אמיתי" },
  { id: "student", label: "תלמיד" },
  { id: "teacher", label: "מורה" },
  { id: "management", label: "הנהלה" }
];

const LAYOUTS: { id: ResolvedLayoutMode | null; label: string }[] = [
  { id: null, label: "מכשיר אמיתי" },
  { id: "mobile", label: "טלפון" },
  { id: "tablet", label: "טאבלט" },
  { id: "desktop", label: "מחשב" }
];

export function CreatorPreviewBar({ user }: { user: UserProfile }) {
  const { prefs, setPreviewLayout, setPreviewRole, layoutMode } = useDeviceLayout();
  if (!user.permissions.isSuperAdmin) return null;

  const active = prefs.previewLayout !== null || prefs.previewRole !== null;
  if (!active) return null;

  return (
    <div className="border-b border-amber-400/25 bg-amber-500/10 px-3 py-2 text-right" dir="rtl">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => {
            setPreviewLayout(null);
            setPreviewRole(null);
          }}
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-amber-100/80 hover:bg-amber-500/15"
        >
          <X size={14} />
          יציאה מתצוגה מקדימה
        </button>
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-50">
            <Eye size={14} />
            תצוגה מקדימה
          </span>
          <span className="text-[10px] text-amber-100/60">
            מכשיר: {layoutModeLabelHe(layoutMode)}
            {prefs.previewRole ? ` · תפקיד: ${previewRoleLabelHe(prefs.previewRole)}` : ""}
          </span>
        </div>
        <div className="flex flex-wrap gap-1">
          {LAYOUTS.map((l) => (
            <button
              key={l.label}
              type="button"
              onClick={() => setPreviewLayout(l.id)}
              className={cx(
                "rounded-lg px-2 py-1 text-[10px] font-semibold transition",
                prefs.previewLayout === l.id || (l.id === null && prefs.previewLayout === null)
                  ? "bg-amber-400/25 text-amber-50"
                  : "text-amber-100/55 hover:bg-amber-500/12"
              )}
            >
              {l.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1">
          {ROLES.map((r) => (
            <button
              key={r.label}
              type="button"
              onClick={() => setPreviewRole(r.id)}
              className={cx(
                "rounded-lg px-2 py-1 text-[10px] font-semibold transition",
                prefs.previewRole === r.id ? "bg-amber-400/25 text-amber-50" : "text-amber-100/55 hover:bg-amber-500/12"
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
