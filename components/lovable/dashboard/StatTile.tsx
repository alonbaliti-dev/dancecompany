"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface StatTileProps {
  label: string;
  value: string;
  delta?: string;
  icon?: ReactNode;
  tone?: "neutral" | "positive" | "negative";
}

export function StatTile({
  label,
  value,
  delta,
  icon,
  tone = "neutral",
}: StatTileProps) {
  const deltaColor =
    tone === "positive"
      ? "text-success"
      : tone === "negative"
        ? "text-rose"
        : "text-muted-foreground";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="glass flex flex-col gap-2 rounded-2xl p-4"
    >
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-[11px] uppercase tracking-[0.14em]">{label}</span>
        {icon}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold tracking-tight text-foreground">
          {value}
        </span>
        {delta && (
          <span className={`text-xs font-medium ${deltaColor}`}>{delta}</span>
        )}
      </div>
    </motion.div>
  );
}
