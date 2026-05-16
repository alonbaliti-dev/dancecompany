import type { PaymentProviderPlugin } from "./types";

/**
 * Bit (בנק לאומי) — mobile deep-link / QR flow.
 * Production: Bit Business API → payment request → webhook `payment.completed`.
 */
export const bitProvider: PaymentProviderPlugin = {
  id: "bit",
  preferredPsp: ["bit_official"],
  async createIntentOnServer(req) {
    const now = new Date().toISOString();
    const transaction = {
      id: `pay_${Date.now().toString(36)}`,
      studioId: req.studioId,
      orderId: req.orderId,
      userId: req.userId,
      provider: "bit" as const,
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
      pollUrl: `/api/payments/verify?transactionId=${transaction.id}`
    };
  }
};
