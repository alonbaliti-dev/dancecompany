import type {
  ShopFulfillmentStatus,
  ShopOrder,
  ShopPaymentMethod,
  ShopPaymentStatus,
  ShopProduct,
  ShopProductCategory,
  ShopStockStatus
} from "@/lib/types";

/** Hebrew category labels for browse UI */
export const SHOP_CATEGORY_GROUPS: { id: ShopProductCategory | "all"; label: string }[] = [
  { id: "all", label: "הכל" },
  { id: "studio_wear", label: "חולצות ממותגות" },
  { id: "studio_wear", label: "בגדי סטודיו" },
  { id: "dance_shoes", label: "נעלי ריקוד" },
  { id: "dance_socks", label: "גרבי ריקוד" },
  { id: "accessories", label: "אביזרי ריקוד" },
  { id: "event_ticket", label: "כרטיסים למופעים" },
  { id: "workshop", label: "תשלום לאירועים / סדנאות / מחנות" },
  { id: "digital", label: "מוצרים דיגיטליים" }
];

/** Unique browse chips — studio wear covers shirts + apparel via tags */
export const SHOP_BROWSE_CHIPS: { id: ShopProductCategory | "branded_shirts" | "all"; label: string; match: (p: ShopProduct) => boolean }[] = [
  { id: "all", label: "הכל", match: () => true },
  {
    id: "branded_shirts",
    label: "חולצות ממותגות",
    match: (p) => p.category === "studio_wear" && p.tags.some((t) => /חולצ|shirt/i.test(t))
  },
  {
    id: "studio_wear",
    label: "בגדי סטודיו",
    match: (p) => p.category === "studio_wear"
  },
  { id: "dance_shoes", label: "נעלי ריקוד", match: (p) => p.category === "dance_shoes" },
  { id: "dance_socks", label: "גרבי ריקוד", match: (p) => p.category === "dance_socks" },
  { id: "accessories", label: "אביזרי ריקוד", match: (p) => p.category === "accessories" },
  { id: "event_ticket", label: "כרטיסים למופעים", match: (p) => p.category === "event_ticket" },
  { id: "workshop", label: "סדנאות ומחנות", match: (p) => p.category === "workshop" },
  { id: "digital", label: "דיגיטלי (בקרוב)", match: (p) => p.category === "digital" }
];

export const END_YEAR_EVENT_ID = "evt_end_year_show";

export function categoryLabel(cat: ShopProductCategory): string {
  const map: Record<ShopProductCategory, string> = {
    studio_wear: "בגדי סטודיו",
    dance_shoes: "נעלי ריקוד",
    dance_socks: "גרבי ריקוד",
    accessories: "אביזרי ריקוד",
    event_ticket: "כרטיס לאירוע",
    workshop: "סדנה / מחנה",
    digital: "דיגיטלי"
  };
  return map[cat] ?? cat;
}

export function stockLabel(status: ShopStockStatus): string {
  const map: Record<ShopStockStatus, string> = {
    in_stock: "במלאי",
    low_stock: "מלאי מוגבל",
    sold_out: "אזל מהמלאי",
    preorder: "הזמנה מראש"
  };
  return map[status];
}

export function paymentStatusLabel(s: ShopPaymentStatus): string {
  const map: Record<ShopPaymentStatus, string> = {
    pending: "ממתין לתשלום",
    paid: "שולם",
    failed: "נכשל",
    refunded: "הוחזר",
    cancelled: "בוטל"
  };
  return map[s];
}

export function fulfillmentStatusLabel(s: ShopFulfillmentStatus): string {
  const map: Record<ShopFulfillmentStatus, string> = {
    new: "הזמנה חדשה",
    processing: "בטיפול",
    ready_for_pickup: "מוכן לאיסוף",
    delivered: "נמסר",
    cancelled: "בוטל"
  };
  return map[s];
}

export function paymentMethodLabel(m: ShopPaymentMethod): string {
  const map: Record<ShopPaymentMethod, string> = {
    apple_pay: "Apple Pay",
    google_pay: "Google Pay",
    credit_card: "כרטיס אשראי",
    card: "כרטיס אשראי",
    bit: "ביט",
    paybox: "PayBox",
    bank_transfer: "העברה בנקאית"
  };
  return map[m];
}

export function formatPrice(nis: number): string {
  return `₪${nis.toLocaleString("he-IL")}`;
}

export function orderLineTotal(order: ShopOrder, products: ShopProduct[]): number {
  return order.items.reduce((sum, line) => {
    const p = products.find((x) => x.id === line.productId);
    return sum + (p?.price ?? 0) * line.quantity;
  }, 0);
}

export function cartTotal(lines: { product: ShopProduct; quantity: number }[]): number {
  return lines.reduce((s, l) => s + l.product.price * l.quantity, 0);
}

export type ShopOrderFilters = {
  productId?: string;
  eventId?: string;
  paymentStatus?: ShopPaymentStatus | "all";
  fulfillmentStatus?: ShopFulfillmentStatus | "all";
};

export function filterOrders(orders: ShopOrder[], products: ShopProduct[], f: ShopOrderFilters): ShopOrder[] {
  return orders.filter((o) => {
    if (f.paymentStatus && f.paymentStatus !== "all" && o.paymentStatus !== f.paymentStatus) return false;
    if (f.fulfillmentStatus && f.fulfillmentStatus !== "all" && o.fulfillmentStatus !== f.fulfillmentStatus) return false;
    if (f.productId && !o.items.some((i) => i.productId === f.productId)) return false;
    if (f.eventId) {
      const eventProductIds = products.filter((p) => p.relatedEventId === f.eventId).map((p) => p.id);
      if (!o.items.some((i) => eventProductIds.includes(i.productId))) return false;
    }
    return true;
  });
}

export function toneForCategory(cat: ShopProductCategory): "commercial" | "competition" | "freestyle" | "technique" | "achievement" | "rehearsal" {
  if (cat === "event_ticket") return "competition";
  if (cat === "workshop") return "rehearsal";
  if (cat === "dance_shoes") return "technique";
  if (cat === "accessories") return "freestyle";
  if (cat === "digital") return "achievement";
  return "commercial";
}
