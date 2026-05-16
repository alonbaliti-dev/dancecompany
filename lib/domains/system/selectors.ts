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
  return issues;
}
