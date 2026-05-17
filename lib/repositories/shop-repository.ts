import "server-only";

import { requireAcademyScope, type AcademyScopedQuery } from "@/lib/security/academy-scope";
import { requireRepositoryWriteContext, type RepositoryWriteContext } from "@/lib/repositories/repository-context";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { ShopProductRow } from "@/lib/supabase/types";
import { safeInitialV6Database } from "@/lib/v6/seed";

export type ShopProductDraft = Pick<ShopProductRow, "id" | "title"> &
  Partial<Pick<ShopProductRow, "description" | "category" | "product_type" | "price" | "price_mode" | "inventory_status" | "visibility" | "image_media_ids" | "featured_image_media_id" | "status" | "metadata">>;

export async function listShopProducts(scope: AcademyScopedQuery): Promise<ShopProductRow[]> {
  const academyId = requireAcademyScope(scope);
  const supabase = getSupabaseServerClient();

  if (!supabase.enabled) {
    return safeInitialV6Database.products
      .filter((product) => (product.academyId ?? product.studioId) === academyId)
      .map((product) => ({
        id: product.id,
        academy_id: academyId,
        title: product.title,
        description: product.description,
        category: product.category,
        product_type: product.type ?? null,
        price: product.price,
        price_mode: product.priceMode ?? "paid",
        inventory_status: product.inventoryStatus ?? "in_stock",
        visibility: product.visibility ?? "members",
        image_media_ids: product.imageMediaIds,
        featured_image_media_id: product.featuredImageMediaId ?? null,
        status: product.active ? "active" : "inactive",
        metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
  }

  const { data, error } = await supabase.client
    .from("shop_products")
    .select("*")
    .eq("academy_id", academyId)
    .in("status", ["active", "published"])
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function upsertShopProduct(context: RepositoryWriteContext, draft: ShopProductDraft): Promise<ShopProductRow> {
  const verified = requireRepositoryWriteContext(context);
  const academyId = requireAcademyScope(verified);
  const supabase = getSupabaseServerClient({ preferServiceRole: true });

  if (supabase.enabled === false) {
    throw new Error("Supabase service-role client is required for shop product persistence.");
  }

  const { data, error } = await supabase.client
    .from("shop_products")
    .upsert(
      {
        id: draft.id,
        academy_id: academyId,
        title: draft.title,
        description: draft.description ?? null,
        category: draft.category ?? null,
        product_type: draft.product_type ?? null,
        price: draft.price ?? 0,
        price_mode: draft.price_mode ?? "paid",
        inventory_status: draft.inventory_status ?? "in_stock",
        visibility: draft.visibility ?? "members",
        image_media_ids: draft.image_media_ids ?? [],
        featured_image_media_id: draft.featured_image_media_id ?? null,
        status: draft.status ?? "active",
        metadata: draft.metadata ?? {}
      },
      { onConflict: "id" }
    )
    .select("*")
    .single();

  if (error) throw error;

  await supabase.client.from("audit_logs").insert({
    id: `audit_shop_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    academy_id: academyId,
    actor_user_id: verified.actor.userId,
    action: "shop.product_changed",
    target: draft.id,
    metadata: {
      source: verified.source
    }
  });

  return data;
}

export async function attachMediaToShopProduct(context: RepositoryWriteContext, productId: string, mediaItemId: string): Promise<ShopProductRow> {
  const verified = requireRepositoryWriteContext(context);
  const academyId = requireAcademyScope(verified);
  const supabase = getSupabaseServerClient({ preferServiceRole: true });

  if (supabase.enabled === false) {
    throw new Error("Supabase service-role client is required for shop product media persistence.");
  }

  const { data: current, error: currentError } = await supabase.client
    .from("shop_products")
    .select("*")
    .eq("academy_id", academyId)
    .eq("id", productId)
    .single();

  if (currentError) throw currentError;
  if (!current) throw new Error("Shop product was not found for media attachment.");

  const imageMediaIds = [...new Set([...(current.image_media_ids ?? []), mediaItemId])];
  const { data, error } = await supabase.client
    .from("shop_products")
    .update({
      image_media_ids: imageMediaIds,
      featured_image_media_id: current.featured_image_media_id ?? mediaItemId
    })
    .eq("academy_id", academyId)
    .eq("id", productId)
    .select("*")
    .single();

  if (error) throw error;

  await supabase.client.from("audit_logs").insert({
    id: `audit_shop_media_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    academy_id: academyId,
    actor_user_id: verified.actor.userId,
    action: "shop.product_changed",
    target: productId,
    metadata: {
      media_item_id: mediaItemId,
      source: verified.source
    }
  });

  return data;
}
