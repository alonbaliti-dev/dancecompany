/**
 * Raw palette — premium dark UI with cinematic accents.
 * Components consume semantic tokens / CSS variables, not these directly.
 */

export const palette = {
  void: "#050506",
  voidElevated: "#0c0c0f",
  voidCard: "#101014",
  voidCardHi: "#16161c",

  ink: "rgba(255,255,255,0.92)",
  inkSecondary: "rgba(255,255,255,0.55)",
  inkMuted: "rgba(255,255,255,0.38)",

  /** Semantic status */
  success: { core: "#34d399", soft: "rgba(52,211,153,0.14)", border: "rgba(52,211,153,0.35)" },
  warning: { core: "#fbbf24", soft: "rgba(251,191,36,0.12)", border: "rgba(251,191,36,0.32)" },
  danger: { core: "#fb7185", soft: "rgba(251,113,133,0.12)", border: "rgba(251,113,133,0.34)" },
  info: { core: "#38bdf8", soft: "rgba(56,189,248,0.1)", border: "rgba(56,189,248,0.28)" },
  accent: { core: "#34d399", soft: "rgba(52,211,153,0.12)", border: "rgba(52,211,153,0.3)" },

  /** Dance style identities */
  hiphop: { core: "#c084fc", glow: "#e879f9", soft: "rgba(192,132,252,0.14)", border: "rgba(232,121,249,0.32)" },
  commercial: { core: "#fb7185", glow: "#fda4af", soft: "rgba(251,113,133,0.12)", border: "rgba(253,164,175,0.3)" },
  technique: { core: "#60a5fa", glow: "#94a3b8", soft: "rgba(96,165,250,0.12)", border: "rgba(148,163,184,0.28)" },
  flexibility: { core: "#22d3ee", glow: "#67e8f9", soft: "rgba(34,211,238,0.11)", border: "rgba(103,232,249,0.28)" },
  freestyle: { core: "#fb923c", glow: "#fbbf24", soft: "rgba(251,146,60,0.12)", border: "rgba(251,191,36,0.3)" },
  competition: { core: "#fbbf24", glow: "#dc2626", soft: "rgba(251,191,36,0.1)", border: "rgba(220,38,38,0.28)" },
  rehearsal: { core: "#818cf8", glow: "#a78bfa", soft: "rgba(129,140,248,0.12)", border: "rgba(167,139,250,0.3)" },
  achievement: { core: "#fcd34d", glow: "#fef3c7", soft: "rgba(252,211,77,0.1)", border: "rgba(254,243,199,0.22)" },
  jazz: { core: "#f472b6", glow: "#e879f9", soft: "rgba(244,114,182,0.11)", border: "rgba(232,121,249,0.26)" },

  /** Roles */
  teacher: { core: "#38bdf8", soft: "rgba(56,189,248,0.1)", border: "rgba(56,189,248,0.26)" },
  management: { core: "#a78bfa", soft: "rgba(167,139,250,0.1)", border: "rgba(167,139,250,0.28)" },
  staff: { core: "#94a3b8", soft: "rgba(148,163,184,0.08)", border: "rgba(148,163,184,0.22)" },
  ai: { core: "#2dd4bf", soft: "rgba(45,212,191,0.1)", border: "rgba(45,212,191,0.28)" }
} as const;
