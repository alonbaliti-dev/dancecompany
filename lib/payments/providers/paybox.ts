import type { PaymentProviderPlugin } from "./types";

/**
 * PayBox — external app redirect + manual/webhook confirmation.
 */
export const payboxProvider: PaymentProviderPlugin = {
  id: "paybox",
  preferredPsp: ["paybox_official"],
  async createIntentOnServer(req) {
    const now = new Date().toISOString();
    const transaction = {
      id: `pay_${Date.now().toString(36)}`,
      studioId: req.studioId,
      orderId: req.orderId,
      userId: req.userId,
      provider: "paybox" as const,
      amount: req.amount,
      currency: req.currency,
      status: "pending" as const,
      providerReference: `paybox_${req.orderId}`,
      createdAt: now,
      updatedAt: now
    };

    return {
      transaction,
      redirectUrl: `https://payboxapp.page.link/?mock=${transaction.id}`,
      pollUrl: `/api/payments/verify?transactionId=${transaction.id}`
    };
  }
};
