import { STUDIO_LK } from "@/lib/platform/constants";
import type { StudioGroup } from "@/lib/types";

/** Studio catalog — kept separate from mock-data to avoid circular imports with user enrichment. */
export const studioGroups: StudioGroup[] = [
  { id: "grp_hh_sel", studioId: STUDIO_LK, name: "LK Hip Hop Crew", levelLabel: "נבחרת" },
  { id: "grp_hh_teen", studioId: STUDIO_LK, name: "היפ הופ — מתבגרים", levelLabel: "רמה 2" },
  { id: "grp_hh_new", studioId: STUDIO_LK, name: "היפ הופ — בסיס", levelLabel: "יסוד" },
  { id: "grp_mod_adv", studioId: STUDIO_LK, name: "Modern Ensemble", levelLabel: "רמה 4" },
  { id: "grp_mod_mid", studioId: STUDIO_LK, name: "מודרן — ביניים", levelLabel: "ביניים" },
  { id: "grp_ballet_kids", studioId: STUDIO_LK, name: "Classical Foundations", levelLabel: "טרום בלט · יסוד" },
  { id: "grp_ballet_sel", studioId: STUDIO_LK, name: "בלט קלאסי — נבחרת", levelLabel: "רמה 4" },
  { id: "grp_flamenco", studioId: STUDIO_LK, name: "Junior Flamenco", levelLabel: "פלמנקו" },
  { id: "grp_acro", studioId: STUDIO_LK, name: "Acro Team", levelLabel: "נבחרת" },
  { id: "grp_rep", studioId: STUDIO_LK, name: "נבחרות — חזרות", levelLabel: "כל הרמות" },
  { id: "grp_tech", studioId: STUDIO_LK, name: "חימום וטכניקה", levelLabel: "פתוח" }
];
