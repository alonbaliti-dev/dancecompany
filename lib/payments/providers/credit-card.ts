import type { PaymentProviderPlugin } from "./types";

/**
 * Credit card — server-side tokenization only.
 *
 * Future backends (pick one per studio):
 * - Tranzila / Cardcom / Hyp hosted page redirect
 * - Meshulam / Grow Israeli aggregators
 */
export const creditCardProvider: PaymentProviderPlugin = {
  id: "credit_card",
  preferredPsp: ["tranzila", "cardcom", "grow_meshulam"],
  async createIntentOnServer(req) {
    const now = new Date().toISOString();
    const transaction = {
      id: `pay_${Date.now().toString(36)}`,
      academyId: req.academyId ?? req.studioId,
      studioId: req.studioId,
      orderId: req.orderId,
      userId: req.userId,
      provider: "credit_card" as const,
      method: "credit_card" as const,
      amount: req.amount,
      currency: req.currency,
      status: "pending" as const,
      providerReference: `pi_mock_${req.orderId}`,
      createdAt: now,
      updatedAt: now
    };

    return {
      transaction,
      /** Stripe: PaymentIntent client_secret — consumed by Stripe.js on client, not PAN */
      clientSecret: `mock_seti_${transaction.id}_secret`
    };
  }
};
