"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Quote, Sparkles, Trophy } from "lucide-react";
import { useStudioIdentity } from "@/context/StudioIdentityContext";
import {
  LEGACY_SECTIONS,
  filterMilestones,
  milestonesByYear,
  type LegacySectionId
} from "@/lib/studio-identity-logic";
import { getLegacyMedia } from "@/lib/integrations/media-feed";
import { ExternalMediaCard } from "../media/ExternalMediaCard";
import { SocialLinksStrip } from "../media/SocialLinksStrip";
import { LegacyMilestoneCard } from "./LegacyMilestoneCard";
import { Card, GhostButton, Header, Pill, PrimaryButton, SectionEyebrow, cx, screenClass } from "../ui";

type View = "hub" | "detail" | "timeline" | "wall";

export function StudioLegacyScreen({
  onOpenLegacyBoard,
  onOpenEvent
}: {
  onOpenLegacyBoard?: () => void;
  onOpenEvent?: (eventId: string) => void;
}) {
  const { mission, milestones, featuredMilestones, quotes, getMilestone } = useStudioIdentity();
  const [view, setView] = useState<View>("hub");
  const [section, setSection] = useState<LegacySectionId>("all");
  const [detailId, setDetailId] = useState<string | null>(null);

  const detail = detailId ? getMilestone(detailId) : undefined;
  const filtered = useMemo(() => filterMilestones(milestones, section), [milestones, section]);
  const byYear = useMemo(() => milestonesByYear(milestones), [milestones]);

  const openDetail = (id: string) => {
    setDetailId(id);
    setView("detail");
  };

  if (view === "detail" && detail) {
    return (
      <div className={screenClass}>
        <GhostButton onClick={() => setView("hub")} className="!mb-2 !px-0 !py-1 !text-sm">
          ← חזרה
        </GhostButton>
        <LegacyMilestoneCard milestone={detail} onPress={() => {}} large />
        {detail.quote ? (
          <Card tone="achievement" animated={false}>
            <Quote className="mb-2 text-amber-200/60" size={22} />
            <p className="text-right text-lg leading-relaxed text-white/80">&ldquo;{detail.quote}&rdquo;</p>
          </Card>
        ) : null}
        {detail.awards?.length ? (
          <Card animated={false}>
            <SectionEyebrow>פרסים</SectionEyebrow>
            <ul className="mt-3 space-y-2 text-right text-sm text-white/60">
              {detail.awards.map((a) => (
                <li key={a}>· {a}</li>
              ))}
            </ul>
          </Card>
        ) : null}
        {detail.memoryVideoUrl ? (
          <GhostButton className="w-full">
            <span className="inline-flex items-center gap-2">
              <Play size={16} />
              צפייה בסרט זיכרון
            </span>
          </GhostButton>
        ) : null}
        {detail.relatedEventId && onOpenEvent ? (
          <PrimaryButton tone="rehearsal" onClick={() => onOpenEvent(detail.relatedEventId!)}>
            לארכיון האירוע המלא
          </PrimaryButton>
        ) : null}
      </div>
    );
  }

  if (view === "timeline") {
    return (
      <div className={screenClass}>
        <GhostButton onClick={() => setView("hub")} className="!mb-2 !px-0 !py-1 !text-sm">
          ← חזרה
        </GhostButton>
        <Header title="ציר זמן הסטודיו" subtitle="רגעים מהחזרות, ההופעות והקהילה — בלי הגזמה, עם לב." />
        <div className="relative mr-3 border-r border-white/10 pr-6">
          {Array.from(byYear.entries()).map(([year, items], yi) => (
            <motion.div
              key={year}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: yi * 0.06 }}
              className="relative mb-10"
            >
              <span className="absolute -right-[1.65rem] top-0 flex h-3 w-3 rounded-full border-2 border-amber-400/50 bg-amber-500/80" />
              <p className="text-2xl font-semibold tabular-nums text-amber-100/90">{year}</p>
              <div className="mt-4 space-y-3">
                {items.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => openDetail(m.id)}
                    className="w-full rounded-[18px] border border-white/[0.08] bg-white/[0.03] px-4 py-3.5 text-right transition hover:bg-white/[0.06]"
                  >
                    <p className="font-semibold text-white">{m.title}</p>
                    <p className="mt-1 text-xs text-white/42">{m.subtitle}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  if (view === "wall") {
    return (
      <div className={screenClass}>
        <GhostButton onClick={() => setView("hub")} className="!mb-2 !px-0 !py-1 !text-sm">
          ← חזרה
        </GhostButton>
        <Header title="קיר הזיכרונות" subtitle="הופעות, חזרות ורגעים מהבמה — זיכרונות מהקהילה." />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {milestones.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => openDetail(m.id)}
              className="flex aspect-square flex-col items-center justify-center rounded-[20px] border border-amber-400/15 bg-gradient-to-b from-amber-500/12 to-black/40 p-3 text-center transition hover:border-amber-400/28"
            >
              <Trophy className="mb-2 text-amber-200/80" size={28} strokeWidth={1.5} />
              <p className="text-[11px] font-bold text-amber-50">{m.year}</p>
              <p className="mt-1 line-clamp-3 text-[10px] leading-tight text-white/55">{m.title}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={screenClass}>
      <div className="overflow-hidden rounded-[26px] border border-white/[0.1]">
        <div className="relative min-h-[220px] bg-gradient-to-bl from-amber-600/25 via-violet-700/15 to-black px-6 py-8 text-right">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_0%,rgba(251,191,36,0.2),transparent_55%)]" />
          <div className="relative">
            <Pill tone="achievement" icon={Sparkles}>
              מורשת אמנותית
            </Pill>
            <h1 className="mt-4 text-[2rem] font-semibold leading-[1.08] tracking-tight text-white">מורשת הסטודיו</h1>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-white/50">{mission.missionStatement}</p>
            <p className="mt-2 text-sm text-white/35">LK Dance School · כפר ויתקין</p>
          </div>
        </div>
      </div>

      <div className="-mx-1 flex gap-2 overflow-x-auto pb-1 no-scrollbar" dir="rtl">
        {LEGACY_SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => {
              if (s.id === "timeline") setView("timeline");
              else if (s.id === "wall") setView("wall");
              else setSection(s.id);
            }}
            className={cx(
              "shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition",
              section === s.id && s.id !== "timeline" && s.id !== "wall"
                ? "border-amber-400/35 bg-amber-500/15 text-amber-50"
                : "border-white/10 bg-white/[0.04] text-white/50 hover:bg-white/[0.07]"
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {section === "all" && featuredMilestones[0] ? (
        <LegacyMilestoneCard milestone={featuredMilestones[0]} large onPress={() => openDetail(featuredMilestones[0].id)} />
      ) : null}

      <AnimatePresence mode="popLayout">
        <motion.div layout className="grid gap-3 sm:grid-cols-2">
          {filtered
            .filter((m) => section !== "all" || !featuredMilestones[0] || m.id !== featuredMilestones[0].id)
            .map((m) => (
              <LegacyMilestoneCard key={m.id} milestone={m} onPress={() => openDetail(m.id)} />
            ))}
        </motion.div>
      </AnimatePresence>

      <Card animated={false} className="!p-4">
        <SectionEyebrow tone="achievement">הסטודיו ברשת</SectionEyebrow>
        <SocialLinksStrip className="mt-3" variant="pills" />
      </Card>

      <div>
        <SectionEyebrow tone="achievement">מדיה וזיכרונות</SectionEyebrow>
        <p className="mt-1 text-right text-xs text-white/40">קישורים לתוכן חיצוני — הופעות, חזרות ועדכונים.</p>
        <div className="mt-3 space-y-2">
          {getLegacyMedia().map((item) => (
            <ExternalMediaCard key={item.id} item={item} layout="row" />
          ))}
        </div>
      </div>

      <div>
        <SectionEyebrow tone="achievement">מילות השראה</SectionEyebrow>
        <div className="mt-3 space-y-2">
          {quotes.map((q) => (
            <Card key={q.id} animated={false} className="border-white/[0.06]">
              <p className="text-right text-sm leading-relaxed text-white/65">&ldquo;{q.text}&rdquo;</p>
              <p className="mt-2 text-right text-[11px] text-white/35">— {q.attribution}</p>
            </Card>
          ))}
        </div>
      </div>

      {onOpenLegacyBoard ? (
        <GhostButton className="w-full" onClick={onOpenLegacyBoard}>
          ארכיון אירועים מלא (לוח הישגים)
        </GhostButton>
      ) : null}
    </div>
  );
}
