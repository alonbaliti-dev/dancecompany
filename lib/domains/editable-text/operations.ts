import type { LocalDatabase } from "@/lib/local-db/db-types";
import { DEFAULT_EDITABLE_COPY } from "@/lib/content/default-copy";
import type { EditableText, UserProfile } from "@/lib/types";
import { domainGuards } from "../core/permissions";
import type { DomainMutationInput } from "../core/types";

export function buildSaveEditableTextMutation(
  actor: UserProfile,
  studioId: string,
  texts: EditableText[],
  input: {
    key: string;
    he: string;
    en?: string;
    scope?: "global" | "studio";
    studioId?: string;
  }
): DomainMutationInput | null {
  if (!actor.permissions.isSuperAdmin) return null;
  const base = texts.find((x) => x.key === input.key) ?? DEFAULT_EDITABLE_COPY.find((x) => x.key === input.key);
  if (!base) return null;

  const next: EditableText = {
    ...base,
    he: input.he.trim(),
    en: input.en?.trim() || undefined,
    scope: input.scope ?? "global",
    studioId: input.scope === "studio" ? input.studioId ?? studioId : undefined,
    lastEditedByUserId: actor.id,
    lastEditedByName: actor.name,
    updatedAt: new Date().toISOString()
  };

  return {
    actor,
    guard: domainGuards.superAdmin(actor),
    mutate: (db) => {
      const filtered = db.editableTexts.filter(
        (p) => !(p.key === input.key && p.scope === next.scope && p.studioId === next.studioId)
      );
      return { ...db, editableTexts: [next, ...filtered] };
    },
    audit: {
      action: `עריכת טקסט: ${input.key}`,
      targetType: "editable_text",
      targetId: input.key,
      severity: "info"
    },
    activity: {
      kind: "system",
      messageHe: `טקסט עודכן: ${input.key}`,
      visibility: "platform"
    }
  };
}

export function buildResetEditableTextMutation(
  actor: UserProfile,
  key: string
): DomainMutationInput | null {
  return {
    actor,
    guard: domainGuards.superAdmin(actor),
    mutate: (db) => ({ ...db, editableTexts: db.editableTexts.filter((p) => p.key !== key) }),
    audit: {
      action: `איפוס טקסט לברירת מחדל: ${key}`,
      targetType: "editable_text",
      targetId: key,
      severity: "info"
    }
  };
}
