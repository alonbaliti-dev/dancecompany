/**
 * Hebrew-first typography hierarchy — className strings for Tailwind.
 */
export const fontFamily = {
  sans: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
} as const;

export const fontSize = {
  hero: ["1.85rem", { lineHeight: "1.08", letterSpacing: "-0.02em", fontWeight: "600" }],
  pageTitle: ["1.65rem", { lineHeight: "1.12", letterSpacing: "-0.02em", fontWeight: "600" }],
  sectionTitle: ["1.35rem", { lineHeight: "1.2", letterSpacing: "-0.015em", fontWeight: "600" }],
  cardTitle: ["1.0625rem", { lineHeight: "1.35", letterSpacing: "-0.01em", fontWeight: "600" }],
  body: ["0.9375rem", { lineHeight: "1.55", fontWeight: "400" }],
  bodySmall: ["0.875rem", { lineHeight: "1.5", fontWeight: "400" }],
  caption: ["0.75rem", { lineHeight: "1.45", fontWeight: "500" }],
  label: ["0.6875rem", { lineHeight: "1.3", letterSpacing: "0.14em", fontWeight: "600" }],
  stat: ["1.25rem", { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "600" }]
} as const;

/** Ready-to-use Tailwind class strings (RTL-friendly) */
export const type = {
  hero: "text-[1.85rem] font-semibold leading-[1.08] tracking-tight text-white",
  pageTitle: "text-[1.65rem] font-semibold leading-[1.12] tracking-tight text-white",
  sectionTitle: "text-right text-[1.35rem] font-semibold leading-snug tracking-tight text-white",
  cardTitle: "text-[1.0625rem] font-semibold leading-snug text-white",
  body: "text-[15px] leading-relaxed text-white/55",
  bodyStrong: "text-[15px] font-medium leading-relaxed text-white/80",
  caption: "text-[12px] leading-relaxed text-white/42",
  label: "text-[11px] font-semibold uppercase tracking-[0.14em] text-white/38",
  status: "text-[10px] font-semibold uppercase tracking-[0.12em] text-white/45",
  eyebrow: "text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40",
  stat: "text-xl font-semibold tabular-nums tracking-tight text-white"
} as const;
