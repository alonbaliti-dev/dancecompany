import { getRuntimeDatabase } from "@/lib/local-db/runtime-store";
import type { TeacherDashboardData, UserProfile } from "@/lib/types";

function filterTeacherDashboard(assignedGroups: string[], master: TeacherDashboardData): TeacherDashboardData {
  const inGroup = (groupName: string) => assignedGroups.includes(groupName);
  return {
    groups: master.groups.filter((g) => inGroup(g.name)),
    todaysClasses: master.todaysClasses.filter((c) => inGroup(c.groupName)),
    homePracticeByGroup: master.homePracticeByGroup.filter((h) => inGroup(h.groupName)),
    studentsAtRisk: master.studentsAtRisk.filter((s) => inGroup(s.group)),
    pendingReviews: master.pendingReviews.filter((p) => inGroup(p.group)),
    quickActions: master.quickActions
  };
}

/** Teacher dashboard from `/database` master template, filtered by assigned groups. */
export function computeTeacherDashboard(user: UserProfile): TeacherDashboardData | null {
  if (!user.permissions.isTeacher && !user.permissions.isManagement) return null;

  const master = getRuntimeDatabase().productData.teacherDashboardMaster;
  if (user.permissions.isManagement && !user.permissions.isTeacher) return master;
  if (!user.assignedGroups.length) {
    return {
      groups: [],
      todaysClasses: [],
      homePracticeByGroup: [],
      studentsAtRisk: [],
      pendingReviews: [],
      quickActions: master.quickActions
    };
  }
  return filterTeacherDashboard(user.assignedGroups, master);
}
