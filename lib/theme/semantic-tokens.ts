import { palette } from "./colors";

export type DanceStyleId =
  | "hiphop"
  | "commercial"
  | "technique"
  | "flexibility"
  | "freestyle"
  | "competition"
  | "rehearsal"
  | "achievement"
  | "jazz"
  | "default";

export type SemanticTone =
  | DanceStyleId
  | "accent"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "achievement"
  | "teacher"
  | "management"
  | "staff"
  | "ai";

export type ToneColors = {
  core: string;
  soft: string;
  border: string;
  glow?: string;
};

const toneMap: Record<SemanticTone, ToneColors> = {
  accent: palette.accent,
  success: palette.success,
  warning: palette.warning,
  danger: palette.danger,
  info: palette.info,
  achievement: palette.achievement,
  hiphop: palette.hiphop,
  commercial: palette.commercial,
  technique: palette.technique,
  flexibility: palette.flexibility,
  freestyle: palette.freestyle,
  competition: palette.competition,
  rehearsal: palette.rehearsal,
  jazz: palette.jazz,
  teacher: palette.teacher,
  management: palette.management,
  staff: palette.staff,
  ai: palette.ai,
  default: palette.accent
};

export function getTone(tone: SemanticTone = "accent"): ToneColors {
  return toneMap[tone] ?? toneMap.accent;
}

/** CSS variable names injected in globals.css */
export const cssVarNames = {
  bgCanvas: "--bg-canvas",
  bgCard: "--bg-card",
  bgElevated: "--bg-elevated",
  borderSubtle: "--border-subtle",
  borderAccent: "--border-accent",
  textPrimary: "--text-primary",
  textSecondary: "--text-secondary",
  textMuted: "--text-muted",
  accent: "--color-accent",
  success: "--color-success",
  warning: "--color-warning",
  danger: "--color-danger"
} as const;
