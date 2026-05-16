"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Sparkles } from "lucide-react";
import { cx } from "@/lib/cx";
import { getTone, resolveThemeTone, type SemanticTone } from "@/lib/design-system/colors";
import { duration, ease, spring } from "@/lib/design-system/motion";
import { radiusClass } from "@/lib/design-system/radius";
import { interaction, screen, surfaces, text } from "@/lib/design-system/tokens";
import { progressGradients } from "@/lib/theme/gradients";
import { glowShadow } from "@/lib/theme/gradients";
import { styleCardGradient } from "@/lib/theme/dance-styles";
import type { DanceStyleId } from "@/lib/theme/semantic-tokens";

export { cx };

/** Standard vertical rhythm for full-screen hubs and stacks. */
export const screenClass = screen.className;
export const sectionListClass = `mt-3 ${screen.sectionList}`;
export const inputClass = interaction.input;

const cardBase = cx(surfaces.card, "p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]");

export function Card({
  children,
  className = "",
  animated = true,
  tone,
  styleId,
  glow = false
}: {
  children: React.ReactNode;
  className?: string;
  animated?: boolean;
  tone?: SemanticTone;
  styleId?: DanceStyleId;
  glow?: boolean;
}) {
  const t = getTone(tone ?? "accent");
  const gradKey = styleId ?? (tone && tone !== "accent" ? (tone as DanceStyleId) : undefined);
  const boxStyle =
    tone || styleId
      ? {
          backgroundImage: gradKey ? styleCardGradient(gradKey) : styleCardGradient("default"),
          borderColor: t.border,
          boxShadow: glow ? glowShadow(resolveThemeTone(tone ?? "accent")) : undefined
        }
      : undefined;
  const cn = cx(cardBase, !boxStyle && "border-white/[0.08]", className);
  if (!animated) {
    return (
      <div className={cn} style={boxStyle}>
        {children}
      </div>
    );
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring.gentle, delay: 0.01 }}
      className={cn}
      style={boxStyle}
    >
      {children}
    </motion.div>
  );
}

export function Pill({
  children,
  icon: Icon = Sparkles,
  className = "",
  tone = "accent"
}: {
  children: React.ReactNode;
  icon?: LucideIcon;
  className?: string;
  tone?: SemanticTone;
}) {
  const t = getTone(tone);
  return (
    <div
      style={{ borderColor: t.border, backgroundColor: t.soft, color: t.core }}
      className={cx(radiusClass.chip, "inline-flex items-center gap-1.5 border px-3 py-1.5 text-[11px] font-semibold tracking-wide", className)}
    >
      {Icon ? <Icon size={13} strokeWidth={2} /> : null}
      {children}
    </div>
  );
}

export function PrimaryButton({
  children,
  className = "",
  onClick,
  type = "button",
  disabled,
  tone = "accent"
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  tone?: SemanticTone;
}) {
  const t = getTone(tone);
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{
        backgroundColor: t.core,
        color: tone === "warning" || tone === "achievement" ? "rgba(5,5,6,0.92)" : "rgba(5,5,6,0.94)"
      }}
      className={cx(interaction.primaryBtn, disabled && "pointer-events-none opacity-40", className)}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  className = "",
  onClick,
  disabled
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cx(interaction.secondaryBtn, disabled && "pointer-events-none opacity-40", className)}
    >
      {children}
    </button>
  );
}

export function Toggle({
  checked,
  onChange,
  disabled,
  "aria-label": ariaLabel
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  "aria-label"?: string;
}) {
  const t = getTone("accent");
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={cx("relative h-8 w-[3.25rem] shrink-0 rounded-full transition-colors disabled:opacity-40", !checked && "bg-white/[0.14]")}
      style={checked ? { backgroundColor: t.core } : undefined}
    >
      <span
        className={cx(
          "absolute top-1 h-6 w-6 rounded-full bg-white shadow-md transition-[inset-inline-start]",
          checked ? "start-[calc(100%-1.65rem)]" : "start-1"
        )}
      />
    </button>
  );
}

export function Metric({
  title,
  value,
  icon: Icon,
  className = "",
  tone = "accent"
}: {
  title: string;
  value: string | number;
  icon: LucideIcon;
  className?: string;
  tone?: SemanticTone;
}) {
  const t = getTone(tone);
  return (
    <Card animated={false} className={cx("flex flex-1 flex-col items-center justify-center px-3 py-4 text-center", className)}>
      <Icon className="mb-2" size={20} strokeWidth={1.75} style={{ color: t.core }} />
      <div className="text-xl font-semibold tabular-nums tracking-tight text-white">{value}</div>
      <div className={cx(text.status, "mt-1")}>{title}</div>
    </Card>
  );
}

export function SectionEyebrow({ children, tone }: { children: React.ReactNode; tone?: SemanticTone }) {
  const t = tone ? getTone(tone) : null;
  return (
    <p className={cx(text.eyebrow, "mb-1 text-right", !t && "text-white/40")} style={t ? { color: t.core } : undefined}>
      {children}
    </p>
  );
}

export function SectionTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <h2 className={cx(text.sectionTitle, className)}>{children}</h2>;
}

export function Header({ title, subtitle, className = "" }: { title: string; subtitle: string; className?: string }) {
  return (
    <div className={cx("text-right", className)}>
      <h1 className={text.pageTitle}>{title}</h1>
      <p className={cx(text.body, "mt-2 max-w-[28rem] text-[14px]")}>{subtitle}</p>
    </div>
  );
}

export function ProgressBar({
  value,
  className = "",
  tone = "accent"
}: {
  value: number;
  className?: string;
  tone?: SemanticTone;
}) {
  const pct = Math.min(100, Math.max(0, value));
  const [c1, c2] = progressGradients[tone as keyof typeof progressGradients] ?? progressGradients.accent;
  return (
    <div className={cx("h-2 w-full overflow-hidden rounded-full bg-white/[0.08]", className)}>
      <motion.div
        className="h-full rounded-full"
        style={{ background: `linear-gradient(to left, ${c1}, ${c2})` }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: duration.progress, ease: ease.out }}
      />
    </div>
  );
}

type RingStatProps = { value: number; label: string; size?: number; className?: string; tone?: SemanticTone };

export function RingStat({ value, label, size = 72, className = "", tone = "accent" }: RingStatProps) {
  const gradId = useId().replace(/:/g, "");
  const stroke = 5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, value));
  const offset = c - (pct / 100) * c;
  const [c1, c2] = progressGradients[tone as keyof typeof progressGradients] ?? progressGradients.accent;
  return (
    <motion.div className={cx("flex flex-col items-center", className)} style={{ width: size }}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            className="transition-[stroke-dashoffset] duration-700 ease-out"
          />
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={c1} />
              <stop offset="100%" stopColor={c2} />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-semibold tabular-nums text-white">{pct}%</span>
        </div>
      </div>
      <span className={cx(text.status, "mt-2 text-center leading-tight")}>{label}</span>
    </motion.div>
  );
}

export function Divider({ className = "" }: { className?: string }) {
  return <div className={cx("h-px w-full bg-gradient-to-l from-transparent via-white/10 to-transparent", className)} />;
}

export const menuRowClass = cx(
  surfaces.menuRow,
  "flex w-full items-center justify-between gap-3 px-4 py-3.5 text-right shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:border-white/[0.12] hover:bg-white/[0.06] active:scale-[0.99] disabled:opacity-40"
);

export function EmptyState({
  title,
  description,
  icon: Icon = Sparkles,
  action,
  tone = "accent"
}: {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  tone?: SemanticTone;
}) {
  const t = getTone(tone);
  return (
    <div className={cx(radiusClass.card, "border border-dashed border-white/[0.1] bg-white/[0.02] px-5 py-10 text-center")}>
      <div
        className={cx("mx-auto mb-4 flex h-14 w-14 items-center justify-center border", radiusClass.icon)}
        style={{ borderColor: t.border, backgroundColor: t.soft }}
      >
        <Icon size={26} strokeWidth={1.65} style={{ color: t.core }} />
      </div>
      <p className={text.bodyStrong}>{title}</p>
      <p className={cx(text.body, "mx-auto mt-2 max-w-[16rem] text-sm")}>{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={cx("animate-pulse rounded-2xl bg-white/[0.07]", className)} aria-hidden />;
}

export { HubTile, HubLinkRow } from "./ui/HubTile";

export function StatusBadge({
  label,
  tone = "accent"
}: {
  label: string;
  tone?: SemanticTone;
}) {
  const t = getTone(tone);
  return (
    <span
      className={cx(radiusClass.chip, "inline-flex border px-2.5 py-1 text-[10px] font-semibold")}
      style={{ borderColor: t.border, backgroundColor: t.soft, color: t.core }}
    >
      {label}
    </span>
  );
}
