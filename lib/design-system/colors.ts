/**
 * Semantic color system — maps meaning to palette tones.
 * Re-exports theme palette; extends aliases for dance styles.
 */
import { palette } from "@/lib/theme/colors";
import { getTone as getThemeTone, type SemanticTone as ThemeTone } from "@/lib/theme/semantic-tokens";

export { palette };

/** Extended semantic keys used in product copy */
export type SemanticTone =
  | ThemeTone
  | "flamenco"
  | "ballet"
  | "modern"
  | "acrodance"
  | "urgent";

const aliases: Record<string, ThemeTone> = {
  flamenco: "competition",
  ballet: "jazz",
  modern: "commercial",
  acrodance: "flexibility",
  urgent: "danger"
};

export type ToneColors = {
  core: string;
  soft: string;
  border: string;
  glow?: string;
};

export function resolveThemeTone(tone: SemanticTone): ThemeTone {
  const key = aliases[tone as string] ?? tone;
  return key as ThemeTone;
}

export function getTone(tone: SemanticTone = "accent"): ToneColors {
  return getThemeTone(resolveThemeTone(tone));
}

export const ink = {
  primary: "rgba(255,255,255,0.92)",
  secondary: "rgba(255,255,255,0.55)",
  muted: "rgba(255,255,255,0.38)",
  faint: "rgba(255,255,255,0.22)"
} as const;

export const surface = {
  canvas: "var(--bg-canvas)",
  card: "var(--bg-card)",
  elevated: "var(--bg-elevated)",
  borderSubtle: "var(--border-subtle)",
  borderAccent: "var(--border-accent)"
} as const;

/** Status → tone mapping for badges and alerts */
export const statusTone: Record<string, SemanticTone> = {
  urgent: "urgent",
  important: "warning",
  normal: "accent",
  success: "success",
  danger: "danger",
  info: "info",
  achievement: "achievement",
  rehearsal: "rehearsal",
  teacher: "teacher",
  management: "management",
  staff: "staff"
};
