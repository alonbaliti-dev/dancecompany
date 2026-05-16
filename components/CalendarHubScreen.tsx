"use client";

import { useStudioOS } from "@/context/StudioOSContext";
import { downloadIcs } from "@/lib/services/calendar-sync-service";
import { calendarTypeLabel } from "@/lib/studio-os-logic";
import type { CalendarSyncItemType } from "@/lib/platform-os/types";
import { Card, Header, cx } from "./ui";

export function CalendarHubScreen() {
  const { filteredCalendar, calendarFilter, setCalendarFilter } = useStudioOS();
  const filters: { id: typeof calendarFilter; label: string }[] = [
    { id: "mine", label: "הלו״ז שלי" },
    { id: "group", label: "קבוצה" },
    { id: "all", label: "כל הסטודיו" }
  ];

  return (
    <div className="space-y-8 pb-6">
      <Header title="לוח שנה" subtitle="שיעורים, חזרות, תחרויות ואירועים — במקום אחד." />
      <div className="flex flex-wrap justify-end gap-2">
        {filters.map((f) => (
          <button key={f.id} type="button" onClick={() => setCalendarFilter(f.id)} className={cx("rounded-full border px-3 py-1.5 text-[12px] font-semibold", calendarFilter === f.id ? "border-emerald-400/30 bg-emerald-500/12 text-emerald-50" : "border-white/10 text-white/45")}>{f.label}</button>
        ))}
      </div>
      <div className="space-y-2">
        {filteredCalendar.map((e) => (
          <Card key={e.id} animated={false}>
            <div className="flex justify-between gap-3 text-right">
              <span className="shrink-0 text-xs text-white/40">{new Date(e.date).toLocaleDateString("he-IL", { weekday: "short", day: "numeric", month: "short" })}{e.time ? ` · ${e.time}` : ""}</span>
              <div>
                <span className="text-[10px] text-white/38">{calendarTypeLabel(e.type)}</span>
                <p className="font-semibold text-white">{e.title}</p>
                {e.groupName ? <p className="text-xs text-white/42">{e.groupName}</p> : null}
                <button
                  type="button"
                  aria-label="הוספה ליומן"
                  onClick={() =>
                    downloadIcs({
                      id: e.id,
                      studioId: "",
                      itemType: (e.type as CalendarSyncItemType) || "class",
                      title: e.title,
                      startAt: `${e.date}T${e.time ?? "09:00"}:00.000Z`,
                      relatedId: e.id
                    })
                  }
                  className="mt-2 text-[11px] font-medium text-emerald-200/80"
                >
                  הוספה ליומן · ייצוא .ics
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
