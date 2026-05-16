import type { DanceStyle, InstitutionalStyleId } from "@/lib/types";

export const DANCE_STYLE_LABELS_HE: Record<DanceStyle, string> = {
  flamenco: "פלמנקו",
  ballet: "בלט קלאסי",
  pointe: "פוינט",
  modern: "מודרני",
  hiphop: "היפ הופ",
  acro: "אקרו",
  repertoire: "רפרטואר"
};

export function danceStylesLabelHe(styles: DanceStyle[]): string {
  return styles.map((s) => DANCE_STYLE_LABELS_HE[s]).join(" · ");
}

export function danceStyleToInstitutional(style: DanceStyle): InstitutionalStyleId {
  const map: Record<DanceStyle, InstitutionalStyleId> = {
    flamenco: "flamenco",
    ballet: "ballet",
    pointe: "ballet",
    modern: "modern",
    hiphop: "hiphop",
    acro: "acro",
    repertoire: "lyrical"
  };
  return map[style];
}

export function institutionalToDanceStyles(ids: InstitutionalStyleId[]): DanceStyle[] {
  const out = new Set<DanceStyle>();
  for (const id of ids) {
    if (id === "flamenco") out.add("flamenco");
    if (id === "ballet" || id === "pre_ballet") out.add("ballet");
    if (id === "modern") out.add("modern");
    if (id === "hiphop") out.add("hiphop");
    if (id === "acro") out.add("acro");
    if (id === "lyrical") out.add("repertoire");
  }
  return [...out];
}
