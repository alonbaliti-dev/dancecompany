"use client";

import { type ElementType, type ReactNode } from "react";
import { AlertTriangle, CalendarDays, ChevronLeft, Clock3, DoorOpen, PencilLine, Sparkles, Users } from "lucide-react";
import { v6Cx, v6Interactive, v6Motion, v6Radius, v6Safe, v6Space, v6Surface, v6Tone, v6Type, type V6Tone } from "./tokens";
import { BidiNumber, SafeMeta, SafeTitle } from "./primitives";

export function MobileScreen({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={v6Cx(v6Safe.content, "space-y-2", className)}>{children}</div>;
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
    <section dir="rtl" className={v6Cx("lk-safe-surface overflow-hidden border text-start", v6Radius.row, v6Space.compactCard, v6Surface.glass)}>
      <div className={v6Cx("pointer-events-none absolute -left-12 -top-14 z-0 h-24 w-24 rounded-full opacity-7 blur-3xl", v6Tone[tone].beam)} />
      <div className="flex items-center gap-2">
        {Icon ? <span className={v6Cx("grid h-7 w-7 shrink-0 place-items-center rounded-[11px] border border-white/[0.035] shadow-[inset_0_1px_0_rgba(255,247,223,0.045)]", v6Tone[tone].soft, v6Tone[tone].text)}><Icon size={12} strokeWidth={1.9} /></span> : null}
        <div className="min-w-0 flex-1">
          {kicker ? <SafeMeta as="p" className={v6Type.kicker}>{kicker}</SafeMeta> : null}
          <SafeTitle as="h1" className="mt-px truncate text-[14.5px] font-semibold leading-tight tracking-[-0.018em] text-white">{title}</SafeTitle>
          {subtitle ? <SafeMeta as="p" className="mt-px truncate text-[9.8px] leading-snug text-white/46">{subtitle}</SafeMeta> : null}
        </div>
      </div>
      {action ? <div className="mt-1">{action}</div> : null}
    </section>
  );
}

export function MobileSection({ kicker, title, children, className, tone = "studio" }: { kicker?: ReactNode; title?: ReactNode; children: ReactNode; className?: string; tone?: V6Tone }) {
  return (
    <section dir="rtl" className={v6Cx("lk-safe-surface overflow-hidden border p-1.5", v6Radius.row, v6Surface.open, className)}>
      <div className={v6Cx("pointer-events-none absolute -right-10 top-0 z-0 h-20 w-20 rounded-full opacity-5 blur-3xl", v6Tone[tone].beam)} />
      {title || kicker ? (
        <div className="mb-1 flex items-center justify-between gap-2 px-0.5 text-start">
          <div className="min-w-0">
            {kicker ? <SafeMeta as="p" className={v6Type.kicker}>{kicker}</SafeMeta> : null}
            {title ? <SafeTitle as="h2" className="mt-px text-[12px] font-semibold tracking-[-0.010em] text-white/76">{title}</SafeTitle> : null}
          </div>
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function MobileList({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={v6Cx("divide-y divide-[#f4d58d]/[0.045] overflow-hidden rounded-[15px] border", v6Surface.inset, className)}>{children}</div>;
}

export function MobileListRow({
  icon: Icon,
  title,
  subtitle,
  meta,
  tone = "studio",
  onClick,
  trailing,
  ariaLabel
}: {
  icon?: ElementType;
  title: ReactNode;
  subtitle?: ReactNode;
  meta?: ReactNode;
  tone?: V6Tone;
  onClick?: () => void;
  trailing?: ReactNode;
  ariaLabel?: string;
}) {
  const className = v6Cx("group grid min-h-12 w-full grid-cols-[auto_1fr_auto] items-center gap-2 rounded-[13px] px-2 py-2 text-start", v6Motion.standard, onClick && v6Motion.pressSoft, onClick && v6Motion.focusRing, onClick && v6Interactive.row);
  const content = (
    <>
      {Icon ? <span className={v6Cx("grid h-8 w-8 shrink-0 place-items-center rounded-[11px]", v6Motion.iconPress, v6Tone[tone].soft, v6Tone[tone].text)}><Icon size={12} strokeWidth={1.9} aria-hidden="true" /></span> : <span />}
      <span className="min-w-0">
        <SafeTitle as="span" className="block truncate text-[11.8px] font-semibold tracking-[-0.006em] text-white/84">{title}</SafeTitle>
        {subtitle ? <SafeMeta as="span" className="mt-0.5 block truncate text-[9.2px] font-medium text-white/40">{subtitle}</SafeMeta> : null}
      </span>
      <span className="flex min-w-0 shrink-0 items-center gap-1.5 text-white/32">
        {meta ? <SafeMeta as="span" className="max-w-[5.6rem] truncate text-[9.3px] font-semibold text-white/36">{meta}</SafeMeta> : null}
        {trailing ?? (onClick ? <ChevronLeft size={13} strokeWidth={1.8} className="text-white/22 transition group-hover:text-white/38" aria-hidden="true" /> : null)}
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

export function ManagementSummaryTile({ icon: Icon, label, value, meta, tone = "management" }: { icon: ElementType; label: ReactNode; value: ReactNode; meta?: ReactNode; tone?: V6Tone }) {
  return (
    <div dir="rtl" className={v6Cx("lk-safe-surface min-w-0 rounded-[18px] border px-2.5 py-2.5 text-start", v6Surface.inset)}>
      <div className="flex items-center justify-between gap-2">
        <SafeMeta as="span" className="truncate text-[9px] font-semibold text-white/36">{label}</SafeMeta>
        <Icon size={12} strokeWidth={1.8} aria-hidden="true" className={v6Tone[tone].text} />
      </div>
      <SafeTitle as="span" className={v6Cx("mt-1 block truncate text-[1.15rem] font-semibold leading-none tracking-[-0.042em]", v6Tone[tone].text)}>{value}</SafeTitle>
      {meta ? <SafeMeta as="span" className="mt-1 block truncate text-[9.5px] font-medium text-white/35">{meta}</SafeMeta> : null}
    </div>
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
        "group grid min-h-[54px] w-full grid-cols-[auto_1fr_auto] items-center gap-2 rounded-[15px] border px-2.5 py-2 text-start",
        v6Surface.whisper,
        v6Motion.standard,
        v6Motion.pressSoft,
        v6Motion.focusRing,
        onClick && v6Interactive.row
      )}
    >
      <span className={v6Cx("grid h-9 w-9 shrink-0 place-items-center rounded-[13px]", v6Motion.iconPress, v6Tone[tone].soft, v6Tone[tone].text)}>
        <Icon size={13.5} strokeWidth={1.9} aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <SafeTitle as="span" className="block truncate text-[12.4px] font-semibold tracking-[-0.008em] text-white/88">{title}</SafeTitle>
        {subtitle ? <SafeMeta as="span" className="mt-0.5 block truncate text-[9.8px] font-medium text-white/43">{subtitle}</SafeMeta> : null}
      </span>
      <span className="flex min-w-0 shrink-0 items-center gap-1.5">
        {meta ? <SafeMeta as="span" className="max-w-[5.8rem] truncate text-[9.5px] font-semibold text-white/42">{meta}</SafeMeta> : null}
        {onClick ? <ChevronLeft size={13} strokeWidth={1.8} className="text-white/24 transition group-hover:text-white/42" aria-hidden="true" /> : null}
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
    card: "border-rose-300/34 bg-[linear-gradient(135deg,rgba(251,113,133,0.105),rgba(255,255,255,0.018)_58%,rgba(244,213,141,0.034))] shadow-[inset_0_1px_0_rgba(255,247,223,0.068),0_0_0_1px_rgba(251,113,133,0.045)]",
    chip: "border-rose-200/20 bg-rose-200/[0.12] text-rose-50",
    dot: "bg-rose-200",
    text: "text-rose-50"
  },
  room_conflict: {
    card: "border-[#f4d58d]/38 bg-[linear-gradient(135deg,rgba(244,213,141,0.115),rgba(255,255,255,0.018)_58%,rgba(125,211,252,0.030))] shadow-[inset_0_1px_0_rgba(255,247,223,0.080),0_0_0_1px_rgba(244,213,141,0.055)]",
    chip: "border-[#f4d58d]/22 bg-[#f4d58d]/[0.13] text-amber-50",
    dot: "bg-[#f4d58d]",
    text: "text-amber-50"
  },
  group_overlap: {
    card: "border-sky-200/30 bg-[linear-gradient(135deg,rgba(125,211,252,0.095),rgba(255,255,255,0.018)_58%,rgba(244,213,141,0.026))] shadow-[inset_0_1px_0_rgba(255,247,223,0.066),0_0_0_1px_rgba(125,211,252,0.050)]",
    chip: "border-sky-100/18 bg-sky-200/[0.105] text-sky-50",
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
    <div dir="rtl" className={v6Cx("space-y-2 rounded-[24px] border p-2 text-start", v6Surface.elevated)}>
      <div className="flex items-start justify-between gap-2.5 px-1">
        <div className="min-w-0">
          <SafeMeta as="p" className={v6Type.kicker}>מערכת סטודיו שבועית</SafeMeta>
          <SafeTitle as="h2" className="mt-1 text-[16px] font-semibold leading-tight tracking-[-0.030em] text-white/88">תכנון שבועי קבוע</SafeTitle>
          <SafeMeta as="p" className="mt-1 max-w-[15rem] text-[10px] leading-relaxed text-white/42">{weekLabel}</SafeMeta>
        </div>
        <div className="grid shrink-0 grid-cols-2 gap-1">
          <span className="rounded-[15px] border border-white/[0.045] bg-black/16 px-2 py-1.5 text-center">
            <SafeTitle as="span" className="block text-[14px] font-semibold leading-none text-[#f4d58d]"><BidiNumber>{lessonCount}</BidiNumber></SafeTitle>
            <SafeMeta as="span" className="mt-1 block text-[8px] font-semibold text-white/34">שיעורים</SafeMeta>
          </span>
          <span className="rounded-[15px] border border-white/[0.045] bg-black/16 px-2 py-1.5 text-center">
            <SafeTitle as="span" className="block text-[14px] font-semibold leading-none text-sky-50"><BidiNumber>{roomCount}</BidiNumber></SafeTitle>
            <SafeMeta as="span" className="mt-1 block text-[8px] font-semibold text-white/34">חללים</SafeMeta>
          </span>
        </div>
      </div>

      {actions ? <div className="px-0.5">{actions}</div> : null}

      <div className="-mx-0.5 flex snap-x gap-1.5 overflow-x-auto px-0.5 pb-1 pt-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {daySummaries.map((day) => {
          const active = Boolean(day.isActive);
          const content = (
            <>
              <span className={v6Cx("block text-[11.5px] font-semibold leading-none", active ? "text-zinc-950" : "text-white/68")}>{day.day}</span>
              <span className={v6Cx("mt-1 block text-[8.5px] font-semibold", active ? "text-zinc-950/62" : "text-white/32")}>
                <BidiNumber>{day.lessonCount}</BidiNumber> שיעורים{day.firstTime ? <> · {day.firstTime}</> : null}
              </span>
              {day.conflictCount ? (
                <span className={v6Cx("mt-1 inline-flex min-h-5 items-center gap-1 rounded-full px-1.5 text-[8px] font-semibold", active ? "bg-zinc-950/10 text-zinc-950/68" : "bg-rose-200/[0.10] text-rose-50/82")}>
                  <AlertTriangle size={8.5} strokeWidth={1.8} aria-hidden="true" />
                  <BidiNumber>{day.conflictCount}</BidiNumber> התנגשויות
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
                className={v6Cx("min-h-[52px] min-w-[92px] snap-start rounded-[18px] border px-3 py-2 text-start", v6Motion.standard, v6Motion.pressSoft, v6Motion.focusRing, active ? "border-[#f4d58d]/45 bg-[#f4d58d] shadow-[0_10px_24px_rgba(244,213,141,0.11)]" : "border-[#f4d58d]/[0.055] bg-white/[0.030] text-white/64 hover:bg-white/[0.045]")}
              >
                {content}
              </button>
            );
          }

          return (
            <span key={day.day} className={v6Cx("min-h-[52px] min-w-[92px] snap-start rounded-[18px] border px-3 py-2", active ? "border-[#f4d58d]/45 bg-[#f4d58d]" : "border-[#f4d58d]/[0.055] bg-white/[0.030]")}>
              {content}
            </span>
          );
        })}
      </div>

      {conflictSummary.length ? (
        <div className="flex flex-wrap gap-1 px-0.5" aria-label="סיכום התנגשויות במערכת השבועית">
          {conflictSummary.map((item) => {
            const style = weeklyStudioConflictStyles[item.kind];
            return (
              <span key={item.kind} className={v6Cx("inline-flex min-h-6 items-center gap-1 rounded-full border px-2 text-[8.8px] font-semibold", style.chip)} title={`${item.label}: ${item.count}`}>
                <span className={v6Cx("h-1.5 w-1.5 rounded-full", style.dot)} aria-hidden="true" />
                {item.compactLabel}
                <BidiNumber>{item.count}</BidiNumber>
              </span>
            );
          })}
        </div>
      ) : null}

      <div className="space-y-2">{children}</div>
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
    <article dir="rtl" className={v6Cx("overflow-hidden rounded-[22px] border p-2 text-start", conflictCount ? "border-rose-200/20 bg-rose-200/[0.035]" : isToday ? "border-[#f4d58d]/24 bg-[#f4d58d]/[0.055]" : "border-[#f4d58d]/[0.052] bg-black/[0.10]")}>
      <div className="mb-2 flex items-start justify-between gap-2 px-1">
        <div className="min-w-0">
          <SafeTitle as="h3" className="flex items-center gap-1.5 text-[14.5px] font-semibold tracking-[-0.018em] text-white/88">
            {conflictCount ? <AlertTriangle size={12} strokeWidth={1.9} className="text-rose-50" aria-hidden="true" /> : <CalendarDays size={12} strokeWidth={1.9} className={isToday ? "text-[#f4d58d]" : "text-white/34"} aria-hidden="true" />}
            {isToday ? <>היום · {day}</> : day}
          </SafeTitle>
          <SafeMeta as="p" className="mt-1 text-[9.5px] font-semibold text-white/38">
            <BidiNumber>{lessonCount}</BidiNumber> שיעורים · <BidiNumber>{totalStudents}</BidiNumber> תלמידות{densityLabel ? <> · {densityLabel}</> : null}{conflictCount ? <> · <BidiNumber>{conflictCount}</BidiNumber> התנגשויות</> : null}
          </SafeMeta>
        </div>
        <div className="flex max-w-[48%] flex-wrap justify-end gap-1">
          {rooms.slice(0, 3).map((room, index) => (
            <span key={`${String(room)}-${index}`} className="inline-flex min-h-6 items-center gap-1 rounded-full border border-white/[0.045] bg-black/18 px-2 text-[8.8px] font-semibold text-white/46">
              <DoorOpen size={9.5} strokeWidth={1.8} aria-hidden="true" />
              {room}
            </span>
          ))}
        </div>
      </div>
      <div className={v6Cx("grid gap-1.5 sm:grid-cols-2", lessonCount > 5 && "max-h-[62dvh] overflow-y-auto overscroll-contain pr-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden")}>{children}</div>
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
  const cardMinHeight = Math.max(82, Math.min(116, Math.round(safeDuration * 0.9)));
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
      className={v6Cx(
        "group relative isolate grid w-full grid-cols-[auto_1fr] gap-2.5 overflow-hidden rounded-[19px] border px-2.5 py-2.5 text-start",
        "border-[#f4d58d]/[0.070] bg-[linear-gradient(135deg,rgba(255,247,223,0.058),rgba(255,255,255,0.018)_58%,rgba(125,211,252,0.032))]",
        "shadow-[inset_0_1px_0_rgba(255,247,223,0.052)]",
        primaryConflictStyle?.card,
        v6Motion.standard,
        v6Motion.pressSoft,
        v6Motion.focusRing,
        onClick && v6Interactive.card
      )}
    >
      <span className="pointer-events-none absolute -left-10 -top-12 h-24 w-24 rounded-full bg-[#f4d58d]/[0.055] blur-3xl" />
      <span className="flex flex-col items-center gap-1 pt-0.5">
        <span className={v6Cx("grid h-7 w-7 place-items-center rounded-[12px] border border-white/[0.045]", v6Tone[tone].soft, v6Tone[tone].text)}>
          <Clock3 size={12} strokeWidth={1.9} aria-hidden="true" />
        </span>
        <span className="relative flex w-2 flex-1 justify-center py-1" aria-hidden="true">
          <span className="absolute inset-y-0 w-px rounded-full bg-white/[0.060]" />
          <span style={{ height: `${railHeight}px` }} className={v6Cx("relative mt-1 w-1.5 rounded-full shadow-[0_0_20px_rgba(244,213,141,0.12)]", primaryConflictStyle?.dot ?? v6Tone[tone].soft)} />
        </span>
      </span>

      <span className="min-w-0">
        <span className="flex items-start justify-between gap-2">
          <span className="min-w-0">
            <SafeMeta as="span" className="block text-[10px] font-semibold text-[#f4d58d]/82">
              {startTime} - {endTime} · {durationLabel}
            </SafeMeta>
            <SafeTitle as="span" className="mt-0.5 block text-[14.5px] font-semibold leading-tight tracking-[-0.022em] text-white/90">{groupName}</SafeTitle>
            {groupMeta ? <SafeMeta as="span" className="mt-0.5 block truncate text-[9.4px] font-semibold text-white/36">{groupMeta}</SafeMeta> : null}
            {conflictIndicators.length ? (
              <span className="mt-1 flex flex-wrap gap-1" aria-label="התנגשויות בשיעור">
                {conflictIndicators.slice(0, 3).map((conflict) => {
                  const style = weeklyStudioConflictStyles[conflict.kind];
                  return (
                    <span key={conflict.id} className={v6Cx("inline-flex min-h-5 max-w-full items-center gap-1 rounded-full border px-1.5 text-[8.4px] font-semibold", style.chip)} title={conflict.description}>
                      <AlertTriangle size={8.5} strokeWidth={1.8} aria-hidden="true" />
                      <span className="truncate">{conflict.compactLabel}</span>
                      {conflict.overlapLabel ? <span className="text-white/42">{conflict.overlapLabel}</span> : null}
                    </span>
                  );
                })}
                {conflictIndicators.length > 3 ? (
                  <span className="inline-flex min-h-5 items-center rounded-full border border-white/[0.055] bg-black/18 px-1.5 text-[8.4px] font-semibold text-white/48">
                    +<BidiNumber>{conflictIndicators.length - 3}</BidiNumber>
                  </span>
                ) : null}
              </span>
            ) : null}
          </span>
          <span className="inline-flex min-h-6 shrink-0 items-center gap-1 rounded-full border border-white/[0.055] bg-black/18 px-2 text-[9.5px] font-semibold text-white/58">
            <DoorOpen size={9.5} strokeWidth={1.8} aria-hidden="true" />
            {room}
          </span>
        </span>

        <span className="mt-1.5 flex min-w-0 flex-wrap gap-1">
          <span className={v6Cx("inline-flex min-h-6 max-w-full items-center gap-1 rounded-full px-2 text-[9px] font-semibold", v6Tone[tone].soft, v6Tone[tone].text)}>
            <Sparkles size={9.5} strokeWidth={1.8} aria-hidden="true" />
            <span className="truncate">{danceStyle}</span>
          </span>
          <span className="inline-flex min-h-6 max-w-full items-center gap-1 rounded-full border border-white/[0.045] bg-white/[0.030] px-2 text-[9px] font-semibold text-white/44">
            <Users size={9.5} strokeWidth={1.8} aria-hidden="true" />
            <BidiNumber>{studentCount}</BidiNumber> תלמידות
          </span>
        </span>

        <span className="mt-1.5 grid min-h-8 grid-cols-[1fr_auto] items-center gap-2 rounded-[13px] border border-white/[0.045] bg-black/14 px-2 py-1">
          <SafeMeta as="span" className="truncate text-[9.5px] font-semibold text-white/46">מורה: {teacher}</SafeMeta>
          <span className={v6Cx("inline-flex items-center gap-1 rounded-full px-2 py-1 text-[8.8px] font-semibold", v6Tone[statusTone].soft, v6Tone[statusTone].text)}>
            <PencilLine size={9.5} strokeWidth={1.8} aria-hidden="true" />
            {status}
          </span>
        </span>
        {conflictIndicators.length ? (
          <span className={v6Cx("mt-1.5 flex min-h-7 items-center justify-between gap-2 rounded-[12px] border px-2 py-1 text-[8.8px] font-semibold", primaryConflictStyle?.chip)}>
            <span className="min-w-0 truncate">{primaryConflict?.description}</span>
            <span className="shrink-0 text-white/50">{conflictActions ?? primaryConflict?.actionLabel}</span>
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
  onClick,
  ariaLabel
}: {
  room: ReactNode;
  next?: ReactNode;
  groupCount: number;
  onClick?: () => void;
  ariaLabel?: string;
}) {
  return (
    <button
      dir="rtl"
      type="button"
      onClick={onClick}
      aria-label={ariaLabel ?? (typeof room === "string" ? `פתיחת חדר ${room}` : undefined)}
      className={v6Cx("group min-h-[74px] w-full rounded-[18px] border px-3 py-2.5 text-start", v6Surface.whisper, v6Motion.standard, v6Motion.pressSoft, v6Motion.focusRing, onClick && v6Interactive.row)}
    >
      <span className="flex items-start justify-between gap-2">
        <span className="min-w-0">
          <SafeTitle as="span" className="block truncate text-[13px] font-semibold text-white/86">{room}</SafeTitle>
          {next ? <SafeMeta as="span" className="mt-1 block truncate text-[10px] font-medium text-white/42">{next}</SafeMeta> : null}
        </span>
        <span className="shrink-0 rounded-full border border-white/[0.055] bg-black/16 px-2 py-1 text-[9.5px] font-semibold text-white/45">
          <BidiNumber>{groupCount}</BidiNumber> קבוצות
        </span>
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
