"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { ChevronLeft, WandSparkles } from "lucide-react";
import { aiSafetyNotice } from "@/lib/ai/ai-orchestrator";
import type { AIInsight } from "@/lib/ai/ai-types";
import { v6Cx, v6Surface, v6Tone, v6Visual, type V6Tone } from "./tokens";

type RtlRowProps = {
  children: ReactNode;
  className?: string;
  align?: "center" | "start";
};

export function RtlText({ children, className, as: Component = "span" }: { children: ReactNode; className?: string; as?: ElementType }) {
  return <Component dir="auto" className={v6Cx("rtl-text", className)}>{children}</Component>;
}

export function BidiNumber({ children, className }: { children: ReactNode; className?: string }) {
  return <bdi className={v6Cx("ltr-number tabular-nums", className)}>{children}</bdi>;
}

export function BadgeCount({ value, className, label }: { value: number | string; className?: string; label?: string }) {
  return (
    <span className={v6Cx("inline-flex min-h-4 min-w-4 items-center justify-center rounded-full px-1.5 text-[10px] font-bold leading-none", className)} aria-label={label}>
      <BidiNumber>{value}</BidiNumber>
    </span>
  );
}

export function DirectionalChevron({ direction = "forward", className }: { direction?: "forward" | "back"; className?: string }) {
  return <ChevronLeft className={v6Cx("shrink-0", direction === "back" && "rotate-180", className)} size={17} aria-hidden="true" />;
}

export function RtlRow({ children, className, align = "center" }: RtlRowProps) {
  return <div dir="rtl" className={v6Cx("rtl-row flex gap-3 text-start", align === "center" ? "items-center" : "items-start", className)}>{children}</div>;
}

export function IconLabelRow({ icon: Icon, title, subtitle, tone = "studio", trailing, className }: { icon: ElementType; title: ReactNode; subtitle?: ReactNode; tone?: V6Tone; trailing?: ReactNode; className?: string }) {
  return (
    <RtlRow className={className}>
      <span className={v6Cx("grid h-10 w-10 shrink-0 place-items-center rounded-[17px]", v6Tone[tone].soft, v6Tone[tone].text)}><Icon size={16} /></span>
      <span className="min-w-0 flex-1 text-start">
        <RtlText as="span" className="block truncate text-[15px] font-semibold tracking-[-0.02em]">{title}</RtlText>
        {subtitle ? <RtlText as="span" className="mt-0.5 block line-clamp-1 text-[12px] leading-snug text-white/42">{subtitle}</RtlText> : null}
      </span>
      {trailing ? <span className="rtl-row-trailing shrink-0">{trailing}</span> : null}
    </RtlRow>
  );
}

export function Surface({ children, tone = "studio", className }: { children: ReactNode; tone?: V6Tone; className?: string }) {
  return (
    <section dir="rtl" className={v6Cx("relative isolate mx-auto w-full max-w-full overflow-hidden rounded-[29px] border p-4 text-start", v6Surface.base, className)}>
      <div className={v6Cx("pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full opacity-16 blur-3xl", v6Tone[tone].beam)} />
      <div className="relative">{children}</div>
    </section>
  );
}

export function HeroSurface({ children, tone = "studio", className }: { children: ReactNode; tone?: V6Tone; className?: string }) {
  return (
    <section dir="rtl" className={v6Cx("relative isolate overflow-hidden rounded-[38px] border border-[rgba(255,255,255,0.060)] bg-gradient-to-br px-5 py-5 text-start shadow-[0_30px_86px_rgba(0,0,0,0.44),inset_0_1px_0_rgba(255,255,255,0.082)]", v6Tone[tone].grad, v6Visual.texture, v6Visual.heroOrnaments, className)}>
      <div className={v6Cx("pointer-events-none absolute right-6 top-0 h-56 w-24 rotate-12 rounded-full opacity-24 blur-3xl", v6Tone[tone].beam)} />
      <div className={v6Cx("pointer-events-none absolute inset-y-0 left-0 w-1/2 opacity-28 mix-blend-screen", v6Visual.stageBeam)} />
      <div className={v6Cx("pointer-events-none absolute bottom-0 left-8 h-24 w-32 rounded-t-full opacity-44", v6Visual.stageFloor)} />
      <div className="relative">{children}</div>
    </section>
  );
}

export function EditorialSection({ title, kicker, tone = "studio", children, className }: { title: string; kicker?: string; tone?: V6Tone; children: ReactNode; className?: string }) {
  return (
    <section dir="rtl" className={v6Cx("relative isolate overflow-hidden rounded-[30px] border p-3 text-start", v6Surface.editorial, className)}>
      <div className={v6Cx("pointer-events-none absolute -left-20 top-0 h-32 w-32 rounded-full opacity-10 blur-3xl", v6Tone[tone].beam)} />
      <div className="relative mb-3 flex items-center justify-start gap-2 text-start">
        <div>
          {kicker ? <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-white/32">{kicker}</p> : null}
          <h2 className="text-[14px] font-semibold tracking-[-0.025em] text-white/78">{title}</h2>
        </div>
      </div>
      <div className="relative">{children}</div>
    </section>
  );
}

export function StageImage({ tone = "shop", label, icon: Icon, className }: { tone?: V6Tone; label?: string; icon?: ElementType; className?: string }) {
  return (
    <div className={v6Cx("relative isolate min-h-36 overflow-hidden rounded-[29px] border border-[rgba(255,255,255,0.046)] bg-gradient-to-br shadow-[inset_0_1px_0_rgba(255,255,255,0.055),0_14px_34px_rgba(0,0,0,0.18)]", v6Tone[tone].grad, className)}>
      <div className={v6Cx("pointer-events-none absolute inset-0 opacity-36 mix-blend-screen", v6Visual.curtain)} />
      <div className={v6Cx("pointer-events-none absolute inset-x-10 bottom-0 h-16 rounded-t-full opacity-56", v6Visual.plinth)} />
      <div className="absolute bottom-4 right-4 grid h-20 w-20 place-items-center rounded-[31px] border border-white/[0.060] bg-black/16 shadow-[inset_0_1px_0_rgba(255,255,255,0.075)]">
        {Icon ? <Icon className={v6Tone[tone].text} size={24} /> : null}
      </div>
      {label ? <p className="absolute left-4 top-4 max-w-[8rem] text-left text-[9px] font-semibold uppercase tracking-[0.24em] text-white/36">{label}</p> : null}
    </div>
  );
}

export function Widget({ title, kicker, icon: Icon, tone = "studio", children }: { title: string; kicker: string; icon: ElementType; tone?: V6Tone; children: ReactNode }) {
  return (
    <section dir="rtl" className={v6Cx("relative isolate overflow-hidden rounded-[30px] border p-4 text-start", v6Surface.elevated)}>
      <div className={v6Cx("pointer-events-none absolute -left-20 top-0 h-36 w-36 rounded-full opacity-12 blur-3xl", v6Tone[tone].beam)} />
      <div className="mb-3 flex items-center gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2 text-start">
          <span className={v6Cx("grid h-8 w-8 shrink-0 place-items-center rounded-[15px]", v6Tone[tone].soft, v6Tone[tone].text)}><Icon size={14} /></span>
          <h2 className="truncate text-[16px] font-semibold tracking-[-0.035em] text-white/88">{title}</h2>
        </div>
        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.20em] text-white/34">{kicker}</span>
      </div>
      <div className="relative">{children}</div>
    </section>
  );
}

export function FeedRow({ icon: Icon, title, body, meta, tone = "studio" }: { icon: ElementType; title: string; body: string; meta: string; tone?: V6Tone }) {
  return (
    <RtlRow className={v6Cx("rounded-[23px] border px-3.5 py-3", v6Surface.quiet)}>
      <span className={v6Cx("grid h-9 w-9 shrink-0 place-items-center rounded-[15px]", v6Tone[tone].soft, v6Tone[tone].text)}><Icon size={14} /></span>
      <span className="min-w-0 flex-1 text-start">
        <RtlText as="span" className="block truncate text-[13.5px] font-semibold tracking-[-0.015em] text-white/88">{title}</RtlText>
        <RtlText as="span" className="mt-1 block line-clamp-2 text-[12px] leading-snug text-white/50">{body}</RtlText>
      </span>
      <RtlText as="span" className="rtl-row-trailing max-w-[5.5rem] shrink-0 truncate text-[10px] font-semibold text-white/40">{meta}</RtlText>
    </RtlRow>
  );
}

export function ActionPill({ icon: Icon, title, subtitle, tone = "studio", onClick }: { icon: ElementType; title: string; subtitle?: string; tone?: V6Tone; onClick?: () => void }) {
  return (
    <button onClick={onClick} className={v6Cx("grid min-h-[78px] min-w-[76px] shrink-0 place-items-center rounded-[25px] border px-2.5 text-center transition duration-200 active:scale-[0.98]", v6Surface.quiet)}>
      <span className={v6Cx("grid h-10 w-10 place-items-center rounded-[17px]", v6Tone[tone].soft, v6Tone[tone].text)}><Icon size={17} /></span>
      <span className="mt-1.5 text-[11px] font-semibold text-white/82">{title}</span>
      {subtitle ? <span className="-mt-0.5 text-[9px] font-medium text-white/34">{subtitle}</span> : null}
    </button>
  );
}

export function StatusBadge({ children, tone = "studio" }: { children: ReactNode; tone?: V6Tone }) {
  return <span dir="auto" className={v6Cx("bidi-plain inline-flex max-w-full items-center rounded-full px-3 py-1.5 text-[11px] font-semibold", v6Tone[tone].soft, v6Tone[tone].text)}>{children}</span>;
}

export function Button({ children, onClick, variant = "primary", disabled, type = "button" }: { children: ReactNode; onClick?: () => void; variant?: "primary" | "ghost" | "danger"; disabled?: boolean; type?: "button" | "submit" }) {
  return (
    <button dir="rtl" type={type} disabled={disabled} onClick={onClick} className={v6Cx("inline-flex min-h-12 max-w-full items-center justify-center gap-1.5 rounded-[20px] px-5 py-2 text-sm font-semibold tracking-[-0.010em] transition duration-200 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-45", variant === "primary" && "bg-[linear-gradient(135deg,#fff8e8,#f4d58d_56%,#dfffee)] text-zinc-950 shadow-[0_12px_28px_rgba(215,181,109,0.14),inset_0_1px_0_rgba(255,255,255,0.56)]", variant === "ghost" && "border border-[rgba(255,255,255,0.044)] bg-white/[0.038] text-white/82 shadow-[inset_0_1px_0_rgba(255,255,255,0.044)]", variant === "danger" && "bg-[#b72f3d]/12 text-rose-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.042)]")}>
      {children}
    </button>
  );
}

export function FormField({ label, value, onChange, type = "text", placeholder }: { label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string }) {
  const inputDir = type === "tel" || label.includes("טלפון") ? "ltr" : "auto";
  return (
    <label className="block text-start" dir="rtl">
      <span className="text-[12px] font-semibold text-white/48">{label}</span>
      <input dir={inputDir} value={value} type={type} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className={v6Cx("mt-2 min-h-[54px] w-full rounded-[22px] border border-[rgba(255,255,255,0.052)] bg-white/[0.052] px-4 text-[16px] text-white outline-none placeholder:text-white/28 shadow-[inset_0_1px_0_rgba(255,255,255,0.048)] focus:border-[rgba(215,181,109,0.22)] focus:bg-white/[0.075]", inputDir === "ltr" ? "text-left" : "text-start")} />
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
        background: "rgba(0,0,0,0.68)",
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 12px)"
      }}
      className="px-0 pb-0 backdrop-blur-md md:p-6"
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
        className="relative flex w-full max-w-[430px] flex-col overflow-hidden rounded-t-[34px] border border-[rgba(255,255,255,0.09)] bg-[#090608] shadow-[0_32px_100px_rgba(0,0,0,0.66),inset_0_1px_0_rgba(255,255,255,0.1)] outline-none md:max-w-[760px] md:rounded-[36px]"
      >
        <div className="sticky top-0 z-10 flex items-center gap-3 bg-[#090608]/96 px-5 py-4 shadow-[inset_0_-1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl">
          <h2 className="min-w-0 flex-1 truncate text-start text-xl font-semibold tracking-[-0.03em]">{title}</h2>
          <Button variant="ghost" onClick={onClose}>סגירה</Button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 pb-[calc(5rem+env(safe-area-inset-bottom,0px))]">{children}</div>
      </div>
    </div>
  );

  return mounted ? createPortal(sheet, document.body) : null;
}

export function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return <motion.div dir="auto" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="bidi-plain fixed left-1/2 top-[calc(env(safe-area-inset-top,0px)+0.8rem)] z-[90] w-[min(92vw,360px)] -translate-x-1/2 rounded-full border border-white/10 bg-zinc-950/92 px-4 py-2 text-center text-sm font-bold text-white shadow-2xl backdrop-blur-xl">{message}</motion.div>;
}

export function ConfirmDialog({ title, body, confirmLabel = "אישור", onConfirm, onCancel }: { title: string; body: string; confirmLabel?: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/62 px-4 backdrop-blur-sm">
      <Surface className="max-w-[360px] p-5">
        <h2 className="text-right text-xl font-black text-white">{title}</h2>
        <p className="mt-2 text-right text-sm leading-relaxed text-white/56">{body}</p>
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
    <div dir="rtl" className="flex gap-1 overflow-x-auto rounded-full bg-black/24 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.055)] no-scrollbar">
      {options.map((item) => <button key={item} onClick={() => onChange(item)} className={v6Cx("min-h-10 shrink-0 rounded-full px-4 text-xs font-black transition active:scale-95", value === item ? "bg-[linear-gradient(135deg,#fff7df,#f4d58d_52%,#dfffee)] text-zinc-950 shadow-[0_10px_22px_rgba(0,0,0,0.20)]" : "text-white/62")}>{item}</button>)}
    </div>
  );
}

export function ApprovalRequiredBadge() {
  return <span className="rounded-full bg-amber-200 px-2 py-1 text-[10px] font-black text-amber-950">דורש אישור</span>;
}

export function AIInsightCard({ insight }: { insight: AIInsight }) {
  const [expanded, setExpanded] = useState(false);
  const [approved, setApproved] = useState(false);
  const action = insight.requiresApproval ? "לאשר נוסח לפני שליחה" : insight.riskLevel === "high" ? "לטפל היום" : "לעקוב בהמשך";
  return (
    <div dir="rtl" className="rounded-[24px] bg-black/18 p-3.5 text-start shadow-[inset_0_1px_0_rgba(255,255,255,0.045)]">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <RtlText as="p" className="truncate text-[14px] font-bold text-white">{insight.title}</RtlText>
          <RtlText as="p" className="mt-1 line-clamp-2 text-[12px] leading-snug text-white/56">{insight.body}</RtlText>
        </div>
        {insight.requiresApproval ? <ApprovalRequiredBadge /> : <span className={v6Cx("shrink-0 rounded-full px-2 py-1 text-[10px] font-black", insight.riskLevel === "high" ? "bg-rose-300 text-rose-950" : insight.riskLevel === "medium" ? "bg-amber-200 text-amber-950" : "bg-emerald-200 text-emerald-950")}>{insight.riskLevel === "high" ? "דחוף" : insight.riskLevel === "medium" ? "לבדיקה" : "רגוע"}</span>}
      </div>
      {expanded ? <div className="mt-2 rounded-[16px] bg-white/[0.055] p-3 text-[12px] leading-relaxed text-white/55"><p>{aiSafetyNotice()}</p><p className="mt-2 font-bold text-white/72">פעולה מומלצת: {action}</p></div> : null}
      <div className="mt-2 flex items-center gap-2">
        <p className={v6Cx("min-w-0 flex-1 truncate text-[11px]", insight.requiresApproval ? "font-bold text-amber-100/75" : "text-white/38")}>{approved ? "אושר ידנית" : action}</p>
        <div className="flex shrink-0 gap-1.5">
          {insight.requiresApproval ? <button onClick={() => setApproved(true)} className="min-h-9 rounded-full bg-emerald-200 px-2.5 text-[11px] font-black text-emerald-950">{approved ? "מאושר" : "אישור"}</button> : null}
          <button onClick={() => setExpanded((value) => !value)} className="min-h-9 rounded-full bg-white/[0.06] px-2.5 text-[11px] font-bold text-white/62">{expanded ? "סגור" : "פירוט"}</button>
        </div>
      </div>
    </div>
  );
}

export function AISuggestionStack({ insights, title = "העוזרת החכמה", subtitle = "קצר, שימושי, עם אישור אנושי לפני פרסום." }: { insights: AIInsight[]; title?: string; subtitle?: string }) {
  return (
    <section dir="rtl" className={v6Cx("relative isolate overflow-hidden rounded-[30px] border border-[rgba(255,255,255,0.052)] bg-gradient-to-br p-4 text-start shadow-[0_18px_50px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.060)] backdrop-blur-xl", v6Tone.admin.grad)}>
      <div className="pointer-events-none absolute -left-16 -top-20 h-40 w-40 rounded-full bg-violet-200/8 blur-3xl" />
      <div className="flex items-start gap-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/[0.055] text-violet-100"><WandSparkles size={16} /></span>
        <div className="min-w-0 flex-1 text-start">
          <h2 className="text-[16px] font-semibold tracking-[-0.025em] text-white/88">{title}</h2>
          <p className="mt-1 text-[11px] leading-snug text-white/45">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1.5">{insights.map((insight) => <AIInsightCard key={insight.id} insight={insight} />)}</div>
    </section>
  );
}
