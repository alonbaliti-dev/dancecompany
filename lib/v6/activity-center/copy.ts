export const V6_ACTIVITY_COPY = {
  centerKicker: "מרכז פעילות",
  centerTitle: "עדכונים והתראות",
  viewAll: "למרכז הפעילות",
  unreadKicker: (count: number) => `${count} חדשים`,
  unreadBadgeLabel: (count: number) => `${count} עדכונים שלא נקראו`,
  unreadHeroLabel: (count: number) => `${count} עדכונים חדשים`,
  calmKicker: "עדכונים",
  markAllRead: "סמן הכול כנקרא",
  calmStatus: "הכול שקט כרגע — בלי עומס מיותר",
  needsAttention: (count: number) => `${count} פריטים דורשים תשומת לב`
} as const;
