"use client";

import { useStudioOS } from "@/context/StudioOSContext";
import { cx } from "./ui";

export function ActivityHeatmap({ compact = false }: { compact?: boolean }) {
  const { consistency } = useStudioOS();
  const cells = consistency.days.slice(-84);

  return (
    <div className={cx("text-right", compact ? "space-y-2" : "space-y-3")}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/38">עקביות תרגול</p>
          {!compact ? <p className="mt-1 text-sm text-white/45">ציון {consistency.consistencyScore}% · רצף {consistency.streakDays} ימים</p> : null}
        </div>
        <div className="flex gap-3 text-[10px] text-white/40">
          <span>שבוע מיטבי: {consistency.bestWeekMinutes} דק׳</span>
          <span>החמצות: {consistency.missedDaysLast30}</span>
        </div>
      </div>
      <div className="flex flex-wrap justify-end gap-[3px]" dir="ltr">
        {cells.map((d) => (
          <span
            key={d.date}
            title={`${d.date}: ${d.minutes} דק׳`}
            className={cx(
              "rounded-[3px]",
              compact ? "h-2.5 w-2.5" : "h-3 w-3",
              d.level === 0 && "bg-white/[0.06]",
              d.level === 1 && "bg-emerald-500/25",
              d.level === 2 && "bg-emerald-500/45",
              d.level === 3 && "bg-emerald-500/65",
              d.level >= 4 && "bg-emerald-400/85"
            )}
          />
        ))}
      </div>
    </div>
  );
}
