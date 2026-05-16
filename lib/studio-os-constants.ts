import type { FeedbackCategory, ProfessionalLevelId } from "@/lib/types";

export const PROFESSIONAL_LEVELS: { id: ProfessionalLevelId; label: string; labelHe: string; order: number }[] = [
  { id: "beginner", label: "Beginner", labelHe: "מתחילים", order: 0 },
  { id: "foundation", label: "Foundation", labelHe: "יסודות", order: 1 },
  { id: "intermediate", label: "Intermediate", labelHe: "ביניים", order: 2 },
  { id: "advanced", label: "Advanced", labelHe: "מתקדמים", order: 3 },
  { id: "team", label: "Team", labelHe: "נבחרת", order: 4 },
  { id: "elite", label: "Elite", labelHe: "עילית", order: 5 }
];

export const LEVEL_SKILLS: Record<ProfessionalLevelId, string[]> = {
  beginner: ["קצב בסיסי", "זיכרון קומבינציה קצרה", "נוכחות עקבית"],
  foundation: ["בסיסי טכני יציב", "גמישות יומית", "העלאת תרגול"],
  intermediate: ["מוזיקליות", "פריסה במרחב", "ביטחון במה"],
  advanced: ["קומבינציה מורכבת", "אימפרוביזציה מבוקרת", "מנהיגות בקבוצה"],
  team: ["ביצוע קבוצתי חד", "נוכחות בחזרות", "משמעת מקצועית"],
  elite: ["ביצוע תחרותי", "יציבות תחת לחץ", "ייצוג הסטודיו"]
};

export const FEEDBACK_CATEGORIES: { id: FeedbackCategory; label: string }[] = [
  { id: "technique", label: "טכניקה" },
  { id: "energy", label: "אנרגיה" },
  { id: "musicality", label: "מוזיקליות" },
  { id: "flexibility", label: "גמישות" },
  { id: "confidence", label: "ביטחון" },
  { id: "teamwork", label: "עבודת צוות" }
];

export function levelLabelHe(id: ProfessionalLevelId): string {
  return PROFESSIONAL_LEVELS.find((l) => l.id === id)?.labelHe ?? id;
}

export function nextLevelId(current: ProfessionalLevelId): ProfessionalLevelId | null {
  const idx = PROFESSIONAL_LEVELS.findIndex((l) => l.id === current);
  if (idx < 0 || idx >= PROFESSIONAL_LEVELS.length - 1) return null;
  return PROFESSIONAL_LEVELS[idx + 1].id;
}
