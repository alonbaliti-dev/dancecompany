import type { V6Database } from "@/lib/v6/types";

export function selectV6ActiveProducts(db: V6Database) {
  return db.products.filter((product) => product.active);
}

export function selectV6ShopProductsByCategory(db: V6Database, category: string) {
  const products = selectV6ActiveProducts(db);
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
