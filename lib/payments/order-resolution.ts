import { readLocalDatabaseSafe } from "@/lib/local-db/read-db-safe";
import { privateLessonPriceForDuration } from "@/lib/private-lessons/constants";
import type {
  CreatePaymentIntentRequest,
  PaymentCheckoutDraft,
  PaymentResolvedOrderDraft
} from "./types";

function assertPositiveQuantity(quantity: number): boolean {
  return Number.isInteger(quantity) && quantity > 0 && quantity <= 20;
}

function resolveCatalogItems(
  academyId: string,
  items: Extract<PaymentCheckoutDraft, { type: "shop" | "event_ticket" | "workshop_camp" }>["items"]
) {
  const { db } = readLocalDatabaseSafe();
  let amount = 0;
  const safeProductIds: string[] = [];

  for (const item of items) {
    if (!assertPositiveQuantity(item.quantity)) {
      return { error: "invalid_quantity" as const };
    }
    const product = db.shopProducts.find(
      (p) => p.id === item.productId && p.studioId === academyId && p.isActive && p.stockStatus !== "sold_out"
    );
    if (!product) {
      return { error: "product_not_available" as const };
    }
    amount += product.price * item.quantity;
    safeProductIds.push(product.id);
  }

  if (amount <= 0) return { error: "empty_checkout" as const };
  return { amount, safeProductIds };
}

function resolvePrivateLessonDraft(
  academyId: string,
  draft: Extract<PaymentCheckoutDraft, { type: "private_lesson" }>
) {
  const { db } = readLocalDatabaseSafe();
  const request = db.teachersAvailability.find((item) => item.id === draft.requestId && item.studioId === academyId);
  if (!request) return { error: "private_lesson_request_not_found" as const };
  if (request.status !== "ready_for_payment" || request.selectedSlotId !== draft.selectedSlotId) {
    return { error: "private_lesson_not_ready_for_payment" as const };
  }
  if (request.teacherId !== draft.teacherId || request.durationMinutes !== draft.durationMinutes) {
    return { error: "private_lesson_mismatch" as const };
  }

  const selectedSlot = request.teacherSuggestedSlots?.find((slot) => slot.id === draft.selectedSlotId);
  if (!selectedSlot) return { error: "selected_slot_not_found" as const };

  return {
    amount: privateLessonPriceForDuration(draft.durationMinutes),
    safeMetadata: {
      requestId: request.id,
      selectedSlotId: selectedSlot.id,
      teacherId: request.teacherId,
      studentId: request.studentId,
      reservedOnlyAfterPaid: "true"
    }
  };
}

export function resolvePaymentOrderDraft(req: CreatePaymentIntentRequest):
  | { ok: true; draft: PaymentResolvedOrderDraft }
  | { ok: false; error: string } {
  const academyId = req.academyId ?? req.studioId;
  const base = {
    orderId: req.orderId,
    academyId,
    userId: req.userId,
    description: req.description,
    currency: "ILS" as const
  };

  if (!req.checkoutDraft) {
    const { db } = readLocalDatabaseSafe();
    const existingOrder = db.shopOrders.find(
      (order) => order.id === req.orderId && order.studioId === academyId && order.userId === req.userId
    );
    if (!existingOrder) return { ok: false, error: "checkout_draft_required" };
    return {
      ok: true,
      draft: {
        ...base,
        type: "existing_shop_order",
        amount: existingOrder.totalPrice,
        safeMetadata: { source: "shop_order", orderId: existingOrder.id }
      }
    };
  }

  if (req.checkoutDraft.type === "private_lesson") {
    const resolved = resolvePrivateLessonDraft(academyId, req.checkoutDraft);
    if ("error" in resolved) return { ok: false, error: resolved.error };
    return {
      ok: true,
      draft: {
        ...base,
        type: "private_lesson",
        amount: resolved.amount,
        safeMetadata: resolved.safeMetadata
      }
    };
  }

  const resolved = resolveCatalogItems(academyId, req.checkoutDraft.items);
  if ("error" in resolved) return { ok: false, error: resolved.error };

  return {
    ok: true,
    draft: {
      ...base,
      type: req.checkoutDraft.type,
      amount: resolved.amount,
      safeMetadata: {
        source: req.checkoutDraft.type,
        productIds: resolved.safeProductIds.join(",")
      }
    }
  };
}
