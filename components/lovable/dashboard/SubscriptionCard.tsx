"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Info } from "lucide-react";
import type { StudentSubscription } from "@/lib/lovable/types";

export function SubscriptionCard({
  sub,
  title = "תשלומים ומנוי",
}: {
  sub: StudentSubscription;
  title?: string;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-base font-semibold tracking-tight">{title}</h2>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass flex flex-col gap-3 rounded-3xl p-4 text-right"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col">
            <span className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              {sub.cycle}
            </span>
            <span className="mt-0.5 text-base font-semibold text-foreground">
              {sub.plan}
            </span>
            <span className="text-xs text-muted-foreground">
              חיוב הבא · {sub.nextCharge}
            </span>
          </div>
          <span className="shrink-0 rounded-full bg-success/15 px-2.5 py-1 text-[10px] font-semibold text-success">
            מנוי פעיל
          </span>
        </div>

        {sub.managedBy === "parent" && sub.managedByName && (
          <div className="flex items-center gap-2 rounded-2xl border border-hairline bg-white/3 px-3 py-2 text-[11px] text-muted-foreground">
            <ShieldCheck size={13} className="shrink-0 text-success" />
            {sub.managedByName}
          </div>
        )}

        {sub.pendingAction && (
          <div className="flex items-center gap-2 rounded-2xl bg-primary/10 px-3 py-2 text-[11px] text-primary">
            <Info size={13} className="shrink-0" />
            {sub.pendingAction}
          </div>
        )}
      </motion.div>
    </section>
  );
}
