import type { DanceStyle } from "@/lib/types";

/** Private lesson focus lines — aligned with teacher specialties (no invented credentials). */
export const PRIVATE_LESSON_FOCUS_BY_STYLE: Record<DanceStyle, string> = {
  ballet: "טכניקה קלאסית · קו · שלמות",
  pointe: "הכנה לפוינט · כוח ויציבות",
  modern: "טכניקה מודרנית · קומפוזיציה",
  hiphop: "יסודות היפ הופ · פריסטייל",
  acro: "גמישות · כוח · תנאי גוף לאקרו",
  flamenco: "מוזיקליות פלמנקו · ביטוי",
  repertoire: "ליווי רפרטואר · הכנה לבמה"
};

export function privateLessonFocusForStyles(styles: DanceStyle[]): string[] {
  return styles.map((s) => PRIVATE_LESSON_FOCUS_BY_STYLE[s]);
}
