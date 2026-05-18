"use client";

import { motion } from "framer-motion";
import type { LiveLesson } from "@/lib/lovable/types";

const STATE = {
  now: { label: "כעת", tone: "bg-success/15 text-success", dot: "bg-success animate-pulse" },
  next: { label: "הבא", tone: "bg-primary/15 text-primary", dot: "bg-primary" },
  soon: { label: "בהמשך", tone: "bg-white/6 text-foreground", dot: "bg-white/40" },
} as const;

export function LiveActivity({
  items,
  title = "פעילות חיה",
}: {
  items: LiveLesson[];
  title?: string;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-base font-semibold tracking-tight">{title}</h2>
      <ul className="flex flex-col gap-2">
        {items.map((l, i) => {
          const s = STATE[l.state];
          return (
            <motion.li
              key={l.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.4 }}
              className="glass flex items-center gap-3 rounded-2xl p-3.5 text-right"
            >
              <span className={`h-2 w-2 shrink-0 rounded-full ${s.dot}`} />
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-semibold text-foreground">
                    {l.title}
                  </span>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${s.tone}`}>
                    {s.label}
                  </span>
                </div>
                <span className="truncate text-[11px] text-muted-foreground">
                  {l.time} · {l.teacher} · {l.room} · {l.students} תלמידות
                </span>
              </div>
            </motion.li>
          );
        })}
      </ul>
    </section>
  );
}
