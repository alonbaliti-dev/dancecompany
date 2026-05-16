/** iOS-like motion — subtle, no bounce */
export const ease = {
  out: [0.16, 1, 0.3, 1] as const,
  inOut: [0.45, 0, 0.55, 1] as const
};

export const duration = {
  fast: 0.18,
  normal: 0.28,
  slow: 0.45,
  progress: 0.55,
  ring: 0.7
} as const;

export const spring = {
  gentle: { type: "spring" as const, stiffness: 380, damping: 34 },
  nav: { type: "spring" as const, stiffness: 420, damping: 34 },
  sheet: { type: "spring" as const, stiffness: 400, damping: 36 }
};

export const motionPresets = {
  pageEnter: { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 } },
  pageTransition: { duration: duration.normal, ease: ease.out },
  cardEnter: { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } },
  cardTransition: { ...spring.gentle, delay: 0.02 },
  press: { whileTap: { scale: 0.99 } },
  sheet: { initial: { y: "100%" }, animate: { y: 0 }, exit: { y: "100%" } }
} as const;
