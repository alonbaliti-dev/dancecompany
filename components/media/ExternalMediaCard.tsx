"use client";

import { motion } from "framer-motion";
import { ExternalLink, Play } from "lucide-react";
import { openExternalMedia } from "@/lib/integrations/open-external";
import { platformCtaHe } from "@/lib/integrations/social-links";
import { mediaCardGradient, platformLabelHe } from "@/lib/integrations/media-visuals";
import type { ExternalMediaItem } from "@/lib/types";
import { cx } from "@/lib/cx";

export function ExternalMediaCard({
  item,
  className,
  layout = "card"
}: {
  item: ExternalMediaItem;
  className?: string;
  layout?: "card" | "row";
}) {
  const bg = mediaCardGradient(item.platform, item.category);
  const cta = platformCtaHe(item.platform);

  const onOpen = () => openExternalMedia(item.externalUrl);

  if (layout === "row") {
    return (
      <button
        type="button"
        onClick={onOpen}
        className={cx(
          "flex w-full items-center gap-3 rounded-[18px] border border-white/[0.08] bg-white/[0.02] p-2 text-right transition hover:border-white/[0.14] hover:bg-white/[0.04] active:scale-[0.99]",
          className
        )}
      >
        <div
          className="relative flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10"
          style={{ background: bg }}
        >
          <Play size={22} className="text-white/75" strokeWidth={1.5} />
          <span className="absolute bottom-1 left-1 rounded-md bg-black/55 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wider text-white/80">
            {platformLabelHe(item.platform)}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 font-semibold text-white">{item.title}</p>
          {item.description ? <p className="mt-1 line-clamp-2 text-xs text-white/42">{item.description}</p> : null}
          <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-emerald-200/85">
            {cta}
            <ExternalLink size={12} />
          </span>
        </div>
      </button>
    );
  }

  return (
    <motion.button
      type="button"
      onClick={onOpen}
      whileTap={{ scale: 0.99 }}
      className={cx(
        "group w-full overflow-hidden rounded-[22px] border border-white/[0.09] text-right shadow-[0_12px_40px_rgba(0,0,0,0.35)] transition hover:border-white/[0.16] active:scale-[0.99]",
        className
      )}
    >
      <motion.div
        className="relative aspect-[16/10] w-full overflow-hidden"
        style={{ background: bg }}
        initial={false}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
      >
        <motion.div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_0%,rgba(255,255,255,0.12),transparent_55%)]" />
        <motion.div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
        <span className="absolute right-3 top-3 rounded-full border border-white/15 bg-black/45 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-white/75 backdrop-blur-md">
          {platformLabelHe(item.platform)}
        </span>
        <span className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 backdrop-blur-sm transition group-hover:scale-105 group-hover:border-white/35">
          <Play size={22} className="ml-0.5 text-white/90" fill="rgba(255,255,255,0.15)" />
        </span>
        {item.featured ? (
          <span className="absolute bottom-3 right-3 rounded-full border border-amber-400/30 bg-amber-500/15 px-2 py-0.5 text-[9px] font-semibold text-amber-100">
            מומלץ
          </span>
        ) : null}
      </motion.div>
      <div className="border-t border-white/[0.06] bg-gradient-to-b from-white/[0.04] to-transparent px-4 py-3.5">
        <p className="font-semibold leading-snug text-white">{item.title}</p>
        {item.description ? (
          <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-white/45">{item.description}</p>
        ) : null}
        <p className="mt-3 flex items-center justify-end gap-1.5 text-[12px] font-medium text-white/55 transition group-hover:text-emerald-200/90">
          <span>{cta}</span>
          <ExternalLink size={14} className="opacity-70" />
        </p>
        <p className="mt-1 text-[10px] text-white/28">נפתח בפלטפורמה חיצונית</p>
      </div>
    </motion.button>
  );
}
