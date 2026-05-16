"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { interaction } from "@/lib/design-system/tokens";
import { cx } from "./ui";

export function BottomSheet({
  open,
  title,
  onClose,
  children,
  footer
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="sheet-layer fixed inset-0 flex flex-col justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
        >
          <button type="button" className="overlay-dim overlay-blur absolute inset-0" aria-label="סגירה" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 420, damping: 38 }}
            className="relative z-[61] mx-auto w-full max-w-md rounded-t-[26px] border border-white/[0.1] border-b-0 bg-[#0a0a0c] shadow-[0_-20px_80px_rgba(0,0,0,0.55)]"
            style={{ paddingBottom: "max(1rem, var(--safe-bottom))" }}
          >
            <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-5 py-4">
              <button type="button" onClick={onClose} aria-label="סגירה" className={interaction.iconBtn}>
                <X size={18} />
              </button>
              <h2 className="flex-1 text-center text-[1.05rem] font-semibold text-white">{title}</h2>
              <span className="w-10" />
            </div>
            <div className={cx("max-h-sheet scroll-touch px-5 py-5")}>{children}</div>
            {footer ? <div className="border-t border-white/[0.06] px-5 py-4">{footer}</div> : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
