import { assertHumanApprovalBeforePublish, createAIDraft, isUserFacingAIAction } from "./ai-approval";
import type { AIActionType, AIDraft, AIRequestContext, AITargetModule } from "./ai-types";

export type AISafeSuggestion = {
  label: "AI suggestion";
  text: string;
  draft: AIDraft;
  safety: {
    requiresApproval: boolean;
    canPublish: false;
    canSend: false;
    permissionBypassBlocked: true;
    sensitiveContentLogged: false;
    factsPolicy: "provided_context_only";
    message: string;
  };
};

const publishIntents = new Set(["send", "sent", "publish", "published", "auto_publish", "auto_send"]);
const sensitivePatterns = [
  /api[_ -]?key/i,
  /password/i,
  /credit card/i,
  /מספר כרטיס/i,
  /סיסמה/i,
  /secret/i
];

function hasPublishIntent(value: unknown) {
  return typeof value === "string" && publishIntents.has(value.trim().toLowerCase());
}

function includesSensitiveLeak(text: string) {
  return sensitivePatterns.some((pattern) => pattern.test(text));
}

export function rejectAIPublishIntent(intent: unknown) {
  if (!hasPublishIntent(intent)) return null;
  return { ok: false as const, code: "ai_publish_blocked", message: "AI cannot send or publish directly. Create a draft for human approval.", status: 400 };
}

export function validateAISafety(input: {
  context: AIRequestContext;
  actionType: AIActionType;
  targetModule: AITargetModule;
  outputText: string;
  intent?: unknown;
}):
  | { ok: true; suggestion: AISafeSuggestion }
  | { ok: false; code: string; message: string; status: number } {
  const publishIntent = rejectAIPublishIntent(input.intent);
  if (publishIntent) return publishIntent;

  if (includesSensitiveLeak(input.outputText)) {
    return { ok: false, code: "ai_sensitive_output_blocked", message: "AI output appears to include sensitive private data and was blocked.", status: 422 };
  }

  const draft = createAIDraft({
    actionType: input.actionType,
    targetModule: input.targetModule,
    content: input.outputText,
    actorUserId: input.context.currentUser.id,
    studioId: input.context.studioId
  });
  const approval = assertHumanApprovalBeforePublish(draft);

  if (isUserFacingAIAction(input.actionType) && approval.ok) {
    return { ok: false, code: "ai_approval_required", message: "User-facing AI output must stay pending approval.", status: 500 };
  }

  return {
    ok: true,
    suggestion: {
      label: "AI suggestion",
      text: input.outputText,
      draft,
      safety: {
        requiresApproval: draft.requiresApproval,
        canPublish: false,
        canSend: false,
        permissionBypassBlocked: true,
        sensitiveContentLogged: false,
        factsPolicy: "provided_context_only",
        message: "AI output is a suggestion only. Review, edit, and approve before sending or publishing."
      }
    }
  };
}
