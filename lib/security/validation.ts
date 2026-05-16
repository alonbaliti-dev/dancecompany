/**
 * Client-side input validation — defense in depth; always re-validate server-side.
 * Never use dangerouslySetInnerHTML for user content.
 */

const PHONE_IL = /^0?5\d{8}$/;

export function validatePhone(phone: string): { ok: true; normalized: string } | { ok: false; error: string } {
  const digits = phone.replace(/\D/g, "");
  const normalized = digits.startsWith("5") ? `0${digits}` : digits.length === 10 ? digits : digits;
  if (!PHONE_IL.test(normalized.replace(/^0/, "0"))) {
    if (normalized.length < 9 || normalized.length > 10) {
      return { ok: false, error: "מספר טלפון לא תקין" };
    }
  }
  const check = normalized.length === 10 && normalized.startsWith("05") ? normalized : null;
  if (!check) return { ok: false, error: "מספר טלפון לא תקין" };
  return { ok: true, normalized: check };
}

export function validatePassword(password: string, minLen = 6): { ok: true } | { ok: false; error: string } {
  if (password.length < minLen) return { ok: false, error: `סיסמה חייבת להכיל לפחות ${minLen} תווים` };
  return { ok: true };
}

export function validateRequiredText(value: string, maxLen: number): { ok: true; value: string } | { ok: false; error: string } {
  const v = value.trim();
  if (!v) return { ok: false, error: "שדה חובה" };
  if (v.length > maxLen) return { ok: false, error: "טקסט ארוך מדי" };
  return { ok: true, value: v };
}

/**
 * Display-safe text — strip control chars. Production: DOMPurify on server if rich text added.
 */
export function sanitizeDisplayText(input: string): string {
  return input
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/</g, "\u2039")
    .replace(/>/g, "\u203A")
    .trim();
}
