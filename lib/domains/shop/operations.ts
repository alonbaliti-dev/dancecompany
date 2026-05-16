import type { V6Product, V6User } from "@/lib/v6/types";
import { v6Allowed, v6Denied } from "../core/v6";
import { canV6BuyFromShop, canV6ManageShop } from "./guards";

export function buildV6ShopOrderOperation(actor: V6User, product: V6Product) {
  return canV6BuyFromShop(actor) && product.active ? v6Allowed({ productId: product.id }) : v6Denied("המוצר לא זמין לרכישה");
}

export function buildV6SaveProductOperation(actor: V6User, product: V6Product) {
  return canV6ManageShop(actor) ? v6Allowed({ product }) : v6Denied("אין הרשאה לניהול חנות");
}
