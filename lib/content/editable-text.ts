import type { EditableText } from "@/lib/types";
import { DEFAULT_COPY_BY_KEY } from "./default-copy";

export type ResolvedCopy = {
  key: string;
  he: string;
  en?: string;
  isOverride: boolean;
  entry?: EditableText;
};

export function mergeEditableTexts(
  defaults: EditableText[],
  overrides: EditableText[],
  studioId?: string
): EditableText[] {
  const map = new Map<string, EditableText>();
  for (const d of defaults) {
    map.set(d.key, { ...d });
  }
  for (const o of overrides) {
    if (o.scope === "global" || (o.scope === "studio" && o.studioId === studioId)) {
      const base = map.get(o.key) ?? o;
      map.set(o.key, {
        ...base,
        ...o,
        defaultHe: base.defaultHe ?? o.defaultHe,
        defaultEn: base.defaultEn ?? o.defaultEn
      });
    }
  }
  return [...map.values()];
}

export function resolveCopy(
  key: string,
  texts: EditableText[],
  locale: "he" | "en" = "he"
): ResolvedCopy {
  const entry = texts.find((t) => t.key === key) ?? DEFAULT_COPY_BY_KEY.get(key);
  const defaultHe = entry?.defaultHe ?? entry?.he ?? key;
  const defaultEn = entry?.defaultEn ?? entry?.en;
  const he = entry?.he ?? defaultHe;
  const en = entry?.en ?? defaultEn;
  const isOverride = Boolean(entry && (entry.he !== entry.defaultHe || (entry.en && entry.en !== entry.defaultEn)));

  if (locale === "en" && en) {
    return { key, he: en, en, isOverride, entry };
  }
  return { key, he, en, isOverride, entry };
}

export function filterEditableTexts(
  texts: EditableText[],
  filters: {
    q?: string;
    module?: string;
    scope?: "global" | "studio" | "all";
    editedOnly?: boolean;
    untranslatedOnly?: boolean;
  }
): EditableText[] {
  return texts.filter((t) => {
    if (filters.module && filters.module !== "all" && t.module !== filters.module) return false;
    if (filters.scope && filters.scope !== "all" && t.scope !== filters.scope) return false;
    if (filters.editedOnly && t.he === t.defaultHe && (!t.en || t.en === t.defaultEn)) return false;
    if (filters.untranslatedOnly && t.defaultEn && !t.en) return false;
    if (filters.q) {
      const q = filters.q.toLowerCase();
      const hay = `${t.key} ${t.label} ${t.he} ${t.en ?? ""} ${t.module}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function uniqueModules(texts: EditableText[]): string[] {
  return [...new Set(texts.map((t) => t.module))].sort();
}
