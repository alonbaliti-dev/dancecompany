import type { LocalDatabase } from "@/lib/local-db/db-types";
import { canManageShopCatalog, canManageShopOrder } from "@/lib/security/permissions";
import { guard } from "@/lib/security/guards";
import type {
  ShopOrder,
  ShopPaymentStatus,
  ShopProduct,
  ShopProductFormPayload,
  ShopFulfillmentStatus,
  UserProfile
} from "@/lib/types";
import { domainGuards } from "../core/permissions";
import type { DomainMutationInput } from "../core/types";

function newId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

export function buildCreateProductMutation(
  actor: UserProfile,
  payload: ShopProductFormPayload
): DomainMutationInput {
  const id = newId("prod");
  const product: ShopProduct = {
    ...payload,
    id,
    studioId: actor.studioId,
    currency: "ILS"
  };
  return {
    actor,
    guard: domainGuards.manageShop(actor, actor.studioId),
    mutate: (db) => ({ ...db, shopProducts: [...db.shopProducts, product] }),
    audit: {
      action: `מוצר חדש: ${product.title}`,
      targetType: "shop_product",
      targetId: id,
      severity: "info"
    },
    activity: {
      kind: "shop_order",
      messageHe: `מוצר בחנות: ${product.title}`,
      relatedType: "shop_product",
      relatedId: id
    }
  };
}

export function buildUpdateProductMutation(
  actor: UserProfile,
  productId: string,
  patch: Partial<ShopProductFormPayload> & { isActive?: boolean },
  existing: ShopProduct
): DomainMutationInput | null {
  if (!canManageShopCatalog(actor, existing.studioId)) return null;
  return {
    actor,
    guard: domainGuards.manageShop(actor, existing.studioId),
    mutate: (db) => ({
      ...db,
      shopProducts: db.shopProducts.map((p) => (p.id === productId ? { ...p, ...patch } : p))
    }),
    audit: {
      action: "מוצר חנות עודכן",
      targetType: "shop_product",
      targetId: productId,
      severity: "info"
    }
  };
}

export function buildAppendShopOrderMutation(
  actor: UserProfile,
  order: ShopOrder
): DomainMutationInput {
  return {
    actor,
    guard: guard(true),
    mutate: (db) => ({ ...db, shopOrders: [order, ...db.shopOrders] }),
    audit: {
      action: "הזמנת חנות נוצרה",
      targetType: "shop_order",
      targetId: order.id,
      severity: "info"
    },
    activity: {
      kind: "shop_order",
      messageHe: `הזמנה חדשה ₪${order.totalPrice}`,
      relatedType: "shop_order",
      relatedId: order.id
    },
    sync: { actionType: "shop_checkout", payload: { orderId: order.id } }
  };
}

export function buildUpdateOrderPaymentMutation(
  actor: UserProfile,
  order: ShopOrder,
  status: ShopPaymentStatus
): DomainMutationInput | null {
  if (!canManageShopOrder(actor, order)) return null;
  return {
    actor,
    guard: guard(true),
    mutate: (db) => ({
      ...db,
      shopOrders: db.shopOrders.map((o) => (o.id === order.id ? { ...o, paymentStatus: status } : o))
    }),
    audit: {
      action: `סטטוס תשלום הזמנה: ${status}`,
      targetType: "shop_order",
      targetId: order.id,
      severity: status === "failed" ? "warning" : "info"
    }
  };
}

export function buildMarkManualOfficePaymentMutation(
  actor: UserProfile,
  order: ShopOrder,
  input: { method: "office_cash" | "bank_transfer" | "office_credit_terminal"; note?: string }
): DomainMutationInput | null {
  if (!canManageShopOrder(actor, order)) return null;
  return {
    actor,
    guard: guard(true),
    mutate: (db) => ({
      ...db,
      shopOrders: db.shopOrders.map((o) =>
        o.id === order.id
          ? {
              ...o,
              paymentStatus: "paid",
              paymentMethod: input.method === "bank_transfer" ? "bank_transfer" : "credit_card"
            }
          : o
      )
    }),
    audit: {
      action: `תשלום ידני אושר: ${input.method}`,
      targetType: "shop_order",
      targetId: order.id,
      severity: "info"
    },
    activity: {
      kind: "shop_order",
      messageHe: `תשלום ידני אושר להזמנה ${order.id}`,
      relatedType: "shop_order",
      relatedId: order.id
    }
  };
}

export function buildUpdateOrderFulfillmentMutation(
  actor: UserProfile,
  order: ShopOrder,
  status: ShopFulfillmentStatus
): DomainMutationInput | null {
  if (!canManageShopOrder(actor, order)) return null;
  return {
    actor,
    guard: guard(true),
    mutate: (db) => ({
      ...db,
      shopOrders: db.shopOrders.map((o) => (o.id === order.id ? { ...o, fulfillmentStatus: status } : o))
    }),
    audit: {
      action: `סטטוס אספקה: ${status}`,
      targetType: "shop_order",
      targetId: order.id,
      severity: "info"
    }
  };
}
