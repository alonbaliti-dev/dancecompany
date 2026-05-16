import type { DanceStyleId, SemanticTone } from "./semantic-tokens";

/** Card / hero washes — low opacity for dark base */
export const cardGradients: Record<DanceStyleId | "accent" | "achievement" | "rehearsal" | "competition" | "morning" | "evening" | "executive", string> = {
  accent: "linear-gradient(145deg, rgba(52,211,153,0.14) 0%, rgba(255,255,255,0.03) 48%, transparent 100%)",
  morning: "linear-gradient(145deg, rgba(251,146,60,0.12) 0%, rgba(252,211,77,0.06) 40%, transparent 100%)",
  evening: "linear-gradient(145deg, rgba(129,140,248,0.14) 0%, rgba(192,132,252,0.06) 45%, transparent 100%)",
  executive: "linear-gradient(145deg, rgba(167,139,250,0.1) 0%, rgba(56,189,248,0.05) 50%, transparent 100%)",
  hiphop: "linear-gradient(145deg, rgba(192,132,252,0.16) 0%, rgba(232,121,249,0.06) 42%, transparent 100%)",
  commercial: "linear-gradient(145deg, rgba(251,113,133,0.14) 0%, rgba(253,164,175,0.06) 40%, transparent 100%)",
  technique: "linear-gradient(145deg, rgba(96,165,250,0.14) 0%, rgba(148,163,184,0.05) 45%, transparent 100%)",
  flexibility: "linear-gradient(145deg, rgba(34,211,238,0.13) 0%, rgba(103,232,249,0.05) 42%, transparent 100%)",
  freestyle: "linear-gradient(145deg, rgba(251,146,60,0.15) 0%, rgba(251,191,36,0.06) 40%, transparent 100%)",
  competition: "linear-gradient(145deg, rgba(251,191,36,0.12) 0%, rgba(220,38,38,0.08) 50%, transparent 100%)",
  rehearsal: "linear-gradient(145deg, rgba(129,140,248,0.16) 0%, rgba(167,139,250,0.07) 45%, transparent 100%)",
  achievement: "linear-gradient(145deg, rgba(252,211,77,0.14) 0%, rgba(254,243,199,0.05) 50%, transparent 100%)",
  jazz: "linear-gradient(145deg, rgba(244,114,182,0.12) 0%, rgba(232,121,249,0.05) 45%, transparent 100%)",
  default: "linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)"
};

export const progressGradients: Record<SemanticTone, [string, string]> = {
  accent: ["rgba(52,211,153,0.95)", "rgba(16,185,129,0.75)"],
  success: ["rgba(52,211,153,0.95)", "rgba(16,185,129,0.75)"],
  warning: ["rgba(251,191,36,0.95)", "rgba(245,158,11,0.75)"],
  danger: ["rgba(251,113,133,0.95)", "rgba(244,63,94,0.75)"],
  info: ["rgba(56,189,248,0.95)", "rgba(37,99,235,0.75)"],
  achievement: ["rgba(252,211,77,0.95)", "rgba(245,158,11,0.7)"],
  hiphop: ["rgba(192,132,252,0.95)", "rgba(232,121,249,0.75)"],
  commercial: ["rgba(251,113,133,0.95)", "rgba(253,164,175,0.75)"],
  technique: ["rgba(96,165,250,0.95)", "rgba(148,163,184,0.75)"],
  flexibility: ["rgba(34,211,238,0.95)", "rgba(103,232,249,0.75)"],
  freestyle: ["rgba(251,146,60,0.95)", "rgba(251,191,36,0.75)"],
  competition: ["rgba(251,191,36,0.95)", "rgba(220,38,38,0.7)"],
  rehearsal: ["rgba(129,140,248,0.95)", "rgba(167,139,250,0.75)"],
  jazz: ["rgba(244,114,182,0.95)", "rgba(232,121,249,0.75)"],
  teacher: ["rgba(56,189,248,0.95)", "rgba(37,99,235,0.75)"],
  management: ["rgba(167,139,250,0.95)", "rgba(129,140,248,0.75)"],
  staff: ["rgba(148,163,184,0.9)", "rgba(100,116,139,0.7)"],
  ai: ["rgba(45,212,191,0.95)", "rgba(20,184,166,0.75)"],
  default: ["rgba(255,255,255,0.5)", "rgba(255,255,255,0.25)"]
};

export function glowShadow(tone: SemanticTone, intensity: "soft" | "medium" = "soft"): string {
  const map: Partial<Record<SemanticTone, string>> = {
    hiphop: "192,132,252",
    commercial: "251,113,133",
    freestyle: "251,146,60",
    rehearsal: "129,140,248",
    achievement: "252,211,77",
    accent: "52,211,153",
    danger: "251,113,133"
  };
  const rgb = map[tone] ?? "52,211,153";
  const a = intensity === "medium" ? 0.35 : 0.22;
  return `0 0 40px rgba(${rgb},${a}), 0 8px 32px rgba(0,0,0,0.45)`;
}
