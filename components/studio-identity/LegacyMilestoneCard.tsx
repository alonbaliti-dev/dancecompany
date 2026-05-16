"use client";

import { motion } from "framer-motion";
import { ChevronLeft, Play, Trophy } from "lucide-react";
import { legacyKindLabel } from "@/lib/studio-identity-logic";
import type { LegacyMilestone } from "@/lib/types";
import { achievementBadgeStyle } from "@/lib/legacy-events-logic";
import { cx } from "../ui";

export function LegacyMilestoneCard({
  milestone,
  onPress,
  large = false
}: {
  milestone: LegacyMilestone;
  onPress: () => void;
  large?: boolean;
}) {
  const hasVideo = Boolean(milestone.memoryVideoUrl);
  const topAward = milestone.awards?.[0];

  return (
    <motion.button
      type="button"
      onClick={onPress}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 360, damping: 32 }}
      className={cx(
        "w-full overflow-hidden rounded-[22px] border border-white/[0.1] text-right shadow-[0_20px_60px_rgba(0,0,0,0.35)] transition active:scale-[0.99]",
        large && "col-span-full"
      )}
    >
      <div
        className={cx(
          "relative bg-gradient-to-bl from-amber-500/20 via-violet-600/10 to-black/80",
          large ? "min-h-[200px]" : "min-h-[140px]"
        )}
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="relative flex h-full flex-col justify-end p-5">
          <div className="flex flex-wrap items-center justify-end gap-2">
            <span className="rounded-full border border-white/15 bg-black/40 px-2.5 py-0.5 text-[10px] font-semibold text-white/70">
              {milestone.year}
            </span>
            <span className="rounded-full border border-amber-400/30 bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-semibold text-amber-50">
              {legacyKindLabel(milestone.kind)}
            </span>
            {topAward ? (
              <span
                className={cx(
                  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold",
                  achievementBadgeStyle("1")
                )}
              >
                <Trophy size={11} />
                {topAward}
              </span>
            ) : null}
          </div>
          <h3 className={cx("mt-3 font-semibold leading-tight text-white", large ? "text-2xl" : "text-lg")}>{milestone.title}</h3>
          {milestone.subtitle ? <p className="mt-1.5 text-sm text-white/50">{milestone.subtitle}</p> : null}
          {milestone.participatingGroups.length ? (
            <p className="mt-2 text-xs text-white/38">{milestone.participatingGroups.join(" · ")}</p>
          ) : null}
          <div className="mt-4 flex items-center justify-end gap-2 text-[12px] font-semibold text-white/75">
            {hasVideo ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-2.5 py-1">
                <Play size={12} />
                סרט זיכרון
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1">
              לפרטים
              <ChevronLeft size={14} className="opacity-50" />
            </span>
          </div>
        </div>
      </div>
    </motion.button>
  );
}
