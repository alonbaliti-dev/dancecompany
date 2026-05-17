import { NextRequest, NextResponse } from "next/server";
import { apiErrorResponse, supabaseUnavailableResponse } from "@/lib/errors/api-error-response";
import { repositoryContextFromSession } from "@/lib/repositories/repository-context";
import { listShopProducts, upsertShopProduct, type ShopProductDraft } from "@/lib/repositories/shop-repository";
import { createAcademyScope } from "@/lib/security/academy-scope";
import { requireProductionSession } from "@/lib/security/production-hardening";
import { DEFAULT_ACADEMY_ID } from "@/lib/v6/seed";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const academyId = request.nextUrl.searchParams.get("academyId") ?? DEFAULT_ACADEMY_ID;
  const gate = await requireProductionSession(request, "shop.products", { academyId });

  if (gate.ok === false) {
    return apiErrorResponse(gate.error, gate.status, { technicalDetails: gate.message });
  }

  try {
    const scope = createAcademyScope({ academyId, actor: gate.mode === "verified_session" ? gate.session.actor : undefined });
    const products = await listShopProducts(scope);
    return NextResponse.json({ ok: true, mode: gate.mode === "verified_session" ? "supabase" : "local_demo", academyId: scope.academyId, products });
  } catch (error) {
    return supabaseUnavailableResponse(error instanceof Error ? error.message : undefined);
  }
}

export async function POST(request: NextRequest) {
  let body: { academyId?: string; product?: ShopProductDraft };

  try {
    body = (await request.json()) as { academyId?: string; product?: ShopProductDraft };
  } catch {
    return apiErrorResponse("invalid_json", 400, { messageHe: "בקשת המוצר אינה תקינה.", messageEn: "Invalid product request body." });
  }

  if (!body.academyId || !body.product?.id || !body.product.title) {
    return apiErrorResponse("missing_product_payload", 400, { messageHe: "חסרים פרטי מוצר לשמירה.", messageEn: "Missing product fields." });
  }

  const gate = await requireProductionSession(request, "shop.products", {
    academyId: body.academyId,
    roles: ["management", "super_admin"]
  });

  if (gate.ok === false) {
    return apiErrorResponse(gate.error, gate.status, { technicalDetails: gate.message });
  }

  if (gate.mode !== "verified_session") {
    return NextResponse.json({
      ok: true,
      mode: "local_demo",
      message: "Shop product persistence route is available, but local demo mode keeps writes in the browser database.",
      product: body.product
    });
  }

  try {
    const product = await upsertShopProduct(repositoryContextFromSession(gate.session), body.product);
    return NextResponse.json({ ok: true, mode: "supabase", product });
  } catch (error) {
    return supabaseUnavailableResponse(error instanceof Error ? error.message : undefined);
  }
}
