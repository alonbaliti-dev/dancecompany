/**
 * Payment domain types — production checkout architecture.
 *
 * SECURITY: Card numbers, CVV, and full PAN never appear in these types or in the client.
 * Sensitive tokenization happens only on the payment provider / server (PCI scope).
 */

export type PaymentProvider =
  | "apple_pay"
  | "google_pay"
  | "bit"
  | "paybox"
  | "credit_card";

export type PaymentStatus =
  | "pending"
  | "authorized"
  | "paid"
  | "failed"
  | "cancelled"
  | "refunded";

export type PaymentCurrency = "ILS";

export type PaymentTransaction = {
  id: string;
  studioId: string;
  orderId: string;
  userId: string;
  provider: PaymentProvider;
  amount: number;
  currency: PaymentCurrency;
  status: PaymentStatus;
  /** Provider reference (intent id, Bit request id, etc.) — set server-side */
  providerReference?: string;
  /** Client-safe metadata only */
  metadata?: Record<string, string>;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
};

export type PaymentAuditAction =
  | "payment_initiated"
  | "payment_authorized"
  | "payment_paid"
  | "payment_failed"
  | "payment_cancelled"
  | "payment_refunded"
  | "payment_manual_status_changed"
  | "payment_reminder_sent";

export type PaymentAuditEntry = {
  id: string;
  studioId: string;
  orderId: string;
  transactionId: string;
  action: PaymentAuditAction;
  actorUserId: string;
  actorName: string;
  note?: string;
  createdAt: string;
};

/** Request to create a payment on the server — no card fields. */
export type CreatePaymentIntentRequest = {
  studioId: string;
  orderId: string;
  userId: string;
  provider: PaymentProvider;
  amount: number;
  currency: PaymentCurrency;
  description: string;
  returnUrl: string;
  /** Apple Pay / Google Pay session hints — validated server-side */
  walletSession?: {
    platform: "apple_pay" | "google_pay";
    merchantId?: string;
  };
};

export type CreatePaymentIntentResponse = {
  transaction: PaymentTransaction;
  /** Stripe / Tranzila client secret — never log in production */
  clientSecret?: string;
  /** Bit / PayBox deep link — opened in external app */
  redirectUrl?: string;
  /** Polling endpoint for pending wallet transfers */
  pollUrl?: string;
};

export type VerifyPaymentRequest = {
  transactionId: string;
  studioId: string;
};

export type RefundPaymentRequest = {
  transactionId: string;
  studioId: string;
  reason?: string;
  partialAmount?: number;
};

export type PaymentMethodOption = {
  provider: PaymentProvider;
  labelHe: string;
  subtitleHe: string;
  recommended?: boolean;
  available: boolean;
  unavailableReason?: string;
};

/** Future PSP adapters — wired in lib/payments/providers/ */
export type PaymentPspId =
  | "stripe"
  | "tranzila"
  | "meshulam"
  | "hyp"
  | "grow"
  | "cardcom"
  | "bit_official"
  | "paybox_official";
