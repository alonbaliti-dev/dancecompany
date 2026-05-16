import type { PaymentProviderPlugin } from "./types";

/** Google Pay — Payment Request API + server-side capture. */
export const googlePayProvider: PaymentProviderPlugin = {
  id: "google_pay",
  preferredPsp: ["stripe", "tranzila"],
  async createIntentOnServer(req) {
    const now = new Date().toISOString();
    const transaction = {
      id: `pay_${Date.now().toString(36)}`,
      studioId: req.studioId,
      orderId: req.orderId,
      userId: req.userId,
      provider: "google_pay" as const,
      amount: req.amount,
      currency: req.currency,
      status: "authorized" as const,
      providerReference: `gpay_${req.orderId}`,
      metadata: { wallet: "google_pay" },
      createdAt: now,
      updatedAt: now
    };

    return {
      transaction,
      clientSecret: `mock_gpay_${transaction.id}`
    };
  }
};
