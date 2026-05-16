/**
 * Studio shop — mock. Supabase: `shop_products`, `shop_orders` + payment webhook Edge Function.
 */
import type { ShopOrder, ShopProduct } from "@/lib/types";

export const shopService = {
  listProducts(studioId: string): Promise<ShopProduct[]> {
    void studioId;
    return Promise.resolve([]);
  },

  listOrders(studioId: string, userId?: string): Promise<ShopOrder[]> {
    void studioId;
    void userId;
    return Promise.resolve([]);
  }
};
