/**
 * Touch-first interaction constants (Apple HIG ~44pt minimum).
 * Use these class strings on controls in mobile layouts.
 */
export const touch = {
  /** Minimum interactive height (44px at 16px root). */
  minTarget: "min-h-[2.75rem] min-w-[2.75rem] touch-manipulation",
  /** Comfortable primary tap (48px). */
  primaryTarget: "min-h-[3rem] touch-manipulation",
  /** Icon-only circular control. */
  iconButton:
    "inline-flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.04] text-white/70 active:bg-white/[0.1] active:scale-[0.98]",
  /** Icon with hover only on fine pointers. */
  /** Fixed composer above bottom nav (chat, etc.). */
  composerFixed:
    "composer-fixed pointer-events-auto fixed inset-x-0 z-[55] mx-auto max-w-md px-5",
  /** Text field — 16px prevents iOS zoom on focus. */
  field: "text-base leading-normal touch-manipulation"
} as const;
