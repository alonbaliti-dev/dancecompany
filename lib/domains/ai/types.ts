import type { AIInsight } from "@/lib/ai/ai-types";

export type V6AISuggestion = AIInsight & {
  permissionFiltered: boolean;
  source: "mock" | "engine" | "future_model";
};
