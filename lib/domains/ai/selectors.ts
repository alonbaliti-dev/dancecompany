import { runAIAssistants } from "@/lib/ai/ai-orchestrator";
import type { V6Database, V6User } from "@/lib/v6/types";

export function selectV6AIInsightsForActor(db: V6Database, actor: V6User) {
  return runAIAssistants({ db, actor, role: actor.role });
}
