import type { AIActionType, AIDraft, AITargetModule } from "./ai-types";

const userFacingActions = new Set<AIActionType>([
  "draft_message",
  "draft_notification",
  "draft_task",
  "draft_parent_update",
  "draft_teacher_feedback",
  "draft_shop_description",
  "draft_event_reminder"
]);

function id(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function isUserFacingAIAction(actionType: AIActionType) {
  return userFacingActions.has(actionType);
}

export function createAIDraft(input: {
  actionType: AIActionType;
  targetModule: AITargetModule;
  content: string;
  actorUserId: string;
  studioId: string;
  createdAt?: string;
}): AIDraft {
  const requiresApproval = isUserFacingAIAction(input.actionType);

  return {
    id: id("ai_draft"),
    actionType: input.actionType,
    targetModule: input.targetModule,
    status: requiresApproval ? "pending_approval" : "draft",
    requiresApproval,
    label: "AI suggestion",
    content: input.content,
    createdByUserId: input.actorUserId,
    studioId: input.studioId,
    createdAt: input.createdAt ?? new Date().toISOString()
  };
}

export function markAIDraftApproved(draft: AIDraft, approved: boolean): AIDraft {
  return { ...draft, status: approved ? "approved" : "rejected" };
}

export function assertHumanApprovalBeforePublish(draft: AIDraft) {
  if (draft.requiresApproval && draft.status !== "approved") {
    return { ok: false as const, reason: "AI draft requires human approval before sending or publishing." };
  }

  return { ok: true as const };
}
