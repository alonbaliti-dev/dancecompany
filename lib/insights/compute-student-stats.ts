import { getRuntimeDatabase } from "@/lib/local-db/runtime-store";
import { buildStudentSummaries } from "@/lib/attendance-intelligence/logic";
import { levelLabelHe } from "@/lib/studio-os-constants";
import type { StudentStats, UserProfile } from "@/lib/types";

/** Derive profile stats for the logged-in student from `/database`. */
export function computeStudentStats(user: UserProfile): StudentStats {
  const db = getRuntimeDatabase();
  const level = db.studioOs.levelsByUser[user.id];
  const group = user.assignedGroups[0] ?? "—";
  const records = db.attendance.intelligenceRecords.filter(
    (r) => r.studentId === user.id && r.studioId === user.studioId
  );
  const summary = buildStudentSummaries(records)[0];
  const g = db.productData.gamification;
  const goals = db.productData.goals.filter((x) => x.studentId === user.id);
  const avgGoal =
    goals.length > 0 ? Math.round(goals.reduce((s, x) => s + x.progressPercent, 0) / goals.length) : 0;

  return {
    name: user.name,
    group,
    level: level ? levelLabelHe(level.currentLevel) : "—",
    streak: g.streakDays,
    xp: g.xp,
    attendance: summary?.attendancePct ?? 100,
    xpToNextLevel: Math.max(0, (g.level + 1) * 500 - g.xp),
    monthlyProgressPct: avgGoal || g.weeklyChallengeProgressPct
  };
}
