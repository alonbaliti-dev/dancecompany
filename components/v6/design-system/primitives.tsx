"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { ChevronLeft, WandSparkles } from "lucide-react";
import { aiSafetyNotice } from "@/lib/ai/ai-orchestrator";
import type { AIInsight } from "@/lib/ai/ai-types";
import { v6Control, v6Cx, v6Safe, v6Surface, v6Tone, v6Type, v6Visual, type V6Tone } from "./tokens";

type RtlRowProps = {
  children: ReactNode;
  className?: string;
  align?: "center" | "start";
};

export function RtlText({ children, className, as: Component = "span" }: { children: ReactNode; className?: string; as?: ElementType }) {
  return <Component dir="auto" className={v6Cx("rtl-text lk-hebrew-text", v6Safe.text, className)}>{children}</Component>;
}

export function BidiNumber({ children, className }: { children: ReactNode; className?: string }) {
  return <bdi className={v6Cx("ltr-number tabular-nums", className)}>{children}</bdi>;
}

export function SurfaceContent({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={v6Cx(v6Safe.content, className)}>{children}</div>;
}

export function SafeTitle({ children, className, as: Component = "h2" }: { children: ReactNode; className?: string; as?: ElementType }) {
  return <RtlText as={Component} className={v6Cx(v6Safe.title, className)}>{children}</RtlText>;
}

export function SafeMeta({ children, className, as: Component = "p" }: { children: ReactNode; className?: string; as?: ElementType }) {
  return <RtlText as={Component} className={v6Cx(v6Safe.meta, className)}>{children}</RtlText>;
}

export function SafeRow({ children, className, align = "start" }: RtlRowProps) {
  return (
    <div dir="rtl" className={v6Cx("rtl-row flex min-w-0 max-w-full flex-wrap gap-3 text-start", v6Safe.row, align === "center" ? "items-center" : "items-start", className)}>
      {children}
    </div>
  );
}

export function SafeBadgeGroup({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={v6Cx(v6Safe.badgeGroup, className)}>{children}</div>;
}

export function BadgeCount({ value, className, label }: { value: number | string; className?: string; label?: string }) {
  return (
    <span className={v6Cx("inline-flex min-h-4 min-w-4 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold leading-none shadow-[0_0_0_1px_rgba(255,247,223,0.10)]", className)} aria-label={label}>
      <BidiNumber>{value}</BidiNumber>
    </span>
  );
}

export function DirectionalChevron({ direction = "forward", className }: { direction?: "forward" | "back"; className?: string }) {
  return <ChevronLeft className={v6Cx("shrink-0", direction === "back" && "rotate-180", className)} size={17} aria-hidden="true" />;
}

export function RtlRow({ children, className, align = "center" }: RtlRowProps) {
  return <SafeRow align={align} className={className}>{children}</SafeRow>;
}

export function IconLabelRow({ icon: Icon, title, subtitle, tone = "studio", trailing, className }: { icon: ElementType; title: ReactNode; subtitle?: ReactNode; tone?: V6Tone; trailing?: ReactNode; className?: string }) {
  return (
    <RtlRow className={className}>
      <span className={v6Cx("grid h-11 w-11 shrink-0 place-items-center rounded-[21px] border border-white/[0.035] shadow-[inset_0_1px_0_rgba(255,247,223,0.050)]", v6Tone[tone].soft, v6Tone[tone].text)}><Icon size={15} strokeWidth={1.85} /></span>
      <span className="min-w-0 flex-1 text-start">
        <SafeTitle as="span" className="block text-[15px] font-semibold leading-snug tracking-[-0.025em] text-white/88">{title}</SafeTitle>
        {subtitle ? <SafeMeta as="span" className="mt-1 block text-[12px] text-white/46">{subtitle}</SafeMeta> : null}
      </span>
      {trailing ? <span className="rtl-row-trailing min-w-0 max-w-full shrink">{trailing}</span> : null}
    </RtlRow>
  );
}

export function Surface({ children, tone = "studio", className }: { children: ReactNode; tone?: V6Tone; className?: string }) {
  return (
    <section dir="rtl" className={v6Cx(v6Safe.surface, "overflow-hidden rounded-[34px] border p-5", v6Surface.base, className)}>
      <div className={v6Cx("pointer-events-none absolute -right-20 -top-20 z-0 h-44 w-44 rounded-full opacity-10 blur-3xl", v6Tone[tone].beam)} />
      <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-l from-transparent via-[#f4d58d]/18 to-transparent" />
      <SurfaceContent>{children}</SurfaceContent>
    </section>
  );
}

export function HeroSurface({ children, tone = "studio", className }: { children: ReactNode; tone?: V6Tone; className?: string }) {
  return (
    <section dir="rtl" className={v6Cx(v6Safe.surface, "overflow-hidden rounded-[42px] border border-[rgba(244,213,141,0.118)] bg-gradient-to-br px-5 py-6 text-start shadow-[0_42px_120px_rgba(0,0,0,0.54),0_16px_70px_rgba(244,213,141,0.055),inset_0_1px_0_rgba(255,247,223,0.095)] sm:px-7 sm:py-7", v6Tone[tone].grad, v6Visual.texture, v6Visual.heroOrnaments, className)}>
      <div className={v6Cx("pointer-events-none absolute right-6 top-0 z-0 h-52 w-24 rotate-12 rounded-full opacity-16 blur-3xl", v6Tone[tone].beam)} />
      <div className={v6Cx("pointer-events-none absolute inset-y-0 left-0 z-0 w-1/2 opacity-20 mix-blend-screen", v6Visual.stageBeam)} />
      <div className={v6Cx("pointer-events-none absolute bottom-0 left-8 z-0 h-24 w-36 rounded-t-full opacity-36", v6Visual.stageFloor)} />
      <SurfaceContent>{children}</SurfaceContent>
    </section>
  );
}

export function EditorialSection({ title, kicker, tone = "studio", children, className }: { title: string; kicker?: string; tone?: V6Tone; children: ReactNode; className?: string }) {
  return (
    <section dir="rtl" className={v6Cx(v6Safe.surface, "overflow-hidden rounded-[36px] border p-4 sm:p-5", v6Surface.editorial, className)}>
      <div className={v6Cx("pointer-events-none absolute -left-20 top-0 z-0 h-32 w-32 rounded-full opacity-7 blur-3xl", v6Tone[tone].beam)} />
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-l from-transparent via-[#f4d58d]/10 to-transparent" />
      <SurfaceContent className="mb-4 flex items-center justify-start gap-2 px-1 text-start">
        <div>
          {kicker ? <p className={v6Type.kicker}>{kicker}</p> : null}
          <SafeTitle as="h2" className={v6Cx(kicker && "mt-1.5", v6Type.sectionTitle)}>{title}</SafeTitle>
        </div>
      </SurfaceContent>
      <SurfaceContent>{children}</SurfaceContent>
    </section>
  );
}

export function OpenCluster({ children, tone = "studio", className }: { children: ReactNode; tone?: V6Tone; className?: string }) {
  return (
    <section dir="rtl" className={v6Cx(v6Safe.surface, "overflow-hidden rounded-[38px] border px-4 py-4 sm:px-5", v6Surface.open, className)}>
      <div className={v6Cx("pointer-events-none absolute -right-20 top-3 z-0 h-36 w-36 rounded-full opacity-7 blur-3xl", v6Tone[tone].beam)} />
      <SurfaceContent>{children}</SurfaceContent>
    </section>
  );
}

export function InlineMetric({ label, value, meta, tone = "studio", className }: { label: ReactNode; value: ReactNode; meta?: ReactNode; tone?: V6Tone; className?: string }) {
  return (
    <div dir="rtl" className={v6Cx("lk-safe-surface min-w-0 max-w-full rounded-[20px] border border-white/[0.035] bg-black/[0.10] px-3 py-2.5 text-start shadow-[inset_0_1px_0_rgba(255,247,223,0.026)]", className)}>
      <SafeMeta as="p" className="text-[10px] font-semibold text-white/34">{label}</SafeMeta>
      <p className={v6Cx("lk-safe-text mt-1 max-w-full break-words text-[1.28rem] font-semibold tracking-[-0.044em]", v6Tone[tone].text)}>{value}</p>
      {meta ? <SafeMeta as="p" className="mt-1 text-[10px] text-white/34">{meta}</SafeMeta> : null}
    </div>
  );
}

export function StageImage({ tone = "shop", label, icon: Icon, className }: { tone?: V6Tone; label?: string; icon?: ElementType; className?: string }) {
  return (
    <div className={v6Cx("relative isolate min-h-36 overflow-hidden rounded-[34px] border border-[rgba(244,213,141,0.075)] bg-gradient-to-br shadow-[inset_0_1px_0_rgba(255,247,223,0.060),0_18px_46px_rgba(0,0,0,0.24)]", v6Tone[tone].grad, className)}>
      <div className={v6Cx("pointer-events-none absolute inset-0 opacity-42 mix-blend-screen", v6Visual.curtain)} />
      <div className={v6Cx("pointer-events-none absolute inset-x-10 bottom-0 h-20 rounded-t-full opacity-60", v6Visual.plinth)} />
      <div className="absolute bottom-5 right-5 grid h-16 w-16 place-items-center rounded-[26px] border border-[#f4d58d]/10 bg-black/14 shadow-[inset_0_1px_0_rgba(255,247,223,0.075)] sm:h-20 sm:w-20 sm:rounded-[32px]">
        {Icon ? <Icon className={v6Tone[tone].text} size={23} strokeWidth={1.75} /> : null}
      </div>
      {label ? <p className="lk-safe-meta absolute left-5 top-5 max-w-[8rem] text-left text-[9px] font-semibold uppercase leading-relaxed tracking-[0.20em] text-white/38">{label}</p> : null}
    </div>
  );
}

export function Widget({ title, kicker, icon: Icon, tone = "studio", children }: { title: string; kicker: string; icon: ElementType; tone?: V6Tone; children: ReactNode }) {
  return (
    <section dir="rtl" className={v6Cx(v6Safe.surface, "overflow-hidden rounded-[36px] border p-5", v6Surface.elevated)}>
      <div className={v6Cx("pointer-events-none absolute -left-20 top-0 z-0 h-36 w-36 rounded-full opacity-9 blur-3xl", v6Tone[tone].beam)} />
      <SurfaceContent className="mb-5 flex items-center gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2 text-start">
          <span className={v6Cx("grid h-8 w-8 shrink-0 place-items-center rounded-[16px] border border-white/[0.035]", v6Tone[tone].soft, v6Tone[tone].text)}><Icon size={14} strokeWidth={1.9} /></span>
          <SafeTitle as="h2" className="text-[16px] font-semibold leading-snug tracking-[-0.030em] text-white/86">{title}</SafeTitle>
        </div>
        <span className="max-w-[7.5rem] shrink-0 text-wrap text-[9px] font-semibold uppercase leading-snug tracking-[0.18em] text-white/32">{kicker}</span>
      </SurfaceContent>
      <SurfaceContent>{children}</SurfaceContent>
    </section>
  );
}

export function FeedRow({ icon: Icon, title, body, meta, tone = "studio" }: { icon: ElementType; title: string; body: string; meta: string; tone?: V6Tone }) {
  return (
    <SafeRow className={v6Cx("rounded-[28px] border px-3.5 py-3.5 transition hover:bg-white/[0.018]", v6Surface.whisper)}>
      <span className={v6Cx("mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-[17px]", v6Tone[tone].soft, v6Tone[tone].text)}><Icon size={13} strokeWidth={1.9} /></span>
      <span className="min-w-0 flex-1 text-start">
        <SafeTitle as="span" className="block text-[14px] font-semibold tracking-[-0.020em] text-white/86">{title}</SafeTitle>
        <RtlText as="span" className="mt-1.5 block text-[12px] leading-relaxed text-white/50">{body}</RtlText>
      </span>
      <SafeMeta as="span" className="rtl-row-trailing min-w-[4rem] max-w-full shrink text-[10px] font-semibold text-white/36 sm:max-w-[8rem]">{meta}</SafeMeta>
    </SafeRow>
  );
}

export function ActionPill({ icon: Icon, title, subtitle, tone = "studio", onClick }: { icon: ElementType; title: string; subtitle?: string; tone?: V6Tone; onClick?: () => void }) {
  return (
    <button dir="rtl" onClick={onClick} className={v6Cx("lk-safe-surface group flex min-h-[64px] w-full min-w-0 items-start gap-3 rounded-[24px] border px-3 py-3 text-start transition duration-200 active:scale-[0.98]", v6Surface.whisper)}>
      <span className={v6Cx("grid h-9 w-9 shrink-0 place-items-center rounded-full transition group-active:scale-95", v6Tone[tone].soft, v6Tone[tone].text)}><Icon size={15} strokeWidth={1.9} /></span>
      <span className="min-w-0 flex-1">
        <SafeTitle as="span" className="block max-w-full text-[12.5px] font-semibold text-white/84">{title}</SafeTitle>
        {subtitle ? <SafeMeta as="span" className="mt-0.5 block max-w-full text-[10px] font-medium text-white/38">{subtitle}</SafeMeta> : null}
      </span>
    </button>
  );
}

export function StatusBadge({ children, tone = "studio" }: { children: ReactNode; tone?: V6Tone }) {
  return <span dir="auto" className={v6Cx("bidi-plain mx-0.5 inline-flex min-h-7 max-w-full min-w-0 items-center rounded-full border border-white/[0.035] px-3 py-1.5 text-[11px] font-semibold shadow-[inset_0_1px_0_rgba(255,247,223,0.036)]", v6Safe.control, v6Tone[tone].soft, v6Tone[tone].text)}>{children}</span>;
}

export function Button({ children, onClick, variant = "primary", disabled, type = "button" }: { children: ReactNode; onClick?: () => void; variant?: "primary" | "ghost" | "danger"; disabled?: boolean; type?: "button" | "submit" }) {
  return (
    <button dir="rtl" type={type} disabled={disabled} onClick={onClick} className={v6Cx("lk-safe-control inline-flex min-h-12 max-w-full min-w-0 items-center justify-center gap-1.5 rounded-[24px] px-5 py-2.5 text-center text-sm font-semibold tracking-[-0.016em] transition duration-200 active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-45", variant === "primary" && "bg-[linear-gradient(135deg,#fff9ea,#f4d58d_56%,#d7b56d)] text-zinc-950 shadow-[0_14px_34px_rgba(244,213,141,0.14),inset_0_1px_0_rgba(255,255,255,0.62)]", variant === "ghost" && "border border-[rgba(244,213,141,0.070)] bg-white/[0.036] text-white/82 shadow-[inset_0_1px_0_rgba(255,247,223,0.046)]", variant === "danger" && "border border-rose-100/[0.055] bg-[#b72f3d]/12 text-rose-50 shadow-[inset_0_1px_0_rgba(255,247,223,0.042)]")}>
      {children}
    </button>
  );
}

export function FormField({ label, value, onChange, type = "text", placeholder }: { label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string }) {
  const inputDir = type === "tel" || label.includes("טלפון") ? "ltr" : "auto";
  return (
    <label className="block text-start" dir="rtl">
      <span className={v6Control.label}>{label}</span>
      <input dir={inputDir} value={value} type={type} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className={v6Cx("mt-2", v6Control.field, inputDir === "ltr" ? "text-left" : "text-start")} />
    </label>
  );
}

export function SelectField({ label, value, onChange, children, className }: { label: string; value: string; onChange: (value: string) => void; children: ReactNode; className?: string }) {
  return (
    <label className={v6Cx("block text-start", className)} dir="rtl">
      <span className={v6Control.label}>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className={v6Cx("mt-2", v6Control.field, "text-start")}>
        {children}
      </select>
    </label>
  );
}

export function BottomSheet({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    window.requestAnimationFrame(() => sheetRef.current?.focus());
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onCloseRef.current();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mounted]);

  const sheet = (
    <div
      dir="rtl"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2147483647,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        background: "radial-gradient(ellipse at 50% 100%, rgba(244,213,141,0.08), transparent 44%), rgba(0,0,0,0.70)",
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 12px)"
      }}
      className="px-0 pb-0 backdrop-blur-lg md:p-6"
    >
      <button type="button" aria-label="סגירת שכבת עריכה" style={{ zIndex: 0 }} className="absolute inset-0 cursor-default" onClick={onClose} />
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        style={{ zIndex: 1, height: "min(720px, calc(100dvh - env(safe-area-inset-top, 0px) - 12px))", insetInline: 0, bottom: 0 }}
        className={v6Cx(v6Safe.surface, "relative flex w-full max-w-[430px] flex-col overflow-hidden rounded-t-[40px] border outline-none md:max-w-[760px] md:rounded-[40px]", v6Surface.floating)}
      >
        <div className="sticky top-0 z-10 flex flex-wrap items-start gap-3 bg-[#080506]/88 px-5 py-4 shadow-[inset_0_-1px_0_rgba(244,213,141,0.08)] backdrop-blur-2xl">
          <SafeTitle as="h2" className="min-w-0 flex-1 text-start text-xl font-semibold tracking-[-0.035em]">{title}</SafeTitle>
          <Button variant="ghost" onClick={onClose}>סגירה</Button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 pb-[calc(5rem+env(safe-area-inset-bottom,0px))]">{children}</div>
      </div>
    </div>
  );

  return mounted ? createPortal(sheet, document.body) : null;
}

export function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return <motion.div dir="auto" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="bidi-plain lk-safe-text fixed left-1/2 top-[calc(env(safe-area-inset-top,0px)+0.8rem)] z-[90] w-[min(92vw,360px)] -translate-x-1/2 rounded-[24px] border border-[#f4d58d]/18 bg-zinc-950/88 px-4 py-3 text-center text-sm font-semibold text-white shadow-[0_18px_46px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,247,223,0.08)] backdrop-blur-xl">{message}</motion.div>;
}

export function ConfirmDialog({ title, body, confirmLabel = "אישור", onConfirm, onCancel }: { title: string; body: string; confirmLabel?: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/62 px-4 backdrop-blur-sm">
      <Surface className="max-w-[360px] p-5">
        <SafeTitle as="h2" className="text-xl font-semibold tracking-[-0.035em] text-white">{title}</SafeTitle>
        <RtlText as="p" className="mt-2 text-sm leading-relaxed text-white/56">{body}</RtlText>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="danger" onClick={onConfirm}>{confirmLabel}</Button>
          <Button variant="ghost" onClick={onCancel}>ביטול</Button>
        </div>
      </Surface>
    </div>
  );
}

export function SegmentedControl({ value, options, onChange }: { value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <div dir="rtl" className="lk-safe-badge-group rounded-[24px] border border-[#f4d58d]/8 bg-black/18 p-1.5 shadow-[inset_0_1px_0_rgba(255,247,223,0.050)]">
      {options.map((item) => <button key={item} onClick={() => onChange(item)} className={v6Cx("lk-safe-control min-h-10 min-w-0 rounded-full px-4 py-2 text-xs font-semibold transition active:scale-95", value === item ? "bg-[#f4d58d]/17 text-[#fff7df] shadow-[inset_0_0_0_1px_rgba(244,213,141,0.20)]" : "text-white/56")}>{item}</button>)}
    </div>
  );
}

export function ApprovalRequiredBadge() {
  return <span className="lk-safe-control inline-flex min-h-7 max-w-full items-center rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-semibold text-amber-950">דורש אישור</span>;
}

export function AIInsightCard({ insight }: { insight: AIInsight }) {
  const [expanded, setExpanded] = useState(false);
  const [approved, setApproved] = useState(false);
  const action = insight.requiresApproval ? "לאשר נוסח לפני שליחה" : insight.riskLevel === "high" ? "לטפל היום" : "לעקוב בהמשך";
  return (
    <div dir="rtl" className={v6Cx(v6Safe.surface, "rounded-[29px] border p-4 text-start", v6Surface.quiet)}>
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <SafeTitle as="p" className="text-[14px] font-semibold tracking-[-0.02em] text-white/88">{insight.title}</SafeTitle>
          <RtlText as="p" className="mt-1 text-[12px] leading-relaxed text-white/52">{insight.body}</RtlText>
        </div>
        {insight.requiresApproval ? <ApprovalRequiredBadge /> : <span className={v6Cx("shrink-0 rounded-full px-2 py-1 text-[10px] font-black", insight.riskLevel === "high" ? "bg-rose-300 text-rose-950" : insight.riskLevel === "medium" ? "bg-amber-200 text-amber-950" : "bg-emerald-200 text-emerald-950")}>{insight.riskLevel === "high" ? "דחוף" : insight.riskLevel === "medium" ? "לבדיקה" : "רגוע"}</span>}
      </div>
      {expanded ? <div className="mt-2 rounded-[20px] border border-white/[0.035] bg-white/[0.040] p-3 text-[12px] leading-relaxed text-white/54"><p className="lk-safe-text">{aiSafetyNotice()}</p><p className="lk-safe-text mt-2 font-semibold text-white/70">פעולה מומלצת: {action}</p></div> : null}
      <div className="mt-3 flex items-center gap-2">
        <SafeMeta as="p" className={v6Cx("min-w-0 flex-1 text-[11px]", insight.requiresApproval ? "font-bold text-amber-100/75" : "text-white/38")}>{approved ? "אושר ידנית" : action}</SafeMeta>
        <div className="flex shrink-0 gap-1.5">
          {insight.requiresApproval ? <button onClick={() => setApproved(true)} className="min-h-9 rounded-full bg-emerald-200 px-2.5 text-[11px] font-black text-emerald-950">{approved ? "מאושר" : "אישור"}</button> : null}
          <button onClick={() => setExpanded((value) => !value)} className="min-h-9 rounded-full bg-white/[0.052] px-2.5 text-[11px] font-semibold text-white/60">{expanded ? "סגור" : "פירוט"}</button>
        </div>
      </div>
    </div>
  );
}

export function AISuggestionStack({ insights, title = "העוזרת החכמה", subtitle = "קצר, שימושי, עם אישור אנושי לפני פרסום." }: { insights: AIInsight[]; title?: string; subtitle?: string }) {
  return (
    <section dir="rtl" className={v6Cx(v6Safe.surface, "overflow-hidden rounded-[36px] border border-[rgba(244,213,141,0.088)] bg-gradient-to-br p-5 text-start shadow-[0_24px_70px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,247,223,0.064)] backdrop-blur-xl", v6Tone.admin.grad)}>
      <div className="pointer-events-none absolute -left-16 -top-20 z-0 h-36 w-36 rounded-full bg-violet-200/8 blur-3xl" />
      <div className="flex items-start gap-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/[0.052] text-violet-100"><WandSparkles size={15} strokeWidth={1.9} /></span>
        <div className="min-w-0 flex-1 text-start">
          <SafeTitle as="h2" className="text-[16px] font-semibold tracking-[-0.030em] text-white/86">{title}</SafeTitle>
          <SafeMeta as="p" className="mt-1 text-[11px] text-white/45">{subtitle}</SafeMeta>
        </div>
      </div>
      <div className="mt-4 space-y-2">{insights.map((insight) => <AIInsightCard key={insight.id} insight={insight} />)}</div>
    </section>
  );
}
