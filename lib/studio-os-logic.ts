import { FEEDBACK_CATEGORIES } from "@/lib/studio-os-constants";
import type {
  AiDailyRecommendation,
  ConsistencyStats,
  FeedbackCategory,
  PracticeHeatmapDay,
  RiskAlert,
  UserProfile
} from "@/lib/types";

export function feedbackCategoryLabel(c: FeedbackCategory): string {
  return FEEDBACK_CATEGORIES.find((x) => x.id === c)?.label ?? c;
}

export function computeConsistencyStats(days: PracticeHeatmapDay[]): ConsistencyStats {
  const last30 = days.slice(-30);
  let streak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].minutes > 0) streak++;
    else break;
  }
  let bestWeek = 0;
  for (let w = 0; w < 13; w++) {
    const slice = days.slice(w * 7, w * 7 + 7);
    const sum = slice.reduce((a, d) => a + d.minutes, 0);
    if (sum > bestWeek) bestWeek = sum;
  }
  const missed = last30.filter((d) => d.minutes === 0).length;
  const active = last30.filter((d) => d.minutes > 0).length;
  const consistencyScore = Math.round((active / 30) * 100);
  return { streakDays: streak, bestWeekMinutes: bestWeek, missedDaysLast30: missed, consistencyScore, days };
}

export function filterRiskForUser(user: UserProfile, alerts: RiskAlert[]): RiskAlert[] {
  if (user.permissions.isManagement) return alerts;
  if (user.permissions.isTeacher) {
    const gids = new Set(user.assignedGroups);
    return alerts.filter((a) => !a.groupId || user.assignedGroups.some((gn) => a.title.includes(gn) || a.detail.includes(gn)));
  }
  return [];
}

export function liveFeedStatusLabel(s: string): string {
  const map: Record<string, string> = {
    arrived: "הגיעו",
    warming_up: "מתחממים",
    on_stage: "על הבמה",
    results: "תוצאות",
    update: "עדכון"
  };
  return map[s] ?? s;
}

export function calendarTypeLabel(t: string): string {
  const map: Record<string, string> = {
    class: "שיעור",
    rehearsal: "חזרה",
    competition: "תחרות",
    photoshoot: "צילומים",
    workshop: "סדנה",
    camp: "קייטנה",
    birthday: "יום הולדת",
    other: "אחר"
  };
  return map[t] ?? t;
}

export { seedAiDailyForStudent as getAiDailyRecommendation } from "@/lib/studio-os-seed";
