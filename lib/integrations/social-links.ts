import type { ExternalMediaPlatform } from "@/lib/types";

/**
 * Public studio channels — update URLs from official LK / Li Dance profiles.
 * Website: https://www.lidance.co.il (מקור רשמי לקישורי רשת).
 */
export type StudioSocialLink = {
  platform: ExternalMediaPlatform | "website";
  labelHe: string;
  handle: string;
  url: string;
  descriptionHe: string;
};

export const STUDIO_WEBSITE_URL = "https://www.lidance.co.il/";

/** Channel URLs — placeholders until exact handles are confirmed on lidance.co.il */
export const STUDIO_SOCIAL_LINKS: StudioSocialLink[] = [
  {
    platform: "instagram",
    labelHe: "אינסטגרם",
    handle: "LK Dance School",
    url: "https://www.instagram.com/explore/tags/lkdance/",
    descriptionHe: "רגעים מהסטודיו, חזרות והופעות — עדכונים מהקהילה."
  },
  {
    platform: "facebook",
    labelHe: "פייסבוק",
    handle: "LK Dance School",
    url: "https://www.facebook.com/search/top?q=lk%20dance%20school",
    descriptionHe: "עדכונים, אירועים וקהילת הסטודיו."
  },
  {
    platform: "youtube",
    labelHe: "יוטיוב",
    handle: "LK Dance School",
    url: "https://www.youtube.com/results?search_query=lk+dance+school",
    descriptionHe: "סרטוני תרגול, הופעות וחומר מהסטודיו (דמו)."
  },
  {
    platform: "website",
    labelHe: "אתר הסטודיו",
    handle: "lidance.co.il",
    url: STUDIO_WEBSITE_URL,
    descriptionHe: "סגנונות, מערכת שעות ומידע על בית הספר."
  }
];

export function getSocialLink(platform: ExternalMediaPlatform | "website"): StudioSocialLink | undefined {
  return STUDIO_SOCIAL_LINKS.find((l) => l.platform === platform);
}

export function platformCtaHe(platform: ExternalMediaPlatform): string {
  if (platform === "instagram") return "צפייה באינסטגרם";
  if (platform === "youtube") return "צפייה ביוטיוב";
  return "צפייה בפייסבוק";
}
