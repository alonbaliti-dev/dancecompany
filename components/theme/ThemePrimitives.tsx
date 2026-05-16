"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { glowShadow, progressGradients } from "@/lib/theme/gradients";
import { getTone, type DanceStyleId, type SemanticTone } from "@/lib/theme/semantic-tokens";
import { styleCardGradient, styleChipStylePlain } from "@/lib/theme/dance-styles";
import { cx } from "../ui";

export function AccentCard({
  children,
  className = "",
  tone = "accent",
  styleId,
  glow = false,
  animated = false
}: {
  children: React.ReactNode;
  className?: string;
  tone?: SemanticTone;
  styleId?: DanceStyleId;
  glow?: boolean;
  animated?: boolean;
}) {
  const grad = styleId ? styleCardGradient(styleId) : styleCardGradient(tone === "accent" ? "default" : (tone as DanceStyleId));
  const t = getTone(tone);
  const boxStyle = {
    backgroundImage: grad,
    borderColor: t.border,
    boxShadow: glow ? glowShadow(tone) : undefined
  };
  const cn = cx(
    "rounded-[22px] border bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-5 backdrop-blur-2xl",
    "shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]",
    className
  );
  if (!animated) return <div className={cn} style={boxStyle}>{children}</div>;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 380, damping: 34 }}
      className={cn}
      style={boxStyle}
    >
      {children}
    </motion.div>
  );
}

export function StyleChip({
  label,
  active,
  styleId,
  onClick
}: {
  label: string;
  active: boolean;
  styleId: DanceStyleId;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={active ? styleChipStylePlain(styleId, true) : undefined}
      className={cx(
        "shrink-0 rounded-full border px-[1.05rem] py-2.5 text-sm font-semibold transition",
        !active && "border-white/10 bg-white/[0.04] text-white/52 hover:border-white/14 hover:bg-white/[0.07]"
      )}
    >
      {label}
    </button>
  );
}

export function PriorityBadge({ tone, label }: { tone: "urgent" | "important" | "normal"; label: string }) {
  const map = {
    urgent: getTone("danger"),
    important: getTone("warning"),
    normal: { core: "rgba(255,255,255,0.48)", soft: "rgba(255,255,255,0.06)", border: "rgba(255,255,255,0.12)" }
  } as const;
  const t = map[tone];
  return (
    <span
      className="rounded-full border px-2 py-0.5 text-[10px] font-semibold"
      style={{ borderColor: t.border, backgroundColor: t.soft, color: tone === "normal" ? t.core : "rgba(255,255,255,0.92)" }}
    >
      {label}
    </span>
  );
}

export function CountdownHero({
  days,
  title,
  subtitle,
  tone = "competition"
}: {
  days: number;
  title: string;
  subtitle: string;
  tone?: SemanticTone;
}) {
  const t = getTone(tone);
  return (
    <AccentCard tone={tone} glow className="!p-0 overflow-hidden">
      <div className="relative px-5 py-6 text-right">
        <div
          className="pointer-events-none absolute -left-8 top-0 h-32 w-32 rounded-full blur-3xl"
          style={{ background: t.soft }}
          aria-hidden
        />
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: t.core }}>
          ספירה לאחור
        </p>
        <p className="mt-3 text-5xl font-semibold tabular-nums tracking-tight text-white">{days}</p>
        <p className="mt-1 text-sm text-white/45">ימים</p>
        <p className="mt-4 text-lg font-semibold text-white">{title}</p>
        <p className="mt-1 text-sm text-white/48">{subtitle}</p>
      </div>
    </AccentCard>
  );
}

export function IntensityDots({ level, max = 3, tone = "freestyle" }: { level: number; max?: number; tone?: SemanticTone }) {
  const t = getTone(tone);
  return (
    <span className="inline-flex gap-1" aria-label={`עוצמה ${level} מתוך ${max}`}>
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: i < level ? t.core : "rgba(255,255,255,0.15)" }}
        />
      ))}
    </span>
  );
}

export function ThemedIconBadge({ icon: Icon, tone = "accent" }: { icon: LucideIcon; tone?: SemanticTone }) {
  const t = getTone(tone);
  return (
    <span
      className="inline-flex rounded-2xl border p-3"
      style={{ borderColor: t.border, backgroundColor: t.soft }}
    >
      <Icon size={24} strokeWidth={1.75} style={{ color: t.core }} />
    </span>
  );
}

export function progressStrokeColors(tone: SemanticTone): [string, string] {
  return progressGradients[tone] ?? progressGradients.accent;
}
