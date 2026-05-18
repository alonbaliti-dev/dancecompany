"use client";

import { motion } from "framer-motion";
import { AttendanceRing } from "./AttendanceRing";
import type { JourneyInsight } from "@/lib/lovable/types";

export function JourneyCard({
  attendanceRate,
  classesThisMonth,
  streakWeeks,
  insights,
  title = "הדרך שלך",
}: {
  attendanceRate: number;
  classesThisMonth: number;
  streakWeeks: number;
  insights: JourneyInsight[];
  title?: string;
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-end justify-between">
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        <span className="text-[11px] text-muted-foreground">החודש</span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="glass-strong rounded-3xl p-5"
      >
        <AttendanceRing
          value={attendanceRate}
          label="התמדה"
          caption={`${classesThisMonth} שיעורים · ${streakWeeks} שבועות רצופים`}
        />

        <ul className="mt-4 flex flex-col gap-1.5">
          {insights.map((i) => (
            <li
              key={i.id}
              className="flex items-center gap-2.5 rounded-xl bg-white/4 px-3 py-2 text-right"
            >
              <span className="text-base leading-none">{i.emoji}</span>
              <span className="text-sm text-foreground">{i.text}</span>
            </li>
          ))}
        </ul>
      </motion.div>
    </section>
  );
}
