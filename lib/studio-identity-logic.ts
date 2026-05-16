import type { LegacyMilestone, LegacyMilestoneKind } from "@/lib/types";

export type LegacySectionId = "all" | "highlights" | "competitions" | "annual" | "special" | "memories" | "timeline" | "wall";

export const LEGACY_SECTIONS: { id: LegacySectionId; label: string }[] = [
  { id: "all", label: "הכל" },
  { id: "highlights", label: "הישגים בולטים" },
  { id: "competitions", label: "תחרויות" },
  { id: "annual", label: "מופעי סוף שנה" },
  { id: "special", label: "רגעים מיוחדים" },
  { id: "memories", label: "זיכרונות מהבמה" },
  { id: "timeline", label: "ציר זמן" },
  { id: "wall", label: "קיר הישגים" }
];

export function legacyKindLabel(kind: LegacyMilestoneKind): string {
  const map: Record<LegacyMilestoneKind, string> = {
    competition_win: "תחרות",
    annual_show: "מופע שנתי",
    showcase: "הצגה",
    workshop: "סדנה",
    international: "בינלאומי",
    guest_choreographer: "אורח בינלאומי",
    milestone: "אבן דרך",
    media: "מדיה",
    charity: "התרמה"
  };
  return map[kind];
}

export function milestonesByYear(milestones: LegacyMilestone[]): Map<number, LegacyMilestone[]> {
  const map = new Map<number, LegacyMilestone[]>();
  for (const m of [...milestones].sort((a, b) => b.year - a.year)) {
    const list = map.get(m.year) ?? [];
    list.push(m);
    map.set(m.year, list);
  }
  return map;
}

export function filterMilestones(milestones: LegacyMilestone[], section: LegacySectionId): LegacyMilestone[] {
  if (section === "all" || section === "timeline" || section === "wall") return milestones;
  if (section === "highlights") return milestones.filter((m) => m.featured);
  if (section === "competitions") {
    return milestones.filter((m) => m.kind === "competition_win" || m.tags.includes("תחרות"));
  }
  if (section === "annual") {
    return milestones.filter((m) => m.kind === "annual_show" || m.tags.some((t) => t.includes("מופע") || t.includes("סוף שנה")));
  }
  if (section === "special") {
    return milestones.filter((m) => ["showcase", "charity", "guest_choreographer", "international", "workshop"].includes(m.kind));
  }
  if (section === "memories") {
    return milestones.filter((m) => m.kind === "media" || m.memoryVideoUrl);
  }
  return milestones;
}

export function facultyRoleLabel(role: string): string {
  if (role === "founder") return "מייסדת";
  if (role === "artistic_director") return "מנהלת אמנותית";
  if (role === "guest") return "אורח/ת";
  return "צוות הוראה";
}
