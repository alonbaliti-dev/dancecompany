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
                "pointer-events-auto flex max-w-md items-center gap-2 rounded-[22px] border px-4 py-3 text-right shadow-[0_18px_54px_rgba(0,0,0,0.52),inset_0_1px_0_rgba(255,247,223,0.07)] backdrop-blur-xl",
                t.tone === "success" && "border-emerald-200/24 bg-[linear-gradient(145deg,rgba(6,78,59,0.94),rgba(3,7,18,0.92))] text-emerald-50",
                t.tone === "error" && "border-rose-200/24 bg-[linear-gradient(145deg,rgba(127,29,29,0.94),rgba(3,7,18,0.92))] text-rose-50",
                t.tone === "info" && "border-[#f4d58d]/18 bg-[linear-gradient(145deg,rgba(24,20,18,0.96),rgba(9,9,11,0.94))] text-white"
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
