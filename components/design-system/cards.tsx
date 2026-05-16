"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { ChevronLeft } from "lucide-react";
import { cx } from "@/lib/cx";
import { getTone, resolveThemeTone, type SemanticTone } from "@/lib/design-system/colors";
import { motionPresets, spring } from "@/lib/design-system/motion";
import { shadows } from "@/lib/design-system/shadows";
import { radiusClass } from "@/lib/design-system/radius";
import { surfaces, text } from "@/lib/design-system/tokens";
import { glowShadow } from "@/lib/theme/gradients";
import { styleCardGradient } from "@/lib/theme/dance-styles";
import type { DanceStyleId } from "@/lib/theme/semantic-tokens";

const cardPadding = "p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]";

type BaseCardProps = {
  children: React.ReactNode;
  className?: string;
  animated?: boolean;
  tone?: SemanticTone;
  styleId?: DanceStyleId;
  glow?: boolean;
  onClick?: () => void;
};

function cardStyle(tone?: SemanticTone, styleId?: DanceStyleId, glow?: boolean) {
  if (!tone && !styleId) return undefined;
  const t = getTone(tone ?? "accent");
  const gradKey = styleId ?? (tone && tone !== "accent" ? (tone as DanceStyleId) : undefined);
  return {
    backgroundImage: gradKey ? styleCardGradient(gradKey) : styleCardGradient("default"),
    borderColor: t.border,
    boxShadow: glow ? glowShadow(resolveThemeTone(tone ?? "accent")) : undefined
  } as React.CSSProperties;
}

export function BaseCard({
  children,
  className,
  animated = true,
  tone,
  styleId,
  glow,
  onClick
}: BaseCardProps) {
  const boxStyle = cardStyle(tone, styleId, glow);
  const cn = cx(surfaces.card, cardPadding, !boxStyle && "border-white/[0.08]", className);
  if (!animated) {
    return onClick ? (
      <button type="button" className={cx(cn, "w-full touch-manipulation text-right active:scale-[0.99]")} style={boxStyle} onClick={onClick}>
        {children}
      </button>
    ) : (
      <div className={cn} style={boxStyle}>
        {children}
      </div>
    );
  }

  if (onClick) {
    return (
      <motion.button
        type="button"
        initial={motionPresets.cardEnter.initial}
        animate={motionPresets.cardEnter.animate}
        transition={{ ...spring.gentle, delay: 0.02 }}
        className={cx(cn, "w-full touch-manipulation text-right active:scale-[0.99]")}
        style={boxStyle}
        onClick={onClick}
      >
        {children}
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={motionPresets.cardEnter.initial}
      animate={motionPresets.cardEnter.animate}
      transition={{ ...spring.gentle, delay: 0.02 }}
      className={cn}
      style={boxStyle}
    >
      {children}
    </motion.div>
  );
}

/** Large hero / welcome surface */
export function HeroCard({
  eyebrow,
  title,
  subtitle,
  children,
  className,
  tone = "accent"
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
  tone?: SemanticTone;
}) {
  const t = getTone(tone);
  return (
    <BaseCard tone={tone} glow className={cx("overflow-hidden", className)}>
      {eyebrow ? (
        <p className={text.eyebrow} style={{ color: t.core }}>
          {eyebrow}
        </p>
      ) : null}
      <h2 className={cx(text.hero, "mt-1 text-right")}>{title}</h2>
      {subtitle ? <p className={cx(text.body, "mt-2 text-right")}>{subtitle}</p> : null}
      {children ? <div className="mt-5">{children}</div> : null}
    </BaseCard>
  );
}

/** Compact stat / glance row */
export function GlanceCard({
  label,
  value,
  hint,
  icon: Icon,
  className,
  tone = "accent"
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  className?: string;
  tone?: SemanticTone;
}) {
  const t = getTone(tone);
  return (
    <BaseCard animated={false} className={cx("flex items-center justify-between gap-3", className)}>
      <div className="min-w-0 text-right">
        <p className={text.label}>{label}</p>
        <p className={cx(text.stat, "mt-0.5 text-white")}>{value}</p>
        {hint ? <p className={cx(text.caption, "mt-1")}>{hint}</p> : null}
      </div>
      {Icon ? (
        <span
          className={cx("flex h-11 w-11 shrink-0 items-center justify-center", radiusClass.icon, "border")}
          style={{ borderColor: t.border, backgroundColor: t.soft }}
        >
          <Icon size={20} strokeWidth={1.75} style={{ color: t.core }} />
        </span>
      ) : null}
    </BaseCard>
  );
}

/** Tappable action row or grid cell */
export function ActionCard({
  label,
  description,
  icon: Icon,
  onPress,
  className,
  tone = "accent"
}: {
  label: string;
  description?: string;
  icon: LucideIcon;
  onPress: () => void;
  className?: string;
  tone?: SemanticTone;
}) {
  const t = getTone(tone);
  return (
    <button
      type="button"
      onClick={onPress}
      className={cx(
        "flex w-full min-h-[3.25rem] touch-manipulation items-center justify-between gap-2 border border-white/[0.08] bg-black/25 px-3 py-3.5 text-right transition",
        "rounded-2xl",
        "active:scale-[0.98] active:bg-white/[0.06] [@media(hover:hover)_and_(pointer:fine)]:hover:border-white/[0.12] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-white/[0.04]",
        className
      )}
    >
      <ChevronLeft className="shrink-0 text-white/22" size={18} />
      <span className="min-w-0 flex-1">
        <span className={text.bodyStrong}>{label}</span>
        {description ? <span className={cx(text.caption, "mt-0.5 block")}>{description}</span> : null}
      </span>
      <span
        className={cx("flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center border", radiusClass.icon)}
        style={{ borderColor: t.border, backgroundColor: t.soft }}
      >
        <Icon size={20} strokeWidth={1.75} style={{ color: t.core }} />
      </span>
    </button>
  );
}

/** Status / alert emphasis */
export function StatusCard({
  title,
  message,
  icon: Icon,
  tone = "warning",
  action,
  className
}: {
  title: string;
  message: string;
  icon: LucideIcon;
  tone?: SemanticTone;
  action?: React.ReactNode;
  className?: string;
}) {
  const t = getTone(tone);
  return (
    <BaseCard animated={false} className={cx("border-dashed", className)} tone={tone}>
      <div className="flex items-start gap-3">
        <span
          className={cx("flex h-11 w-11 shrink-0 items-center justify-center border", radiusClass.icon)}
          style={{ borderColor: t.border, backgroundColor: t.soft }}
        >
          <Icon size={20} style={{ color: t.core }} />
        </span>
        <div className="min-w-0 flex-1 text-right">
          <p className={text.cardTitle}>{title}</p>
          <p className={cx(text.body, "mt-1")}>{message}</p>
          {action ? <div className="mt-3">{action}</div> : null}
        </div>
      </div>
    </BaseCard>
  );
}

/** Timeline / schedule row */
export function TimelineCard({
  time,
  title,
  meta,
  trailing,
  className,
  tone
}: {
  time: string;
  title: string;
  meta?: string;
  trailing?: React.ReactNode;
  className?: string;
  tone?: SemanticTone;
}) {
  return (
    <BaseCard animated={false} className={cx("flex items-center gap-3 py-4", className)} tone={tone}>
      <span className={cx(text.label, "w-12 shrink-0 text-center tabular-nums")}>{time}</span>
      <div className="min-w-0 flex-1 border-s border-white/10 ps-3 text-right">
        <p className={text.cardTitle}>{title}</p>
        {meta ? <p className={cx(text.caption, "mt-0.5")}>{meta}</p> : null}
      </div>
      {trailing}
    </BaseCard>
  );
}

/** Media thumbnail card */
export function MediaCard({
  title,
  subtitle,
  thumbnail,
  onPress,
  className
}: {
  title: string;
  subtitle?: string;
  thumbnail?: React.ReactNode;
  onPress?: () => void;
  className?: string;
}) {
  const inner = (
    <>
      {thumbnail ? (
        <div className={cx("mb-3 overflow-hidden", radiusClass.cardSm, "aspect-video bg-white/[0.04]")}>{thumbnail}</div>
      ) : null}
      <p className={text.cardTitle}>{title}</p>
      {subtitle ? <p className={cx(text.caption, "mt-1")}>{subtitle}</p> : null}
    </>
  );
  if (onPress) {
    return (
      <BaseCard animated={false} className={cx("cursor-pointer text-right transition hover:border-white/[0.12]", className)} onClick={onPress}>
        {inner}
      </BaseCard>
    );
  }
  return (
    <BaseCard animated={false} className={cx("text-right", className)}>
      {inner}
    </BaseCard>
  );
}

/** Analytics metric block */
export function AnalyticsCard({
  metrics
}: {
  metrics: Array<{ label: string; value: string | number; tone?: SemanticTone }>;
}) {
  return (
    <BaseCard animated={false} className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {metrics.map((m) => {
        const t = getTone(m.tone ?? "accent");
        return (
          <div key={m.label} className="text-center">
            <p className="text-xl font-semibold tabular-nums text-white">{m.value}</p>
            <p className={text.status} style={{ color: t.core }}>
              {m.label}
            </p>
          </div>
        );
      })}
    </BaseCard>
  );
}

/** Achievement / milestone highlight */
export function AchievementCard({
  title,
  description,
  icon: Icon,
  progress,
  className
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  progress?: number;
  className?: string;
}) {
  const t = getTone("achievement");
  return (
    <BaseCard tone="achievement" glow className={className}>
      <motion.div className="flex items-start gap-3">
        <span
          className={cx("flex h-12 w-12 items-center justify-center border", radiusClass.icon)}
          style={{ borderColor: t.border, backgroundColor: t.soft, boxShadow: shadows.glowAccent }}
        >
          <Icon size={22} style={{ color: t.core }} />
        </span>
        <div className="min-w-0 flex-1 text-right">
          <p className={text.cardTitle}>{title}</p>
          <p className={cx(text.body, "mt-1")}>{description}</p>
          {progress != null ? (
            <motion.div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: t.core }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, progress)}%` }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              />
            </motion.div>
          ) : null}
        </div>
      </motion.div>
    </BaseCard>
  );
}
