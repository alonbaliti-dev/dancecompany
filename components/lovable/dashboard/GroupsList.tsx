"use client";

import { motion } from "framer-motion";
import { Users } from "lucide-react";
import type { DanceGroup } from "@/lib/lovable/types";

const ACCENT: Record<DanceGroup["accent"], string> = {
  amber: "from-amber-300/30 to-amber-500/10 text-amber-200",
  rose: "from-rose/30 to-rose/5 text-rose",
  violet: "from-violet-400/30 to-violet-500/10 text-violet-200",
  emerald: "from-emerald-400/30 to-emerald-500/10 text-emerald-200",
  sky: "from-sky-400/30 to-sky-500/10 text-sky-200",
};

export function GroupsList({
  groups,
  title = "הקבוצות שלך",
}: {
  groups: DanceGroup[];
  title?: string;
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-end justify-between">
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        <span className="text-[11px] text-muted-foreground">
          {groups.length} קבוצות פעילות
        </span>
      </div>
      <ul className="flex flex-col gap-2">
        {groups.map((g, i) => (
          <motion.li
            key={g.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.4 }}
            className="glass flex items-center gap-3 rounded-2xl p-3.5 text-right"
          >
            <div
              className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${ACCENT[g.accent]}`}
            >
              <span className="text-[10px] font-bold tracking-wider">
                {g.style.slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-semibold text-foreground">
                  {g.name}
                </span>
                {g.tag && (
                  <span className="shrink-0 rounded-full border border-hairline px-2 py-0.5 text-[10px] text-muted-foreground">
                    {g.tag}
                  </span>
                )}
              </div>
              <span className="truncate text-[11px] text-muted-foreground">
                {g.teacher} · {g.schedule}
              </span>
              <span className="mt-1.5 inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                <Users size={11} />
                {g.members} חברות · {g.level}
              </span>
            </div>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
