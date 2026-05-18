"use client";

import { motion } from "framer-motion";
import type { WeekEntry } from "@/lib/lovable/types";

const ACCENT_BG: Record<WeekEntry["accent"], string> = {
  amber: "from-amber-300/20 to-amber-500/5",
  rose: "from-rose/25 to-rose/5",
  violet: "from-violet-400/25 to-violet-500/5",
  emerald: "from-emerald-400/20 to-emerald-500/5",
  sky: "from-sky-400/20 to-sky-500/5",
};

const ACCENT_BAR: Record<WeekEntry["accent"], string> = {
  amber: "bg-gradient-to-b from-amber-300 to-amber-500",
  rose: "bg-gradient-to-b from-rose to-rose/60",
  violet: "bg-gradient-to-b from-violet-300 to-violet-500",
  emerald: "bg-gradient-to-b from-emerald-300 to-emerald-500",
  sky: "bg-gradient-to-b from-sky-300 to-sky-500",
};

export function WeeklyTimeline({
  entries,
  title = "השבוע שלך בסטודיו",
}: {
  entries: WeekEntry[];
  title?: string;
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-end justify-between">
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        <button className="text-xs font-medium text-primary">למערכת המלאה</button>
      </div>
      <ul className="flex flex-col gap-2">
        {entries.map((e, i) => (
          <motion.li
            key={e.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="glass relative flex items-stretch gap-3 overflow-hidden rounded-2xl p-3 text-right"
          >
            <div
              aria-hidden
              className={`pointer-events-none absolute inset-0 bg-gradient-to-l ${ACCENT_BG[e.accent]} opacity-70`}
            />
            <div className={`relative w-1 shrink-0 rounded-full ${ACCENT_BAR[e.accent]}`} />
            <div className="relative flex w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-white/5 py-1">
              <span className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                {e.dayLabel}
              </span>
              <span className="text-sm font-semibold tracking-tight text-foreground">
                {e.date}
              </span>
            </div>
            <div className="relative flex min-w-0 flex-1 flex-col justify-center">
              <span className="truncate text-sm font-semibold text-foreground">
                {e.title}
              </span>
              <span className="truncate text-[11px] text-muted-foreground">
                {e.startsAt}–{e.endsAt} · {e.room} · {e.teacher}
              </span>
            </div>
            {e.state === "today" && (
              <span className="relative my-auto inline-flex shrink-0 items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
                היום
              </span>
            )}
            {e.state === "tomorrow" && (
              <span className="relative my-auto shrink-0 rounded-full bg-white/8 px-2 py-0.5 text-[10px] font-semibold text-foreground">
                מחר
              </span>
            )}
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
