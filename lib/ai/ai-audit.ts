import type { AIProviderId } from "./providers";
import type { AIActionType, AIApprovalStatus, AIRequestContext, AITargetModule } from "./ai-types";

export type AIAuditEvent = {
  id: string;
  actorUserId: string;
  actorRole: AIRequestContext["role"];
  studioId: string;
  academyId?: string;
  provider: AIProviderId | "mock";
  actionType: AIActionType;
  targetModule: AITargetModule;
  targetEntityIds: AIRequestContext["targetEntityIds"];
  promptType?: string;
  suggestionId?: string;
  approved: boolean;
  published: boolean;
  approvalStatus: AIApprovalStatus;
  decision?: "suggested" | "approved" | "rejected" | "published";
  createdAt: string;
  sanitized: true;
};

function id(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function limitTargets(targets: AIRequestContext["targetEntityIds"]) {
  return Object.fromEntries(
    Object.entries(targets).map(([key, values]) => [key, values.slice(0, 30)])
  ) as AIRequestContext["targetEntityIds"];
}

export function buildAIAuditEvent(input: {
  context: AIRequestContext;
  provider: AIProviderId | "mock";
  actionType: AIActionType;
  targetModule: AITargetModule;
  approvalStatus: AIApprovalStatus;
  promptType?: string;
  suggestionId?: string;
  published?: boolean;
  createdAt?: string;
}): AIAuditEvent {
  return {
    id: id("ai_audit"),
    actorUserId: input.context.currentUser.id,
    actorRole: input.context.currentUser.role,
    studioId: input.context.studioId,
    academyId: input.context.academyId,
    provider: input.provider,
    actionType: input.actionType,
    targetModule: input.targetModule,
    targetEntityIds: limitTargets(input.context.targetEntityIds),
    promptType: input.promptType,
    suggestionId: input.suggestionId,
    approved: input.approvalStatus === "approved" || input.approvalStatus === "published",
    published: Boolean(input.published),
    approvalStatus: input.approvalStatus,
    decision: input.published
      ? "published"
      : input.approvalStatus === "approved"
        ? "approved"
        : input.approvalStatus === "rejected"
          ? "rejected"
          : "suggested",
    createdAt: input.createdAt ?? new Date().toISOString(),
    sanitized: true
  };
}

export function toV6AuditTarget(event: AIAuditEvent) {
  return `ai:${event.actionType}:${event.targetModule}:${event.provider}`;
}
