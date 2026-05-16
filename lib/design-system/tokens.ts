/**
 * Single entry point for the LK design system.
 */
export * from "./spacing";
export * from "./typography";
export * from "./radius";
export * from "./shadows";
export * from "./motion";
export * from "./colors";

import { spacingClass } from "./spacing";
import { elevation } from "./shadows";
import { radiusClass } from "./radius";
import { type } from "./typography";

/** Surfaces */
export const surfaces = {
  card: `${radiusClass.card} border ${elevation.raised} surface-card`,
  cardFlat: `${radiusClass.card} border ${elevation.flat}`,
  header: `${radiusClass.card} border border-white/[0.09] surface-header`,
  chrome: `${radiusClass.navShell} border border-white/[0.1] surface-chrome`,
  input: `${radiusClass.input} border border-white/10 bg-white/[0.05]`,
  menuRow: `${radiusClass.cardSm} border border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-white/[0.02]`
} as const;

/** Interaction — touch-first (min 44px targets, active feedback). */
export const interaction = {
  primaryBtn:
    "w-full rounded-2xl py-3.5 text-base font-semibold shadow-[0_1px_0_rgba(255,255,255,0.12)_inset] transition active:scale-[0.99] min-h-[3rem] touch-manipulation [@media(hover:hover)_and_(pointer:fine)]:hover:brightness-110",
  secondaryBtn:
    "rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-base font-medium text-white/85 transition active:scale-[0.99] active:bg-white/[0.1] min-h-[3rem] touch-manipulation [@media(hover:hover)_and_(pointer:fine)]:hover:bg-white/[0.07]",
  subtleBtn:
    "rounded-xl px-4 py-2.5 text-sm font-medium text-white/70 min-h-[2.75rem] touch-manipulation transition active:bg-white/[0.08] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-white/[0.06]",
  iconBtn:
    "inline-flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.04] text-white/70 active:bg-white/[0.1] active:scale-[0.98]",
  focusRing:
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050506]",
  input: `w-full ${surfaces.input} px-4 py-3 text-base text-white outline-none placeholder:text-white/30 focus:border-[color:var(--border-accent)] touch-manipulation`,
  tapTarget: "min-h-[2.75rem] min-w-[2.75rem] touch-manipulation"
} as const;

/** Screen layout */
export const screen = {
  className: spacingClass.screen,
  sectionList: spacingClass.list,
  page: "app-canvas-glow min-h-app text-white"
} as const;

/** Typography shortcuts on tokens */
export const text = type;

/** More menu / hub section rhythm */
export const menuSection = {
  wrap: "space-y-8",
  block: "space-y-2.5",
  title: "text-right text-[11px] font-semibold uppercase tracking-[0.14em] text-white/38"
} as const;

/** Collapsible stack on Today hub */
export const stackSection = {
  summary:
    "flex w-full cursor-pointer list-none items-center justify-between gap-2 py-1 text-right marker:content-none [&::-webkit-details-marker]:hidden",
  panel: "mt-3 space-y-2.5"
} as const;

/** Tappable hub rows (main tabs secondary screens). */
export const hubRow =
  "flex w-full min-h-[3.25rem] touch-manipulation items-center justify-between gap-3 px-4 py-3.5 text-right shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition active:scale-[0.99] active:bg-white/[0.08] [@media(hover:hover)_and_(pointer:fine)]:hover:border-white/[0.12] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-white/[0.06]";
