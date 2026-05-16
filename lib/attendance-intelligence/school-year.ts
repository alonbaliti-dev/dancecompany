/** Israeli school year: September → July. */

export function getSchoolYearBounds(asOf = new Date()): { start: Date; end: Date; label: string } {
  const y = asOf.getFullYear();
  const month = asOf.getMonth();
  const startYear = month >= 8 ? y : y - 1;
  const start = new Date(startYear, 8, 1);
  const end = new Date(startYear + 1, 6, 31, 23, 59, 59);
  const label = `${startYear}–${startYear + 1}`;
  return { start, end, label };
}

export function isWithinSchoolYear(isoDate: string, asOf = new Date()): boolean {
  const d = new Date(isoDate);
  const { start, end } = getSchoolYearBounds(asOf);
  return d >= start && d <= asOf;
}

export function weeksAgoIso(weeks: number, asOf = new Date()): string {
  const d = new Date(asOf);
  d.setDate(d.getDate() - weeks * 7);
  return d.toISOString().slice(0, 10);
}

export function formatHeDate(iso: string): string {
  return new Date(iso).toLocaleDateString("he-IL", { day: "numeric", month: "short", year: "numeric" });
}
