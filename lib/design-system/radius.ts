export const radius = {
  xs: "0.5rem", // 8
  sm: "0.75rem", // 12
  md: "1rem", // 16
  lg: "1.125rem", // 18
  xl: "1.375rem", // 22
  "2xl": "1.5rem", // 24
  pill: "9999px",
  full: "9999px"
} as const;

export const radiusClass = {
  button: "rounded-2xl",
  input: "rounded-2xl",
  card: "rounded-[22px]",
  cardSm: "rounded-[18px]",
  sheet: "rounded-t-[24px]",
  nav: "rounded-[14px]",
  navShell: "rounded-[24px]",
  icon: "rounded-2xl",
  chip: "rounded-full"
} as const;
