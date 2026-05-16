import { NextResponse } from "next/server";
import { buildAIAuditEvent } from "@/lib/ai/ai-audit";
import { selectAIPrompt } from "@/lib/ai/ai-prompts";
import { checkAIRateLimit } from "@/lib/ai/ai-rate-limit";
import { aiLocalMvpContextNotice, validateAIRequestContext } from "@/lib/ai/ai-request-context";
import { rejectAIPublishIntent, validateAISafety } from "@/lib/ai/ai-safety";
import type { AIActionType, AITargetModule } from "@/lib/ai/ai-types";
import {
  AIProviderConfigError,
  completeWithAI,
  isAIProviderId,
  type AICompletionMessage,
  type AIProviderId
} from "@/lib/ai/providers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_INPUT_CHARS = 12000;
const MAX_MESSAGES = 16;
const allowedRoles = new Set<AICompletionMessage["role"]>(["system", "user", "assistant"]);
const allowedActionTypes = new Set<AIActionType>([
  "insight",
  "draft_message",
  "draft_notification",
  "draft_task",
  "draft_parent_update",
  "draft_teacher_feedback",
  "draft_shop_description",
  "draft_event_reminder",
  "analysis"
]);
const allowedTargetModules = new Set<AITargetModule>([
  "students",
  "parents",
  "teachers",
  "groups",
  "messages",
  "notifications",
  "tasks",
  "shop",
  "events",
  "media",
  "private_lessons",
  "system"
]);

type AICompleteBody = {
  provider?: unknown;
  model?: unknown;
  system?: unknown;
  prompt?: unknown;
  messages?: unknown;
  maxOutputTokens?: unknown;
  temperature?: unknown;
  context?: unknown;
  actionType?: unknown;
  targetModule?: unknown;
  intent?: unknown;
  promptKey?: unknown;
  aiPrompts?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function optionalString(value: unknown) {
  return typeof value === "string" ? value.trim() : undefined;
}

function optionalNumber(value: unknown) {
  return typeof value === "number" ? value : undefined;
}

function requiredEnum<T extends string>(value: unknown, allowed: Set<T>) {
  return typeof value === "string" && allowed.has(value as T) ? (value as T) : null;
}

function parseMessages(value: unknown): AICompletionMessage[] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || value.length > MAX_MESSAGES) return undefined;

  const messages = value.map((item) => {
    if (!isRecord(item)) return undefined;
    const role = item.role;
    const content = item.content;

    if (!allowedRoles.has(role as AICompletionMessage["role"]) || typeof content !== "string") {
      return undefined;
    }

    return {
      role: role as AICompletionMessage["role"],
      content: content.trim()
    };
  });

  if (messages.some((message) => !message?.content)) return undefined;
  return messages as AICompletionMessage[];
}

function inputLength(prompt: string | undefined, messages: AICompletionMessage[] | undefined) {
  return prompt?.length ?? messages?.reduce((total, message) => total + message.content.length, 0) ?? 0;
}

function devMockText(actionType: AIActionType) {
  return `הצעה בלבד: ספק ה-AI לא זמין כרגע. אפשר לנסות שוב, או לערוך טיוטה ידנית עבור ${actionType}.`;
}

function jsonNoStore(body: unknown, init?: ResponseInit) {
  return NextResponse.json(body, {
    ...init,
    headers: {
      "Cache-Control": "no-store"
    }
  });
}

export async function POST(request: Request) {
  let body: AICompleteBody;

  try {
    const json = await request.json();
    if (!isRecord(json)) {
      return NextResponse.json({ error: "invalid_body", message: "Expected a JSON object." }, { status: 400 });
    }
    body = json;
  } catch {
    return NextResponse.json({ error: "invalid_json", message: "Request body must be valid JSON." }, { status: 400 });
  }

  const contextResult = validateAIRequestContext(body.context);
  if (contextResult.ok === false) {
    return jsonNoStore({ error: contextResult.code, message: contextResult.message }, { status: contextResult.status });
  }

  const actionType = requiredEnum(body.actionType, allowedActionTypes);
  const targetModule = requiredEnum(body.targetModule, allowedTargetModules);
  if (!actionType || !targetModule) {
    return jsonNoStore(
      { error: "ai_action_required", message: "AI requests require valid actionType and targetModule metadata." },
      { status: 400 }
    );
  }

  const publishIntent = rejectAIPublishIntent(body.intent);
  if (publishIntent) {
    return jsonNoStore({ error: publishIntent.code, message: publishIntent.message }, { status: publishIntent.status });
  }

  const rateLimit = checkAIRateLimit({ context: contextResult.context, actionType });
  if (rateLimit.ok === false) {
    return jsonNoStore(
      { error: rateLimit.code, message: rateLimit.message, rateLimit: { remaining: rateLimit.remaining, resetAt: rateLimit.resetAt } },
      { status: rateLimit.status }
    );
  }

  const providerValue = optionalString(body.provider);
  if (providerValue && !isAIProviderId(providerValue)) {
    return jsonNoStore(
      { error: "invalid_provider", message: "Provider must be one of: openai, anthropic." },
      { status: 400 }
    );
  }

  const provider = providerValue as AIProviderId | undefined;
  const prompt = optionalString(body.prompt);
  const messages = parseMessages(body.messages);
  const promptSelection =
    optionalString(body.promptKey)
      ? selectAIPrompt({
          db: isRecord(body.aiPrompts) ? { aiPrompts: body.aiPrompts as Record<string, string> } : null,
          key: optionalString(body.promptKey) as string
        })
      : null;

  if (body.messages !== undefined && !messages) {
    return jsonNoStore(
      { error: "invalid_messages", message: "Messages must include role and content, up to 16 items." },
      { status: 400 }
    );
  }

  if ((!prompt && !messages?.length) || (prompt && messages?.length)) {
    return jsonNoStore(
      { error: "invalid_input", message: "Send either prompt or messages, but not both." },
      { status: 400 }
    );
  }

  if (inputLength(prompt, messages) > MAX_INPUT_CHARS) {
    return jsonNoStore(
      { error: "input_too_large", message: "AI input is limited to 12000 characters." },
      { status: 400 }
    );
  }

  if (promptSelection && promptSelection.ok === false) {
    return jsonNoStore(
      { error: "ai_prompt_unavailable", message: promptSelection.reason, prompt: { key: promptSelection.key, status: promptSelection.status } },
      { status: 400 }
    );
  }

  try {
    const result = await completeWithAI({
      provider,
      model: optionalString(body.model),
      system: optionalString(body.system) ?? (promptSelection?.ok ? promptSelection.prompt : undefined),
      prompt,
      messages,
      maxOutputTokens: optionalNumber(body.maxOutputTokens),
      temperature: optionalNumber(body.temperature)
    });

    const safetyResult = validateAISafety({
      context: contextResult.context,
      actionType,
      targetModule,
      outputText: result.text,
      intent: body.intent
    });
    if (safetyResult.ok === false) {
      return jsonNoStore({ error: safetyResult.code, message: safetyResult.message }, { status: safetyResult.status });
    }

    const audit = buildAIAuditEvent({
      context: contextResult.context,
      provider: result.provider,
      actionType,
      targetModule,
      approvalStatus: safetyResult.suggestion.draft.status
    });

    return jsonNoStore(
      {
        ...result,
        suggestion: safetyResult.suggestion,
        safety: safetyResult.suggestion.safety,
        audit,
        rateLimit,
        contextValidation: {
          mode: "local_mvp",
          message: aiLocalMvpContextNotice
        },
        prompt: promptSelection?.ok ? { key: promptSelection.key, source: promptSelection.source, status: promptSelection.status } : undefined
      }
    );
  } catch (error) {
    if (error instanceof AIProviderConfigError) {
      return jsonNoStore(
        {
          error: error.code,
          message:
            error.code === "missing_api_key"
              ? "AI provider is not configured in this environment. Add the server-side API key and retry."
              : error.message,
          retryable: true
        },
        { status: error.status }
      );
    }

    console.error("[ai/api] completion failed", error instanceof Error ? error.message : error);

    if (process.env.NODE_ENV !== "production") {
      const fallbackText = devMockText(actionType);
      const safetyResult = validateAISafety({
        context: contextResult.context,
        actionType,
        targetModule,
        outputText: fallbackText,
        intent: body.intent
      });

      if (safetyResult.ok) {
        return jsonNoStore({
          provider: "mock",
          model: "dev-mock-fallback",
          text: fallbackText,
          usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
          suggestion: safetyResult.suggestion,
          safety: safetyResult.suggestion.safety,
          audit: buildAIAuditEvent({
            context: contextResult.context,
            provider: "mock",
            actionType,
            targetModule,
            approvalStatus: safetyResult.suggestion.draft.status
          }),
          rateLimit,
          retryable: true,
          providerFallback: true,
          message: "AI provider failed, so a local development mock suggestion was returned."
        });
      }
    }

    return jsonNoStore(
      { error: "ai_completion_failed", message: "AI provider request failed. Please retry.", retryable: true },
      { status: 502 }
    );
  }
}
