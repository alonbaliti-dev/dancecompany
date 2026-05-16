import type { DirectoryUser, StudentTask, StudioUpdate, UserProfile } from "@/lib/types";
import { getDirectoryStudents, groupNameToId, teacherSharesGroupWithStudent, userGroupIds } from "@/lib/studio-roster";

/** Current date for scheduling (pilot uses real calendar). */
export function getAppToday(): Date {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  return d;
}

export const MOCK_TODAY = getAppToday();

export function startOfMockToday(): Date {
  const d = new Date(getAppToday());
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfMockWeek(): Date {
  const d = startOfMockToday();
  d.setDate(d.getDate() + 7);
  return d;
}

export function parseIso(d?: string): Date | null {
  if (!d) return null;
  const x = new Date(d);
  return Number.isNaN(x.getTime()) ? null : x;
}

export function effectiveCompletions(task: StudentTask, studentId: string): number {
  if (task.targetType === "personal" && task.assignedStudentIds?.includes(studentId)) {
    return task.completedCount;
  }
  return task.perStudentCompletions?.[studentId] ?? 0;
}

export function progressPercentForStudent(task: StudentTask, studentId: string): number {
  const t = task.targetCompletions || 1;
  const c = effectiveCompletions(task, studentId);
  return Math.min(100, Math.round((c / t) * 100));
}

export function statusForStudent(task: StudentTask, studentId: string): StudentTask["status"] {
  const pct = progressPercentForStudent(task, studentId);
  if (pct >= 100) return "completed";
  const due = parseIso(task.dueDate);
  const today = startOfMockToday();
  if (due && due < today && pct < 100) return "overdue";
  if (effectiveCompletions(task, studentId) > 0) return "in_progress";
  return "not_started";
}

export function taskVisibleToStudent(task: StudentTask, user: UserProfile): boolean {
  if (task.studioId !== user.studioId) return false;
  const gids = new Set(userGroupIds(user));
  if (task.targetType === "studio") return true;
  if (task.targetType === "personal") return task.assignedStudentIds?.includes(user.id) ?? false;
  if (task.targetType === "group") return (task.assignedGroupIds ?? []).some((id) => gids.has(id));
  return false;
}

export function updateVisibleToStudent(u: StudioUpdate, user: UserProfile): boolean {
  if (u.studioId !== user.studioId) return false;
  const gids = new Set(userGroupIds(user));
  if (u.targetType === "studio") return true;
  if (u.targetType === "personal") return u.assignedStudentIds?.includes(user.id) ?? false;
  if (u.targetType === "group") return (u.assignedGroupIds ?? []).some((id) => gids.has(id));
  return false;
}

export function isDueThisWeek(due?: string): boolean {
  const dueD = parseIso(due);
  if (!dueD) return false;
  return dueD >= startOfMockToday() && dueD <= endOfMockWeek();
}

export function isDueToday(due?: string): boolean {
  const dueD = parseIso(due);
  if (!dueD) return false;
  const s = startOfMockToday();
  const e = new Date(s);
  e.setDate(e.getDate() + 1);
  return dueD >= s && dueD < e;
}

export function normalizeTask(t: StudentTask): StudentTask {
  const aggregate = (): { count: number; pct: number; status: StudentTask["status"] } => {
    const students = getDirectoryStudents();
    let maxPct = 0;
    let sum = 0;
    let n = 0;
    if (t.targetType === "personal" && t.assignedStudentIds?.length) {
      for (const sid of t.assignedStudentIds) {
        const pct = progressPercentForStudent(t, sid);
        maxPct = Math.max(maxPct, pct);
        sum += effectiveCompletions(t, sid);
        n += 1;
      }
      const status: StudentTask["status"] =
        maxPct >= 100 ? "completed" : parseIso(t.dueDate) && parseIso(t.dueDate)! < startOfMockToday() && maxPct < 100 ? "overdue" : sum > 0 ? "in_progress" : "not_started";
      return { count: sum, pct: n ? Math.round(sum / (n * (t.targetCompletions || 1)) * 100) : 0, status };
    }
    const inGroups = new Set<string>();
    (t.assignedGroupIds ?? []).forEach((id) => inGroups.add(id));
    const relevant = students.filter((s) => s.assignedGroups.some((gn) => inGroups.has(groupNameToId(gn) ?? "__none__")));
    const ids = t.targetType === "studio" ? students.map((s) => s.id) : relevant.map((s) => s.id);
    const uniq = [...new Set(ids)];
    for (const sid of uniq) {
      const pct = progressPercentForStudent(t, sid);
      maxPct = Math.max(maxPct, pct);
      sum += effectiveCompletions(t, sid);
      n += 1;
    }
    const avgPct = n ? Math.round((sum / (n * (t.targetCompletions || 1))) * 100) : 0;
    const status: StudentTask["status"] =
      maxPct >= 100 ? "completed" : parseIso(t.dueDate) && parseIso(t.dueDate)! < startOfMockToday() && avgPct < 100 ? "overdue" : sum > 0 ? "in_progress" : "not_started";
    return { count: sum, pct: Math.min(100, avgPct), status };
  };
  const { count, pct, status } = aggregate();
  return {
    ...t,
    completedCount: t.targetType === "personal" ? t.completedCount : count,
    progressPercent: pct,
    status
  };
}

export function canTeacherEditTask(user: UserProfile, task: StudentTask): boolean {
  if (user.permissions.isManagement) return true;
  if (!user.permissions.isTeacher) return false;
  if (task.targetType === "studio") return false;
  const tg = new Set(userGroupIds(user));
  if (task.createdByUserId === user.id) return true;
  if (task.targetType === "group") return (task.assignedGroupIds ?? []).every((id) => tg.has(id));
  if (task.targetType === "personal") {
    const sid = task.assignedStudentIds?.[0];
    if (!sid) return false;
    const st = getDirectoryStudents().find((s) => s.id === sid);
    return st ? teacherSharesGroupWithStudent(user, st) : false;
  }
  return false;
}

export function canTeacherCreateTarget(user: UserProfile, target: StudentTask["targetType"]): boolean {
  if (user.permissions.isManagement) return true;
  if (!user.permissions.isTeacher) return false;
  return target !== "studio";
}

export function canTeacherCreateUpdateTarget(user: UserProfile, target: StudioUpdate["targetType"]): boolean {
  if (user.permissions.isManagement) return true;
  if (!user.permissions.isTeacher) return false;
  return target !== "studio";
}
