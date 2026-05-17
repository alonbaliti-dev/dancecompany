import "server-only";

import { getR2Config } from "@/lib/r2/client";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { buildOperationalHealthSnapshot, type OperationalHealthState } from "@/lib/operations/health-summary";

export type IntegrationHealthState = "connected" | "missing" | "failed" | "sandbox" | "noop" | "watching";

export type IntegrationHealthItem = {
  id: string;
  labelHe: string;
  state: IntegrationHealthState;
  statusHe: "מחובר" | "חסר" | "בדיקה נכשלה" | "מצב בדיקה" | "כבוי" | "במעקב";
  detailHe: string;
};

export type IntegrationHealthReport = {
  generatedAt: string;
  items: IntegrationHealthItem[];
  latestErrors: string[];
};

const PAYMENT_PROVIDERS = new Set(["tranzila", "cardcom", "grow_meshulam"]);

function envPresent(name: string) {
  return Boolean(process.env[name]?.trim());
}

function missing(keys: string[]) {
  return keys.filter((key) => !envPresent(key));
}

async function testSupabase(): Promise<IntegrationHealthItem> {
  const supabase = getSupabaseServerClient();
  if (supabase.enabled === false) {
    return {
      id: "supabase",
      labelHe: "Supabase",
      state: "missing",
      statusHe: "חסר",
      detailHe: `חסרים משתנים: ${supabase.missingEnv.join(", ")}`
    };
  }

  try {
    const ping = supabase.client.from("academies").select("id").limit(1);
    const result = await Promise.race([
      ping,
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), 2500))
    ]);

    if (result.error) throw result.error;

    return {
      id: "supabase",
      labelHe: "Supabase",
      state: "connected",
      statusHe: "מחובר",
      detailHe: supabase.serviceRoleAvailable ? "חיבור שרת זמין; service role נשמר בצד שרת" : "חיבור anon זמין; service role לא מוגדר"
    };
  } catch {
    return {
      id: "supabase",
      labelHe: "Supabase",
      state: "failed",
      statusHe: "בדיקה נכשלה",
      detailHe: "המשתנים קיימים, אבל בדיקת קריאה קצרה לא הצליחה"
    };
  }
}

function r2Health(): IntegrationHealthItem {
  const config = getR2Config();
  if (config.configured === false) {
    return {
      id: "r2",
      labelHe: "Cloudflare R2",
      state: "missing",
      statusHe: "חסר",
      detailHe: `חסרים משתנים: ${config.missingEnv.join(", ")}`
    };
  }

  return {
    id: "r2",
    labelHe: "Cloudflare R2",
    state: "connected",
    statusHe: "מחובר",
    detailHe: config.publicBaseUrl ? "חתימות העלאה מוכנות; כתובת ציבורית הוגדרה" : "חתימות העלאה מוכנות; כתובת ציבורית לא הוגדרה"
  };
}

function paymentHealth(): IntegrationHealthItem {
  const provider = process.env.PAYMENT_PROVIDER?.trim();
  if (!provider || !PAYMENT_PROVIDERS.has(provider)) {
    return {
      id: "payments",
      labelHe: "תשלומים",
      state: "missing",
      statusHe: "חסר",
      detailHe: "ספק תשלומים לא הוגדר"
    };
  }

  const missingPaymentEnv = missing(["PAYMENT_PROVIDER_SECRET_KEY", "PAYMENT_TERMINAL_ID", "PAYMENT_WEBHOOK_SECRET"]);
  if (missingPaymentEnv.length) {
    return {
      id: "payments",
      labelHe: "תשלומים",
      state: "sandbox",
      statusHe: "מצב בדיקה",
      detailHe: `${provider}; חסרים להשלמה: ${missingPaymentEnv.join(", ")}`
    };
  }

  return {
    id: "payments",
    labelHe: "תשלומים",
    state: "sandbox",
    statusHe: "מצב בדיקה",
    detailHe: `${provider}; יצירת סשן ו-webhook מוכנים לסביבת בדיקה`
  };
}

function pushHealth(): IntegrationHealthItem {
  const missingPushEnv = missing(["NEXT_PUBLIC_VAPID_PUBLIC_KEY", "VAPID_PRIVATE_KEY", "VAPID_SUBJECT"]);
  if (missingPushEnv.length) {
    return {
      id: "push",
      labelHe: "התראות Push",
      state: "missing",
      statusHe: "חסר",
      detailHe: `אין שליחה חיה; חסרים: ${missingPushEnv.join(", ")}`
    };
  }

  return {
    id: "push",
    labelHe: "התראות Push",
    state: "sandbox",
    statusHe: "מצב בדיקה",
    detailHe: "הרשמה ובדיקת שליחה מוכנות להפעלה ידנית בלבד"
  };
}

function messagingHealth(kind: "email" | "sms" | "whatsapp", labelHe: string): IntegrationHealthItem {
  const prefix = kind.toUpperCase();
  const provider = process.env[`${prefix}_PROVIDER`]?.trim();
  const apiKey = process.env[`${prefix}_API_KEY`]?.trim();
  if (!provider || !apiKey) {
    return {
      id: kind,
      labelHe,
      state: "noop",
      statusHe: "כבוי",
      detailHe: "ברירת מחדל: ללא שליחה חיה"
    };
  }

  return {
    id: kind,
    labelHe,
    state: "sandbox",
    statusHe: "מצב בדיקה",
    detailHe: `${provider}; שליחה תישאר מבוקרת עד אישור הפעלה`
  };
}

function operationalStateToIntegrationState(state: OperationalHealthState): IntegrationHealthState {
  if (state === "healthy") return "connected";
  if (state === "blocked") return "failed";
  if (state === "not_configured") return "missing";
  return "watching";
}

function operationalStatusHe(state: OperationalHealthState): IntegrationHealthItem["statusHe"] {
  if (state === "healthy") return "מחובר";
  if (state === "blocked") return "בדיקה נכשלה";
  if (state === "not_configured") return "חסר";
  if (state === "needs_attention") return "במעקב";
  return "במעקב";
}

function operationalHealthItems(): IntegrationHealthItem[] {
  const snapshot = buildOperationalHealthSnapshot({
    generatedAt: new Date().toISOString()
  });

  return snapshot.signals.map((signal) => ({
    id: `operations_${signal.area}`,
    labelHe: signal.labelHe,
    state: operationalStateToIntegrationState(signal.state),
    statusHe: operationalStatusHe(signal.state),
    detailHe: signal.summaryHe
  }));
}

export async function getIntegrationHealthReport(): Promise<IntegrationHealthReport> {
  const items = [
    await testSupabase(),
    r2Health(),
    paymentHealth(),
    pushHealth(),
    messagingHealth("email", "אימייל"),
    messagingHealth("sms", "SMS"),
    messagingHealth("whatsapp", "WhatsApp"),
    ...operationalHealthItems()
  ];

  return {
    generatedAt: new Date().toISOString(),
    items,
    latestErrors: items.filter((item) => item.state === "failed").map((item) => `${item.labelHe}: ${item.detailHe}`)
  };
}
