/**
 * Achievement aggregation from `/database` — tasks, events, milestones, attendance, levels.
 */
import { buildStudentSummaries } from "@/lib/attendance-intelligence/logic";
import { getRuntimeDatabase } from "@/lib/local-db/runtime-store";
import { getStudioGroups } from "@/lib/studio-groups-access";
import { MOCK_TODAY, statusForStudent } from "@/lib/studio-task-logic";
import type { AchievementRow } from "@/lib/local-db/db-types";
import type { GeneratedAchievement, LegacyMilestone, StudioAchievement, StudioEvent, StudentTask } from "@/lib/types";
import { achievementPlaceLabel } from "@/lib/legacy-events-logic";

function studioGroupIds(studioId: string): Set<string> {
  return new Set(getStudioGroups().filter((g) => g.studioId === studioId).map((g) => g.id));
}

function eventInStudio(event: StudioEvent, studioId: string): boolean {
  const ids = studioGroupIds(studioId);
  return event.participatingGroupIds.some((id) => ids.has(id));
}

function milestoneToGenerated(m: LegacyMilestone): GeneratedAchievement {
  return {
    id: m.id,
    title: m.title,
    description: m.subtitle ?? "",
    year: m.year,
    source: m.kind === "competition_win" ? "competition" : m.kind === "annual_show" ? "event" : "milestone",
    scope: "studio",
    eventId: m.relatedEventId,
    awardedAt: `${m.year}-06-01T12:00:00.000Z`
  };
}

function rowToGenerated(row: AchievementRow, userId?: string): GeneratedAchievement {
  return {
    id: row.id,
    title: row.title,
    description: row.body,
    year: new Date().getFullYear(),
    source: "milestone",
    scope: userId ? "student" : "studio",
    userId,
    awardedAt: new Date().toISOString()
  };
}

function eventAchievements(event: StudioEvent): GeneratedAchievement[] {
  return event.achievements.map((a) => ({
    id: a.id,
    title: a.title,
    description: a.description,
    year: new Date(a.awardedAt).getFullYear(),
    source: event.type === "competition" ? "competition" : "event",
    scope: a.studentIds?.length ? "student" : a.groupId ? "group" : "studio",
    userId: a.studentIds?.[0],
    groupId: a.groupId,
    eventId: event.id,
    awardedAt: a.awardedAt,
    place: a.place
  }));
}

function taskAchievements(tasks: StudentTask[], userId: string): GeneratedAchievement[] {
  const out: GeneratedAchievement[] = [];
  for (const t of tasks) {
    if (statusForStudent(t, userId) !== "completed") continue;
    out.push({
      id: `ach_task_${t.id}_${userId}`,
      title: `השלמת משימה: ${t.title}`,
      description: `+${t.xpReward} XP`,
      year: new Date().getFullYear(),
      source: "task",
      scope: t.targetType === "personal" ? "student" : "group",
      userId,
      awardedAt: new Date().toISOString()
    });
  }
  return out;
}

function levelAchievements(userId: string, studioId: string): GeneratedAchievement[] {
  const level = getRuntimeDatabase().studioOs.levelsByUser[userId];
  if (!level) return [];
  return [
    {
      id: `ach_level_${userId}`,
      title: `מסלול מקצועי — ${level.progressPct}%`,
      description: `רמה נוכחית במסלול`,
      year: new Date().getFullYear(),
      source: "level",
      scope: "student",
      userId,
      awardedAt: new Date().toISOString()
    }
  ];
}

function feedbackAchievements(userId: string): GeneratedAchievement[] {
  return getRuntimeDatabase()
    .studioOs.feedback.filter((f) => f.studentId === userId && f.visibleToStudent)
    .slice(0, 3)
    .map((f) => ({
      id: `ach_fb_${f.id}`,
      title: "פידבק מקצועי",
      description: f.note.slice(0, 80),
      year: new Date(f.createdAt).getFullYear(),
      source: "feedback",
      scope: "student",
      userId,
      awardedAt: f.createdAt
    }));
}

export function getStudioAchievements(studioId: string): GeneratedAchievement[] {
  const db = getRuntimeDatabase();
  const milestones = db.studioIdentity.milestones.filter((m) => m.studioId === studioId);
  const fromEvents = db.events.filter((e) => eventInStudio(e, studioId)).flatMap(eventAchievements);
  const catalog = db.achievements.map((a) => rowToGenerated(a));
  return [...milestones.map(milestoneToGenerated), ...fromEvents, ...catalog];
}

export function getGroupAchievements(groupId: string, studioId: string): GeneratedAchievement[] {
  const groupName = getStudioGroups().find((g) => g.id === groupId)?.name;
  return getStudioAchievements(studioId).filter(
    (a) => a.groupId === groupId || (groupName && a.title.includes(groupName))
  );
}

export function getStudentAchievements(userId: string, tasks: StudentTask[] = [], studioId?: string): GeneratedAchievement[] {
  const db = getRuntimeDatabase();
  const sid = studioId ?? db.users.find((u) => u.id === userId)?.studioId ?? "";
  const personal = taskAchievements(tasks.length ? tasks : db.tasks, userId);
  const fromEvents = db.events
    .filter((e) => !sid || eventInStudio(e, sid) || e.participatingStudentIds?.includes(userId))
    .flatMap((e) => eventAchievements(e).filter((a) => a.userId === userId || e.participatingStudentIds?.includes(userId)));
  const records = db.attendance.intelligenceRecords.filter((r) => r.studentId === userId);
  const summary = buildStudentSummaries(records)[0];
  const att =
    summary && summary.attendancePct >= 90
      ? attendanceMilestoneAchievements(summary.attendancePct, userId)
      : null;
  return [
    ...personal,
    ...fromEvents,
    ...levelAchievements(userId, sid),
    ...feedbackAchievements(userId),
    ...(att ? [att] : [])
  ];
}

export function generateAchievementFromEvent(event: StudioEvent): GeneratedAchievement[] {
  return eventAchievements(event);
}

export function generateAchievementFromCompetitionResult(result: {
  eventId: string;
  title: string;
  place: StudioAchievement["place"];
  studentIds?: string[];
  groupId?: string;
}): GeneratedAchievement {
  return {
    id: `ach_comp_${Date.now()}`,
    title: result.title,
    description: result.place ? achievementPlaceLabel(result.place) : undefined,
    year: new Date().getFullYear(),
    source: "competition",
    scope: result.studentIds?.length ? "student" : "group",
    userId: result.studentIds?.[0],
    groupId: result.groupId,
    eventId: result.eventId,
    awardedAt: new Date().toISOString(),
    place: result.place
  };
}

export function generateAchievementFromTaskCompletion(task: StudentTask, userId: string): GeneratedAchievement {
  return {
    id: `ach_task_gen_${task.id}_${userId}`,
    title: `השלמה: ${task.title}`,
    year: new Date().getFullYear(),
    source: "task",
    scope: task.targetType === "personal" ? "student" : "group",
    userId,
    awardedAt: new Date().toISOString()
  };
}

export function generateYearlyStudioTimeline(studioId: string): { year: number; items: GeneratedAchievement[] }[] {
  const all = getStudioAchievements(studioId);
  const map = new Map<number, GeneratedAchievement[]>();
  for (const a of all) {
    const list = map.get(a.year) ?? [];
    list.push(a);
    map.set(a.year, list);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => b - a)
    .map(([year, items]) => ({ year, items }));
}

export function attendanceMilestoneAchievements(attendancePct: number, userId: string): GeneratedAchievement | null {
  if (attendancePct < 90) return null;
  return {
    id: `ach_att_${userId}`,
    title: "נוכחות זהובה",
    description: `${attendancePct}% נוכחות בשנה הנוכחית`,
    year: MOCK_TODAY.getFullYear(),
    source: "attendance",
    scope: "student",
    userId,
    awardedAt: new Date().toISOString()
  };
}
