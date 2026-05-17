import type { PaymentProviderPlugin } from "./types";

/**
 * Bit (בנק לאומי) — mobile deep-link / QR flow.
 * Production: Bit Business API → payment request → webhook `payment.completed`.
 */
export const bitProvider: PaymentProviderPlugin = {
  id: "bit",
  preferredPsp: ["tranzila", "cardcom", "grow_meshulam"],
  async createIntentOnServer(req) {
    const now = new Date().toISOString();
    const transaction = {
      id: `pay_${Date.now().toString(36)}`,
      academyId: req.academyId ?? req.studioId,
      studioId: req.studioId,
      orderId: req.orderId,
      userId: req.userId,
      provider: "bit" as const,
      method: "bit" as const,
      amount: req.amount,
      currency: req.currency,
      status: "pending" as const,
      providerReference: `bit_req_${req.orderId}`,
      createdAt: now,
      updatedAt: now
    };

    return {
      transaction,
      redirectUrl: `bit://pay?request=${transaction.id}&amount=${req.amount}`,
      pollUrl: `/api/payments/status?transactionId=${transaction.id}&academyId=${encodeURIComponent(req.academyId ?? req.studioId)}`
    };
  }
};
