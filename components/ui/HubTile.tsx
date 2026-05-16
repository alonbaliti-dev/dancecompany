"use client";

import type { LucideIcon } from "lucide-react";
import { ChevronLeft } from "lucide-react";
import { cx } from "@/lib/cx";
import { getTone, type SemanticTone } from "@/lib/design-system/colors";
import { hubRow, surfaces } from "@/lib/design-system/tokens";

const hubRowClass = cx(surfaces.menuRow, hubRow);

/** Primary hub navigation tile — consistent across שיעורים / הודעות / משימות. */
export function HubTile({
  icon: Icon,
  title,
  subtitle,
  badge,
  onClick,
  tone = "accent"
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  badge?: number;
  onClick: () => void;
  tone?: SemanticTone;
}) {
  const t = getTone(tone);
  return (
    <button type="button" onClick={onClick} className={cx(hubRowClass, "relative")}>
      {badge != null && badge > 0 ? (
        <span className="absolute left-3 top-3 z-10 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
          {badge > 9 ? "9+" : badge}
        </span>
      ) : null}
      <ChevronLeft className="shrink-0 text-white/22" size={20} />
      <div className="min-w-0 flex-1 text-right">
        <p className="font-semibold text-white">{title}</p>
        <p className="mt-1 text-sm text-white/42">{subtitle}</p>
      </div>
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border"
        style={{ borderColor: t.border, backgroundColor: t.soft }}
      >
        <Icon size={20} style={{ color: t.core }} />
      </span>
    </button>
  );
}

/** Full-width hub action (e.g. שליחת עדכון). */
export function HubLinkRow({
  icon: Icon,
  title,
  subtitle,
  onClick,
  tone = "accent"
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  onClick: () => void;
  tone?: SemanticTone;
}) {
  const t = getTone(tone);
  return (
    <button type="button" onClick={onClick} className={hubRowClass}>
      <ChevronLeft className="shrink-0 text-white/22" size={20} />
      <div className="min-w-0 flex-1 text-right">
        <p className="font-semibold text-white">{title}</p>
        <p className="mt-1 text-sm text-white/42">{subtitle}</p>
      </div>
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border"
        style={{ borderColor: t.border, backgroundColor: t.soft }}
      >
        <Icon size={20} style={{ color: t.core }} />
      </span>
    </button>
  );
}
