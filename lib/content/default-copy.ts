import type { EditableText } from "@/lib/types";

function row(
  key: string,
  module: string,
  label: string,
  he: string,
  en?: string
): EditableText {
  return {
    id: `copy_${key.replace(/\./g, "_")}`,
    key,
    scope: "global",
    module,
    label,
    he,
    en,
    defaultHe: he,
    defaultEn: en
  };
}

/** Canonical copy registry — Super Admin can override via EditableTextProvider. */
export const DEFAULT_EDITABLE_COPY: EditableText[] = [
  row("nav.dashboard", "navigation", "טאב דשבורד", "דשבורד", "Dashboard"),
  row("nav.lessons", "navigation", "טאב שיעורים", "שיעורים", "Lessons"),
  row("nav.messages", "navigation", "טאב הודעות", "הודעות", "Messages"),
  row("nav.shop", "navigation", "טאב חנות", "חנות", "Shop"),
  row("nav.more", "navigation", "טאב עוד", "עוד", "More"),
  row("nav.tasks_hub", "navigation", "משימות (תפריט)", "משימות", "Tasks"),

  row("today.shop.title", "today", "כרטיס חנות — כותרת", "חנות הסטודיו", "Studio Shop"),
  row("today.shop.subtitle", "today", "כרטיס חנות — תת־כותרת", "בגדים · כרטיסים · שיעורים פרטיים", "Wear · tickets · private lessons"),
  row("today.shop.private", "today", "כפתור שיעורים פרטיים", "שיעורים פרטיים", "Private lessons"),
  row("today.shop.tickets", "today", "כפתור כרטיסים", "כרטיסים למופעים", "Event tickets"),
  row("today.shop.wear", "today", "כפתור ביגוד", "ביגוד וציוד", "Wear & gear"),

  row("shop.boutique.title", "shop", "כותרת בוטיק", "בוטיק הסטודיו", "Studio Boutique"),
  row("shop.boutique.subtitle", "shop", "תת־כותרת בוטיק", "קולקציה אוצרת — בגדים, ציוד ובמה", "Curated collection"),

  row("event.buy_tickets", "events", "רכישת כרטיסים", "רכישת כרטיסים", "Buy tickets"),
  row("event.buy_tickets_hint", "events", "רמז כרטיסים", "כרטיסים למופע סוף השנה ובמה חיה", "End-of-year & live show"),

  row("faculty.book_private", "faculty", "הזמנת שיעור פרטי", "הזמנת שיעור פרטי", "Book a private lesson"),

  row("floating.shop", "navigation", "כפתור צף חנות", "חנות", "Shop"),

  row("more.tasks", "more", "משימות בתפריט עוד", "משימות ותרגול ביתי", "Tasks & home practice"),

  row("payment.secure_title", "shop", "כותרת תשלום", "תשלום מאובטח", "Secure payment"),

  row("onboarding.welcome", "onboarding", "ברוכים הבאים", "ברוכים הבאים ל־LK Student Space", "Welcome to LK Student Space")
];

export const DEFAULT_COPY_BY_KEY = new Map(DEFAULT_EDITABLE_COPY.map((t) => [t.key, t]));
