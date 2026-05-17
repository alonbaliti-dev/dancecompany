import type { V6Database, V6Product, V6User } from "@/lib/v6/types";
import { v6Allowed, v6Denied, type V6DomainResult } from "../core/v6";
import { canV6BuyFromShop, canV6ManageShop } from "./guards";

export const v6ProductCategories = ["ביגוד סטודיו", "חולצות ממותגות", "גרבי ריקוד", "נעלי ריקוד", "אביזרים", "כרטיסים", "שיעורים פרטיים", "סדנאות ומחנות", "כרטיסים למופעים", "ביגוד", "סדנאות"];
export const v6ProductTypes = ["physical", "event_ticket", "private_lesson", "workshop_camp", "accessory", "clothing"] as const;
export const v6InventoryStatuses = ["in_stock", "out_of_stock", "limited", "preorder", "draft"] as const;

export function buildV6ShopOrderOperation(actor: V6User, product: V6Product) {
  return canV6BuyFromShop(actor) && product.active && product.inventoryStatus !== "out_of_stock" && product.inventoryStatus !== "draft" ? v6Allowed({ productId: product.id }) : v6Denied("המוצר לא זמין לרכישה");
}

export function buildV6SaveProductOperation(db: V6Database, actor: V6User, product: V6Product): V6DomainResult<{ exists: boolean; product: V6Product }> {
  if (!canV6ManageShop(actor)) return v6Denied("אין הרשאה לניהול חנות");
  if (!product.title.trim()) return v6Denied("שם מוצר הוא שדה חובה");
  const priceMode = product.priceMode ?? "paid";
  if (priceMode === "paid" && (!Number.isFinite(product.price) || product.price < 0)) return v6Denied("מחיר מוצר חייב להיות מספר תקין");
  if ((priceMode === "free" || priceMode === "request") && (!Number.isFinite(product.price) || product.price < 0)) return v6Denied("מחיר מוצר חייב להיות מספר תקין");
  if (!product.category.trim()) return v6Denied("חובה לבחור קטגוריה למוצר");
  if (!v6ProductCategories.includes(product.category)) return v6Denied("קטגוריית מוצר לא תקינה");
  if (product.type && !v6ProductTypes.includes(product.type)) return v6Denied("סוג מוצר לא תקין");
  if (product.inventoryStatus && !v6InventoryStatuses.includes(product.inventoryStatus)) return v6Denied("סטטוס מלאי לא תקין");
  if (typeof product.active !== "boolean") return v6Denied("חובה לבחור סטטוס מוצר");
  if (product.imageMediaIds.some((id) => !db.media.some((media) => media.id === id))) return v6Denied("תמונת מוצר לא נמצאה במדיה");
  const exists = db.products.some((item) => item.id === product.id);
  const inventoryStatus = product.inventoryStatus ?? (product.active ? "in_stock" : "draft");
  return v6Allowed({
    exists,
    product: {
      ...product,
      title: product.title.trim(),
      description: product.description.trim(),
      category: product.category.trim(),
      price: priceMode === "free" ? 0 : product.price,
      priceMode,
      type: product.type ?? "physical",
      inventoryStatus,
      visibility: product.visibility ?? (inventoryStatus === "draft" ? "hidden" : "public"),
      active: product.active && inventoryStatus !== "draft",
      imageMediaIds: [...new Set(product.imageMediaIds)],
      sizes: product.sizes?.map((item) => item.trim()).filter(Boolean),
      colors: product.colors?.map((item) => item.trim()).filter(Boolean),
      notes: product.notes?.trim(),
      pickupDeliveryNote: product.pickupDeliveryNote?.trim()
    }
  });
}
