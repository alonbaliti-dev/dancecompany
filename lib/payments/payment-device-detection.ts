/**
 * Suggests payment methods by device / browser — client-safe heuristics only.
 * Final eligibility is validated server-side when creating a payment intent.
 */

import { captureDeviceSnapshot, type DeviceSnapshot } from "@/lib/device/device-detection";
import { isSafariEngine } from "@/lib/layout/viewport-sync";
import type { PaymentMethodOption, PaymentProvider } from "./types";

export type PaymentDeviceProfile = {
  snapshot: DeviceSnapshot;
  isIosSafari: boolean;
  isAndroidChrome: boolean;
  supportsApplePay: boolean;
  supportsGooglePay: boolean;
  isMobile: boolean;
  isDesktop: boolean;
};

export function detectPaymentDevice(): PaymentDeviceProfile {
  const snapshot = captureDeviceSnapshot();
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const isIos = /iPhone|iPad|iPod/i.test(ua);
  const isAndroid = /Android/i.test(ua);
  const isChrome = /Chrome/i.test(ua) && !/Edg|OPR|SamsungBrowser/i.test(ua);
  const isIosSafari = isIos && isSafariEngine();
  const isAndroidChrome = isAndroid && isChrome;

  /**
   * Apple Pay on the Web requires Safari + ApplePaySession (checked at runtime).
   * We only surface the option when the environment is plausible; the server confirms.
   */
  const supportsApplePay =
    typeof window !== "undefined" &&
    isIosSafari &&
    typeof (window as Window & { ApplePaySession?: { canMakePayments?: () => boolean } }).ApplePaySession !== "undefined" &&
    (() => {
      try {
        return (window as Window & { ApplePaySession?: { canMakePayments?: () => boolean } }).ApplePaySession?.canMakePayments?.() ?? false;
      } catch {
        return isIosSafari;
      }
    })();

  /** Google Pay — Chrome/Android; Payment Request API checked when initiating. */
  const supportsGooglePay =
    typeof window !== "undefined" &&
    (isAndroidChrome || (snapshot.deviceType === "desktop" && isChrome)) &&
    typeof window.PaymentRequest !== "undefined";

  return {
    snapshot,
    isIosSafari,
    isAndroidChrome,
    supportsApplePay,
    supportsGooglePay,
    isMobile: snapshot.deviceType === "mobile" || snapshot.deviceType === "tablet",
    isDesktop: snapshot.deviceType === "desktop"
  };
}

const BASE_OPTIONS: Omit<PaymentMethodOption, "available" | "recommended" | "unavailableReason">[] = [
  { provider: "apple_pay", labelHe: "Apple Pay", subtitleHe: "תשלום מהיר ומאובטח" },
  { provider: "google_pay", labelHe: "Google Pay", subtitleHe: "תשלום מהיר בנייד" },
  { provider: "credit_card", labelHe: "כרטיס אשראי", subtitleHe: "מעובד בשרת — ללא שמירת פרטים באפליקציה" },
  { provider: "bit", labelHe: "ביט", subtitleHe: "מעבר לאפליקציית Bit" },
  { provider: "paybox", labelHe: "PayBox", subtitleHe: "מעבר לאפליקציית PayBox" }
];

export function getPaymentMethodOptions(profile: PaymentDeviceProfile = detectPaymentDevice()): PaymentMethodOption[] {
  const ordered: PaymentProvider[] = profile.isIosSafari
    ? ["apple_pay", "credit_card", "bit", "paybox", "google_pay"]
    : profile.isAndroidChrome
      ? ["google_pay", "credit_card", "bit", "paybox", "apple_pay"]
      : profile.isDesktop
        ? ["credit_card", "bit", "paybox", "apple_pay", "google_pay"]
        : ["credit_card", "bit", "paybox", "apple_pay", "google_pay"];

  const byProvider = new Map(BASE_OPTIONS.map((o) => [o.provider, o]));

  return ordered.map((provider, index) => {
    const base = byProvider.get(provider)!;
    let available = true;
    let unavailableReason: string | undefined;

    if (provider === "apple_pay" && !profile.supportsApplePay) {
      available = false;
      unavailableReason = "זמין ב-Safari על iPhone/iPad";
    }
    if (provider === "google_pay" && !profile.supportsGooglePay) {
      available = false;
      unavailableReason = "זמין ב-Chrome על Android";
    }

    return {
      ...base,
      available,
      unavailableReason,
      recommended: index === 0 && available
    };
  });
}

export function defaultPaymentProvider(profile: PaymentDeviceProfile = detectPaymentDevice()): PaymentProvider {
  const options = getPaymentMethodOptions(profile);
  const first = options.find((o) => o.available);
  return first?.provider ?? "credit_card";
}
