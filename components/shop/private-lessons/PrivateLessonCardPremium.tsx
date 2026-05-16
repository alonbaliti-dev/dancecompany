"use client";

import { motion } from "framer-motion";
import { CalendarClock, Sparkles } from "lucide-react";
import { priceLabelForDuration, teacherInitials } from "@/lib/private-lessons/logic";
import type { PrivateLessonProduct } from "@/lib/types";
import { cx } from "../../ui";

export function PrivateLessonCardPremium({
  product,
  onPress,
  index = 0,
  variant = "grid"
}: {
  product: PrivateLessonProduct;
  onPress: () => void;
  index?: number;
  variant?: "grid" | "rail";
}) {
  const widthClass = variant === "rail" ? "w-[17.5rem] shrink-0" : "w-full";

  return (
    <motion.button
      type="button"
      onClick={onPress}
      className={cx(
        widthClass,
        "group overflow-hidden rounded-[24px] border border-white/[0.1] text-right shadow-[0_20px_60px_rgba(0,0,0,0.45)] transition active:scale-[0.99]"
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      style={{
        background:
          "linear-gradient(165deg, rgba(56,189,248,0.12) 0%, rgba(16,185,129,0.08) 35%, rgba(0,0,0,0.55) 100%)"
      }}
    >
      <div className="relative px-5 pb-5 pt-5">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_100%_0%,rgba(255,255,255,0.1),transparent_55%)]" />
        <div className="relative flex items-start justify-between gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/[0.08] text-sm font-bold text-white">
            {teacherInitials(product.teacherName)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-200/80">שיעור פרטי</p>
            <h3 className="mt-1 text-lg font-semibold leading-tight text-white">{product.teacherName}</h3>
            <p className="mt-1 text-xs text-white/45">{product.teacherStyles.join(" · ")}</p>
          </div>
        </div>

        <div className="relative mt-4 flex flex-wrap justify-end gap-2">
          <span className="rounded-full border border-white/10 bg-black/30 px-2.5 py-1 text-[11px] font-semibold tabular-nums text-white">
            30 דק׳ · {priceLabelForDuration(30)}
          </span>
          <span className="rounded-full border border-white/10 bg-black/30 px-2.5 py-1 text-[11px] font-semibold tabular-nums text-white">
            45 דק׳ · {priceLabelForDuration(45)}
          </span>
        </div>

        {product.availabilityNote ? (
          <div className="relative mt-3 flex items-center justify-end gap-1.5 text-[11px] text-white/40">
            <CalendarClock size={12} />
            <span>{product.availabilityNote}</span>
          </div>
        ) : null}

        <div className="relative mt-4 flex items-center justify-end gap-1 text-sm font-semibold text-emerald-200/90">
          <Sparkles size={14} />
          הזמנת שיעור פרטי
        </div>
      </div>
    </motion.button>
  );
}
