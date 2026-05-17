import type { V6Database, V6Product, V6User } from "@/lib/v6/types";
import { v6Allowed, v6Denied, type V6DomainResult } from "../core/v6";
import { canV6BuyFromShop, canV6ManageShop } from "./guards";

const validCategories = ["אביזרים", "כרטיסים למופעים", "שיעורים פרטיים", "ביגוד", "סדנאות"];

export function buildV6ShopOrderOperation(actor: V6User, product: V6Product) {
  return canV6BuyFromShop(actor) && product.active ? v6Allowed({ productId: product.id }) : v6Denied("המוצר לא זמין לרכישה");
}

export function buildV6SaveProductOperation(db: V6Database, actor: V6User, product: V6Product): V6DomainResult<{ exists: boolean; product: V6Product }> {
  if (!canV6ManageShop(actor)) return v6Denied("אין הרשאה לניהול חנות");
  if (!product.title.trim()) return v6Denied("שם מוצר הוא שדה חובה");
  if (!Number.isFinite(product.price) || product.price < 0) return v6Denied("מחיר מוצר חייב להיות מספר תקין");
  if (!product.category.trim()) return v6Denied("חובה לבחור קטגוריה למוצר");
  if (!validCategories.includes(product.category)) return v6Denied("קטגוריית מוצר לא תקינה");
  if (typeof product.active !== "boolean") return v6Denied("חובה לבחור סטטוס מלאי");
  if (product.imageMediaIds.some((id) => !db.media.some((media) => media.id === id))) return v6Denied("תמונת מוצר לא נמצאה במדיה");
  const exists = db.products.some((item) => item.id === product.id);
  return v6Allowed({ exists, product: { ...product, title: product.title.trim(), description: product.description.trim(), category: product.category.trim() } });
}
