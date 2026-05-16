import type { PaymentProvider } from "./types";
import type { ShopPaymentMethod } from "@/lib/types";

/** Maps shop checkout UI methods ↔ payment layer providers. */
export function shopMethodToProvider(method: ShopPaymentMethod): PaymentProvider | null {
  const map: Record<ShopPaymentMethod, PaymentProvider | null> = {
    apple_pay: "apple_pay",
    google_pay: "google_pay",
    credit_card: "credit_card",
    card: "credit_card",
    bit: "bit",
    paybox: "paybox",
    bank_transfer: null
  };
  return map[method] ?? null;
}

export function providerToShopMethod(provider: PaymentProvider): ShopPaymentMethod {
  return provider;
}

export function isExternalAppProvider(provider: PaymentProvider): boolean {
  return provider === "bit" || provider === "paybox";
}

export function isWalletProvider(provider: PaymentProvider): boolean {
  return provider === "apple_pay" || provider === "google_pay";
}
