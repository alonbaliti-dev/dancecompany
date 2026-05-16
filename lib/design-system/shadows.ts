export const shadows = {
  /** Inset highlight on elevated surfaces */
  cardInset: "inset 0 1px 0 rgba(255,255,255,0.05)",
  cardInsetHover: "inset 0 1px 0 rgba(255,255,255,0.07)",
  /** Floating chrome */
  header: "0 8px 40px rgba(0,0,0,0.25)",
  nav: "0 -16px 56px rgba(0,0,0,0.5)",
  sheet: "0 24px 80px rgba(0,0,0,0.55)",
  buttonInset: "0 1px 0 rgba(255,255,255,0.12) inset",
  glowAccent: "0 0 40px rgba(52,211,153,0.15)"
} as const;

export const shadowClass = {
  card: `shadow-[${shadows.cardInset}]`,
  header: `shadow-[${shadows.header}]`,
  nav: `shadow-[${shadows.nav}]`
} as const;

/** Elevation tiers — combine with border tokens */
export const elevation = {
  flat: "border-white/[0.06] bg-white/[0.02]",
  raised: "border-white/[0.08] bg-gradient-to-b from-white/[0.06] to-white/[0.02]",
  overlay: "border-white/[0.1] bg-[rgba(8,8,10,0.88)] backdrop-blur-2xl backdrop-saturate-150"
} as const;
