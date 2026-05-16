import defaultPrompts from "@/database/ai-prompts.json";
import type { V6Database } from "@/lib/v6/types";

export type AIPromptStatus = {
  key: string;
  enabled: boolean;
  version: number;
  updatedAt?: string;
  disabledAt?: string;
  reason?: string;
};

export type AIPromptVersion = {
  key: string;
  version: number;
  prompt: string;
  createdAt: string;
  actorUserId?: string;
  note?: string;
};

export type AIPromptSelection =
  | { ok: true; key: string; prompt: string; source: "database" | "default"; status: AIPromptStatus }
  | { ok: false; key: string; reason: string; status: AIPromptStatus };

const defaults = defaultPrompts as Record<string, string>;

export function defaultAIPrompts() {
  return { ...defaults };
}

export function selectAIPrompt(input: {
  db?: Pick<V6Database, "aiPrompts"> | null;
  key: string;
  disabledPrompts?: Record<string, AIPromptStatus>;
}): AIPromptSelection {
  const disabled = input.disabledPrompts?.[input.key];
  const status: AIPromptStatus = disabled ?? { key: input.key, enabled: true, version: 1 };

  if (!status.enabled) {
    return { ok: false, key: input.key, reason: status.reason ?? "AI prompt is disabled.", status };
  }

  const dbPrompt = input.db?.aiPrompts?.[input.key]?.trim();
  if (dbPrompt) return { ok: true, key: input.key, prompt: dbPrompt, source: "database", status };

  const defaultPrompt = defaults[input.key]?.trim();
  if (defaultPrompt) return { ok: true, key: input.key, prompt: defaultPrompt, source: "default", status };

  return { ok: false, key: input.key, reason: "AI prompt was not found.", status };
}

export function resetAIPrompt(prompts: V6Database["aiPrompts"], key: string) {
  if (!defaults[key]) return { ok: false as const, reason: "Default AI prompt was not found.", prompts };
  return { ok: true as const, prompts: { ...prompts, [key]: defaults[key] } };
}

export function disableAIPrompt(key: string, reason = "Disabled by Super Admin") {
  const now = new Date().toISOString();
  return {
    key,
    enabled: false,
    version: 1,
    disabledAt: now,
    updatedAt: now,
    reason
  } satisfies AIPromptStatus;
}

export function getAIPromptVersionHistoryPlaceholder(key: string): AIPromptVersion[] {
  const prompt = defaults[key];
  if (!prompt) return [];

  return [
    {
      key,
      version: 1,
      prompt,
      createdAt: "2026-05-16T09:00:00.000Z",
      note: "Seed prompt from database/ai-prompts.json. Persistent version history can attach here later."
    }
  ];
}
