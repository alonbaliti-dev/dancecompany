import { generateText, type LanguageModelUsage, type ModelMessage } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";

export const aiProviderIds = ["openai", "anthropic"] as const;

export type AIProviderId = (typeof aiProviderIds)[number];

export type AICompletionMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type AICompletionInput = {
  provider?: AIProviderId;
  model?: string;
  system?: string;
  prompt?: string;
  messages?: AICompletionMessage[];
  maxOutputTokens?: number;
  temperature?: number;
};

export type AICompletionResult = {
  provider: AIProviderId;
  model: string;
  text: string;
  usage: Pick<LanguageModelUsage, "inputTokens" | "outputTokens" | "totalTokens">;
};

export type AIProviderStatus = {
  id: AIProviderId;
  configured: boolean;
  defaultModel: string;
};

export class AIProviderConfigError extends Error {
  code: "invalid_provider" | "missing_api_key";
  status: number;

  constructor(code: AIProviderConfigError["code"], message: string, status = 400) {
    super(message);
    this.name = "AIProviderConfigError";
    this.code = code;
    this.status = status;
  }
}

const defaultModels: Record<AIProviderId, string> = {
  openai: "gpt-4o-mini",
  anthropic: "claude-3-5-haiku-latest"
};

function apiKeyFor(provider: AIProviderId) {
  return provider === "openai" ? process.env.OPENAI_API_KEY : process.env.ANTHROPIC_API_KEY;
}

export function isAIProviderId(value: unknown): value is AIProviderId {
  return typeof value === "string" && aiProviderIds.includes(value as AIProviderId);
}

export function resolveAIProviderId(provider = process.env.AI_DEFAULT_PROVIDER): AIProviderId {
  if (!provider) return "openai";
  if (isAIProviderId(provider)) return provider;
  throw new AIProviderConfigError(
    "invalid_provider",
    "AI provider must be one of: openai, anthropic."
  );
}

export function getAIProviderStatus() {
  const defaultProvider = resolveAIProviderId();
  const providers: AIProviderStatus[] = aiProviderIds.map((id) => ({
    id,
    configured: Boolean(apiKeyFor(id)),
    defaultModel: defaultModels[id]
  }));

  return {
    defaultProvider,
    defaultModel: process.env.AI_DEFAULT_MODEL || defaultModels[defaultProvider],
    providers
  };
}

function getProviderConfig(providerInput?: AIProviderId, modelInput?: string) {
  const provider = resolveAIProviderId(providerInput);
  const apiKey = apiKeyFor(provider);

  if (!apiKey) {
    const envName = provider === "openai" ? "OPENAI_API_KEY" : "ANTHROPIC_API_KEY";
    throw new AIProviderConfigError("missing_api_key", `Missing ${envName}.`);
  }

  return {
    provider,
    model: modelInput?.trim() || process.env.AI_DEFAULT_MODEL || defaultModels[provider],
    apiKey
  };
}

function languageModelFor(provider: AIProviderId, model: string, apiKey: string) {
  if (provider === "openai") {
    return createOpenAI({ apiKey })(model);
  }

  return createAnthropic({ apiKey })(model);
}

function sanitizeMaxOutputTokens(value: number | undefined) {
  if (!Number.isFinite(value)) return 500;
  return Math.min(Math.max(Math.floor(value), 1), 2000);
}

function sanitizeTemperature(value: number | undefined) {
  if (!Number.isFinite(value)) return undefined;
  return Math.min(Math.max(Number(value), 0), 2);
}

function toModelMessages(messages: AICompletionMessage[]): ModelMessage[] {
  return messages.map((message) => ({
    role: message.role,
    content: message.content
  }));
}

export async function completeWithAI(input: AICompletionInput): Promise<AICompletionResult> {
  const { provider, model, apiKey } = getProviderConfig(input.provider, input.model);
  const languageModel = languageModelFor(provider, model, apiKey);
  const settings = {
    model: languageModel,
    system: input.system?.trim() || undefined,
    maxOutputTokens: sanitizeMaxOutputTokens(input.maxOutputTokens),
    temperature: sanitizeTemperature(input.temperature),
    maxRetries: 1
  };

  const result = input.messages?.length
    ? await generateText({
        ...settings,
        messages: toModelMessages(input.messages)
      })
    : await generateText({
        ...settings,
        prompt: input.prompt ?? ""
      });

  return {
    provider,
    model,
    text: result.text,
    usage: {
      inputTokens: result.totalUsage.inputTokens,
      outputTokens: result.totalUsage.outputTokens,
      totalTokens: result.totalUsage.totalTokens
    }
  };
}
