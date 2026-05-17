import type { PaymentProviderPlugin } from "./types";

/**
 * Apple Pay — Wallet token via Payment Request / Apple Pay JS on supported Safari.
 * Merchant validation must run on server (Apple Pay merchant session endpoint).
 */
export const applePayProvider: PaymentProviderPlugin = {
  id: "apple_pay",
  preferredPsp: ["tranzila", "cardcom", "grow_meshulam"],
  async createIntentOnServer(req) {
    const now = new Date().toISOString();
    const transaction = {
      id: `pay_${Date.now().toString(36)}`,
      academyId: req.academyId ?? req.studioId,
      studioId: req.studioId,
      orderId: req.orderId,
      userId: req.userId,
      provider: "apple_pay" as const,
      method: "apple_pay" as const,
      amount: req.amount,
      currency: req.currency,
      status: "authorized" as const,
      providerReference: `applepay_${req.orderId}`,
      metadata: { wallet: "apple_pay" },
      createdAt: now,
      updatedAt: now
    };

    return {
      transaction,
      clientSecret: `mock_applepay_${transaction.id}`
    };
  }
};
