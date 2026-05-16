/** Visual language inspired by mentor team poster 25–26 */
export const FACULTY_THEME = {
  sand: "#F5E6E3",
  sandMuted: "rgba(245,230,227,0.12)",
  sandBorder: "rgba(245,230,227,0.22)",
  ink: "#1c1917",
  rose: "#9f1239",
  charcoal: "#292524"
} as const;

export const FACULTY_PORTRAIT_GRADIENTS = [
  `linear-gradient(145deg, ${FACULTY_THEME.sand}22 0%, ${FACULTY_THEME.rose}55 45%, ${FACULTY_THEME.charcoal} 100%)`,
  `linear-gradient(145deg, rgba(192,132,252,0.25) 0%, ${FACULTY_THEME.sand}18 50%, ${FACULTY_THEME.charcoal} 100%)`,
  `linear-gradient(145deg, rgba(56,189,248,0.2) 0%, ${FACULTY_THEME.sand}15 55%, ${FACULTY_THEME.charcoal} 100%)`
];
