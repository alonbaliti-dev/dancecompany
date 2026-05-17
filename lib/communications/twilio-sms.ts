import "server-only";

export type SmsSendResult =
  | { ok: true; mode: "live" | "sandbox"; provider: "twilio"; messageId?: string }
  | { ok: false; provider: "twilio"; reason: string };

type SendSmsInput = {
  to: string;
  body: string;
};

function twilioConfig() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
  const fromNumber = process.env.TWILIO_FROM_NUMBER?.trim();
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID?.trim();
  const sandbox = process.env.SMS_SANDBOX !== "false";

  return { accountSid, authToken, fromNumber, messagingServiceSid, sandbox };
}

export function getTwilioSmsStatus() {
  const config = twilioConfig();
  return {
    configured: Boolean(config.accountSid && config.authToken && (config.fromNumber || config.messagingServiceSid)),
    sandbox: config.sandbox,
    provider: "twilio" as const
  };
}

export async function sendTwilioSms(input: SendSmsInput): Promise<SmsSendResult> {
  const config = twilioConfig();

  if (!config.accountSid || !config.authToken || (!config.fromNumber && !config.messagingServiceSid)) {
    return { ok: false, provider: "twilio", reason: "twilio_not_configured" };
  }

  if (config.sandbox) {
    return {
      ok: true,
      mode: "sandbox",
      provider: "twilio",
      messageId: `sandbox_twilio_${Date.now().toString(36)}`
    };
  }

  const params = new URLSearchParams({
    To: input.to,
    Body: input.body
  });

  if (config.messagingServiceSid) params.set("MessagingServiceSid", config.messagingServiceSid);
  else if (config.fromNumber) params.set("From", config.fromNumber);

  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${config.accountSid}:${config.authToken}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: params
  });

  if (!response.ok) {
    return { ok: false, provider: "twilio", reason: `twilio_send_failed_${response.status}` };
  }

  const payload = (await response.json()) as { sid?: string };
  return { ok: true, mode: "live", provider: "twilio", messageId: payload.sid };
}
