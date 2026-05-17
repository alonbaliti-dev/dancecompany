import { NextRequest, NextResponse } from "next/server";
import { apiErrorResponse, supabaseUnavailableResponse } from "@/lib/errors/api-error-response";
import { listMediaItems } from "@/lib/repositories/media-repository";
import { createAcademyScope } from "@/lib/security/academy-scope";
import { requireProductionSession } from "@/lib/security/production-hardening";
import { DEFAULT_ACADEMY_ID } from "@/lib/v6/seed";

export async function GET(request: NextRequest) {
  const academyId = request.nextUrl.searchParams.get("academyId") ?? DEFAULT_ACADEMY_ID;
  const gate = await requireProductionSession(request, "media.list", { academyId });
  if (gate.ok === false) {
    return apiErrorResponse(gate.error, gate.status, { technicalDetails: gate.message });
  }

  try {
    const scope = createAcademyScope({ academyId, actor: gate.mode === "verified_session" ? gate.session.actor : undefined });
    const mediaType = request.nextUrl.searchParams.get("mediaType");
    const mediaItems = await listMediaItems(scope, {
      groupId: request.nextUrl.searchParams.get("groupId") ?? undefined,
      classId: request.nextUrl.searchParams.get("classId") ?? undefined,
      eventId: request.nextUrl.searchParams.get("eventId") ?? undefined,
      productId: request.nextUrl.searchParams.get("productId") ?? undefined,
      uploadedByUserId: request.nextUrl.searchParams.get("uploadedByUserId") ?? undefined,
      lessonDate: request.nextUrl.searchParams.get("lessonDate") ?? undefined,
      mediaType: mediaType === "image" || mediaType === "video" ? mediaType : undefined
    });

    return NextResponse.json({ ok: true, mode: gate.mode === "verified_session" ? "supabase" : "local_demo", academyId: scope.academyId, mediaItems });
  } catch (error) {
    return supabaseUnavailableResponse(error instanceof Error ? error.message : undefined);
  }
}
