import { institutionalToDanceStyles } from "@/lib/studio/dance-style";
import { teachersForDanceStyle } from "@/lib/studio/staff-roster";
import type { InstitutionalDanceStyle, InstitutionalStyleId } from "@/lib/types";

function featuredForInstitutional(styleId: InstitutionalStyleId): string[] {
  const styles = institutionalToDanceStyles([styleId]);
  const ids = new Set<string>();
  for (const ds of styles) teachersForDanceStyle(ds).forEach((id) => ids.add(id));
  if (!styles.length && styleId === "pre_ballet") {
    teachersForDanceStyle("ballet").forEach((id) => ids.add(id));
  }
  return Array.from(ids);
}

export const INSTITUTIONAL_STYLES: Record<InstitutionalStyleId, InstitutionalDanceStyle> = {
  flamenco: {
    id: "flamenco",
    nameHe: "פלמנקו",
    nameEn: "Flamenco",
    description:
      "זהות אמנותית מרכזית ב-LK: קומפאס, עיגון ורגש. דגש על קצב, מוזיקליות והקשבה לגוף — מחיבור בין טכניקה לביטוי.",
    energy: "קצב · עיגון · ביטוי",
    mood: "דרמטי, חם ומוזיקלי",
    signatureColors: {
      core: "#fbbf24",
      soft: "rgba(185,28,28,0.22)",
      border: "rgba(251,191,36,0.45)",
      glow: "rgba(251,191,36,0.55)"
    },
    heroGradient:
      "linear-gradient(145deg, rgba(127,29,29,0.72) 0%, rgba(69,10,10,0.85) 38%, rgba(251,191,36,0.18) 72%, rgba(0,0,0,0.92) 100%)",
    featuredTeacherIds: featuredForInstitutional("flamenco"),
    featuredGroupNames: ["Junior Flamenco"],
    galleryPlaceholders: ["חימום וקצב", "שיעור כיתה", "רגע מהחזרה"]
  },
  ballet: {
    id: "ballet",
    nameHe: "בלט קלאסי",
    nameEn: "Classical Ballet",
    description: "יסודות של קו, שלמות ומוזיקליות — מסלול מקצועי מהצעדים הראשונים ועד רמת נבחרת.",
    energy: "מדויק · רך",
    mood: "קלאסי ומעודן",
    signatureColors: {
      core: "#f9a8d4",
      soft: "rgba(249,168,212,0.12)",
      border: "rgba(226,232,240,0.35)",
      glow: "rgba(241,245,249,0.25)"
    },
    heroGradient: "linear-gradient(145deg, rgba(244,114,182,0.2) 0%, rgba(148,163,184,0.12) 40%, rgba(0,0,0,0.75) 100%)",
    featuredTeacherIds: featuredForInstitutional("ballet"),
    featuredGroupNames: ["Classical Foundations", "בלט קלאסי — נבחרת"],
    galleryPlaceholders: ["ברֶה", "נקודות", "תרגול כיתה"]
  },
  modern: {
    id: "modern",
    nameHe: "מודרני",
    nameEn: "Modern Contemporary",
    description: "תנועה עכשווית, קומפוזיציה וחקירה — גוף ככלי ביטוי, עם משמעת אמנותית.",
    energy: "זורם · חוקר",
    mood: "אמנותי ועכשווי",
    signatureColors: {
      core: "#94a3b8",
      soft: "rgba(148,163,184,0.14)",
      border: "rgba(34,211,238,0.28)",
      glow: "rgba(56,189,248,0.22)"
    },
    heroGradient: "linear-gradient(145deg, rgba(71,85,105,0.45) 0%, rgba(34,211,238,0.08) 50%, rgba(0,0,0,0.8) 100%)",
    featuredTeacherIds: featuredForInstitutional("modern"),
    featuredGroupNames: ["Modern Ensemble"],
    relatedEventIds: ["evt_current_showcase"],
    galleryPlaceholders: ["קומבינציה", "אימפרוביזציה", "חזרה"]
  },
  hiphop: {
    id: "hiphop",
    nameHe: "היפ הופ",
    nameEn: "Hip Hop",
    description: "אנרגיה אורבנית, כוריאוגרפיה ונוכחות — מהבסיסים ועד עבודת נבחרת.",
    energy: "אורבני · חזק",
    mood: "אלקטרי וצעיר",
    signatureColors: {
      core: "#e879f9",
      soft: "rgba(232,121,249,0.14)",
      border: "rgba(192,132,252,0.35)",
      glow: "rgba(217,70,239,0.35)"
    },
    heroGradient: "linear-gradient(145deg, rgba(192,132,252,0.35) 0%, rgba(236,72,153,0.15) 40%, rgba(0,0,0,0.85) 100%)",
    featuredTeacherIds: featuredForInstitutional("hiphop"),
    featuredGroupNames: ["LK Hip Hop Crew", "היפ הופ — מתבגרים"],
    relatedEventIds: ["evt_end_year_show"],
    galleryPlaceholders: ["חזרת נבחרת", "כוריאוגרפיה", "תרגול ביתי"]
  },
  acro: {
    id: "acro",
    nameHe: "אקרודאנס",
    nameEn: "Acrodance",
    description: "כוח, גמישות ושיתוף פעולה — אלמנטים אקרובטיים בתוך שפה ריקודית ובטיחותית.",
    energy: "אתלטי · דינמי",
    mood: "נועז ומשחקי",
    signatureColors: {
      core: "#2dd4bf",
      soft: "rgba(45,212,191,0.12)",
      border: "rgba(251,146,60,0.32)",
      glow: "rgba(251,191,36,0.28)"
    },
    heroGradient: "linear-gradient(145deg, rgba(20,184,166,0.25) 0%, rgba(251,146,60,0.12) 45%, rgba(0,0,0,0.8) 100%)",
    featuredTeacherIds: featuredForInstitutional("acro"),
    featuredGroupNames: ["Acro Team"],
    galleryPlaceholders: ["שיווי משקל", "עבודת זוג", "חימום"]
  },
  jazz: {
    id: "jazz",
    nameHe: "ג׳אז",
    nameEn: "Jazz",
    description: "קצב, סנכרון וסטייל — שילוב של טכניקה מדויקת עם ביטוי חופשי.",
    energy: "קצבי · חי",
    mood: "מוזיקלי ונוצץ",
    signatureColors: {
      core: "#fbbf24",
      soft: "rgba(251,191,36,0.12)",
      border: "rgba(244,114,182,0.32)",
      glow: "rgba(251,191,36,0.3)"
    },
    heroGradient: "linear-gradient(145deg, rgba(251,191,36,0.22) 0%, rgba(244,114,182,0.12) 45%, rgba(0,0,0,0.82) 100%)",
    featuredTeacherIds: featuredForInstitutional("jazz"),
    featuredGroupNames: ["Classical Foundations", "היפ הופ — בסיס"],
    galleryPlaceholders: ["קומבינציית ג'אז", "חימום", "שיעור"]
  },
  lyrical: {
    id: "lyrical",
    nameHe: "לירי",
    nameEn: "Lyrical",
    description: "סיפור בתנועה — חיבור בין טכניקה לרגש, נשימה וקו ארוך.",
    energy: "רגשי · זורם",
    mood: "אינטימי ומלא משמעות",
    signatureColors: {
      core: "#a5b4fc",
      soft: "rgba(165,180,252,0.14)",
      border: "rgba(196,181,253,0.35)",
      glow: "rgba(129,140,248,0.28)"
    },
    heroGradient: "linear-gradient(145deg, rgba(99,102,241,0.28) 0%, rgba(148,163,184,0.1) 50%, rgba(0,0,0,0.85) 100%)",
    featuredTeacherIds: featuredForInstitutional("lyrical"),
    featuredGroupNames: ["נבחרות — חזרות"],
    galleryPlaceholders: ["רפרטואר", "קומפוזיציה", "חזרה"]
  },
  pre_ballet: {
    id: "pre_ballet",
    nameHe: "טרום בלט",
    nameEn: "Pre-Ballet",
    description: "צעדים ראשונים בבלט — משחק, דמיון ויסודות עדינים שמכינים לבמה בביטחון.",
    energy: "עדין · שמח",
    mood: "מזמין ומעודד",
    signatureColors: {
      core: "#fbcfe8",
      soft: "rgba(251,207,232,0.16)",
      border: "rgba(253,186,216,0.35)",
      glow: "rgba(244,114,182,0.22)"
    },
    heroGradient: "linear-gradient(145deg, rgba(251,207,232,0.25) 0%, rgba(249,168,212,0.1) 40%, rgba(0,0,0,0.78) 100%)",
    featuredTeacherIds: featuredForInstitutional("pre_ballet"),
    featuredGroupNames: ["Classical Foundations"],
    galleryPlaceholders: ["צעדים ראשונים", "חימום", "שיעור"]
  }
};

export function getInstitutionalStyle(id: InstitutionalStyleId): InstitutionalDanceStyle {
  return INSTITUTIONAL_STYLES[id];
}
