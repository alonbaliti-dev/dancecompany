"use client";

import { useState, type ElementType, type ReactNode } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, WandSparkles } from "lucide-react";
import { aiSafetyNotice } from "@/lib/ai/ai-orchestrator";
import type { AIInsight } from "@/lib/ai/ai-types";
import { v6Cx, v6Surface, v6Tone, type V6Tone } from "./tokens";

export function Surface({ children, tone = "studio", className }: { children: ReactNode; tone?: V6Tone; className?: string }) {
  return <section className={v6Cx("mx-auto w-full max-w-full overflow-hidden rounded-[26px] border border-white/[0.055] p-3.5", v6Surface.base, className)}>{children}</section>;
}

export function HeroSurface({ children, tone = "studio", className }: { children: ReactNode; tone?: V6Tone; className?: string }) {
  return <section className={v6Cx("relative isolate overflow-hidden rounded-[34px] bg-gradient-to-br px-4 py-4 shadow-[0_26px_70px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,0.1)]", v6Tone[tone].grad, className)}>{children}</section>;
}

export function Widget({ title, kicker, icon: Icon, tone = "studio", children }: { title: string; kicker: string; icon: ElementType; tone?: V6Tone; children: ReactNode }) {
  return (
    <section className={v6Cx("overflow-hidden rounded-[29px] p-3.5", v6Surface.elevated)}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-[11px] font-black text-white/38">{kicker}</span>
        <div className="flex min-w-0 items-center gap-2 text-right">
          <h2 className="truncate text-[16px] font-black tracking-[-0.035em] text-white">{title}</h2>
          <span className={v6Cx("grid h-8 w-8 shrink-0 place-items-center rounded-full", v6Tone[tone].soft, v6Tone[tone].text)}><Icon size={15} /></span>
        </div>
      </div>
      {children}
    </section>
  );
}

export function FeedRow({ icon: Icon, title, body, meta, tone = "studio" }: { icon: ElementType; title: string; body: string; meta: string; tone?: V6Tone }) {
  return (
    <div className={v6Cx("flex items-center gap-3 rounded-[21px] px-3 py-2.5 text-right", v6Surface.quiet)}>
      <span className={v6Cx("grid h-9 w-9 shrink-0 place-items-center rounded-full", v6Tone[tone].soft, v6Tone[tone].text)}><Icon size={15} /></span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-bold text-white">{title}</span>
        <span className="mt-0.5 block truncate text-[12px] text-white/46">{body}</span>
      </span>
      <span className="shrink-0 rounded-full bg-white/[0.06] px-2 py-1 text-[10px] font-black text-white/42">{meta}</span>
    </div>
  );
}

export function ActionPill({ icon: Icon, title, subtitle, tone = "studio", onClick }: { icon: ElementType; title: string; subtitle?: string; tone?: V6Tone; onClick?: () => void }) {
  return (
    <button onClick={onClick} className={v6Cx("grid min-h-[72px] min-w-[66px] shrink-0 place-items-center rounded-[24px] px-2 text-center transition active:scale-[0.97]", v6Surface.quiet)}>
      <span className={v6Cx("grid h-11 w-11 place-items-center rounded-full shadow-[0_10px_24px_rgba(0,0,0,0.18)]", v6Tone[tone].soft, v6Tone[tone].text)}><Icon size={18} /></span>
      <span className="mt-1 text-[11px] font-black text-white">{title}</span>
      {subtitle ? <span className="-mt-0.5 text-[9px] font-bold text-white/38">{subtitle}</span> : null}
    </button>
  );
}

export function StatusBadge({ children, tone = "studio" }: { children: ReactNode; tone?: V6Tone }) {
  return <span className={v6Cx("inline-flex max-w-full items-center rounded-full px-2.5 py-1 text-[11px] font-bold shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]", v6Tone[tone].soft, v6Tone[tone].text)}>{children}</span>;
}

export function Button({ children, onClick, variant = "primary", disabled, type = "button" }: { children: ReactNode; onClick?: () => void; variant?: "primary" | "ghost" | "danger"; disabled?: boolean; type?: "button" | "submit" }) {
  return (
    <button type={type} disabled={disabled} onClick={onClick} className={v6Cx("inline-flex min-h-11 max-w-full items-center justify-center gap-1.5 rounded-[18px] px-4 py-2 text-sm font-bold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45", variant === "primary" && "bg-[linear-gradient(135deg,#fbfff8,#baf7dc_44%,#4fd1c5)] text-zinc-950 shadow-[0_12px_26px_rgba(45,212,191,0.18)]", variant === "ghost" && "bg-white/[0.065] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]", variant === "danger" && "bg-rose-500/14 text-rose-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]")}>
      {children}
    </button>
  );
}

export function FormField({ label, value, onChange, type = "text", placeholder }: { label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string }) {
  return (
    <label className="block text-right">
      <span className="text-[12px] font-bold text-white/50">{label}</span>
      <input value={value} type={type} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className="mt-2 min-h-[54px] w-full rounded-[22px] border border-white/[0.065] bg-white/[0.075] px-4 text-right text-[16px] text-white outline-none placeholder:text-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.055)] focus:border-emerald-100/22 focus:bg-white/[0.105]" />
    </label>
  );
}

export function BottomSheet({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-end bg-black/62 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] backdrop-blur-sm md:hidden">
      <motion.div initial={{ y: 36, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="max-h-[86dvh] w-full overflow-hidden rounded-[30px] bg-zinc-950 shadow-[0_28px_90px_rgba(0,0,0,0.58),inset_0_1px_0_rgba(255,255,255,0.08)]">
        <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-5 py-4">
          <Button variant="ghost" onClick={onClose}>סגירה</Button>
          <h2 className="text-right text-xl font-semibold tracking-[-0.03em]">{title}</h2>
        </div>
        <div className="max-h-[calc(86dvh-5rem)] overflow-y-auto p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))]">{children}</div>
      </motion.div>
    </div>
  );
}

export function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="fixed left-1/2 top-[calc(env(safe-area-inset-top,0px)+0.8rem)] z-[90] w-[min(92vw,360px)] -translate-x-1/2 rounded-full border border-white/10 bg-zinc-950/92 px-4 py-2 text-center text-sm font-bold text-white shadow-2xl backdrop-blur-xl">{message}</motion.div>;
}

export function ConfirmDialog({ title, body, confirmLabel = "אישור", onConfirm, onCancel }: { title: string; body: string; confirmLabel?: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/62 px-4 backdrop-blur-sm">
      <Surface className="max-w-[360px] p-5">
        <h2 className="text-right text-xl font-black text-white">{title}</h2>
        <p className="mt-2 text-right text-sm leading-relaxed text-white/56">{body}</p>
        <div className="mt-5 flex justify-between gap-2">
          <Button variant="ghost" onClick={onCancel}>ביטול</Button>
          <Button variant="danger" onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </Surface>
    </div>
  );
}

export function SegmentedControl({ value, options, onChange }: { value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <div className="flex gap-1 overflow-x-auto rounded-full bg-black/18 p-1 no-scrollbar">
      {options.map((item) => <button key={item} onClick={() => onChange(item)} className={v6Cx("min-h-10 shrink-0 rounded-full px-3 text-xs font-bold transition active:scale-95", value === item ? "bg-white text-zinc-950" : "text-white/62")}>{item}</button>)}
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
    <div className="rounded-[20px] bg-black/18 p-3 text-right shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
      <div className="flex items-start justify-between gap-3">
        {insight.requiresApproval ? <ApprovalRequiredBadge /> : <span className={v6Cx("shrink-0 rounded-full px-2 py-1 text-[10px] font-black", insight.riskLevel === "high" ? "bg-rose-300 text-rose-950" : insight.riskLevel === "medium" ? "bg-amber-200 text-amber-950" : "bg-emerald-200 text-emerald-950")}>{insight.riskLevel === "high" ? "דחוף" : insight.riskLevel === "medium" ? "לבדיקה" : "רגוע"}</span>}
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-bold text-white">{insight.title}</p>
          <p className="mt-1 line-clamp-2 text-[12px] leading-snug text-white/56">{insight.body}</p>
        </div>
      </div>
      {expanded ? <div className="mt-2 rounded-[16px] bg-white/[0.055] p-3 text-[12px] leading-relaxed text-white/55"><p>{aiSafetyNotice()}</p><p className="mt-2 font-bold text-white/72">פעולה מומלצת: {action}</p></div> : null}
      <div className="mt-2 flex items-center justify-between gap-2">
        <p className={v6Cx("truncate text-[11px]", insight.requiresApproval ? "font-bold text-amber-100/75" : "text-white/38")}>{approved ? "אושר ידנית" : action}</p>
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
    <section className={v6Cx("overflow-hidden rounded-[30px] bg-gradient-to-br p-3.5 shadow-[0_22px_58px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.075)] backdrop-blur-2xl", v6Tone.admin.grad)}>
      <div className="flex items-start justify-between gap-3">
        <div className="max-w-[12rem] text-right">
          <h2 className="text-[16px] font-black tracking-[-0.035em] text-white">{title}</h2>
          <p className="mt-1 text-[11px] leading-snug text-white/45">{subtitle}</p>
        </div>
        <span className="grid h-9 w-9 place-items-center rounded-full bg-white/[0.075] text-violet-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"><WandSparkles size={17} /></span>
      </div>
      <div className="mt-3 space-y-1.5">{insights.map((insight) => <AIInsightCard key={insight.id} insight={insight} />)}</div>
    </section>
  );
}
