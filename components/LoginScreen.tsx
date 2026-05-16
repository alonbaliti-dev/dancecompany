"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useDirectoryUsers } from "@/context/UserDirectoryContext";
import type { UserProfile } from "@/lib/types";
import { authService } from "@/lib/services/auth-service";
import { requestPasswordReset } from "@/lib/auth/auth-client";
import { userTypeLabel } from "@/lib/users/user-logic";
import { usePlatform, useBrandingStyle } from "@/context/PlatformContext";
import { Card, PrimaryButton, cx, inputClass } from "./ui";
import { SocialLinksStrip } from "./media/SocialLinksStrip";

type FieldError = "phone" | "password" | null;

export function LoginScreen({ onSuccess }: { onSuccess: (user: UserProfile) => void }) {
  const { branding } = usePlatform();
  const brandStyle = useBrandingStyle(branding);
  const directoryUsers = useDirectoryUsers();
  const devLoginHints = useMemo(
    () =>
      directoryUsers
        .filter((u) => u.status === "active")
        .sort((a, b) => (a.permissions.isSuperAdmin ? -1 : 0) - (b.permissions.isSuperAdmin ? -1 : 0))
        .slice(0, 8)
        .map((u) => ({ role: userTypeLabel(u), phone: u.phone })),
    [directoryUsers]
  );
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [fieldError, setFieldError] = useState<FieldError>(null);
  const [authError, setAuthError] = useState<"invalid" | "inactive" | "rate_limited" | null>(null);
  const [showDevAccounts, setShowDevAccounts] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotMsg, setForgotMsg] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setAuthError(null);
    const p = phone.trim();
    if (!p) {
      setFieldError("phone");
      return;
    }
    if (!password) {
      setFieldError("password");
      return;
    }
    setFieldError(null);

    const result = authService.signIn(p, password);
    if (result.kind === "success") {
      onSuccess(result.user);
      return;
    }
    setAuthError(result.code === "inactive" ? "inactive" : result.code === "rate_limited" ? "rate_limited" : "invalid");
  }

  return (
    <motion.div className="app-canvas-glow flex min-h-app flex-col justify-center px-6 py-14 px-safe" dir="rtl" style={brandStyle}>
      <div className="mx-auto w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-center"
        >
          <div className="mx-auto mb-6 flex h-[5.25rem] w-[5.25rem] items-center justify-center rounded-[1.35rem] border border-white/[0.12] bg-gradient-to-b from-white/[0.14] to-white/[0.03] shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_20px_50px_rgba(0,0,0,0.35)]">
            <span className="bg-gradient-to-br from-white to-white/70 bg-clip-text text-3xl font-semibold tracking-tight text-transparent">{branding.logoText}</span>
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/38">{branding.studioName}</p>
          <h1 className="mt-2 text-[1.85rem] font-semibold leading-tight tracking-tight text-white">{branding.appName}</h1>
          <p className="mx-auto mt-3 max-w-[20rem] text-[14px] leading-relaxed text-white/50">שיעורים, משימות והודעות — במקום אחד מסודר</p>
        </motion.div>

        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 space-y-4"
        >
          <Card animated={false} className="lk-login-panel !p-5 space-y-4 !border-0 !bg-transparent !shadow-none">
            <div>
              <label htmlFor="login-phone" className="mb-2 block text-right text-[11px] font-semibold uppercase tracking-[0.14em] text-white/38">
                מספר טלפון
              </label>
              <input
                id="login-phone"
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (fieldError === "phone") setFieldError(null);
                  setAuthError(null);
                }}
                placeholder="050-0000000"
                className={cx(inputClass, fieldError === "phone" && "border-rose-400/40")}
              />
              {fieldError === "phone" ? <p className="mt-2 text-right text-[12px] text-rose-300/90">נא להזין מספר טלפון</p> : null}
            </div>

            <div>
              <label htmlFor="login-password" className="mb-2 block text-right text-[11px] font-semibold uppercase tracking-[0.14em] text-white/38">
                סיסמה
              </label>
              <input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldError === "password") setFieldError(null);
                  setAuthError(null);
                }}
                placeholder="הזינו סיסמה"
                className={cx(inputClass, fieldError === "password" && "border-rose-400/40")}
              />
              {fieldError === "password" ? <p className="mt-2 text-right text-[12px] text-rose-300/90">נא להזין סיסמה</p> : null}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setForgotOpen((v) => !v);
                  setForgotMsg(null);
                }}
                className="text-[13px] font-medium text-emerald-200/75 transition hover:text-emerald-100/95"
              >
                שכחת סיסמה?
              </button>
            </div>

            {forgotOpen ? (
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 text-right">
                <p className="text-[12px] text-white/45">הזינו מספר טלפון — נשלח אליכם קישור לאיפוס סיסמה בהודעה.</p>
                <button
                  type="button"
                  className="mt-2 text-[13px] font-medium text-emerald-200/80"
                  onClick={() => {
                    const r = requestPasswordReset(phone);
                    setForgotMsg(r.kind === "success" ? r.message : "נסו שוב מאוחר יותר");
                  }}
                >
                  שליחת בקשת איפוס
                </button>
                {forgotMsg ? <p className="mt-2 text-[12px] text-white/50">{forgotMsg}</p> : null}
              </div>
            ) : null}

            {authError === "invalid" ? (
              <p className="rounded-xl border border-rose-400/20 bg-rose-500/[0.08] px-3 py-2.5 text-right text-[13px] text-rose-100/95">מספר הטלפון או הסיסמה שגויים</p>
            ) : null}
            {authError === "inactive" ? (
              <p className="rounded-xl border border-amber-400/20 bg-amber-500/[0.08] px-3 py-2.5 text-right text-[13px] text-amber-100/95">החשבון לא פעיל. צרו קשר עם ההנהלה.</p>
            ) : null}
            {authError === "rate_limited" ? (
              <p className="rounded-xl border border-amber-400/20 bg-amber-500/[0.08] px-3 py-2.5 text-right text-[13px] text-amber-100/95">יותר מדי ניסיונות התחברות. נסו שוב בעוד מספר דקות.</p>
            ) : null}

            <PrimaryButton type="submit">כניסה</PrimaryButton>
          </Card>
        </motion.form>

        {process.env.NEXT_PUBLIC_APP_ENV !== "production" ? (
          <>
            <button
              type="button"
              onClick={() => setShowDevAccounts((v) => !v)}
              className="mt-6 w-full text-center text-[12px] font-medium text-white/35 transition hover:text-white/55"
            >
              {showDevAccounts ? "הסתרת חשבונות לסביבת פיתוח" : "חשבונות לסביבת פיתוח"}
            </button>
            {showDevAccounts ? (
              <div className="mt-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-right text-[12px] leading-relaxed text-white/42">
                <p className="mb-2 text-[11px] text-white/32">
                  משתמשים מ־users.json — סיסמאות ב־auth-credentials.json (לא מוצגות כאן)
                </p>
                {devLoginHints.map((a) => (
                  <p key={a.phone} className="mt-1">
                    <span className="text-white/55">{a.role}:</span>{" "}
                    <span dir="ltr">{a.phone}</span>
                  </p>
                ))}
              </div>
            ) : null}
          </>
        ) : null}

        <div className="mt-8">
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-white/32">הסטודיו ברשת</p>
          <SocialLinksStrip className="mt-3" variant="compact" />
        </div>

        <p className="mt-6 text-center text-[11px] text-white/28">בעיות התחברות? פנו להנהלת הסטודיו</p>
      </div>
    </motion.div>
  );
}
