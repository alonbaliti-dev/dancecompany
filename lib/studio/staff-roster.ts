/**
 * Pilot logins + roster names (group assignments live in faculty.json).
 */
import { facultyIdsForDanceStyle, userIdFromFacultyId } from "@/lib/faculty/faculty-access";
import type { DanceStyle } from "@/lib/types";

export const MENTOR_TEAM_SEASON_LABEL = "צוות המנטורים 25–26";

export const PILOT_LOGIN_HINTS: Record<string, { phone: string; password: string; role: string }> = {
  u_creator: { phone: "0501110000", password: "creator2026", role: "מנהל על" },
  u_liata: { phone: "0509998888", password: "lk2026", role: "בעלת סטודיו / הנהלה" },
  u_shahar: { phone: "0509997777", password: "lk2026", role: "הנהלה" },
  u_office: { phone: "0509996666", password: "lk2026", role: "משרד" },
  u_t_yakir: { phone: "0502223333", password: "lk2026", role: "מורה היפ הופ" },
  u_maya: { phone: "0501234567", password: "123456", role: "תלמידה" },
  u_parent_demo: { phone: "0504445555", password: "123456", role: "הורה" }
};

export function facultyIdForUser(userId: string): string {
  return userId === "u_liata" ? "fac_liata" : `fac_${userId}`;
}

export { userIdFromFacultyId };

export function teachersForDanceStyle(style: DanceStyle, studioId?: string): string[] {
  return facultyIdsForDanceStyle(style, studioId);
}
