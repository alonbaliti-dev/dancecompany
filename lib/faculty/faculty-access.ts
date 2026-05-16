import { getRuntimeDatabase } from "@/lib/local-db/runtime-store";
import { danceStylesLabelHe } from "@/lib/studio/dance-style";
import { FACULTY_PORTRAIT_GRADIENTS } from "@/lib/studio/faculty-theme";
import {
  permissionsForManagement,
  permissionsForMentor,
  permissionsForOffice,
  permissionsForOwner
} from "@/lib/studio/faculty-permissions";
import { privateLessonFocusForStyles } from "@/lib/private-lessons/specialties";
import type { DanceStyle, FacultyMember, FacultyMemberRole, FacultyRecord } from "@/lib/types";

function roleLabel(role: FacultyMemberRole, stylesLine: string): string {
  if (role === "owner") return stylesLine ? `בעלת הסטודיו · ${stylesLine}` : "בעלת הסטודיו";
  if (role === "management") return "הנהלה";
  return stylesLine;
}

function permissionsForRecord(record: FacultyRecord) {
  if (record.role === "owner") return permissionsForOwner();
  if (record.role === "management") {
    return record.userId === "u_office" ? permissionsForOffice() : permissionsForManagement();
  }
  return permissionsForMentor();
}

export function enrichFacultyRecord(record: FacultyRecord, index = 0): FacultyMember {
  const stylesLine = danceStylesLabelHe(record.danceStyles);
  const perms = permissionsForRecord(record);
  return {
    id: record.id,
    studioId: record.studioId,
    userId: record.userId,
    fullName: record.fullName,
    role: record.role,
    danceStyles: record.danceStyles,
    visibility: record.visibility,
    profileImage: record.profileImage,
    shortDescription: record.shortDescription ?? (stylesLine || undefined),
    permissions: perms,
    assignedGroupIds: record.assignedGroupIds,
    privateLessonEnabled: record.privateLessonEnabled,
    privateLessonFocus: record.danceStyles.length ? privateLessonFocusForStyles(record.danceStyles) : undefined,
    canUploadGallery: perms.canManageGallery,
    canModerateChats: perms.canModerateChats,
    canManageAttendance: perms.canManageAttendance,
    portraitGradient: FACULTY_PORTRAIT_GRADIENTS[index % FACULTY_PORTRAIT_GRADIENTS.length]!,
    roleLabelHe: roleLabel(record.role, stylesLine)
  };
}

export function getFacultyRecords(studioId?: string): FacultyRecord[] {
  const db = getRuntimeDatabase();
  let rows = db.faculty ?? [];
  if (!rows.length && db.studioIdentity.faculty?.length) {
    rows = db.studioIdentity.faculty.map((legacy) => ({
      id: legacy.id,
      studioId: legacy.studioId,
      userId: legacy.userId,
      fullName: legacy.fullName,
      role: legacy.role,
      danceStyles: legacy.danceStyles,
      visibility: legacy.visibility,
      assignedGroupIds: legacy.assignedGroupIds,
      privateLessonEnabled: legacy.privateLessonEnabled,
      shortDescription: legacy.shortDescription
    }));
  }
  if (studioId) return rows.filter((r) => r.studioId === studioId);
  return rows;
}

export function getEnrichedFaculty(studioId: string): FacultyMember[] {
  return getFacultyRecords(studioId).map((r, i) => enrichFacultyRecord(r, i));
}

export function getFacultyByUserId(userId: string, studioId?: string): FacultyRecord | undefined {
  return getFacultyRecords(studioId).find((r) => r.userId === userId);
}

export function facultyIdsForDanceStyle(style: DanceStyle, studioId?: string): string[] {
  return getFacultyRecords(studioId)
    .filter((r) => r.danceStyles.includes(style))
    .map((r) => r.id);
}

export function userIdFromFacultyId(facultyId: string): string {
  const row = getFacultyRecords().find((r) => r.id === facultyId);
  if (row) return row.userId;
  if (facultyId === "fac_liata") return "u_liata";
  if (facultyId.startsWith("fac_")) return facultyId.slice(4);
  return facultyId;
}
