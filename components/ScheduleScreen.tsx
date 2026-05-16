"use client";
import { getSchedule } from "@/lib/schedule-access";


import type { StudioClass } from "@/lib/types";
import { Card, Header, SectionEyebrow, SectionTitle, cx } from "./ui";

const statusLabel: Record<StudioClass["status"], string> = {
  confirmed: "מאושר",
  optional: "אופציונלי",
  cancelled: "בוטל"
};

function ClassCard({ item }: { item: StudioClass }) {
  return (
    <Card animated={false}>
      <div className="flex items-start justify-between gap-4">
        <div className="text-left tabular-nums">
          <p className="text-xl font-semibold text-white">{item.time}</p>
          <p className="mt-1 text-xs text-white/45">{item.day}</p>
        </div>
        <div className="min-w-0 flex-1 text-right">
          <div className="flex items-center justify-end gap-2">
            <span
              className={cx(
                "rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                item.status === "confirmed" && "border-emerald-400/25 bg-emerald-400/10 text-emerald-200/90",
                item.status === "optional" && "border-white/15 bg-white/[0.06] text-white/55",
                item.status === "cancelled" && "border-red-400/20 bg-red-400/10 text-red-200/90"
              )}
            >
              {statusLabel[item.status]}
            </span>
          </div>
          <p className="mt-2 text-[1.15rem] font-semibold leading-snug text-white">{item.title}</p>
          <p className="mt-1 text-sm text-white/50">{item.group}</p>
          <p className="mt-2 text-sm text-white/45">
            {item.teacher} · {item.room}
          </p>
          <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-white/35">{item.style}</p>
        </div>
      </div>
    </Card>
  );
}

export function SchedulePeek({ onOpenWeek }: { onOpenWeek?: () => void }) {
  const today = getSchedule().filter((c) => c.section === "today");
  const week = getSchedule().filter((c) => c.section === "week").slice(0, 2);
  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between gap-3 text-right">
        <div>
          <SectionEyebrow>לו״ז</SectionEyebrow>
          <SectionTitle className="mt-0.5">היום והמשך השבוע</SectionTitle>
        </div>
        {onOpenWeek ? (
          <button type="button" onClick={onOpenWeek} className="shrink-0 text-[12px] font-semibold text-emerald-200/85">
            פתיחה מלאה
          </button>
        ) : null}
      </div>
      <div className="space-y-2.5">
        {today.length ? today.map((c) => <ClassCard key={c.id} item={c} />) : <p className="text-right text-sm text-white/42">אין שיעורים מתוכננים להיום.</p>}
        {week.map((c) => (
          <ClassCard key={`w-${c.id}`} item={c} />
        ))}
      </div>
    </div>
  );
}

export function ScheduleScreen() {
  const today = getSchedule().filter((c) => c.section === "today");
  const week = getSchedule().filter((c) => c.section === "week");

  return (
    <div className="space-y-12 pb-6">
      <Header title="מערכת שעות" subtitle="היום והשבוע — שעות, קבוצות, מורים וסטטוס במבט אחד." />

      <section className="space-y-3">
        <SectionEyebrow>היום</SectionEyebrow>
        <SectionTitle className="mt-0.5">מה קורה עכשיו</SectionTitle>
        <div className="mt-5 space-y-3.5">
          {today.length ? today.map((c) => <ClassCard key={c.id} item={c} />) : <p className="text-right text-sm text-white/45">אין שיעורים מתוכננים להיום.</p>}
        </div>
      </section>

      <section className="space-y-3">
        <SectionEyebrow>השבוע</SectionEyebrow>
        <SectionTitle className="mt-0.5">מה בא בתור</SectionTitle>
        <div className="mt-5 space-y-3.5">{week.map((c) => <ClassCard key={c.id} item={c} />)}</div>
      </section>
    </div>
  );
}
