import type { V6Database, V6User } from "@/lib/v6/types";
import { dedupeShopProducts } from "@/lib/v6/dedupe";

export function selectV6ActiveProducts(db: V6Database) {
  return dedupeShopProducts(db.products).filter((product) => product.active && product.visibility !== "hidden" && product.inventoryStatus !== "draft");
}

export function selectV6ShopProductsByCategory(db: V6Database, category: string) {
  const products = selectV6ActiveProducts(db);
  return category === "הכול" ? products : products.filter((product) => product.category.includes(category));
}

export function selectV6ShopProductsForActor(db: V6Database, actor: V6User, category: string) {
  const canManage = actor.role === "super_admin" || actor.permissions.manageShop;
  const products = canManage ? dedupeShopProducts(db.products) : selectV6ActiveProducts(db);
  return category === "הכול" ? products : products.filter((product) => product.category.includes(category));
}

export function selectV6FeaturedShopLanes(db: V6Database) {
  const products = selectV6ActiveProducts(db);
  return {
    privateLessons: products.filter((product) => product.category.includes("שיעורים")),
    tickets: products.filter((product) => product.category.includes("כרטיסים")),
    essentials: products.filter((product) => product.category.includes("אביזרים"))
  };
}
