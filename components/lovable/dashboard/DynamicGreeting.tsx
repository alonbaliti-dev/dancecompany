"use client";

import { motion } from "framer-motion";

interface DynamicGreetingProps {
  headline: string;
  sub: string;
  context?: string;
}

export function DynamicGreeting({ headline, sub, context }: DynamicGreetingProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col gap-1.5"
    >
      {context && (
        <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          {context}
        </span>
      )}
      <h1 className="text-balance text-[30px] font-semibold leading-[1.1] tracking-tight">
        {headline}
      </h1>
      <p className="text-sm leading-relaxed text-muted-foreground">{sub}</p>
    </motion.section>
  );
}
