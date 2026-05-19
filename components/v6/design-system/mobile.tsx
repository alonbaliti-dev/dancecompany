"use client";

import { type ElementType, type ReactNode } from "react";
import { AlertTriangle, CalendarDays, ChevronLeft, DoorOpen, PencilLine, Sparkles, Users } from "lucide-react";
import { v6Cx, v6Interactive, v6Lovable, v6Motion, v6Safe, v6TimetableInteraction, v6TimetableSurface, v6Tone, type V6Tone } from "./tokens";
import { BidiNumber, SafeMeta, SafeTitle } from "./primitives";

export function MobileScreen({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={v6Cx(v6Safe.content, "flex flex-col gap-7 px-5 pb-32 pt-1", className)}>{children}</div>;
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
    <section dir="rtl" className="flex flex-col gap-1.5 text-start">
      <div className="flex items-start gap-2.5">
        {Icon ? <span className={v6Cx("mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full", v6Tone[tone].soft, v6Tone[tone].text)}><Icon size={14} strokeWidth={1.9} /></span> : null}
        <div className="min-w-0 flex-1">
          {kicker ? <SafeMeta as="p" className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/42">{kicker}</SafeMeta> : null}
          <SafeTitle as="h1" className="text-balance text-[30px] font-semibold leading-[1.1] tracking-[-0.045em] text-white">{title}</SafeTitle>
          {subtitle ? <SafeMeta as="p" className="mt-1 text-sm leading-relaxed text-white/50">{subtitle}</SafeMeta> : null}
        </div>
      </div>
      {action ? <div className="mt-2">{action}</div> : null}
    </section>
  );
}

export function MobileSection({ kicker, title, children, className, tone = "studio" }: { kicker?: ReactNode; title?: ReactNode; children: ReactNode; className?: string; tone?: V6Tone }) {
  return (
    <section dir="rtl" className={v6Cx("flex flex-col gap-3 text-start", className)}>
      {title || kicker ? (
        <div className="flex items-end justify-between gap-2 text-start">
          <div className="min-w-0">
            {kicker ? <SafeMeta as="p" className="text-[11px] font-semibold text-white/42">{kicker}</SafeMeta> : null}
            {title ? <SafeTitle as="h2" className="text-base font-semibold tracking-[-0.025em] text-white/92">{title}</SafeTitle> : null}
          </div>
          <span className={v6Cx("h-1.5 w-1.5 shrink-0 rounded-full", v6Tone[tone].soft)} aria-hidden="true" />
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function MobileList({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={v6Cx("flex flex-col gap-2", className)}>{children}</div>;
}

export function MobileListRow({
  icon: Icon,
  title,
  subtitle,
  meta,
  tone = "studio",
  onClick,
  trailing,
  ariaLabel,
  surfaceClassName
}: {
  icon?: ElementType;
  title: ReactNode;
  subtitle?: ReactNode;
  meta?: ReactNode;
  tone?: V6Tone;
  onClick?: () => void;
  trailing?: ReactNode;
  ariaLabel?: string;
  surfaceClassName?: string;
}) {
  const className = v6Cx(surfaceClassName ?? "glass", "group grid min-h-[62px] w-full grid-cols-[auto_1fr_auto] items-center gap-3 rounded-2xl p-3.5 text-start", v6Motion.standard, onClick && v6Motion.pressSoft, onClick && v6Motion.focusRing, onClick && v6Interactive.row);
  const content = (
    <>
      {Icon ? <span className={v6Cx("grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#f4d58d]/20 to-rose-200/10", v6Motion.iconPress, v6Tone[tone].text)}><Icon size={17} strokeWidth={1.8} aria-hidden="true" /></span> : <span />}
      <span className="min-w-0">
        <SafeTitle as="span" className="block truncate text-sm font-semibold tracking-[-0.012em] text-white/92">{title}</SafeTitle>
        {subtitle ? <SafeMeta as="span" className="mt-0.5 block truncate text-[11px] font-medium text-white/48">{subtitle}</SafeMeta> : null}
      </span>
      <span className="flex min-w-0 shrink-0 items-center gap-1.5 text-white/32">
        {meta ? <SafeMeta as="span" className="max-w-[6.4rem] truncate text-[10px] font-semibold text-white/42">{meta}</SafeMeta> : null}
        {trailing ?? (onClick ? <ChevronLeft size={15} strokeWidth={1.8} className="text-white/26 transition group-hover:text-white/46" aria-hidden="true" /> : null)}
      </span>
    </>
  );

  if (onClick) {
    return (
      <button dir="rtl" type="button" onClick={onClick} aria-label={ariaLabel ?? (typeof title === "string" ? title : undefined)} className={className}>
        {content}
      </button>
    );
  }

  return (
    <div dir="rtl" className={className}>
      {content}
    </div>
  );
}

export function LovableActionRow({
  icon: Icon,
  title,
  subtitle,
  trailing,
  tone = "studio",
  onClick,
  ariaLabel
}: {
  icon: ElementType;
  title: ReactNode;
  subtitle?: ReactNode;
  trailing?: ReactNode;
  tone?: V6Tone;
  onClick?: () => void;
  ariaLabel?: string;
}) {
  const Component = onClick ? "button" : "div";
  return (
    <Component
      dir="rtl"
      type={onClick ? "button" : undefined}
      onClick={onClick}
      aria-label={onClick ? ariaLabel ?? (typeof title === "string" ? title : undefined) : undefined}
      className={v6Cx(
        v6Lovable.card,
        "group grid w-full min-h-[60px] grid-cols-[auto_1fr_auto] items-center gap-3 rounded-2xl p-4 text-start",
        v6Motion.standard,
        onClick && v6Motion.pressSoft,
        onClick && v6Motion.focusRing,
        onClick && "touch-manipulation motion-safe:hover:bg-white/[0.060]"
      )}
    >
      <span className={v6Cx("grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#f4d58d]/20 to-rose-200/10", v6Tone[tone].text)}>
        <Icon size={17} strokeWidth={1.8} aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <SafeTitle as="span" className="block truncate text-sm font-semibold tracking-[-0.012em] text-white/92">{title}</SafeTitle>
        {subtitle ? <SafeMeta as="span" className="mt-0.5 block truncate text-[11px] text-white/48">{subtitle}</SafeMeta> : null}
      </span>
      <span className="flex shrink-0 items-center gap-1.5 text-white/30">
        {trailing ?? (onClick ? <ChevronLeft size={15} strokeWidth={1.8} className="text-white/26 transition group-hover:text-white/46" aria-hidden="true" /> : null)}
      </span>
    </Component>
  );
}

export function LovableEditorialPanel({
  kicker,
  title,
  description,
  trailing,
  children,
  className
}: {
  kicker?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  trailing?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section dir="rtl" className={v6Cx(v6Lovable.cardStrong, "flex flex-col gap-3 overflow-hidden p-5 text-start", className)}>
      {(kicker || title || description || trailing) ? (
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {kicker ? <SafeMeta as="p" className={v6Lovable.eyebrow}>{kicker}</SafeMeta> : null}
            {title ? <SafeTitle as="h2" className={v6Cx("mt-1 text-base font-semibold tracking-tight text-white/92", kicker && "mt-1.5") }>{title}</SafeTitle> : null}
            {description ? <SafeMeta as="p" className="mt-1.5 text-sm leading-relaxed text-white/48">{description}</SafeMeta> : null}
          </div>
          {trailing ? <div className="shrink-0">{trailing}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function MobileInfoTile({ icon: Icon, label, value, tone = "studio" }: { icon: ElementType; label: ReactNode; value: ReactNode; tone?: V6Tone }) {
  return (
    <div dir="rtl" className={v6Cx("min-w-0 rounded-[18px] border border-[#f4d58d]/[0.06] bg-black/[0.13] px-2.5 py-2 text-start", v6Safe.content)}>
      <div className="flex items-center justify-between gap-1 text-white/34">
        <SafeMeta as="span" className="text-[8.8px] font-semibold">{label}</SafeMeta>
        <Icon size={11.5} strokeWidth={1.8} aria-hidden="true" className={v6Tone[tone].text} />
      </div>
      <SafeTitle as="span" className="mt-1 block truncate text-[11.8px] font-semibold text-white/86">{value}</SafeTitle>
    </div>
  );
}

export function ManagementSummaryTile({ icon: Icon, label, value, meta, tone = "management", surfaceClassName }: { icon: ElementType; label: ReactNode; value: ReactNode; meta?: ReactNode; tone?: V6Tone; surfaceClassName?: string }) {
  return (
    <div dir="rtl" className={v6Cx(surfaceClassName ?? "glass", "flex min-w-0 flex-col gap-1.5 rounded-2xl p-4 text-start", v6Motion.gentle, surfaceClassName ? "motion-safe:hover:bg-white/[0.052] motion-safe:hover:shadow-[0_12px_30px_rgba(0,0,0,0.20),inset_0_1px_0_rgba(255,247,223,0.050)]" : "motion-safe:hover:bg-white/[0.070] motion-safe:hover:shadow-[0_16px_42px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,247,223,0.064)]")}>
      <div className="flex items-center justify-between gap-2 text-white/42">
        <SafeMeta as="span" className="truncate text-[11px] font-semibold uppercase tracking-[0.14em]">{label}</SafeMeta>
        <span className={v6Cx("shrink-0", v6Tone[tone].text)}>
          <Icon size={16} strokeWidth={1.8} aria-hidden="true" />
        </span>
      </div>
      <SafeTitle as="span" className="block truncate text-[26px] font-semibold leading-none tracking-[-0.04em] text-white">{value}</SafeTitle>
      {meta ? <SafeMeta as="span" className="block truncate text-[11px] font-medium text-white/48">{meta}</SafeMeta> : null}
    </div>
  );
}

export function LiveActivityRow({
  icon: Icon,
  title,
  subtitle,
  meta,
  stateLabel,
  tone = "studio",
  pulse = false,
  onClick,
  ariaLabel
}: {
  icon: ElementType;
  title: ReactNode;
  subtitle?: ReactNode;
  meta?: ReactNode;
  stateLabel: ReactNode;
  tone?: V6Tone;
  pulse?: boolean;
  onClick?: () => void;
  ariaLabel?: string;
}) {
  return (
    <button
      dir="rtl"
      type="button"
      onClick={onClick}
      aria-label={ariaLabel ?? (typeof title === "string" ? title : undefined)}
      className={v6Cx(
        "glass group grid min-h-[62px] w-full grid-cols-[auto_1fr_auto] items-center gap-3 overflow-hidden rounded-2xl p-3.5 text-start",
        v6Motion.standard,
        v6Motion.pressSoft,
        v6Motion.focusRing,
        onClick && v6Interactive.row
      )}
    >
      <span className="flex items-center gap-3">
        <span className={v6Cx("h-2 w-2 shrink-0 rounded-full", v6Tone[tone].soft, pulse && "animate-pulse")} aria-hidden="true" />
        <span className={v6Cx("grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#f4d58d]/20 to-rose-200/10", v6Motion.iconPress, v6Tone[tone].text)}>
          <Icon size={16} strokeWidth={1.8} aria-hidden="true" />
        </span>
      </span>
      <span className="min-w-0">
        <span className="flex items-center justify-between gap-2">
          <SafeTitle as="span" className="block truncate text-sm font-semibold tracking-[-0.012em] text-white/92">{title}</SafeTitle>
          <span className={v6Cx("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold", v6Tone[tone].soft, v6Tone[tone].text)}>{stateLabel}</span>
        </span>
        {subtitle ? <SafeMeta as="span" className="mt-0.5 block truncate text-[11px] font-medium text-white/48">{subtitle}</SafeMeta> : null}
      </span>
      <span className="flex min-w-0 shrink-0 items-center gap-1.5">
        {meta ? <SafeMeta as="span" className="max-w-[5.8rem] truncate text-[10px] font-semibold text-white/42">{meta}</SafeMeta> : null}
        {onClick ? <ChevronLeft size={15} strokeWidth={1.8} className="text-white/26 transition group-hover:text-white/46" aria-hidden="true" /> : null}
      </span>
    </button>
  );
}

export function OperationalAlertRow({
  icon: Icon,
  title,
  subtitle,
  meta,
  tone = "urgent",
  onClick,
  ariaLabel
}: {
  icon: ElementType;
  title: ReactNode;
  subtitle?: ReactNode;
  meta?: ReactNode;
  tone?: V6Tone;
  onClick?: () => void;
  ariaLabel?: string;
}) {
  return (
    <button
      dir="rtl"
      type="button"
      onClick={onClick}
      aria-label={ariaLabel ?? (typeof title === "string" ? title : undefined)}
      className={v6Cx(
        "glass group grid min-h-[62px] w-full grid-cols-[auto_1fr_auto] items-start gap-3 rounded-2xl p-3.5 text-start",
        v6Motion.standard,
        v6Motion.pressSoft,
        v6Motion.focusRing,
        onClick && v6Interactive.row
      )}
    >
      <span className={v6Cx("mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#f4d58d]/20 to-rose-200/10", v6Motion.iconPress, v6Tone[tone].text)}>
        <Icon size={17} strokeWidth={1.8} aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <SafeTitle as="span" className="block truncate text-sm font-semibold tracking-[-0.012em] text-white/92">{title}</SafeTitle>
        {subtitle ? <SafeMeta as="span" className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-white/48">{subtitle}</SafeMeta> : null}
      </span>
      <span className="flex min-w-0 shrink-0 items-center gap-1.5">
        {meta ? <SafeMeta as="span" className="max-w-[5.8rem] truncate text-[10px] font-semibold text-white/42">{meta}</SafeMeta> : null}
        {onClick ? <ChevronLeft size={15} strokeWidth={1.8} className="text-white/26 transition group-hover:text-white/46" aria-hidden="true" /> : null}
      </span>
    </button>
  );
}

export type WeeklyStudioDaySummary = {
  day: string;
  lessonCount: number;
  conflictCount?: number;
  isToday?: boolean;
  isActive?: boolean;
  firstTime?: ReactNode;
  onClick?: () => void;
};

export type WeeklyStudioConflictKind = "teacher_double_booking" | "room_conflict" | "group_overlap";

export type WeeklyStudioConflictIndicator = {
  id: string;
  kind: WeeklyStudioConflictKind;
  label: ReactNode;
  compactLabel: ReactNode;
  description?: string;
  overlapLabel?: ReactNode;
  actionLabel?: ReactNode;
};

export type WeeklyStudioConflictSummary = {
  kind: WeeklyStudioConflictKind;
  label: ReactNode;
  compactLabel: ReactNode;
  count: number;
};

const weeklyStudioConflictStyles: Record<WeeklyStudioConflictKind, { card: string; chip: string; dot: string; text: string }> = {
  teacher_double_booking: {
    card: "border-rose-300/24 bg-[linear-gradient(135deg,rgba(251,113,133,0.072),rgba(255,255,255,0.012)_58%,rgba(244,213,141,0.020))] shadow-[inset_0_1px_0_rgba(255,247,223,0.045),0_0_0_1px_rgba(251,113,133,0.032)]",
    chip: "border-rose-200/18 bg-rose-200/[0.095] text-rose-50",
    dot: "bg-rose-200",
    text: "text-rose-50"
  },
  room_conflict: {
    card: "border-[#f4d58d]/28 bg-[linear-gradient(135deg,rgba(244,213,141,0.080),rgba(255,255,255,0.012)_58%,rgba(125,211,252,0.020))] shadow-[inset_0_1px_0_rgba(255,247,223,0.052),0_0_0_1px_rgba(244,213,141,0.038)]",
    chip: "border-[#f4d58d]/20 bg-[#f4d58d]/[0.105] text-amber-50",
    dot: "bg-[#f4d58d]",
    text: "text-amber-50"
  },
  group_overlap: {
    card: "border-sky-200/24 bg-[linear-gradient(135deg,rgba(125,211,252,0.066),rgba(255,255,255,0.012)_58%,rgba(244,213,141,0.018))] shadow-[inset_0_1px_0_rgba(255,247,223,0.044),0_0_0_1px_rgba(125,211,252,0.034)]",
    chip: "border-sky-100/16 bg-sky-200/[0.088] text-sky-50",
    dot: "bg-sky-200",
    text: "text-sky-50"
  }
};

function weeklyStudioConflictTitle(conflicts: WeeklyStudioConflictIndicator[]) {
  return conflicts.map((conflict) => conflict.description).filter(Boolean).join("\n");
}

export function WeeklyStudioTimetableShell({
  weekLabel,
  lessonCount,
  roomCount,
  daySummaries,
  conflictSummary = [],
  actions,
  children
}: {
  weekLabel: ReactNode;
  lessonCount: number;
  roomCount: number;
  daySummaries: WeeklyStudioDaySummary[];
  conflictSummary?: WeeklyStudioConflictSummary[];
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div dir="rtl" className={v6Cx(v6Lovable.cardStrong, "flex min-w-0 flex-col gap-5 overflow-hidden p-5 text-start")}>
      <div className="flex min-w-0 flex-col gap-3 min-[380px]:flex-row min-[380px]:items-end min-[380px]:justify-between min-[380px]:gap-4">
        <div className="min-w-0">
          <SafeMeta as="p" className={v6Lovable.eyebrow}>מערכת שבועית</SafeMeta>
          <SafeTitle as="h2" className="mt-1.5 text-lg font-semibold tracking-tight text-white/94">סטודיו · עריכה חיה</SafeTitle>
          <SafeMeta as="p" className="mt-1.5 max-w-[22rem] text-sm leading-relaxed text-white/48">{weekLabel}</SafeMeta>
        </div>
        <span className="inline-flex min-h-8 shrink-0 items-center gap-2 self-start rounded-full bg-emerald-200/[0.08] px-3 text-[11px] font-semibold text-emerald-100/88 min-[380px]:self-auto">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 motion-safe:animate-pulse" />
          עריכה חיה
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <ManagementSummaryTile icon={CalendarDays} label="שיעורים" value={<BidiNumber>{lessonCount}</BidiNumber>} meta="במערכת השבועית" tone="management" surfaceClassName={v6TimetableSurface.summaryTile} />
        <ManagementSummaryTile icon={DoorOpen} label="חללים" value={<BidiNumber>{roomCount}</BidiNumber>} meta="בשימוש תפעולי" tone="repertoire" surfaceClassName={v6TimetableSurface.summaryTile} />
      </div>

      {actions ? <div>{actions}</div> : null}

      <div className="-mx-2 flex snap-x snap-mandatory gap-2.5 overflow-x-auto overscroll-x-contain px-2 pb-3 pt-0.5 motion-safe:scroll-smooth [scrollbar-width:none] [touch-action:pan-x] [&::-webkit-scrollbar]:hidden">
        {daySummaries.map((day) => {
          const active = Boolean(day.isActive);
          const content = (
            <>
              <span className={v6Cx("block text-xs font-semibold leading-none", active ? "text-zinc-950" : "text-white/70")}>{day.day}</span>
              <span className={v6Cx("mt-1.5 block text-[11px] font-medium leading-snug", active ? "text-zinc-950/62" : "text-white/40")}>
                <BidiNumber>{day.lessonCount}</BidiNumber> שיעורים{day.firstTime ? <> · {day.firstTime}</> : null}
              </span>
              {day.conflictCount ? (
                <span className={v6Cx("mt-1.5 inline-flex min-h-6 max-w-full items-center gap-1 rounded-full px-2 text-[11px] font-semibold leading-snug", active ? "bg-zinc-950/10 text-zinc-950/68" : "bg-rose-200/[0.09] text-rose-50/82")}>
                  <AlertTriangle size={9.5} strokeWidth={1.8} aria-hidden="true" />
                  <span className="truncate"><BidiNumber>{day.conflictCount}</BidiNumber> התנגשויות</span>
                </span>
              ) : null}
            </>
          );

          if (day.onClick) {
            return (
              <button
                key={day.day}
                type="button"
                onClick={day.onClick}
                aria-label={`מעבר ליום ${day.day} במערכת השבועית`}
                aria-pressed={active}
                className={v6Cx("min-h-[76px] min-w-[118px] max-w-[46vw] snap-start px-4 py-3", v6TimetableInteraction.dayChip, v6Motion.standard, v6Motion.pressSoft, v6Motion.focusRing, active ? v6TimetableInteraction.dayChipActive : v6TimetableSurface.dayChip, !active && v6TimetableInteraction.dayChipInactive)}
              >
                {content}
              </button>
            );
          }

          return (
            <span key={day.day} className={v6Cx("min-h-[76px] min-w-[118px] max-w-[46vw] snap-start px-4 py-3", v6TimetableInteraction.dayChip, active ? v6TimetableInteraction.dayChipActive : v6TimetableSurface.dayChip, !active && v6TimetableInteraction.dayChipDisabled)} aria-disabled="true">
              {content}
            </span>
          );
        })}
      </div>

      {conflictSummary.length ? (
        <div className="flex flex-wrap gap-2" aria-label="סיכום התנגשויות במערכת השבועית">
          {conflictSummary.map((item) => {
            const style = weeklyStudioConflictStyles[item.kind];
            return (
              <span key={item.kind} className={v6Cx("inline-flex min-h-8 max-w-full items-center gap-1.5 rounded-full border px-3 text-[11px] font-semibold leading-snug shadow-[inset_0_1px_0_rgba(255,247,223,0.030)]", v6TimetableInteraction.conflictSummaryChip, style.chip)} title={`${item.label}: ${item.count}`}>
                <span className={v6Cx("h-1.5 w-1.5 rounded-full opacity-80", style.dot)} aria-hidden="true" />
                <span className="min-w-0 truncate">{item.compactLabel}</span>
                <BidiNumber>{item.count}</BidiNumber>
              </span>
            );
          })}
        </div>
      ) : null}

      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}

export function WeeklyStudioDayLane({
  day,
  isToday,
  lessonCount,
  conflictCount = 0,
  rooms,
  totalStudents,
  densityLabel,
  children
}: {
  day: ReactNode;
  isToday?: boolean;
  lessonCount: number;
  conflictCount?: number;
  rooms: ReactNode[];
  totalStudents: number;
  densityLabel?: ReactNode;
  children: ReactNode;
}) {
  return (
    <article dir="rtl" className="flex flex-col gap-3.5 text-start">
      <div className="flex min-w-0 flex-col gap-2.5 min-[390px]:flex-row min-[390px]:items-start min-[390px]:justify-between min-[390px]:gap-3">
        <div className="min-w-0">
          <SafeTitle as="h3" className="flex min-w-0 flex-wrap items-center gap-2 text-[15px] font-semibold tracking-[-0.018em] text-white/90">
            {conflictCount ? <AlertTriangle size={12} strokeWidth={1.9} className="text-rose-50" aria-hidden="true" /> : <CalendarDays size={12} strokeWidth={1.9} className={isToday ? "text-[#f4d58d]" : "text-white/34"} aria-hidden="true" />}
            {isToday ? <>היום · {day}</> : day}
          </SafeTitle>
          <SafeMeta as="p" className="mt-1.5 text-xs font-medium leading-relaxed text-white/42">
            <BidiNumber>{lessonCount}</BidiNumber> שיעורים · <BidiNumber>{totalStudents}</BidiNumber> תלמידות{densityLabel ? <> · {densityLabel}</> : null}{conflictCount ? <> · <BidiNumber>{conflictCount}</BidiNumber> התנגשויות</> : null}
          </SafeMeta>
        </div>
        <div className="flex max-w-full flex-wrap justify-start gap-1.5 min-[390px]:max-w-[48%] min-[390px]:justify-end">
          {rooms.slice(0, 2).map((room, index) => (
            <span key={`${String(room)}-${index}`} className="inline-flex min-h-7 max-w-full items-center gap-1.5 rounded-full bg-white/[0.042] px-2.5 text-[11px] font-medium text-white/56">
              <DoorOpen size={10.5} strokeWidth={1.8} aria-hidden="true" />
              <span className="min-w-0 truncate">{room}</span>
            </span>
          ))}
          {rooms.length > 2 ? (
            <span className="inline-flex min-h-7 items-center rounded-full bg-white/[0.030] px-2.5 text-[11px] font-medium text-white/44">
              +<BidiNumber>{rooms.length - 2}</BidiNumber>
            </span>
          ) : null}
        </div>
      </div>
      <div className={v6Cx("relative flex flex-col gap-3 scroll-py-3 pb-2 pr-3", lessonCount > 5 && "scroll-touch max-h-[62dvh] overflow-y-auto overscroll-contain motion-safe:scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden")}>
        <span aria-hidden className="absolute bottom-2 right-[5px] top-2 w-px bg-gradient-to-b from-white/[0.024] via-white/[0.085] to-white/[0.024]" />
        {children}
      </div>
    </article>
  );
}

export function WeeklyStudioLessonCard({
  groupName,
  groupMeta,
  danceStyle,
  teacher,
  room,
  startTime,
  endTime,
  durationLabel,
  durationMinutes,
  studentCount,
  status,
  statusTone = "management",
  tone = "management",
  conflictIndicators = [],
  conflictActions,
  onClick,
  ariaLabel
}: {
  groupName: ReactNode;
  groupMeta?: ReactNode;
  danceStyle: ReactNode;
  teacher: ReactNode;
  room: ReactNode;
  startTime: ReactNode;
  endTime: ReactNode;
  durationLabel: ReactNode;
  durationMinutes: number;
  studentCount: number;
  status: ReactNode;
  statusTone?: V6Tone;
  tone?: V6Tone;
  conflictIndicators?: WeeklyStudioConflictIndicator[];
  conflictActions?: ReactNode;
  onClick?: () => void;
  ariaLabel?: string;
}) {
  const safeDuration = Math.max(30, Math.min(durationMinutes, 120));
  const railHeight = Math.max(26, Math.min(64, Math.round(safeDuration * 0.52)));
  const cardMinHeight = Math.max(92, Math.min(116, Math.round(safeDuration * 0.86)));
  const primaryConflict = conflictIndicators[0];
  const primaryConflictStyle = primaryConflict ? weeklyStudioConflictStyles[primaryConflict.kind] : undefined;
  const conflictTitle = weeklyStudioConflictTitle(conflictIndicators);
  const fullAriaLabel = [ariaLabel, conflictTitle].filter(Boolean).join(" · ");

  return (
    <button
      dir="rtl"
      type="button"
      onClick={onClick}
      aria-label={fullAriaLabel || undefined}
      title={conflictTitle || undefined}
      data-conflict-count={conflictIndicators.length || undefined}
      data-conflict-kind={primaryConflict?.kind}
      style={{ minHeight: `${cardMinHeight}px` }}
      className={v6Cx(v6TimetableSurface.lessonCard, "group relative mr-5 flex w-[calc(100%-1.25rem)] items-stretch gap-3 overflow-hidden rounded-[22px] p-3.5 text-start sm:gap-3.5 sm:p-4", primaryConflictStyle?.card, v6Motion.standard, v6Motion.pressSoft, v6Motion.focusRing, onClick && v6Interactive.card, onClick && v6TimetableInteraction.lessonCard)}
    >
      <span className={v6Cx("absolute right-[-1.38rem] top-4 h-2.5 w-2.5 rounded-full shadow-[0_0_0_4px_rgba(255,255,255,0.018)] transition-transform duration-200 motion-reduce:transition-none group-hover:scale-110", primaryConflictStyle?.dot ?? v6Tone[tone].soft)} aria-hidden="true" />
      <span className={v6Cx("relative w-1 shrink-0 rounded-full shadow-[0_0_12px_rgba(244,213,141,0.040)]", primaryConflictStyle?.dot ?? v6Tone[tone].soft)} style={{ minHeight: `${railHeight}px` }} aria-hidden="true" />
      <span className={v6Cx("relative flex min-h-16 w-[3.9rem] shrink-0 flex-col items-center justify-center rounded-2xl py-2 transition-colors duration-200 motion-reduce:transition-none group-hover:bg-white/[0.044] sm:w-[4.35rem]", v6TimetableSurface.lessonInset)}>
        <SafeMeta as="span" className="text-[11px] font-semibold text-white/40">{durationLabel}</SafeMeta>
        <SafeTitle as="span" className="mt-1 text-base font-semibold tracking-[-0.018em] text-white">{startTime}</SafeTitle>
        <SafeMeta as="span" className="mt-0.5 text-[11px] font-medium text-white/38">{endTime}</SafeMeta>
      </span>

      <span className="relative min-w-0 flex-1">
        <span className="flex min-w-0 flex-col gap-2 min-[390px]:flex-row min-[390px]:items-start min-[390px]:justify-between">
          <span className="min-w-0 flex-1">
            <SafeTitle as="span" className="block text-[15px] font-semibold leading-tight tracking-[-0.020em] text-white/94">{groupName}</SafeTitle>
            {groupMeta ? <SafeMeta as="span" className="mt-1 block truncate text-xs font-medium text-white/46">{groupMeta}</SafeMeta> : null}
            {conflictIndicators.length ? (
              <span className="mt-1.5 flex flex-wrap gap-1.5" aria-label="התנגשויות בשיעור">
                {conflictIndicators.slice(0, 2).map((conflict) => {
                  const style = weeklyStudioConflictStyles[conflict.kind];
                  return (
                    <span key={conflict.id} className={v6Cx("inline-flex min-h-7 max-w-full items-center gap-1 rounded-full border px-2 text-[11px] font-semibold leading-snug", v6TimetableInteraction.conflictChip, style.chip)} title={conflict.description}>
                      <AlertTriangle size={9.5} strokeWidth={1.8} aria-hidden="true" />
                      <span className="truncate">{conflict.compactLabel}</span>
                      {conflict.overlapLabel ? <span className="text-white/42">{conflict.overlapLabel}</span> : null}
                    </span>
                  );
                })}
                {conflictIndicators.length > 2 ? (
                  <span className="inline-flex min-h-7 items-center rounded-full bg-black/16 px-2 text-[11px] font-semibold text-white/50">
                    +<BidiNumber>{conflictIndicators.length - 2}</BidiNumber>
                  </span>
                ) : null}
              </span>
            ) : null}
          </span>
          <span className={v6Cx("inline-flex min-h-8 max-w-full shrink-0 items-center gap-1.5 self-start rounded-full px-2.5 text-[11px] font-semibold text-white/64 transition-colors duration-200 motion-reduce:transition-none group-hover:bg-white/[0.060] group-hover:text-white/74", v6TimetableSurface.lessonPill)}>
            <DoorOpen size={10.5} strokeWidth={1.8} aria-hidden="true" />
            <span className="min-w-0 truncate">{room}</span>
          </span>
        </span>

        <span className="mt-2 flex min-w-0 flex-wrap gap-1.5">
          <span className={v6Cx("inline-flex min-h-7 max-w-full items-center gap-1.5 rounded-full px-2.5 text-[11px] font-semibold", v6Tone[tone].soft, v6Tone[tone].text)}>
            <Sparkles size={10.5} strokeWidth={1.8} aria-hidden="true" />
            <span className="truncate">{danceStyle}</span>
          </span>
          <span className={v6Cx("inline-flex min-h-7 max-w-full items-center gap-1.5 rounded-full px-2.5 text-[11px] font-medium text-white/46", v6TimetableSurface.lessonPill)}>
            <Users size={10.5} strokeWidth={1.8} aria-hidden="true" />
            <BidiNumber>{studentCount}</BidiNumber> תלמידות
          </span>
        </span>

        <span className={v6Cx("mt-2 grid min-h-10 grid-cols-1 items-center gap-2 rounded-2xl px-2.5 py-1.5 transition-colors duration-200 motion-reduce:transition-none group-hover:bg-white/[0.046] min-[390px]:grid-cols-[1fr_auto]", v6TimetableSurface.lessonInset)}>
          <SafeMeta as="span" className="min-w-0 break-words text-xs font-medium leading-relaxed text-white/52">מורה: {teacher}</SafeMeta>
          <span className={v6Cx("inline-flex min-h-7 max-w-full items-center gap-1.5 justify-self-start rounded-full px-2.5 py-1 text-[11px] font-semibold leading-snug min-[390px]:justify-self-end", v6Tone[statusTone].soft, v6Tone[statusTone].text)}>
            <PencilLine size={10} strokeWidth={1.8} aria-hidden="true" />
            <span className="min-w-0 truncate">{status}</span>
          </span>
        </span>
        {conflictIndicators.length ? (
          <span className={v6Cx("mt-2 flex min-h-9 flex-col gap-1.5 rounded-2xl border px-2.5 py-2 text-[11px] font-semibold leading-snug min-[390px]:flex-row min-[390px]:items-center min-[390px]:justify-between min-[390px]:gap-2", primaryConflictStyle?.chip)}>
            <span className="min-w-0 break-words">{primaryConflict?.description}</span>
            <span className="shrink-0 text-white/55">{conflictActions ?? primaryConflict?.actionLabel}</span>
          </span>
        ) : null}
      </span>
    </button>
  );
}

export function WeeklyTimetableCard({ day, isToday, lessonCount, children }: { day: ReactNode; isToday?: boolean; lessonCount: number; children: ReactNode }) {
  return (
    <article dir="rtl" className={v6Cx("rounded-[22px] border p-2 text-start", isToday ? "border-[#f4d58d]/22 bg-[#f4d58d]/[0.055]" : "border-[#f4d58d]/[0.050] bg-black/[0.10]")}>
      <div className="mb-2 flex items-center justify-between gap-2 px-1">
        <SafeTitle as="h3" className="text-[13px] font-semibold text-white/84">{isToday ? <>היום · {day}</> : day}</SafeTitle>
        <SafeMeta as="span" className="text-[9px] font-semibold text-white/36"><BidiNumber>{lessonCount}</BidiNumber> שיעורים</SafeMeta>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">{children}</div>
    </article>
  );
}

export function RoomAllocationTile({
  room,
  next,
  groupCount,
  active = false,
  onClick,
  ariaLabel
}: {
  room: ReactNode;
  next?: ReactNode;
  groupCount: number;
  active?: boolean;
  onClick?: () => void;
  ariaLabel?: string;
}) {
  return (
    <button
      dir="rtl"
      type="button"
      onClick={onClick}
      aria-label={ariaLabel ?? (typeof room === "string" ? `פתיחת חדר ${room}` : undefined)}
      className={v6Cx("glass group flex min-h-[64px] w-full items-center justify-between gap-3 rounded-2xl p-3.5 text-start", v6Motion.standard, v6Motion.pressSoft, v6Motion.focusRing, onClick && v6Interactive.row)}
    >
      <span className="flex min-w-0 flex-col">
        <span className="flex min-w-0 items-center gap-2">
          <SafeTitle as="span" className="block truncate text-sm font-semibold text-white/92">{room}</SafeTitle>
          <SafeMeta as="span" className="shrink-0 text-[10px] text-white/42">· {groupCount} קבוצות</SafeMeta>
        </span>
        {next ? <SafeMeta as="span" className="mt-0.5 block truncate text-[11px] font-medium text-white/48">{active ? `מתקיים/הבא: ${next}` : next}</SafeMeta> : null}
      </span>
      <span className={v6Cx("shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold", active ? "bg-emerald-100 text-emerald-950" : "bg-white/[0.060] text-white/48")}>
        {active ? "תפוס" : "פנוי"}
      </span>
    </button>
  );
}

export function AttachedPrimaryAction({ label, title, cta, onClick }: { label: ReactNode; title: ReactNode; cta: ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className={v6Cx("grid w-full grid-cols-[1fr_auto] items-center gap-2 rounded-[13px] border border-[#f4d58d]/10 bg-[#f4d58d]/[0.040] p-2 text-start", v6Motion.standard, v6Motion.pressSoft, v6Motion.focusRing, v6Interactive.row)}>
      <span className="min-w-0">
        <SafeMeta as="span" className="block text-[9.2px] font-semibold text-white/36">{label}</SafeMeta>
        <SafeTitle as="span" className="mt-px block truncate text-[12px] font-semibold text-white/86">{title}</SafeTitle>
      </span>
      <span className="rounded-full bg-[#f4d58d] px-2.5 py-0.5 text-[9.5px] font-semibold text-zinc-950">{cta}</span>
    </button>
  );
}
