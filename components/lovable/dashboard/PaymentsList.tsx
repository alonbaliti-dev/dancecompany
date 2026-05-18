"use client";

import { motion } from "framer-motion";
import { toast } from "sonner";
import type { PaymentRow } from "@/lib/lovable/types";

const STATUS = {
  overdue: { label: "באיחור", tone: "bg-rose/15 text-rose border-rose/30" },
  due: { label: "לתשלום", tone: "bg-primary/15 text-primary border-primary/30" },
  partial: { label: "חלקי", tone: "bg-white/8 text-foreground border-hairline" },
} as const;

export function PaymentsList({ items }: { items: PaymentRow[] }) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-end justify-between">
        <h2 className="text-base font-semibold tracking-tight">תשלומים פתוחים</h2>
        <button className="text-xs font-medium text-primary">לכל התשלומים</button>
      </div>
      <ul className="flex flex-col gap-2">
        {items.map((p) => {
          const s = STATUS[p.status];
          return (
            <motion.li
              key={p.id}
              whileTap={{ scale: 0.99 }}
              className="glass flex items-center justify-between gap-3 rounded-2xl p-3.5 text-right"
            >
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium text-foreground">
                  {p.name}
                </span>
                <span className="text-[11px] text-muted-foreground">{p.due}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold tracking-tight text-foreground">
                  {p.amount}
                </span>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${s.tone}`}
                >
                  {s.label}
                </span>
                <button
                  onClick={() =>
                    toast.success("נשלחה תזכורת", { description: p.name })
                  }
                  className="rounded-full bg-white/6 px-2.5 py-1 text-[10px] font-medium text-foreground"
                >
                  תזכורת
                </button>
              </div>
            </motion.li>
          );
        })}
      </ul>
    </section>
  );
}
