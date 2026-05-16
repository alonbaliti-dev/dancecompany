/**
 * 4px base spacing scale — use these keys, not arbitrary Tailwind gaps.
 */
export const space = {
  0: "0",
  px: "1px",
  0.5: "0.125rem", // 2
  1: "0.25rem", // 4
  1.5: "0.375rem", // 6
  2: "0.5rem", // 8
  2.5: "0.625rem", // 10
  3: "0.75rem", // 12
  3.5: "0.875rem", // 14
  4: "1rem", // 16
  5: "1.25rem", // 20
  6: "1.5rem", // 24
  7: "1.75rem", // 28
  8: "2rem", // 32
  9: "2.25rem", // 36
  10: "2.5rem", // 40
  12: "3rem", // 48
  14: "3.5rem", // 56
  16: "4rem", // 64
  20: "5rem",
  24: "6rem"
} as const;

/** Layout rhythm presets */
export const layout = {
  screenGap: space[8],
  sectionGap: space[6],
  cardGap: space[3],
  stackGap: space[2],
  inlineGap: space[2],
  pagePaddingX: space[5],
  pagePaddingXTablet: space[6],
  pagePaddingXDesktop: space[8],
  navBottomClearance: "5.75rem",
  tapMin: "2.75rem"
} as const;

export const spacingClass = {
  screen: "space-y-8 pb-8",
  section: "space-y-6",
  sectionTight: "space-y-4",
  card: "space-y-3",
  list: "space-y-2.5",
  inline: "gap-2",
  grid: "gap-3"
} as const;
