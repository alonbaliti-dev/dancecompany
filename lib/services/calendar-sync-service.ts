import type { CalendarSyncEntry, CalendarSyncItemType } from "@/lib/platform-os/types";

export function buildIcsEvent(entry: Pick<CalendarSyncEntry, "title" | "startAt" | "endAt" | "location">): string {
  const end = entry.endAt ?? entry.startAt;
  const fmt = (iso: string) => iso.replace(/[-:]/g, "").split(".")[0] + "Z";
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//LK Student Space//HE",
    "BEGIN:VEVENT",
    `DTSTART:${fmt(entry.startAt)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${entry.title}`,
    entry.location ? `LOCATION:${entry.location}` : "",
    "END:VEVENT",
    "END:VCALENDAR"
  ]
    .filter(Boolean)
    .join("\r\n");
}

export function downloadIcs(entry: CalendarSyncEntry): void {
  const body = entry.icsBody ?? buildIcsEvent(entry);
  const blob = new Blob([body], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `lk-${entry.itemType}-${entry.id}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

export function calendarProviderLabel(provider: "apple" | "google" | "ics"): string {
  if (provider === "apple") return "Apple Calendar";
  if (provider === "google") return "Google Calendar";
  return "קובץ .ics";
}

export function itemTypeLabelHe(t: CalendarSyncItemType): string {
  const map: Record<CalendarSyncItemType, string> = {
    class: "שיעור",
    rehearsal: "חזרה",
    private_lesson: "שיעור פרטי",
    competition: "תחרות",
    annual_show: "מופע שנתי",
    workshop: "סדנה"
  };
  return map[t];
}
