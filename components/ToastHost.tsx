"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { cx } from "./ui";

export function ToastHost() {
  const { toasts, dismissToast } = useToast();

  return (
    <motion.div
      className="pointer-events-none fixed inset-x-0 top-safe z-[90] flex flex-col items-center gap-2 px-4 pt-3"
      dir="rtl"
      aria-live="polite"
    >
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = t.tone === "error" ? AlertCircle : t.tone === "info" ? Info : CheckCircle2;
          return (
            <motion.button
              key={t.id}
              type="button"
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6 }}
              onClick={() => dismissToast(t.id)}
              className={cx(
                "pointer-events-auto flex max-w-md items-center gap-2 rounded-2xl border px-4 py-3 text-right shadow-[0_16px_48px_rgba(0,0,0,0.45)] backdrop-blur-md",
                t.tone === "success" && "border-emerald-400/30 bg-emerald-950/90 text-emerald-50",
                t.tone === "error" && "border-rose-400/30 bg-rose-950/90 text-rose-50",
                t.tone === "info" && "border-sky-400/30 bg-zinc-900/95 text-white"
              )}
            >
              <Icon size={18} className="shrink-0 opacity-90" />
              <span className="text-sm font-medium leading-snug">{t.message}</span>
            </motion.button>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
}
