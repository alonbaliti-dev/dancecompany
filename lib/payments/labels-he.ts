import type { PaymentProvider, PaymentStatus } from "./types";

export function paymentStatusLabelHe(status: PaymentStatus): string {
  const map: Record<PaymentStatus, string> = {
    pending: "ממתין לאישור תשלום",
    authorized: "אושר — ממתין לחיוב סופי",
    paid: "התשלום התקבל",
    failed: "התשלום נכשל",
    cancelled: "בוטל",
    refunded: "הוחזר"
  };
  return map[status];
}

export function paymentProviderLabelHe(provider: PaymentProvider): string {
  const map: Record<PaymentProvider, string> = {
    apple_pay: "Apple Pay",
    google_pay: "Google Pay",
    credit_card: "כרטיס אשראי",
    bit: "ביט",
    paybox: "PayBox"
  };
  return map[provider];
}

export function externalRedirectMessageHe(provider: PaymentProvider): string {
  if (provider === "bit") return "הועבר לאפליקציית Bit";
  if (provider === "paybox") return "הועבר ל-PayBox";
  return "ממתין לאישור באפליקציה חיצונית";
}

export function pendingPaymentHintHe(provider: PaymentProvider): string {
  if (provider === "bit") return "אשרו את התשלום ב-Bit. נעדכן את ההזמנה לאחר אישור.";
  if (provider === "paybox") return "אשרו את התשלום ב-PayBox. ההנהלה יכולה לאשר ידנית.";
  return "ממתין לאישור תשלום";
}
