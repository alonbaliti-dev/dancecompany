import type { PaymentProvider } from "../types";
import type { PaymentProviderPlugin } from "./types";
import { applePayProvider } from "./apple-pay";
import { bitProvider } from "./bit";
import { creditCardProvider } from "./credit-card";
import { googlePayProvider } from "./google-pay";
import { payboxProvider } from "./paybox";

const registry: Record<PaymentProvider, PaymentProviderPlugin> = {
  apple_pay: applePayProvider,
  google_pay: googlePayProvider,
  credit_card: creditCardProvider,
  bit: bitProvider,
  paybox: payboxProvider
};

export function getPaymentProvider(id: PaymentProvider): PaymentProviderPlugin {
  return registry[id];
}

export { applePayProvider, googlePayProvider, creditCardProvider, bitProvider, payboxProvider };
