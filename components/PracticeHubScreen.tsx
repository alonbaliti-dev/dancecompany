"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, PlayCircle } from "lucide-react";
import { useProductData } from "@/context/ProductDataContext";
import { useLocalDatabase } from "@/context/LocalDatabaseContext";
import { PracticeTasksSection } from "./TasksScreen";
import { categoryToStyle, resolveDanceStyle } from "@/lib/theme/dance-styles";
import { StyleChip } from "./theme/ThemePrimitives";
import { Card, Header, PrimaryButton, RingStat, SectionEyebrow, SectionTitle, cx, screenClass } from "./ui";

export function PracticeHubScreen({ onOpenGallery, onOpenGalleryUpload }: { onOpenGallery?: () => void; onOpenGalleryUpload?: () => void } = {}) {
  const { gamification, bumpWeeklyChallenge } = useProductData();
  const { db } = useLocalDatabase();
  const { categories: trainingCategories, items: trainings } = db.trainings;
  const [cat, setCat] = useState("הכל");
  const [doneIds, setDoneIds] = useState<Set<string>>(() => new Set(trainings.filter((t) => t.done).map((t) => t.id)));

  const featured = useMemo(() => trainings.find((t) => t.featured) ?? trainings[0], [trainings]);
  const list = useMemo(() => {
    const base = trainings.filter((t) => t.id !== featured?.id);
    if (cat === "הכל") return base;
    return base.filter((t) => t.category === cat);
  }, [cat, featured.id]);

  const featuredDone = doneIds.has(featured.id);
  const ringPractice = Math.min(100, gamification.weeklyChallengeProgressPct);
  const ringTasks = Math.min(100, gamification.groupChallengeProgressPct);

  const toggleTraining = (id: string) => {
    setDoneIds((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  return (
    <div className={screenClass}>
      <Header title="תרגול" subtitle="תרגול ביתי ומשימות — בקצב שלך." />

      <Card animated={false} tone="freestyle">
        <div className="flex flex-wrap items-center justify-between gap-8">
          <div className="flex gap-5">
            <RingStat value={ringPractice} label="תרגול" size={76} tone="freestyle" />
            <RingStat value={ringTasks} label="משימות" size={76} tone="technique" />
          </div>
          <div className="min-w-0 flex-1 text-right">
            <SectionEyebrow>תוכנית השבוע</SectionEyebrow>
            <p className="mt-2 text-lg font-semibold text-white">מיקודים קצרים שמחזיקים את הקצב</p>
            <p className="mt-2 text-sm leading-relaxed text-white/42">התקדמות נשמרת כאן — גם כשאין זמן לאימון ארוך.</p>
          </div>
        </div>
      </Card>

      <div>
        <SectionEyebrow>מומלץ עכשיו</SectionEyebrow>
        <Card className="mt-2.5 overflow-hidden !p-0" tone={resolveDanceStyle(featured.category)} glow>
          <div className="relative p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <PlayCircle className="text-white/80" size={28} strokeWidth={1.75} style={{ color: "var(--color-accent)" }} />
              </div>
              <div className="min-w-0 flex-1 text-right">
                <p className="text-xs font-medium uppercase tracking-wide text-white/45">אימון מוביל</p>
                <p className="mt-2 text-xl font-semibold leading-tight text-white">{featured.title}</p>
                <p className="mt-2 text-sm text-white/50">
                  {featured.category} · {featured.duration} · {featured.difficulty}
                </p>
                <p className="mt-2 text-sm font-medium text-white/55">+{featured.xp} XP</p>
              </div>
            </div>
            <PrimaryButton
              className="mt-5"
              onClick={() => {
                toggleTraining(featured.id);
                bumpWeeklyChallenge();
              }}
            >
              {featuredDone ? "סימנתי — צפייה חוזרת" : "התחלת תרגול"}
            </PrimaryButton>
          </div>
        </Card>
      </div>

      <div className="-mx-1 flex gap-2 overflow-x-auto pb-1 no-scrollbar" dir="rtl">
        {trainingCategories.map((c) => (
          <StyleChip key={c} label={c} active={cat === c} styleId={categoryToStyle(c)} onClick={() => setCat(c)} />
        ))}
      </div>

      <div>
        <SectionEyebrow>ספריית תרגולים</SectionEyebrow>
        <SectionTitle className="mt-0.5">לפי קטגוריה</SectionTitle>
        <div className="mt-4 space-y-3">
          {list.map((item) => {
            const done = doneIds.has(item.id);
            return (
              <Card key={item.id} animated={false}>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => toggleTraining(item.id)}
                    className={cx(
                      "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border transition",
                      done ? "border-emerald-400/25 bg-emerald-400/10" : "border-white/10 bg-white/[0.05]"
                    )}
                    aria-label={done ? "בטל סימון" : "סמן כבוצע"}
                  >
                    {done ? <CheckCircle2 className="text-emerald-300" size={24} /> : <PlayCircle className="text-white/55" size={24} />}
                  </button>
                  <div className="min-w-0 flex-1 text-right">
                    <p className="font-semibold text-white">{item.title}</p>
                    <p className="mt-1 text-sm text-white/45">
                      {item.category} · {item.duration} · {item.difficulty}
                    </p>
                    <p className="mt-1 text-xs font-medium text-emerald-200/80">+{item.xp} XP</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <PracticeTasksSection />
    </div>
  );
}
