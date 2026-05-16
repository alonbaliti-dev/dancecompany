import type { SemanticTone } from "@/lib/design-system/colors";

export type StudioDayPhase = "performance_soon" | "rehearsal" | "class_day" | "calm";

export type StudioDayContext = {
  phase: StudioDayPhase;
  ambientLabel: string;
  tone: SemanticTone;
  /** Subtle copy for hero — one line only */
  heroLine: string;
};

/** Emotional rhythm of the studio calendar — drives Today ambience. */
export function resolveStudioDay(opts: {
  performanceDaysRemaining: number;
  hasClassToday: boolean;
  hour: number;
}): StudioDayContext {
  const { performanceDaysRemaining, hasClassToday, hour } = opts;

  if (performanceDaysRemaining <= 14 && performanceDaysRemaining > 0) {
    return {
      phase: "performance_soon",
      ambientLabel: "שבועות הבמה",
      tone: "competition",
      heroLine:
        performanceDaysRemaining <= 7
          ? "אנרגיית חזרות — כל שיעור מקרב לבמה."
          : "ההכנה לקראת המופע — קצב, דיוק וביטחון."
    };
  }

  if (hasClassToday && hour >= 14 && hour < 22) {
    return {
      phase: "rehearsal",
      ambientLabel: "יום חזרה",
      tone: "rehearsal",
      heroLine: "היום בסטודיו — התמקדו בנוכחות, בקצב וביטוי."
    };
  }

  if (hasClassToday) {
    return {
      phase: "class_day",
      ambientLabel: "יום שיעור",
      tone: "accent",
      heroLine: "השיעור הבא מחכה — תרגול קצר לפניו עושה הבדל."
    };
  }

  return {
    phase: "calm",
    ambientLabel: "יום שקט",
    tone: "technique",
    heroLine: "יום ללא שיעור — מצוין לחזק טכניקה בקצב שלכם."
  };
}
