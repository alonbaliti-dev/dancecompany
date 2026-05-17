import type { V6CalendarEvent, V6Database, V6User } from "@/lib/v6/types";

function eventTimeKey(event: V6CalendarEvent) {
  return `${event.date} ${event.startTime ?? "00:00"}`;
}

function eventMatchesActor(event: V6CalendarEvent, actor: V6User) {
  if (actor.role === "super_admin" || actor.role === "management") return true;
  if (actor.role === "teacher") return event.teacherIds.includes(actor.id) || event.groupIds.some((groupId) => actor.groupIds.includes(groupId));
  if (actor.role === "parent") {
    const linkedStudentIds = new Set(actor.linkedStudentIds);
    return event.studentIds.some((studentId) => linkedStudentIds.has(studentId));
  }
  return event.studentIds.includes(actor.id) || event.groupIds.some((groupId) => actor.groupIds.includes(groupId));
}

export function selectV6UpcomingEvents(db: V6Database, actor?: V6User) {
  const today = new Date().toISOString().slice(0, 10);
  return [...db.events]
    .filter((event) => event.date >= today)
    .filter((event) => !actor || eventMatchesActor(event, actor))
    .sort((a, b) => eventTimeKey(a).localeCompare(eventTimeKey(b), "he", { numeric: true }));
}

export function selectV6SchoolYearEvents(db: V6Database, schoolYear = "2025-2026", actor?: V6User) {
  return [...db.events]
    .filter((event) => event.schoolYear === schoolYear)
    .filter((event) => !actor || eventMatchesActor(event, actor))
    .sort((a, b) => eventTimeKey(a).localeCompare(eventTimeKey(b), "he", { numeric: true }));
}

export function selectV6PrimaryEvent(db: V6Database, actor?: V6User) {
  return selectV6UpcomingEvents(db, actor)[0];
}

export function selectV6EventOperatingSummary(db: V6Database, eventId: string) {
  const event = db.events.find((item) => item.id === eventId);
  const participants = db.eventParticipants.filter((item) => item.eventId === eventId);
  const checklist = db.eventChecklists.filter((item) => item.eventId === eventId);
  const readiness = db.showReadiness.filter((item) => item.eventId === eventId);
  const missingApprovals = participants.filter((item) => item.approvalStatus === "pending").length + readiness.reduce((sum, item) => sum + item.approvalsMissing.length, 0);
  const missingCostumes = participants.filter((item) => item.costumeStatus === "missing" || item.costumeStatus === "in_progress").length;
  const openChecklist = checklist.filter((item) => item.status !== "done").length;
  return {
    event,
    participants,
    checklist,
    readiness,
    missingApprovals,
    missingCostumes,
    openChecklist,
    averageReadiness: readiness.length ? Math.round(readiness.reduce((sum, item) => sum + item.score, 0) / readiness.length) : undefined,
    nextAction: readiness.find((item) => item.nextAction)?.nextAction ?? checklist.find((item) => item.status !== "done")?.title ?? "אין חסמים ידועים"
  };
}

export function selectV6EventsByFilters(db: V6Database, filters: { groupId?: string; ageGroupId?: string; danceStyleId?: string; teacherId?: string; type?: V6CalendarEvent["type"] }, actor?: V6User) {
  return selectV6SchoolYearEvents(db, undefined, actor).filter((event) => {
    return (!filters.groupId || event.groupIds.includes(filters.groupId))
      && (!filters.ageGroupId || event.ageGroupIds.includes(filters.ageGroupId))
      && (!filters.danceStyleId || event.danceStyleIds.includes(filters.danceStyleId))
      && (!filters.teacherId || event.teacherIds.includes(filters.teacherId))
      && (!filters.type || event.type === filters.type);
  });
}
