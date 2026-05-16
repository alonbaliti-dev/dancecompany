import type { CreatePaymentIntentRequest, CreatePaymentIntentResponse, PaymentPspId, PaymentProvider } from "../types";

/**
 * Provider plugin contract — implemented per method.
 * Real charging runs in API routes + PSP SDK on the server only.
 */
export type PaymentProviderPlugin = {
  id: PaymentProvider;
  /** Target PSP for backend wiring (Stripe, Tranzila, Bit API, …) */
  preferredPsp: PaymentPspId[];
  /**
   * SERVER ONLY — called from `/api/payments/create-intent`.
   * Must not accept raw card numbers.
   */
  createIntentOnServer: (req: CreatePaymentIntentRequest) => Promise<CreatePaymentIntentResponse>;
};
