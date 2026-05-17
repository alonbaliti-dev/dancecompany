"use client";

import { useMemo, useState } from "react";

type AcademyOtpLoginFormProps = {
  academyId: string;
  slug: string;
  enabled: boolean;
};

type LoginStep = "phone" | "code" | "done";
type LoginMethod = "password" | "sms";

const inputStyle = {
  width: "100%",
  boxSizing: "border-box" as const,
  border: "1px solid rgba(255,255,255,0.18)",
  borderRadius: 14,
  padding: "13px 14px",
  color: "#fff",
  background: "rgba(255,255,255,0.08)",
  minHeight: 48
};

const buttonStyle = {
  marginTop: 8,
  border: 0,
  borderRadius: 16,
  padding: "14px 16px",
  color: "#120f18",
  fontWeight: 800,
  background: "linear-gradient(135deg, #F6E6B5, #D7B56D)",
  cursor: "pointer",
  minHeight: 48
};

function messageFor(error?: string | null) {
  const messages: Record<string, string> = {
    invalid_phone: "מספר הטלפון לא תקין. אפשר להזין 05... או ‎+972...",
    too_many_attempts: "בוצעו יותר מדי ניסיונות. נסו שוב בעוד כמה דקות.",
    sms_send_failed: "לא הצלחנו לשלוח SMS כרגע. נסו שוב בעוד רגע.",
    invalid_session: "הקוד שגוי או פג תוקף. אפשר לבקש קוד חדש.",
    invalid_credentials: "מספר הטלפון או הסיסמה אינם נכונים.",
    profile_not_found: "לא נמצא פרופיל פעיל באקדמיה למספר הזה.",
    supabase_not_configured: "החיבור המאובטח למסד הנתונים אינו זמין כרגע.",
    session_secret_missing: "לא ניתן ליצור סשן מאובטח כרגע.",
    network: "לא הצלחנו להתחבר. בדקו אינטרנט ונסו שוב."
  };
  return error ? messages[error] ?? "לא ניתן להשלים כניסה כרגע." : null;
}

export function AcademyOtpLoginForm({ academyId, slug, enabled }: AcademyOtpLoginFormProps) {
  const [method, setMethod] = useState<LoginMethod>("password");
  const [step, setStep] = useState<LoginStep>("phone");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [phoneTail, setPhoneTail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const errorMessage = useMemo(() => messageFor(error), [error]);

  function resetFlow(nextMethod: LoginMethod) {
    setMethod(nextMethod);
    setStep("phone");
    setCode("");
    setError(null);
    setNotice(null);
  }

  async function loginWithPassword() {
    setLoading(true);
    setError(null);
    setNotice(null);

    try {
      const response = await fetch("/api/auth/phone-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ academyId, slug, phone, password })
      });
      const payload = (await response.json()) as { ok: boolean; error?: string };
      if (!response.ok || !payload.ok) {
        setError(payload.error ?? "invalid_credentials");
        return;
      }
      setStep("done");
      setNotice("הכניסה הצליחה. מעבירים אותך למרחב האישי...");
      window.location.assign("/");
    } catch {
      setError("network");
    } finally {
      setLoading(false);
    }
  }

  async function sendCode() {
    setLoading(true);
    setError(null);
    setNotice(null);

    try {
      const response = await fetch("/api/auth/sms/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ academyId, phone })
      });
      const payload = (await response.json()) as { ok: boolean; error?: string; phoneTail?: string };
      if (!response.ok || !payload.ok) {
        setError(payload.error ?? "network");
        return;
      }
      setPhoneTail(payload.phoneTail ?? "");
      setStep("code");
      setNotice("שלחנו קוד חד־פעמי ב-SMS.");
    } catch {
      setError("network");
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode() {
    setLoading(true);
    setError(null);
    setNotice(null);

    try {
      const response = await fetch("/api/auth/sms/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ academyId, phone, code })
      });
      const payload = (await response.json()) as { ok: boolean; error?: string };
      if (!response.ok || !payload.ok) {
        setError(payload.error ?? "invalid_session");
        return;
      }
      setStep("done");
      setNotice("הכניסה הצליחה. מעבירים אותך למרחב האישי...");
      window.location.assign("/");
    } catch {
      setError("network");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {errorMessage || notice ? (
        <div
          role="status"
          style={{
            borderRadius: 18,
            border: `1px solid ${errorMessage ? "rgba(251,113,133,0.34)" : "rgba(52,211,153,0.34)"}`,
            padding: 14,
            color: "rgba(255,255,255,0.86)",
            background: errorMessage ? "rgba(127,29,29,0.24)" : "rgba(6,78,59,0.22)",
            lineHeight: 1.6
          }}
        >
          {errorMessage ?? notice}
        </div>
      ) : null}

      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!enabled || loading) return;
          if (method === "password") void loginWithPassword();
          if (method === "sms" && step === "phone") void sendCode();
          if (method === "sms" && step === "code") void verifyCode();
        }}
        style={{ display: "grid", gap: 12 }}
      >
        <input name="slug" type="hidden" value={slug} />
        <input name="academyId" type="hidden" value={academyId} />

        <div
          role="tablist"
          aria-label="אפשרויות כניסה"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 8,
            padding: 4,
            borderRadius: 18,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.08)"
          }}
        >
          {([
            ["password", "טלפון + סיסמה"],
            ["sms", "קוד SMS"]
          ] as const).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={method === id}
              onClick={() => resetFlow(id)}
              disabled={loading}
              style={{
                minHeight: 42,
                borderRadius: 14,
                color: method === id ? "#120f18" : "rgba(255,255,255,0.78)",
                fontWeight: 800,
                background: method === id ? "linear-gradient(135deg, #F6E6B5, #D7B56D)" : "transparent",
                cursor: loading ? "not-allowed" : "pointer"
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <label style={{ display: "grid", gap: 6 }}>
          <span>טלפון נייד</span>
          <input
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="05xxxxxxxx"
            style={inputStyle}
            disabled={!enabled || loading || (method === "sms" && step !== "phone")}
            dir="ltr"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />
        </label>

        {method === "password" ? (
          <label style={{ display: "grid", gap: 6 }}>
            <span>סיסמה</span>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              style={inputStyle}
              disabled={!enabled || loading}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
        ) : null}

        {method === "sms" && step !== "phone" ? (
          <label style={{ display: "grid", gap: 6 }}>
            <span>קוד חד־פעמי</span>
            <input
              name="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="123456"
              maxLength={6}
              style={{ ...inputStyle, letterSpacing: "0.18em", textAlign: "center" }}
              disabled={!enabled || loading || step === "done"}
              dir="ltr"
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
            />
            {phoneTail ? <small style={{ color: "rgba(255,255,255,0.58)" }}>הקוד נשלח למספר שמסתיים ב-{phoneTail}</small> : null}
          </label>
        ) : null}

        <button
          type="submit"
          disabled={!enabled || loading || step === "done"}
          style={{
            ...buttonStyle,
            cursor: !enabled || loading || step === "done" ? "not-allowed" : "pointer",
            opacity: !enabled || loading || step === "done" ? 0.58 : 1
          }}
        >
          {loading ? "רגע..." : method === "password" ? "כניסה לסטודיו" : step === "phone" ? "שליחת קוד SMS" : "כניסה עם קוד"}
        </button>

        {method === "sms" && step === "code" ? (
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              setStep("phone");
              setCode("");
              setError(null);
              setNotice(null);
            }}
            style={{ color: "rgba(246,230,181,0.9)", padding: "8px 0", textAlign: "center" }}
          >
            שינוי מספר טלפון
          </button>
        ) : null}
      </form>
    </div>
  );
}
