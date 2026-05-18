"use client";

import { motion } from "framer-motion";
import type { PulseStat } from "@/lib/lovable/types";

export function StudioPulse({
  stats,
  title = "מה קורה היום בסטודיו",
}: {
  stats: PulseStat[];
  title?: string;
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-end justify-between">
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
          מתעדכן בזמן אמת
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {stats.map((s, i) => (
          <motion.div
            key={s.key}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.4 }}
            className="glass flex flex-col gap-1.5 rounded-2xl p-4 text-right"
          >
            <span className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              {s.label}
            </span>
            <span className="text-[26px] font-semibold leading-none tracking-tight text-foreground">
              {s.value}
            </span>
            <span className="text-[11px] text-muted-foreground">{s.hint}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
