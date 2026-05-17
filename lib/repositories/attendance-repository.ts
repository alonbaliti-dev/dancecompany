import "server-only";

import { requireAcademyScope, type AcademyScopedQuery } from "@/lib/security/academy-scope";
import { requireRepositoryWriteContext, type RepositoryWriteContext } from "@/lib/repositories/repository-context";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { AttendanceRecordRow } from "@/lib/supabase/types";
import { safeInitialV6Database } from "@/lib/v6/seed";

export type AttendanceRecordDraft = Pick<AttendanceRecordRow, "id" | "academy_id" | "status"> &
  Partial<Pick<AttendanceRecordRow, "class_id" | "group_id" | "student_id" | "note" | "marked_by_user_id" | "class_date" | "saved_at">>;

export async function listAttendanceRecords(scope: AcademyScopedQuery): Promise<AttendanceRecordRow[]> {
  const academyId = requireAcademyScope(scope);
  const supabase = getSupabaseServerClient();

  if (!supabase.enabled) {
    return safeInitialV6Database.attendance
      .filter((record) => (record.academyId ?? record.studioId) === academyId)
      .map((record) => ({
        id: record.id,
        academy_id: academyId,
        class_id: record.lessonId,
        group_id: record.groupId ?? null,
        student_id: record.studentId,
        status: record.status,
        note: record.note ?? null,
        marked_by_user_id: record.markedByUserId ?? null,
        class_date: record.classDate ?? null,
        saved_at: record.savedAt ?? null,
        created_at: record.createdAt,
        updated_at: record.updatedAt ?? record.createdAt
      }));
  }

  const { data, error } = await supabase.client
    .from("attendance_records")
    .select("*")
    .eq("academy_id", academyId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function upsertAttendanceRecords(context: RepositoryWriteContext, records: AttendanceRecordDraft[]): Promise<AttendanceRecordRow[]> {
  const verified = requireRepositoryWriteContext(context);
  const academyId = requireAcademyScope(verified);

  if (!records.length) return [];

  const rows = records.map((record) => {
    if (record.academy_id !== academyId) {
      throw new Error("Attendance record academy_id does not match the verified academy context.");
    }

    return {
      id: record.id,
      academy_id: academyId,
      class_id: record.class_id ?? null,
      group_id: record.group_id ?? null,
      student_id: record.student_id ?? null,
      status: record.status,
      note: record.note ?? null,
      marked_by_user_id: verified.actor.userId,
      class_date: record.class_date ?? null,
      saved_at: record.saved_at ?? new Date().toISOString()
    };
  });

  const supabase = getSupabaseServerClient({ preferServiceRole: true });

  if (!supabase.enabled) {
    return rows.map((row) => ({
      ...row,
      created_at: row.saved_at ?? new Date().toISOString(),
      updated_at: row.saved_at ?? new Date().toISOString()
    }));
  }

  const { data, error } = await supabase.client
    .from("attendance_records")
    .upsert(rows, { onConflict: "id" })
    .select("*");

  if (error) throw error;

  await supabase.client.from("audit_logs").insert({
    id: `audit_attendance_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    academy_id: academyId,
    actor_user_id: verified.actor.userId,
    action: "attendance.updated",
    target: rows.map((row) => row.class_id ?? row.id).join(",").slice(0, 220),
    metadata: {
      count: rows.length,
      source: verified.source
    }
  });

  return data ?? [];
}
