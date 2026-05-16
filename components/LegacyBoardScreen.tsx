"use client";

import { useMemo } from "react";
import { Award, ChevronLeft, Play, Sparkles, Trophy } from "lucide-react";
import { useLegacyEvents } from "@/context/LegacyEventsContext";
import {
  achievementBadgeStyle,
  achievementPlaceLabel,
  daysUntil,
  eventTypeLabel,
  formatEventDateRange,
  groupNamesForEvent,
  sortEventsByDate,
  statusLabel,
  statusStyle
} from "@/lib/legacy-events-logic";
import type { StudioAchievement, StudioEvent } from "@/lib/types";
import { Card, Header, PrimaryButton, SectionEyebrow, SectionTitle, cx } from "./ui";

function CountdownPill({ days }: { days: number }) {
  if (days < 0) return null;
  return (
    <span className="rounded-full border border-sky-400/28 bg-sky-500/10 px-2.5 py-1 text-[11px] font-semibold text-sky-100">
      {days === 0 ? "היום" : days === 1 ? "מחר" : `עוד ${days} ימים`}
    </span>
  );
}

function EventCard({ event, onOpen }: { event: StudioEvent; onOpen: () => void }) {
  const days = event.status === "future" ? daysUntil(event.date) : null;
  return (
    <button type="button" onClick={onOpen} className="flex w-full flex-col overflow-hidden rounded-[20px] border border-white/[0.08] bg-gradient-to-bl from-white/[0.05] to-transparent text-right transition hover:border-white/[0.14]">
      {event.memoryVideoThumbnailUrl && event.status === "past" ? (
        <div className="relative flex aspect-[2.2/1] items-center justify-center bg-gradient-to-b from-violet-500/15 via-black/40 to-black/80">
          <Play className="text-white/70" size={36} strokeWidth={1.5} />
          <span className="absolute bottom-3 right-3 rounded-full border border-white/15 bg-black/50 px-2 py-0.5 text-[10px] text-white/60">זיכרון וידאו</span>
        </div>
      ) : null}
      <div className="p-4">
        <div className="flex flex-wrap items-center justify-end gap-2">
          <span className={cx("rounded-full border px-2 py-0.5 text-[10px] font-semibold", statusStyle(event.status))}>{statusLabel(event.status)}</span>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] text-white/45">{eventTypeLabel(event.type)}</span>
          {days !== null ? <CountdownPill days={days} /> : null}
        </div>
        <p className="mt-2 text-lg font-semibold text-white">{event.title}</p>
        <p className="mt-1 text-sm text-white/42">{formatEventDateRange(event.date, event.endDate)}</p>
        {event.location ? <p className="mt-1 text-xs text-white/35">{event.location}</p> : null}
        <p className="mt-2 text-xs text-white/40">{groupNamesForEvent(event)}</p>
        {event.achievements.length > 0 ? (
          <div className="mt-3 flex flex-wrap justify-end gap-1.5">
            {event.achievements.slice(0, 3).map((a) => (
              <span key={a.id} className={cx("rounded-full border px-2 py-0.5 text-[10px] font-semibold", a.place ? achievementBadgeStyle(a.place) : "border-white/10 text-white/45")}>
                {a.place ? achievementPlaceLabel(a.place) : a.title}
              </span>
            ))}
          </div>
        ) : null}
        <div className="mt-3 flex items-center justify-end gap-1 text-[12px] font-semibold text-emerald-200/90">
          צפייה בפרטים
          <ChevronLeft size={16} className="text-white/30" />
        </div>
      </div>
    </button>
  );
}

function AchievementWall({ items }: { items: StudioAchievement[] }) {
  if (!items.length) return null;
  return (
    <div>
      <SectionEyebrow>הישגי הסטודיו</SectionEyebrow>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {items.slice(0, 6).map((a) => (
          <Card key={a.id} animated={false} className={cx("border-white/[0.07]", a.place && "border-amber-400/15")}>
            <div className="flex items-start justify-end gap-2">
              <Trophy className="shrink-0 text-amber-200/70" size={18} />
              <div className="min-w-0 flex-1 text-right">
                {a.place ? <span className={cx("inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold", achievementBadgeStyle(a.place))}>{achievementPlaceLabel(a.place)}</span> : null}
                <p className="mt-1.5 font-semibold text-white">{a.title}</p>
                {a.description ? <p className="mt-1 text-xs text-white/42">{a.description}</p> : null}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function LegacyBoardScreen({
  onOpenEvent,
  onCreateEvent
}: {
  onOpenEvent: (id: string) => void;
  onCreateEvent?: () => void;
}) {
  const { visibleEvents, allAchievements, canManage } = useLegacyEvents();

  const future = useMemo(() => sortEventsByDate(visibleEvents.filter((e) => e.status === "future")), [visibleEvents]);
  const current = useMemo(() => visibleEvents.filter((e) => e.status === "current"), [visibleEvents]);
  const past = useMemo(() => sortEventsByDate(visibleEvents.filter((e) => e.status === "past"), "desc"), [visibleEvents]);

  return (
    <div className="space-y-10 pb-6">
      <Header title="לוח הישגים ואירועים" subtitle="ארכיון הסטודיו — תחרויות, הופעות, זיכרונות והישגים." />

      {canManage && onCreateEvent ? (
        <PrimaryButton onClick={onCreateEvent}>
          <Sparkles size={18} className="ml-2 inline" />
          אירוע חדש
        </PrimaryButton>
      ) : null}

      <div className="rounded-[22px] border border-amber-400/12 bg-gradient-to-bl from-amber-500/[0.08] via-transparent to-violet-500/[0.05] p-5 text-right">
        <div className="flex items-center justify-end gap-2 text-amber-100/90">
          <Award size={20} />
          <p className="text-sm font-semibold">קיר גאווה דיגיטלי</p>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-white/45">כל מה שהסטודיו השיג — בעבר, בהווה ובעתיד.</p>
      </div>

      {future.length > 0 ? (
        <div>
          <SectionEyebrow>עתיד</SectionEyebrow>
          <SectionTitle className="mt-0.5">אירועים קרובים</SectionTitle>
          <div className="mt-3 space-y-3">{future.map((e) => <EventCard key={e.id} event={e} onOpen={() => onOpenEvent(e.id)} />)}</div>
        </div>
      ) : null}

      {current.length > 0 ? (
        <div>
          <SectionEyebrow>הווה</SectionEyebrow>
          <SectionTitle className="mt-0.5">קורה עכשיו</SectionTitle>
          <div className="mt-3 space-y-3">{current.map((e) => <EventCard key={e.id} event={e} onOpen={() => onOpenEvent(e.id)} />)}</div>
        </div>
      ) : null}

      {past.length > 0 ? (
        <div>
          <SectionEyebrow>עבר</SectionEyebrow>
          <SectionTitle className="mt-0.5">זיכרונות מהעבר</SectionTitle>
          <div className="mt-3 space-y-3">{past.map((e) => <EventCard key={e.id} event={e} onOpen={() => onOpenEvent(e.id)} />)}</div>
        </div>
      ) : null}

      <AchievementWall items={allAchievements} />

      {!visibleEvents.length ? (
        <Card animated={false}><p className="py-10 text-center text-sm text-white/40">אין אירועים להצגה כרגע.</p></Card>
      ) : null}
    </div>
  );
}
