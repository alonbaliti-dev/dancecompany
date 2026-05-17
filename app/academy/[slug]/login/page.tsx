import Link from "next/link";
import { getAuthModeStatus } from "@/lib/auth/auth-mode";
import { getAcademyBySlug } from "@/lib/repositories/academy-repository";
import { AcademyOtpLoginForm } from "./AcademyOtpLoginForm";

type AcademyLoginPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ auth?: string; error?: string }>;
};

function authMessageFor(error?: string) {
  if (!error) return null;
  const messages: Record<string, string> = {
    invalid_credentials: "מספר הטלפון או קוד הכניסה אינם נכונים.",
    invalid_session: "קוד הכניסה שגוי או פג תוקף.",
    backend_unavailable: "כניסה מאובטחת אינה זמינה כרגע. מצב דמו מקומי עדיין פתוח לצוות הפיתוח.",
    session_unavailable: "לא ניתן ליצור סשן מאובטח כרגע.",
    profile_not_found: "לא נמצא פרופיל פעיל באקדמיה.",
    academy_forbidden: "אין הרשאה לאקדמיה המבוקשת."
  };
  return messages[error] ?? "לא ניתן להשלים כניסה כרגע.";
}

export default async function AcademyLoginPage({ params, searchParams }: AcademyLoginPageProps) {
  const { slug } = await params;
  const query = (await searchParams) ?? {};
  const { academy, source, reason } = await getAcademyBySlug(slug);
  const authStatus = getAuthModeStatus();
  const branding = academy.branding;
  const showDevNotice = process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_APP_ENV === "development";
  const isPhoneLoginPending = authStatus.mode === "supabase" && !authStatus.enabled;
  const errorMessage = authMessageFor(query.error);
  const verifiedMessage = query.auth === "verified" ? "הכניסה אומתה והפרופיל נקשר לאקדמיה." : null;

  return (
    <main
      dir={academy.settings.direction}
      style={{
        minHeight: "100svh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        color: "#fff",
        background:
          "radial-gradient(circle at top, rgba(215,181,109,0.22), transparent 34rem), linear-gradient(135deg, #120f18 0%, #050407 100%)"
      }}
    >
      <section
        style={{
          width: "min(100%, 440px)",
          border: "1px solid rgba(246,230,181,0.22)",
          borderRadius: 28,
          padding: 28,
          background: "rgba(8, 7, 12, 0.84)",
          boxShadow: "0 32px 90px rgba(0,0,0,0.42)"
        }}
      >
        <p style={{ margin: 0, color: branding.accentColors?.highlight ?? "#F6E6B5", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          {branding.displayName ?? academy.name}
        </p>
        <h1 style={{ margin: "14px 0 8px", fontSize: 34 }}>{academy.name}</h1>
        <p style={{ margin: "0 0 24px", color: "rgba(255,255,255,0.72)", lineHeight: 1.7 }}>{branding.tagline}</p>

        {showDevNotice ? (
          <div
            style={{
              marginBottom: 20,
              borderRadius: 18,
              border: "1px solid rgba(215,181,109,0.28)",
              padding: 14,
              color: "rgba(255,255,255,0.82)",
              background: "rgba(215,181,109,0.08)"
            }}
          >
            {source === "local_demo" && reason ? `${reason} ` : ""}
            {authStatus.reason}
          </div>
        ) : null}

        {errorMessage || verifiedMessage ? (
          <div
            style={{
              marginBottom: 20,
              borderRadius: 18,
              border: `1px solid ${errorMessage ? "rgba(251,113,133,0.34)" : "rgba(52,211,153,0.34)"}`,
              padding: 14,
              color: "rgba(255,255,255,0.86)",
              background: errorMessage ? "rgba(127,29,29,0.24)" : "rgba(6,78,59,0.22)"
            }}
          >
            {errorMessage ?? verifiedMessage}
          </div>
        ) : null}

        {authStatus.enabled ? (
          <AcademyOtpLoginForm academyId={academy.id} slug={slug} enabled={authStatus.enabled} />
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            <button
              type="button"
              disabled={isPhoneLoginPending}
              style={{
                ...buttonStyle,
                cursor: isPhoneLoginPending ? "not-allowed" : "pointer",
                opacity: isPhoneLoginPending ? 0.58 : 1
              }}
            >
              {isPhoneLoginPending ? "כניסה מאובטחת חסומה עד השלמת הגדרות" : "המשך למצב דמו מקומי"}
            </button>
          </div>
        )}

        <Link href="/" style={{ display: "block", marginTop: 16, color: branding.accentColors?.highlight ?? "#F6E6B5", textAlign: "center" }}>
          פתיחת LK Student Space במצב דמו מקומי
        </Link>
      </section>
    </main>
  );
}

const buttonStyle = {
  marginTop: 8,
  border: 0,
  borderRadius: 16,
  padding: "13px 16px",
  color: "#120f18",
  fontWeight: 700,
  background: "linear-gradient(135deg, #F6E6B5, #D7B56D)",
  cursor: "pointer"
};
