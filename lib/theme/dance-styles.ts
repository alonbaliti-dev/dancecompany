import type { DanceStyleId } from "./semantic-tokens";
import { cardGradients } from "./gradients";
import { getTone, type SemanticTone } from "./semantic-tokens";

const RULES: { id: DanceStyleId; patterns: RegExp[] }[] = [
  { id: "competition", patterns: [/flamenco/i, /פלמנקו/i, /compás/i, /קומפאס/i] },
  { id: "hiphop", patterns: [/hip\s*hop/i, /היפ/i] },
  { id: "commercial", patterns: [/commercial/i, /קומרשל/i] },
  { id: "technique", patterns: [/technique/i, /טכניק/i, /גמישות/i] },
  { id: "flexibility", patterns: [/flex/i, /stretch/i, /מתיח/i] },
  { id: "freestyle", patterns: [/freestyle/i, /פריסטייל/i, /סדנה/i] },
  { id: "competition", patterns: [/competition/i, /נבחרת/i, /הופע/i, /תחרות/i] },
  { id: "rehearsal", patterns: [/rehearsal/i, /חזר/i] },
  { id: "jazz", patterns: [/jazz/i, /ג׳אז/i, /ג'אז/i] },
  { id: "achievement", patterns: [/הישג/i, /מדלי/i, /legacy/i] }
];

export function resolveDanceStyle(text: string): DanceStyleId {
  const t = text.trim();
  for (const rule of RULES) {
    if (rule.patterns.some((p) => p.test(t))) return rule.id;
  }
  return "default";
}

export function styleTone(styleId: DanceStyleId): SemanticTone {
  return styleId === "default" ? "accent" : styleId;
}

export function styleCardGradient(textOrId: string): string {
  const id = RULES.some((r) => r.id === (textOrId as DanceStyleId)) ? (textOrId as DanceStyleId) : resolveDanceStyle(textOrId);
  return cardGradients[id] ?? cardGradients.default;
}

export function styleChipClasses(styleId: DanceStyleId, active = false): string {
  const t = getTone(styleTone(styleId));
  if (active) {
    return `border-[${t.border}] bg-[color-mix(in_srgb,${t.core}_18%,transparent)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]`;
  }
  return "border-white/10 bg-white/[0.04] text-white/52 hover:border-white/14 hover:bg-white/[0.07]";
}

export function styleChipStylePlain(styleId: DanceStyleId, active = false): Record<string, string> {
  const t = getTone(styleTone(styleId));
  if (!active) return {};
  return {
    borderColor: t.border,
    backgroundColor: t.soft,
    color: "rgba(255,255,255,0.95)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)"
  };
}

export const PRACTICE_CATEGORY_MAP: Record<string, DanceStyleId> = {
  הכל: "default",
  כוריאוגרפיה: "commercial",
  טכניקה: "technique",
  גמישות: "flexibility",
  כוח: "freestyle",
  ביצועים: "competition"
};

export function categoryToStyle(category: string): DanceStyleId {
  return PRACTICE_CATEGORY_MAP[category] ?? resolveDanceStyle(category);
}
