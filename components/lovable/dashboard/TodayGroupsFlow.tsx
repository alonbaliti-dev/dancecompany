"use client";

import { motion } from "framer-motion";
import type { TeacherLesson } from "@/lib/lovable/types";

const STATE_LABEL = {
  done: { label: "הסתיים", tone: "text-muted-foreground", dot: "bg-white/20" },
  now: { label: "מתקיים", tone: "text-success", dot: "bg-success animate-pulse" },
  upcoming: { label: "הבא", tone: "text-primary", dot: "bg-primary" },
} as const;

export function TodayGroupsFlow({
  lessons,
  title = "הקבוצות של היום",
}: {
  lessons: TeacherLesson[];
  title?: string;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-base font-semibold tracking-tight">{title}</h2>
      <ol className="relative flex flex-col gap-2.5 pr-3">
        <span
          aria-hidden
          className="absolute bottom-2 right-[5px] top-2 w-px bg-hairline"
        />
        {lessons.map((l, i) => {
          const s = STATE_LABEL[l.status];
          return (
            <motion.li
              key={l.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className="relative"
            >
              <span
                className={`absolute right-[-2px] top-4 h-2.5 w-2.5 rounded-full ${s.dot}`}
              />
              <div
                className={`glass mr-5 flex items-center justify-between gap-3 rounded-2xl p-3.5 text-right ${l.status === "done" ? "opacity-55" : ""}`}
              >
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-foreground">
                      {l.group}
                    </span>
                    <span className={`shrink-0 text-[10px] font-semibold ${s.tone}`}>
                      {s.label}
                    </span>
                  </div>
                  <span className="truncate text-[11px] text-muted-foreground">
                    {l.time}–{l.endTime} · {l.room} · {l.students} תלמידות
                  </span>
                </div>
              </div>
            </motion.li>
          );
        })}
      </ol>
    </section>
  );
}
