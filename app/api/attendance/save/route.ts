import { NextResponse } from "next/server";
import { apiErrorResponse, supabaseUnavailableResponse } from "@/lib/errors/api-error-response";
import { repositoryContextFromSession } from "@/lib/repositories/repository-context";
import { upsertAttendanceRecords, type AttendanceRecordDraft } from "@/lib/repositories/attendance-repository";
import { requireProductionSession } from "@/lib/security/production-hardening";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SaveAttendanceBody = {
  academyId?: string;
  records?: AttendanceRecordDraft[];
};

export async function POST(request: Request) {
  let body: SaveAttendanceBody;

  try {
    body = (await request.json()) as SaveAttendanceBody;
  } catch {
    return apiErrorResponse("invalid_json", 400, { messageHe: "בקשת הנוכחות אינה תקינה.", messageEn: "Invalid attendance request body." });
  }

  if (!body.academyId || !Array.isArray(body.records)) {
    return apiErrorResponse("missing_attendance_payload", 400, { messageHe: "חסרים נתוני נוכחות לשמירה.", messageEn: "Missing attendance payload." });
  }

  const gate = await requireProductionSession(request, "attendance.save", {
    academyId: body.academyId,
    roles: ["teacher", "management", "super_admin"]
  });
  if (gate.ok === false) {
    return apiErrorResponse(gate.error, gate.status, { technicalDetails: gate.message });
  }

  if (gate.mode !== "verified_session") {
    return NextResponse.json({
      ok: true,
      mode: "local_demo",
      message: "Attendance persistence route is available, but local demo mode keeps writes in the browser database.",
      records: body.records
    });
  }

  try {
    const records = await upsertAttendanceRecords(repositoryContextFromSession(gate.session), body.records);
    return NextResponse.json({ ok: true, mode: "supabase", records });
  } catch (error) {
    return supabaseUnavailableResponse(error instanceof Error ? error.message : undefined);
  }
}
