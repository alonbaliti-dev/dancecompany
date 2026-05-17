import "server-only";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { PaymentStatus, PaymentTransaction } from "./types";

export type PaymentStatusUpdate = {
  academyId: string;
  orderId: string;
  transactionId: string;
  status: PaymentStatus;
  providerReference?: string;
  safeMetadata?: Record<string, string | number | boolean | null>;
};

export async function updatePaymentTransactionStatus(update: PaymentStatusUpdate) {
  const supabase = getSupabaseServerClient({ preferServiceRole: true });
  if (!supabase.enabled) {
    return { ok: true as const, mode: "local_demo" as const, update };
  }

  return {
    ok: false as const,
    mode: "supabase_placeholder" as const,
    reason: "payment_transactions_table_not_applied",
    update
  };
}

export async function updateShopOrderPaymentStatus(update: PaymentStatusUpdate) {
  const supabase = getSupabaseServerClient({ preferServiceRole: true });
  if (!supabase.enabled) {
    return { ok: true as const, mode: "local_demo" as const, update };
  }

  const { data: existing } = await supabase.client
    .from("shop_orders")
    .select("metadata")
    .eq("academy_id", update.academyId)
    .eq("id", update.orderId)
    .single();
  const existingMetadata =
    existing && typeof existing.metadata === "object" && existing.metadata && !Array.isArray(existing.metadata)
      ? existing.metadata
      : {};

  const { error } = await supabase.client
    .from("shop_orders")
    .update({
      payment_status: update.status,
      metadata: {
        ...existingMetadata,
        payment_transaction_id: update.transactionId,
        payment_provider_reference: update.providerReference ?? null,
        payment_updated_at: new Date().toISOString()
      }
    })
    .eq("academy_id", update.academyId)
    .eq("id", update.orderId);

  if (error) return { ok: false as const, mode: "supabase" as const, reason: error.message };
  return { ok: true as const, mode: "supabase" as const };
}

export function paymentStatusUpdateFromTransaction(transaction: PaymentTransaction): PaymentStatusUpdate {
  return {
    academyId: transaction.academyId,
    orderId: transaction.orderId,
    transactionId: transaction.id,
    status: transaction.status,
    providerReference: transaction.providerReference,
    safeMetadata: transaction.rawWebhookSafeMetadata
  };
}
