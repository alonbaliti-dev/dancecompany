import { getStudioGroups } from "@/lib/studio-groups-access";
import { MOCK_TODAY } from "@/lib/studio-task-logic";
import type { AchievementPlace, StudioEvent, StudioEventStatus, StudioEventType } from "@/lib/types";

export function eventTypeLabel(t: StudioEventType): string {
  const map: Record<StudioEventType, string> = {
    competition: "תחרות",
    performance: "הופעה",
    workshop: "סדנה",
    showcase: "הצגה",
    photoshoot: "צילומים",
    camp: "קייטנה",
    other: "אחר"
  };
  return map[t];
}

export function statusLabel(s: StudioEventStatus): string {
  if (s === "past") return "עבר";
  if (s === "current") return "עכשיו";
  return "בקרוב";
}

export function statusStyle(s: StudioEventStatus): string {
  if (s === "past") return "border-white/12 bg-white/[0.06] text-white/50";
  if (s === "current") return "border-emerald-400/30 bg-emerald-500/12 text-emerald-50";
  return "border-sky-400/28 bg-sky-500/10 text-sky-100";
}

export function achievementPlaceLabel(p: AchievementPlace): string {
  const map: Record<AchievementPlace, string> = {
    "1": "מקום 1",
    "2": "מקום 2",
    "3": "מקום 3",
    finalist: "גמר",
    special_award: "פרס מיוחד",
    participation: "השתתפות"
  };
  return map[p];
}

export function achievementBadgeStyle(p: AchievementPlace): string {
  if (p === "1") return "border-amber-400/40 bg-gradient-to-bl from-amber-500/25 to-amber-900/10 text-amber-50";
  if (p === "2") return "border-slate-300/30 bg-gradient-to-bl from-slate-400/20 to-transparent text-slate-100";
  if (p === "3") return "border-orange-400/30 bg-gradient-to-bl from-orange-600/20 to-transparent text-orange-100";
  if (p === "special_award") return "border-violet-400/30 bg-violet-500/12 text-violet-100";
  return "border-white/12 bg-white/[0.06] text-white/55";
}

export function groupNamesForEvent(event: Pick<StudioEvent, "participatingGroupIds">): string {
  const names = event.participatingGroupIds
    .map((id) => getStudioGroups().find((g) => g.id === id)?.name)
    .filter(Boolean) as string[];
  return names.length ? names.join(" · ") : "כל הסטודיו";
}

export function formatEventDateRange(date: string, endDate?: string): string {
  const start = new Date(date);
  if (!endDate) return start.toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" });
  const end = new Date(endDate);
  if (start.toDateString() === end.toDateString()) {
    return start.toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "long" });
  }
  return `${start.toLocaleDateString("he-IL", { day: "numeric", month: "short" })} – ${end.toLocaleDateString("he-IL", { day: "numeric", month: "short", year: "numeric" })}`;
}

export function daysUntil(dateIso: string): number {
  const target = new Date(dateIso);
  target.setHours(0, 0, 0, 0);
  const today = new Date(MOCK_TODAY);
  today.setHours(0, 0, 0, 0);
  return Math.ceil((+target - +today) / (1000 * 60 * 60 * 24));
}

export function deriveEventStatus(date: string, endDate?: string): StudioEventStatus {
  const today = new Date(MOCK_TODAY);
  today.setHours(12, 0, 0, 0);
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate ?? date);
  end.setHours(23, 59, 59, 999);
  if (+end < +today) return "past";
  if (+start > +today) return "future";
  return "current";
}

export function sortEventsByDate(events: StudioEvent[], direction: "asc" | "desc" = "asc"): StudioEvent[] {
  return [...events].sort((a, b) => {
    const da = +new Date(a.date);
    const db = +new Date(b.date);
    return direction === "asc" ? da - db : db - da;
  });
}
