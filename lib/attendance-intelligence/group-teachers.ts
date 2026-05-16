import { getFacultyRecords } from "@/lib/faculty/faculty-access";
import { seedFacultyRecords } from "@/lib/studio/faculty-seed-data";

/** Group id → primary teacher from faculty.json */
export const GROUP_TEACHERS: Record<string, { teacherId: string; teacherName: string }> = {};

function assignFromFaculty() {
  const rows = getFacultyRecords().length ? getFacultyRecords() : seedFacultyRecords();
  for (const f of rows) {
    if (f.role !== "mentor" && f.role !== "teacher" && f.role !== "owner") continue;
    for (const gid of f.assignedGroupIds) {
      if (!GROUP_TEACHERS[gid]) {
        GROUP_TEACHERS[gid] = { teacherId: f.userId, teacherName: f.fullName };
      }
    }
  }
}

assignFromFaculty();

export const DEFAULT_GROUP_TEACHER = { teacherId: "u_t_yakir", teacherName: "יקיר גבאי" };

export function refreshGroupTeachersFromFaculty(): void {
  for (const k of Object.keys(GROUP_TEACHERS)) delete GROUP_TEACHERS[k];
  assignFromFaculty();
}
