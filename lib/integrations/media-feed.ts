import { danceStyleToInstitutional } from "@/lib/studio/dance-style";
import type { DanceStyle, ExternalMediaCategory, ExternalMediaItem, InstitutionalStyleId } from "@/lib/types";
import { STUDIO_SOCIAL_LINKS, STUDIO_WEBSITE_URL } from "./social-links";

const IG = STUDIO_SOCIAL_LINKS.find((l) => l.platform === "instagram")!.url;
const YT = STUDIO_SOCIAL_LINKS.find((l) => l.platform === "youtube")!.url;
const FB = STUDIO_SOCIAL_LINKS.find((l) => l.platform === "facebook")!.url;

const FEED: ExternalMediaItem[] = [
  {
    id: "ext_flamenco_1",
    platform: "instagram",
    title: "פלמנקו — רגע מהחזרה",
    description: "מהאינסטגרם של הסטודיו",
    externalUrl: IG,
    category: "flamenco",
    featured: true
  },
  {
    id: "ext_hiphop_1",
    platform: "instagram",
    title: "היפ הופ — קומבינציה",
    description: "מהאינסטגרם של הסטודיו",
    externalUrl: IG,
    category: "hiphop",
    featured: false
  },
  {
    id: "ext_ballet_1",
    platform: "youtube",
    title: "בלט קלאסי — תרגול",
    description: "ערוץ הסטודיו",
    externalUrl: YT,
    category: "ballet",
    featured: false
  },
  {
    id: "ext_modern_1",
    platform: "facebook",
    title: "מודרן — improv",
    description: "עדכון מהסטודיו",
    externalUrl: FB,
    category: "modern",
    featured: false
  },
  {
    id: "ext_studio_1",
    platform: "facebook",
    title: "LK Dance School",
    description: "אתר הסטודיו",
    externalUrl: STUDIO_WEBSITE_URL,
    category: "studio_update",
    featured: true
  },
  {
    id: "ext_perf_1",
    platform: "youtube",
    title: "הופעת סוף שנה",
    description: "זיכרון מהבמה",
    externalUrl: YT,
    category: "performance",
    featured: false
  },
  {
    id: "ext_reh_1",
    platform: "instagram",
    title: "חזרת נבחרת",
    description: "מאחורי הקלעים",
    externalUrl: IG,
    category: "rehearsal",
    featured: false
  },
  {
    id: "ext_ach_1",
    platform: "instagram",
    title: "הישג קהילתי",
    description: "גאווה סטודיו",
    externalUrl: IG,
    category: "achievement",
    featured: false
  }
];

const STYLE_CATEGORY: Partial<Record<InstitutionalStyleId, ExternalMediaCategory>> = {
  flamenco: "flamenco",
  ballet: "ballet",
  modern: "modern",
  hiphop: "hiphop",
  acro: "rehearsal",
  lyrical: "performance",
  pre_ballet: "ballet",
  jazz: "performance"
};

export function getStudioMediaFeed(): ExternalMediaItem[] {
  return FEED;
}

export function getFeaturedMedia(): ExternalMediaItem[] {
  return FEED.filter((m) => m.featured);
}

export function getRehearsalMedia(): ExternalMediaItem[] {
  return FEED.filter((m) => m.category === "rehearsal");
}

export function getPerformanceMedia(): ExternalMediaItem[] {
  return FEED.filter((m) => m.category === "performance" || m.category === "achievement");
}

export function getMediaForStyle(styleId: InstitutionalStyleId): ExternalMediaItem[] {
  const cat = STYLE_CATEGORY[styleId];
  if (!cat) return FEED.filter((m) => m.category === "studio_update");
  return FEED.filter((m) => m.category === cat || m.category === "studio_update");
}

export function getMediaForFaculty(facultyId: string, danceStyles: DanceStyle[]): ExternalMediaItem[] {
  const cats = new Set<ExternalMediaCategory>(["studio_update"]);
  for (const s of danceStyles) {
    const inst = danceStyleToInstitutional(s);
    getMediaForStyle(inst).forEach((m) => cats.add(m.category));
  }
  const related = FEED.filter((m) => cats.has(m.category));
  if (facultyId === "fac_liata") {
    return [...FEED.filter((m) => m.category === "flamenco" || m.featured), ...related].slice(0, 4);
  }
  return related.slice(0, 4);
}

export function getLegacyMedia(): ExternalMediaItem[] {
  return FEED.filter((m) =>
    ["performance", "achievement", "rehearsal", "studio_update"].includes(m.category)
  );
}
