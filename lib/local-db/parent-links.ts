import type { DbUserRecord, ParentStudentLink } from "./db-types";

export function buildParentStudentLinksFromUsers(users: DbUserRecord[]): ParentStudentLink[] {
  const links: ParentStudentLink[] = [];
  const seen = new Set<string>();
  for (const u of users) {
    if (u.type !== "parent" && !u.isParent) continue;
    for (const sid of u.linkedStudentIds ?? []) {
      const id = `ps_${u.id}_${sid}`;
      if (seen.has(id)) continue;
      seen.add(id);
      links.push({
        id,
        studioId: u.studioId,
        parentUserId: u.id,
        studentUserId: sid
      });
    }
  }
  return links;
}
