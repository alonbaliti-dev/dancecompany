"use client";

import { type ElementType, type ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { v6Cx, v6Surface, v6Tone, v6Type, type V6Tone } from "./tokens";
import { SafeMeta, SafeTitle } from "./primitives";

export function MobileScreen({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={v6Cx("space-y-1.5", className)}>{children}</div>;
}

export function MobileIntro({
  kicker,
  title,
  subtitle,
  icon: Icon,
  tone = "studio",
  action
}: {
  kicker?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: ElementType;
  tone?: V6Tone;
  action?: ReactNode;
}) {
  return (
    <section dir="rtl" className={v6Cx("lk-safe-surface overflow-hidden rounded-[15px] border p-2 text-start", v6Surface.base)}>
      <div className="flex items-center gap-2">
        {Icon ? <span className={v6Cx("grid h-7 w-7 shrink-0 place-items-center rounded-[12px]", v6Tone[tone].soft, v6Tone[tone].text)}><Icon size={13.5} strokeWidth={1.9} /></span> : null}
        <div className="min-w-0 flex-1">
          {kicker ? <SafeMeta as="p" className={v6Type.kicker}>{kicker}</SafeMeta> : null}
          <SafeTitle as="h1" className="mt-px truncate text-[15.5px] font-semibold leading-tight tracking-[-0.020em] text-white">{title}</SafeTitle>
          {subtitle ? <SafeMeta as="p" className="mt-px truncate text-[10.5px] leading-relaxed text-white/50">{subtitle}</SafeMeta> : null}
        </div>
      </div>
      {action ? <div className="mt-1.5">{action}</div> : null}
    </section>
  );
}

export function MobileSection({ kicker, title, children, className, tone = "studio" }: { kicker?: ReactNode; title?: ReactNode; children: ReactNode; className?: string; tone?: V6Tone }) {
  return (
    <section dir="rtl" className={v6Cx("lk-safe-surface overflow-hidden rounded-[14px] border p-1.5", v6Surface.open, className)}>
      {title || kicker ? (
        <div className="mb-1.5 flex items-center justify-between gap-2 px-0.5 text-start">
          <div className="min-w-0">
            {kicker ? <SafeMeta as="p" className={v6Type.kicker}>{kicker}</SafeMeta> : null}
            {title ? <SafeTitle as="h2" className="mt-px text-[12.5px] font-semibold tracking-[-0.012em] text-white/78">{title}</SafeTitle> : null}
          </div>
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function MobileList({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={v6Cx("divide-y divide-[#f4d58d]/[0.045] overflow-hidden rounded-[13px] border border-[#f4d58d]/[0.040] bg-black/[0.06]", className)}>{children}</div>;
}

export function MobileListRow({
  icon: Icon,
  title,
  subtitle,
  meta,
  tone = "studio",
  onClick,
  trailing
}: {
  icon?: ElementType;
  title: ReactNode;
  subtitle?: ReactNode;
  meta?: ReactNode;
  tone?: V6Tone;
  onClick?: () => void;
  trailing?: ReactNode;
}) {
  const Component = onClick ? "button" : "div";
  return (
    <Component dir="rtl" onClick={onClick} className="group grid min-h-[38px] w-full grid-cols-[auto_1fr_auto] items-center gap-1.5 px-1.5 py-1.5 text-start transition active:scale-[0.99]">
      {Icon ? <span className={v6Cx("grid h-6 w-6 shrink-0 place-items-center rounded-[10px]", v6Tone[tone].soft, v6Tone[tone].text)}><Icon size={11.5} strokeWidth={1.9} /></span> : <span />}
      <span className="min-w-0">
        <SafeTitle as="span" className="block truncate text-[11.8px] font-semibold tracking-[-0.008em] text-white/82">{title}</SafeTitle>
        {subtitle ? <SafeMeta as="span" className="mt-px block truncate text-[9.3px] font-medium text-white/38">{subtitle}</SafeMeta> : null}
      </span>
      <span className="flex min-w-0 shrink-0 items-center gap-1.5 text-white/32">
        {meta ? <SafeMeta as="span" className="max-w-[5.5rem] truncate text-[10px] font-semibold text-white/36">{meta}</SafeMeta> : null}
        {trailing ?? (onClick ? <ChevronLeft size={15} strokeWidth={1.8} className="text-white/24 transition group-hover:text-white/40" /> : null)}
      </span>
    </Component>
  );
}

export function AttachedPrimaryAction({ label, title, cta, onClick }: { label: ReactNode; title: ReactNode; cta: ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className="grid w-full grid-cols-[1fr_auto] items-center gap-2 rounded-[12px] border border-[#f4d58d]/7 bg-[#f4d58d]/[0.030] p-1.5 text-start transition active:scale-[0.99]">
      <span className="min-w-0">
        <SafeMeta as="span" className="block text-[10px] font-semibold text-white/38">{label}</SafeMeta>
        <SafeTitle as="span" className="mt-px block truncate text-[12.5px] font-semibold text-white/86">{title}</SafeTitle>
      </span>
      <span className="rounded-full bg-[#f4d58d] px-2.5 py-0.5 text-[10px] font-semibold text-zinc-950">{cta}</span>
    </button>
  );
}
