export type AuthMode = "local_demo" | "supabase";

export function getAuthMode(): AuthMode {
  return process.env.AUTH_MODE === "supabase" ? "supabase" : "local_demo";
}

export function isSupabaseAuthEnabled() {
  return getAuthMode() === "supabase";
}

export function getAuthModeStatus() {
  const mode = getAuthMode();
  const databaseUrlConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const supabaseServerConfigured = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (mode === "supabase" && !databaseUrlConfigured) {
    return {
      mode,
      enabled: false as const,
      reason: "כניסת סטודיו מאובטחת אינה מוגדרת במלואה. מצב דמו מקומי עדיין זמין."
    };
  }

  if (mode === "supabase" && !supabaseServerConfigured) {
    return {
      mode,
      enabled: false as const,
      reason: "כניסת סטודיו מאובטחת חסומה עד השלמת הגדרות שרת ואימות פרופיל אקדמיה."
    };
  }

  if (mode === "supabase") {
    return {
      mode,
      enabled: true as const,
      reason: "כניסת סטודיו עם קוד SMS פעילה. נדרש טלפון ישראלי ופרופיל אקדמיה."
    };
  }

  return {
    mode,
    enabled: false as const,
    reason: "Local demo auth is active."
  };
}
