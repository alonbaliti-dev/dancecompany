import type { V6Database } from "@/lib/v6/types";
import type { V6SystemIssue } from "./types";

export function selectV6SystemIssues(db: V6Database): V6SystemIssue[] {
  const issues: V6SystemIssue[] = [];
  const linkedIds = new Set(db.users.flatMap((user) => user.linkedStudentIds));
  linkedIds.forEach((id) => {
    if (!db.users.some((user) => user.id === id)) issues.push({ id: `missing_${id}`, title: "קישור תלמיד חסר", body: id, severity: "critical", source: "database" });
  });
  db.media.forEach((item) => {
    if (item.visibility === "group" && !item.linkedGroupId) issues.push({ id: `media_${item.id}`, title: "מדיה קבוצתית בלי קבוצה", body: item.title, severity: "attention", source: "media" });
  });
  db.groups.forEach((group) => {
    const ageGroup = group.ageGroupId ? db.ageGroups.find((item) => item.id === group.ageGroupId) : undefined;
    const style = group.danceStyleId ? db.danceStyles.find((item) => item.id === group.danceStyleId) : undefined;
    if (group.ageGroupId && !ageGroup) issues.push({ id: `group_age_${group.id}`, title: "קבוצה בלי שכבת גיל תקינה", body: group.name, severity: "attention", source: "database" });
    if (group.danceStyleId && !style) issues.push({ id: `group_style_${group.id}`, title: "קבוצה בלי סגנון תקין", body: group.name, severity: "attention", source: "database" });
    if (ageGroup?.stage === "adults" && group.parentVisibility) issues.push({ id: `adult_parent_${group.id}`, title: "קבוצת מבוגרים עם הנחת הורים", body: group.name, severity: "attention", source: "database" });
  });
  db.events.forEach((event) => {
    if ((event.type === "annual_show" || event.type === "competition") && !db.showReadiness.some((item) => item.eventId === event.id)) {
      issues.push({ id: `readiness_${event.id}`, title: "אירוע מרכזי בלי מוכנות", body: event.title, severity: "attention", source: "database" });
    }
  });
  return issues;
}
