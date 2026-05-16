"use client";

import type { LucideIcon } from "lucide-react";
import { ChevronLeft } from "lucide-react";
import type { FeatureFlags } from "@/lib/types";
import { Card, SectionEyebrow, Toggle, cx } from "../ui";

export function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <Card animated={false} className="!p-4 text-right">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/38">{label}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-white">{value}</p>
      {sub ? <p className="mt-1 text-xs text-white/42">{sub}</p> : null}
    </Card>
  );
}

export function ActionRow({
  title,
  subtitle,
  icon: Icon,
  onPress,
  danger
}: {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onPress}
      className={cx(
        "flex w-full items-center justify-between gap-3 rounded-[18px] border px-4 py-3.5 text-right transition hover:bg-white/[0.05]",
        danger ? "border-rose-400/20 bg-rose-500/[0.06]" : "border-white/[0.07] bg-white/[0.03]"
      )}
    >
      <ChevronLeft className="shrink-0 text-white/22" size={18} />
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-white">{title}</p>
        {subtitle ? <p className="mt-1 text-sm text-white/42">{subtitle}</p> : null}
      </div>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/25">
        <Icon size={18} className="text-emerald-200/85" />
      </span>
    </button>
  );
}

const FLAG_LABELS: Record<keyof FeatureFlags, string> = {
  aiCoach: "מאמן AI",
  liveEventFeed: "פיד חי",
  parentPeaceMode: "שקט נפשי להורים",
  videoUploads: "העלאת וידאו",
  staffChat: "צ׳אט צוות",
  gallery: "גלריה",
  achievementsBoard: "לוח הישגים",
  reports: "דוחות",
  payments: "תשלומים",
  shop: "חנות סטודיו",
  studioIdentity: "מורשת וצוות"
};

export function FeatureFlagList({
  flags,
  onChange,
  readOnly
}: {
  flags: FeatureFlags;
  onChange?: (key: keyof FeatureFlags, value: boolean) => void;
  readOnly?: boolean;
}) {
  return (
    <div className="space-y-2">
      {(Object.keys(FLAG_LABELS) as (keyof FeatureFlags)[]).map((key) => (
        <Card key={key} animated={false} className="flex items-center justify-between gap-3 !py-3">
          <Toggle
            checked={flags[key]}
            onChange={(v) => onChange?.(key, v)}
            disabled={readOnly || !onChange}
            aria-label={FLAG_LABELS[key]}
          />
          <div className="text-right">
            <p className="font-medium text-white">{FLAG_LABELS[key]}</p>
            <p className="text-[11px] text-white/40">{flags[key] ? "פעיל" : "כבוי"}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}
