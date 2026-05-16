import { END_YEAR_EVENT_ID } from "@/lib/shop-logic";
import { cardGradients, glowShadow } from "@/lib/theme/gradients";
import type { DanceStyleId } from "@/lib/theme/semantic-tokens";
import { getTone } from "@/lib/design-system/colors";
import type { SemanticTone } from "@/lib/theme/semantic-tokens";
import type { ShopProduct, ShopProductCategory, UserProfile } from "@/lib/types";

/** Editorial boutique categories — emotional, style-led (not generic e-commerce). */
export type BoutiqueCategoryId =
  | "all"
  | "studio_wear"
  | "flamenco"
  | "hiphop"
  | "ballet"
  | "acro"
  | "accessories"
  | "event_ticket"
  | "workshop"
  | "private_lessons";

export type BoutiqueCategory = {
  id: BoutiqueCategoryId;
  label: string;
  tagline: string;
  styleId: DanceStyleId;
};

export const BOUTIQUE_CATEGORIES: BoutiqueCategory[] = [
  { id: "all", label: "הכל", tagline: "קולקציית הסטודיו", styleId: "default" },
  { id: "studio_wear", label: "בגדי סטודיו", tagline: "הלבוש של LK", styleId: "commercial" },
  { id: "flamenco", label: "פלמנקו", tagline: "תשוקה וקצב", styleId: "competition" },
  { id: "hiphop", label: "היפ הופ", tagline: "אנרגיה עירונית", styleId: "hiphop" },
  { id: "ballet", label: "בלט", tagline: "קלאסיקה ודיוק", styleId: "jazz" },
  { id: "acro", label: "אקרודאנס", tagline: "כוח ואוויר", styleId: "flexibility" },
  { id: "accessories", label: "אביזרים", tagline: "פרטים שמשלימים", styleId: "freestyle" },
  { id: "event_ticket", label: "כרטיסים", tagline: "חוויית במה", styleId: "competition" },
  { id: "workshop", label: "סדנאות", tagline: "עומק וצמיחה", styleId: "rehearsal" },
  { id: "private_lessons", label: "שיעורים פרטיים", tagline: "אחד על אחד עם המורה", styleId: "technique" }
];

export const END_YEAR_SHOW = {
  eventId: END_YEAR_EVENT_ID,
  title: "מופע סוף שנה — LK Dance School",
  subtitle: "נבחרות, כוריאוגרפיות ורגעים מהבמה",
  venue: "אולם כפר ויתקין",
  dateIso: "2026-06-28T19:00:00+03:00",
  groups: ["נבחרת היפ הופ", "פלמנקו Junior", "בלט מתקדמים", "אקרו צוות"]
} as const;

const STYLE_TAG_RULES: { style: DanceStyleId; patterns: RegExp[] }[] = [
  { style: "competition", patterns: [/פלמנקו|flamenco/i] },
  { style: "hiphop", patterns: [/היפ|hip\s*hop/i] },
  { style: "jazz", patterns: [/בלט|ballet|ג'אז|jazz/i] },
  { style: "flexibility", patterns: [/אקרו|acro/i] },
  { style: "technique", patterns: [/נעל|shoe|גרב|sock/i] },
  { style: "freestyle", patterns: [/גומי|אביזר|stretch/i] },
  { style: "competition", patterns: [/מופע|כרטיס|VIP|הופע/i] },
  { style: "rehearsal", patterns: [/קייטנ|סדנ|מחנה|workshop/i] }
];

export function productStyleId(product: ShopProduct): DanceStyleId {
  const blob = `${product.title} ${product.description} ${product.tags.join(" ")}`;
  for (const rule of STYLE_TAG_RULES) {
    if (rule.patterns.some((p) => p.test(blob))) return rule.style;
  }
  if (product.category === "event_ticket") return "competition";
  if (product.category === "workshop") return "rehearsal";
  if (product.category === "dance_shoes") return "technique";
  if (product.category === "dance_socks") return "jazz";
  if (product.category === "accessories") return "freestyle";
  return "commercial";
}

export function productTone(product: ShopProduct): SemanticTone {
  const id = productStyleId(product);
  return (id === "default" ? "accent" : id) as SemanticTone;
}

export function productHeroGradient(product: ShopProduct): string {
  return cardGradients[productStyleId(product)] ?? cardGradients.default;
}

export function productGlow(product: ShopProduct): string {
  const id = productStyleId(product);
  return glowShadow(id === "default" ? "accent" : id, "medium");
}

/** Cinematic placeholder art — no external assets required. */
export function productVisualLabel(product: ShopProduct): string {
  if (product.category === "event_ticket") return "LIVE";
  const map: Partial<Record<ShopProductCategory, string>> = {
    studio_wear: "STUDIO",
    dance_shoes: "TECH",
    dance_socks: "CLASS",
    accessories: "GEAR",
    workshop: "CAMP"
  };
  return map[product.category] ?? "LK";
}

export function matchBoutiqueCategory(product: ShopProduct, cat: BoutiqueCategoryId): boolean {
  if (cat === "private_lessons") return false;
  if (cat === "all") return true;
  if (cat === "event_ticket") return product.category === "event_ticket";
  if (cat === "workshop") return product.category === "workshop";
  if (cat === "accessories") return product.category === "accessories" || product.category === "dance_socks";
  if (cat === "studio_wear") return product.category === "studio_wear";
  if (cat === "flamenco") return /פלמנקו|flamenco/i.test(`${product.title} ${product.tags.join(" ")}`);
  if (cat === "hiphop") return /היפ|hip/i.test(`${product.title} ${product.tags.join(" ")}`);
  if (cat === "ballet") return /בלט|ballet|ג'אז/i.test(`${product.title} ${product.tags.join(" ")}`);
  if (cat === "acro") return /אקרו|acro|גמישות/i.test(`${product.title} ${product.tags.join(" ")}`);
  return true;
}

export function productUsageHint(product: ShopProduct): string | null {
  if (product.category === "event_ticket") return "מופע סוף שנה · במה חיה";
  if (/הודי|hoodie/i.test(product.title)) return "מומלץ לחימום וליציאה מהשיעור";
  if (/פלמנקו/i.test(product.title)) return "בשימוש בחזרות פלמנקו";
  if (/נבחרת|נעל ג'אז/i.test(product.title)) return "נבחרות LK · התאמה בסטודיו";
  if (/גרב/i.test(product.title)) return "בחזרות בלט ונבחרות";
  if (/גומי/i.test(product.title)) return "תרגול ביתי · גמישות";
  return null;
}

const GROUP_STYLE_HINTS: Record<string, RegExp[]> = {
  "נבחרת היפ הופ": [/היפ|hip/i],
  פלמנקו: [/פלמנקו/i],
  בלט: [/בלט|גרב/i],
  אקרו: [/אקרו|acro|גמישות/i]
};

export function scoreProductForUser(product: ShopProduct, user: UserProfile): number {
  let score = 0;
  const blob = `${product.title} ${product.tags.join(" ")}`;
  for (const group of user.assignedGroups) {
    for (const [hint, patterns] of Object.entries(GROUP_STYLE_HINTS)) {
      if (group.includes(hint) || hint.includes(group)) {
        if (patterns.some((p) => p.test(blob))) score += 3;
      }
    }
  }
  if (product.stockStatus === "low_stock") score += 1;
  if (product.category === "event_ticket") score += 2;
  if (product.relatedEventId === END_YEAR_EVENT_ID) score += 2;
  return score;
}

export function personalizeReason(product: ShopProduct, user: UserProfile): string | null {
  const score = scoreProductForUser(product, user);
  if (score < 3) return null;
  if (product.relatedEventId === END_YEAR_EVENT_ID) return "קשור למופע הקרוב שלך";
  if (/פלמנקו/i.test(product.title) && user.assignedGroups.some((g) => /פלמנקו|flamenco/i.test(g))) {
    return "מתאים לקבוצת הפלמנקו שלך";
  }
  if (/היפ|hip/i.test(`${product.title} ${product.tags}`) && user.assignedGroups.some((g) => /היפ|hip/i.test(g))) {
    return "נבחרת היפ הופ · מומלץ לקבוצה שלך";
  }
  if (/בלט|גרב/i.test(product.title) && user.assignedGroups.some((g) => /בלט|ballet/i.test(g))) {
    return "בשימוש בחזרות הבלט";
  }
  return "מומלץ עבורך";
}

export function getCountdown(targetIso: string): { days: number; hours: number; label: string } | null {
  const target = new Date(targetIso).getTime();
  const now = Date.now();
  const diff = target - now;
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return { days, hours, label: `${days} ימים · ${hours} שעות` };
  return { days: 0, hours, label: `${hours} שעות לפתיחה` };
}

export function isNewArrival(product: ShopProduct): boolean {
  return product.stockStatus === "preorder" || product.tags.some((t) => /חדש|new/i.test(t));
}

export function featuredProductIds(): string[] {
  return ["shop_lk_hoodie", "shop_end_year_ticket", "shop_flamenco_skirt", "shop_end_year_vip"];
}

export function categoryBannerGradient(cat: BoutiqueCategory): string {
  const t = getTone(cat.styleId === "default" ? "accent" : cat.styleId);
  return `linear-gradient(135deg, ${t.soft} 0%, rgba(0,0,0,0.5) 55%, transparent 100%)`;
}
