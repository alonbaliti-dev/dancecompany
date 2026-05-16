import { chatGptAgent } from "./chatgpt-agent";
import { contentWritingAgent } from "./content-writing-agent";
import { eventReadinessAgent } from "./event-readiness-agent";
import { managementAnalystAgent } from "./management-analyst-agent";
import { riskDetectionAgent } from "./risk-detection-agent";
import { shopInsightAgent } from "./shop-insight-agent";
import { studentInsightAgent } from "./student-insight-agent";
import { teacherAssistantAgent } from "./teacher-assistant-agent";
import type { AIAgent, AIContext, AIInsight, AIPermissionResult } from "./ai-types";

const agents: AIAgent[] = [
  chatGptAgent,
  studentInsightAgent,
  teacherAssistantAgent,
  managementAnalystAgent,
  riskDetectionAgent,
  contentWritingAgent,
  shopInsightAgent,
  eventReadinessAgent
];

export function canUseAI(context: AIContext): AIPermissionResult {
  if (!context.actor.active) return { ok: false, reason: "משתמש לא פעיל" };
  if (context.actor.role === "student" || context.actor.role === "parent") return { ok: true };
  if (context.actor.role === "teacher" || context.actor.role === "management" || context.actor.role === "super_admin") return { ok: true };
  return { ok: false, reason: "אין הרשאה לניתוח AI" };
}

export function runAIAssistants(context: AIContext): AIInsight[] {
  const allowed = canUseAI(context);
  if (!allowed.ok) {
    return [
      {
        id: "ai_denied",
        agentId: "chatgpt",
        title: "AI לא זמין",
        body: allowed.reason ?? "אין הרשאה",
        riskLevel: "low",
        requiresApproval: false,
        suggestedActions: []
      }
    ];
  }
  return agents.flatMap((agent) => agent.run(context)).slice(0, 8);
}

export function aiSafetyNotice() {
  return "הצעות AI הן המלצות בלבד. אין שליחה או פרסום ללא אישור אנושי, והמידע מסונן לפי הרשאות.";
}
