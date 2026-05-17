import "server-only";

import { sendTwilioSms } from "@/lib/communications/twilio-sms";

export type CommunicationChannel = "email" | "sms" | "whatsapp";

export type CommunicationUseCase =
  | "parent_update"
  | "event_reminder"
  | "urgent_alert"
  | "payment_confirmation";

export type CommunicationMessage = {
  academyId: string;
  channel: CommunicationChannel;
  useCase: CommunicationUseCase;
  to: string;
  subject?: string;
  body: string;
  locale?: "he-IL" | "en-US";
  metadata?: Record<string, string>;
};

export type CommunicationSendResult =
  | { ok: true; mode: "sandbox" | "live"; provider: string; messageId?: string }
  | { ok: false; mode: "noop" | "sandbox"; provider: string; reason: string };

type ProviderConfig = {
  provider: string;
  apiKey?: string;
  sandbox: boolean;
};

function configFor(channel: CommunicationChannel): ProviderConfig {
  const prefix = channel.toUpperCase();
  return {
    provider: process.env[`${prefix}_PROVIDER`]?.trim() || "noop",
    apiKey: process.env[`${prefix}_API_KEY`]?.trim(),
    sandbox: process.env[`${prefix}_SANDBOX`] !== "false"
  };
}

function assertSafeMessage(message: CommunicationMessage) {
  if (!message.academyId.trim()) throw new Error("academy_required");
  if (!message.to.trim()) throw new Error("recipient_required");
  if (!message.body.trim()) throw new Error("body_required");
}

export async function sendCommunication(message: CommunicationMessage): Promise<CommunicationSendResult> {
  assertSafeMessage(message);

  const config = configFor(message.channel);
  if (message.channel === "sms" && config.provider === "twilio") {
    const result = await sendTwilioSms({ to: message.to, body: message.body });
    if (result.ok === true) return result;
    return {
      ok: false,
      mode: config.sandbox ? "sandbox" : "noop",
      provider: "twilio",
      reason: result.reason
    };
  }

  if (config.provider === "noop" || !config.apiKey) {
    return {
      ok: false,
      mode: "noop",
      provider: config.provider,
      reason: "communication_provider_not_configured"
    };
  }

  return {
    ok: true,
    mode: config.sandbox ? "sandbox" : "live",
    provider: config.provider,
    messageId: `sandbox_${message.channel}_${Date.now().toString(36)}`
  };
}
