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
        padding: "max(18px, env(safe-area-inset-top, 0px)) 18px max(22px, env(safe-area-inset-bottom, 0px))",
        color: "#fff",
        background:
          "radial-gradient(ellipse 92% 46% at 50% -10%, rgba(246,230,181,0.18), transparent 62%), radial-gradient(ellipse 58% 42% at 12% 78%, rgba(100,28,63,0.25), transparent 66%), radial-gradient(ellipse 46% 30% at 92% 14%, rgba(215,181,109,0.10), transparent 60%), linear-gradient(180deg, #020102 0%, #0a0507 52%, #020102 100%)",
        overflowX: "hidden",
        overflowY: "auto"
      }}
    >
      <section
        style={{
          width: "min(100%, 440px)",
          position: "relative",
          overflow: "hidden",
          border: "1px solid rgba(246,230,181,0.18)",
          borderRadius: "clamp(30px, 8vw, 42px)",
          padding: "clamp(22px, 6vw, 32px)",
          background:
            "radial-gradient(ellipse 80% 70% at 100% 0%, rgba(246,230,181,0.11), transparent 60%), linear-gradient(155deg, rgba(255,247,223,0.105) 0%, rgba(8, 6, 10, 0.92) 56%, rgba(9, 4, 7, 0.96) 100%)",
          boxShadow:
            "0 42px 118px rgba(0,0,0,0.64), 0 18px 70px rgba(215,181,109,0.07), inset 0 1px 0 rgba(255,247,223,0.13)",
          backdropFilter: "blur(24px)"
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: "50%",
            bottom: -120,
            width: "min(78vw, 360px)",
            height: 220,
            transform: "translateX(-50%)",
            borderRadius: "999px 999px 0 0",
            background: "radial-gradient(ellipse at center, rgba(246,230,181,0.10), rgba(100,28,63,0.08) 42%, transparent 72%)",
            pointerEvents: "none"
          }}
        />
        <div
          aria-hidden
          style={{
            position: "absolute",
            insetInline: 40,
            top: 0,
            height: 1,
            background: "linear-gradient(90deg, transparent, rgba(246,230,181,0.32), transparent)"
          }}
        />
        <div style={{ position: "relative", zIndex: 1 }}>
          <p style={{ margin: 0, color: branding.accentColors?.highlight ?? "#F6E6B5", letterSpacing: "0.14em", textTransform: "uppercase", fontSize: 12, fontWeight: 800 }}>
            {branding.displayName ?? academy.name}
          </p>
          <h1 style={{ margin: "14px 0 8px", fontSize: "clamp(32px, 9vw, 42px)", lineHeight: 1.02, letterSpacing: "-0.055em" }}>{academy.name}</h1>
          <p style={{ margin: "0 0 24px", color: "rgba(255,255,255,0.70)", lineHeight: 1.75, fontSize: 15 }}>{branding.tagline}</p>
        </div>

        {showDevNotice ? (
          <div
            style={{
              marginBottom: 20,
              borderRadius: 22,
              border: "1px solid rgba(215,181,109,0.28)",
              padding: "14px 15px",
              color: "rgba(255,255,255,0.82)",
              background: "linear-gradient(145deg, rgba(215,181,109,0.10), rgba(255,255,255,0.025))",
              boxShadow: "inset 0 1px 0 rgba(255,247,223,0.07)",
              lineHeight: 1.65
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
              borderRadius: 22,
              border: `1px solid ${errorMessage ? "rgba(251,113,133,0.34)" : "rgba(52,211,153,0.34)"}`,
              padding: "14px 15px",
              color: "rgba(255,255,255,0.86)",
              background: errorMessage
                ? "linear-gradient(145deg, rgba(127,29,29,0.30), rgba(255,255,255,0.025))"
                : "linear-gradient(145deg, rgba(6,78,59,0.28), rgba(255,255,255,0.025))",
              boxShadow: "inset 0 1px 0 rgba(255,247,223,0.06)",
              lineHeight: 1.65
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

        <Link href="/" style={{ position: "relative", zIndex: 1, display: "block", marginTop: 18, color: branding.accentColors?.highlight ?? "#F6E6B5", textAlign: "center", textDecorationColor: "rgba(246,230,181,0.42)", textUnderlineOffset: 4 }}>
          פתיחת LK Student Space במצב דמו מקומי
        </Link>
      </section>
    </main>
  );
}

const buttonStyle = {
  marginTop: 8,
  border: 0,
  borderRadius: 22,
  padding: "14px 16px",
  color: "#120f18",
  fontWeight: 700,
  background: "linear-gradient(135deg, #F6E6B5, #D7B56D)",
  boxShadow: "0 14px 34px rgba(215,181,109,0.18), inset 0 1px 0 rgba(255,255,255,0.55)",
  cursor: "pointer",
  minHeight: 52
};
