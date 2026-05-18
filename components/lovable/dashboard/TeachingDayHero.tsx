"use client";

import { motion } from "framer-motion";
import { toast } from "sonner";

export function TeachingDayHero({
  lessonsCount,
  studentsCount,
  nextGroup,
  nextTime,
  nextRoom,
}: {
  lessonsCount: number;
  studentsCount: number;
  nextGroup: string;
  nextTime: string;
  nextRoom: string;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="glass-strong relative overflow-hidden rounded-[28px] p-5 text-right"
    >
      <div
        aria-hidden
        className="absolute -left-16 -top-16 h-48 w-48 rounded-full opacity-50 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, oklch(0.82 0.13 80 / 30%), transparent 70%)",
        }}
      />
      <div className="relative flex flex-col gap-4">
        <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          יום ההוראה שלך
        </span>
        <div className="flex items-baseline gap-3">
          <span className="text-[34px] font-semibold leading-none tracking-tight">
            {lessonsCount}
          </span>
          <span className="text-sm text-muted-foreground">
            קבוצות · {studentsCount} תלמידות סה״כ
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/4 p-3">
          <div className="flex min-w-0 flex-col">
            <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              השיעור הבא
            </span>
            <span className="truncate text-sm font-semibold text-foreground">
              {nextGroup}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {nextTime} · {nextRoom}
            </span>
          </div>
          <button
            onClick={() => toast.success("נוכחות נפתחה", { description: nextGroup })}
            className="shrink-0 rounded-full bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-[0_10px_30px_-10px_oklch(0.82_0.13_80/_50%)]"
          >
            פתח נוכחות
          </button>
        </div>
      </div>
    </motion.section>
  );
}
