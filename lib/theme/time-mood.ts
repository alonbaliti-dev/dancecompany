import { cardGradients } from "./gradients";
import type { SemanticTone } from "./semantic-tokens";

export type TimeMood = {
  tone: SemanticTone;
  heroGradient: string;
  glowRgb: string;
};

/** Adaptive accents for Today hub by time of day */
export function timeMoodForHour(hour: number): TimeMood {
  if (hour >= 5 && hour < 11) {
    return { tone: "freestyle", heroGradient: cardGradients.morning, glowRgb: "251,146,60" };
  }
  if (hour >= 11 && hour < 17) {
    return { tone: "accent", heroGradient: cardGradients.accent, glowRgb: "52,211,153" };
  }
  if (hour >= 17 && hour < 22) {
    return { tone: "rehearsal", heroGradient: cardGradients.evening, glowRgb: "129,140,248" };
  }
  return { tone: "technique", heroGradient: cardGradients.evening, glowRgb: "96,165,250" };
}
