"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, Clock, X, HelpCircle } from "lucide-react";
import type { RosterStudent } from "@/lib/lovable/types";

const STATUS_META = {
  present: { label: "נוכח", Icon: Check, tone: "bg-success/15 text-success border-success/30" },
  late: { label: "איחור", Icon: Clock, tone: "bg-primary/15 text-primary border-primary/30" },
  absent: { label: "חיסור", Icon: X, tone: "bg-rose/15 text-rose border-rose/30" },
  pending: { label: "—", Icon: HelpCircle, tone: "bg-white/5 text-muted-foreground border-hairline" },
} as const;

type Status = keyof typeof STATUS_META;
const CYCLE: Status[] = ["pending", "present", "late", "absent"];

export function AttendanceRoster({
  initial,
  title = "נוכחות",
}: {
  initial: RosterStudent[];
  title?: string;
}) {
  const [roster, setRoster] = useState(initial);

  const counts = useMemo(() => {
    const c = { present: 0, late: 0, absent: 0, pending: 0 };
    roster.forEach((r) => c[r.status]++);
    return c;
  }, [roster]);

  const cycle = (id: string) =>
    setRoster((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const next = CYCLE[(CYCLE.indexOf(r.status) + 1) % CYCLE.length];
        return { ...r, status: next };
      }),
    );

  const absentStudents = roster.filter((r) => r.status === "absent");

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-end justify-between">
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        <span className="text-xs text-muted-foreground">
          {counts.present + counts.late}/{roster.length} סומנו
        </span>
      </div>

      <div className="glass-strong grid grid-cols-4 gap-2 rounded-2xl p-3 text-center">
        {(["present", "late", "absent", "pending"] as Status[]).map((s) => {
          const m = STATUS_META[s];
          return (
            <div key={s} className="flex flex-col items-center gap-0.5">
              <span className="text-lg font-semibold tracking-tight text-foreground">
                {counts[s]}
              </span>
              <span className="text-[10px] text-muted-foreground">{m.label}</span>
            </div>
          );
        })}
      </div>

      <ul className="flex flex-col gap-1.5">
        {roster.map((r) => {
          const m = STATUS_META[r.status];
          const Icon = m.Icon;
          return (
            <motion.li
              key={r.id}
              whileTap={{ scale: 0.99 }}
              onClick={() => cycle(r.id)}
              className="glass flex cursor-pointer items-center justify-between gap-3 rounded-2xl p-3 text-right"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/5 text-xs font-semibold text-foreground">
                  {r.name.charAt(0)}
                </span>
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-medium text-foreground">
                    {r.name}
                  </span>
                  {r.note && (
                    <span className="truncate text-[11px] text-muted-foreground">
                      {r.note}
                    </span>
                  )}
                </div>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${m.tone}`}
              >
                <Icon size={12} strokeWidth={2.2} />
                {m.label}
              </span>
            </motion.li>
          );
        })}
      </ul>

      {absentStudents.length > 0 && (
        <div className="glass rounded-2xl p-3.5">
          <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            תלמידים חסרים
          </div>
          <p className="mt-1.5 text-sm text-foreground">
            {absentStudents.map((s) => s.name).join(" · ")}
          </p>
        </div>
      )}
    </section>
  );
}
