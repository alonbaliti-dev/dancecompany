import { getRuntimeDatabase } from "@/lib/local-db/runtime-store";
import { buildStudentSummaries } from "@/lib/attendance-intelligence/logic";
import { runSmartFilters } from "./smart-filters-service";
import type { UserProfile } from "@/lib/types";

export type StudioHealthScore = {
  score: number;
  label: string;
  improved: string[];
  needsAttention: string[];
  recommendedActions: string[];
};

export function computeStudioHealthScore(user: UserProfile, studioId: string): StudioHealthScore {
  const db = getRuntimeDatabase();
  const records = db.attendance.intelligenceRecords.filter((r) => r.studioId === studioId);
  const summaries = buildStudentSummaries(records);
  const avgAtt =
    summaries.length > 0 ? summaries.reduce((s, x) => s + x.attendancePct, 0) / summaries.length : 85;

  const tasks = db.tasks.filter((t) => t.studioId === studioId && !t.deletedAt);
  const taskDone =
    tasks.length > 0 ? tasks.filter((t) => t.status === "completed").length / tasks.length : 0.7;

  const filters = runSmartFilters(user, studioId);
  const urgent = filters.find((f) => f.id === "urgent_unread")?.count ?? 0;
  const plIssues = filters.find((f) => f.id === "private_lesson_unscheduled")?.count ?? 0;
  const consents = filters.find((f) => f.id === "missing_parent_consents")?.count ?? 0;

  let score = Math.round(avgAtt * 0.35 + taskDone * 100 * 0.25 + (100 - Math.min(urgent * 5, 30)) * 0.2);
  score = Math.max(0, Math.min(100, score - plIssues * 3 - consents * 2));

  const improved: string[] = [];
  const needsAttention: string[] = [];
  const recommendedActions: string[] = [];

  if (avgAtt >= 85) improved.push("נוכחות יציבה בסטודיו");
  else needsAttention.push("נוכחות ממוצעת נמוכה מ־85%");

  if (taskDone >= 0.75) improved.push("השלמת משימות טובה");
  else {
    needsAttention.push("שיעור השלמת משימות נמוך");
    recommendedActions.push("סקירת משימות פתוחות בקבוצות");
  }

  if (urgent > 0) {
    needsAttention.push(`${urgent} הודעות דחופות שלא נקראו`);
    recommendedActions.push("שליחת תזכורת או סגירת עדכונים דחופים");
  }
  if (plIssues > 0) {
    needsAttention.push(`${plIssues} שיעורים פרטיים ששולמו ולא שובצו`);
    recommendedActions.push("תיאום מועדים לשיעורים פרטיים");
  }
  if (consents > 0) {
    needsAttention.push("אישורי הורים חסרים");
    recommendedActions.push("פנייה להורים לאישורים חסרים");
  }

  const label = score >= 85 ? "מצוין" : score >= 70 ? "טוב" : score >= 50 ? "דורש תשומת לב" : "קריטי";

  return { score, label, improved, needsAttention, recommendedActions };
}
