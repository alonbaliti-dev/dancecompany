/**
 * Payment domain types — production checkout architecture.
 *
 * SECURITY: Card numbers, CVV, and full PAN never appear in these types or in the client.
 * Sensitive tokenization happens only on the payment provider / server (PCI scope).
 */

export type PaymentMethod =
  | "apple_pay"
  | "google_pay"
  | "bit"
  | "paybox"
  | "credit_card";

/** Checkout method. Kept as PaymentProvider for existing UI compatibility. */
export type PaymentProvider = PaymentMethod;

export type PaymentProcessorProvider = "tranzila" | "cardcom" | "grow_meshulam";

export type PaymentStatus =
  | "pending"
  | "authorized"
  | "paid"
  | "failed"
  | "cancelled"
  | "refunded";

export type PaymentCurrency = "ILS";

export type PaymentProviderConfig = {
  academyId: string;
  provider: PaymentProcessorProvider;
  terminalId?: string;
  merchantId?: string;
  publicConfig: Record<string, string>;
  /** Secret value lives in env/secret manager; this is only the reference name. */
  secretConfigReference: string;
  enabledMethods: PaymentMethod[];
  isActive: boolean;
};

export type PaymentTransaction = {
  id: string;
  academyId: string;
  studioId: string;
  orderId: string;
  userId: string;
  provider: PaymentProvider;
  processorProvider?: PaymentProcessorProvider;
  amount: number;
  currency: PaymentCurrency;
  method?: PaymentMethod;
  status: PaymentStatus;
  providerTransactionId?: string;
  /** Provider reference (intent id, Bit request id, etc.) — set server-side */
  providerReference?: string;
  /** Client-safe metadata only */
  metadata?: Record<string, string>;
  rawWebhookSafeMetadata?: Record<string, string | number | boolean | null>;
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
  academyId?: string;
  orderId: string;
  userId: string;
  provider: PaymentProvider;
  /**
   * Informational legacy field only. API routes must calculate the final amount
   * from database products/requests and reject mismatches.
   */
  amount: number;
  currency: PaymentCurrency;
  description: string;
  returnUrl: string;
  checkoutDraft?: PaymentCheckoutDraft;
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

export type PaymentCheckoutDraft =
  | {
      type: "shop";
      items: { productId: string; quantity: number; size?: string; color?: string }[];
    }
  | {
      type: "private_lesson";
      requestId: string;
      selectedSlotId: string;
      teacherId: string;
      durationMinutes: 30 | 45;
    }
  | {
      type: "event_ticket";
      items: { productId: string; quantity: number }[];
      eventId?: string;
    }
  | {
      type: "workshop_camp";
      items: { productId: string; quantity: number }[];
    };

export type PaymentResolvedOrderDraft = {
  orderId: string;
  academyId: string;
  userId: string;
  type: PaymentCheckoutDraft["type"] | "existing_shop_order";
  description: string;
  amount: number;
  currency: PaymentCurrency;
  safeMetadata: Record<string, string>;
};

export type ShopOrderPaymentModel = {
  id: string;
  academyId: string;
  userId: string;
  items: { productId: string; quantity: number; unitAmount: number }[];
  totalAmount: number;
  currency: PaymentCurrency;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: "new" | "processing" | "ready_for_pickup" | "delivered" | "cancelled";
  createdAt: string;
  updatedAt: string;
};

export type PrivateLessonPayment = {
  requestId: string;
  selectedSlotId: string;
  teacherId: string;
  durationMinutes: 30 | 45;
  amount: number;
  paymentStatus: PaymentStatus;
  reservedOnlyAfterPaid: true;
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

export type ManualOfficePaymentRequest = {
  academyId: string;
  orderId: string;
  actorUserId: string;
  actorName: string;
  method: "office_cash" | "bank_transfer" | "office_credit_terminal";
  note?: string;
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
  | "tranzila"
  | "cardcom"
  | "grow_meshulam";
