/**
 * Canonical faculty seed — exact style mapping from product owner.
 * Used only by `scripts/generate-database.ts` → `/database/faculty.json`.
 */
import { STUDIO_LK } from "@/lib/platform/constants";
import { groupNameToId } from "@/lib/studio-roster";
import type { DanceStyle, FacultyMemberRole, FacultyRecord } from "@/lib/types";

function gids(names: string[]): string[] {
  return names.map((n) => groupNameToId(n)).filter(Boolean) as string[];
}

type Row = Omit<FacultyRecord, "studioId" | "assignedGroupIds"> & { groupNames: string[] };

const HH_SEL = ["LK Hip Hop Crew"];
const HH_TEEN = ["היפ הופ — מתבגרים"];
const HH_NEW = ["היפ הופ — בסיס"];

const ROWS: Row[] = [
  {
    id: "fac_liata",
    userId: "u_liata",
    fullName: "ליאת קפלינסקי",
    role: "owner",
    danceStyles: ["flamenco"],
    visibility: "public",
    privateLessonEnabled: true,
    managementAccess: true,
    groupNames: ["Junior Flamenco", "נבחרות — חזרות"]
  },
  {
    id: "fac_u_shahar",
    userId: "u_shahar",
    fullName: "שחר קפלינסקי",
    role: "management",
    danceStyles: [],
    visibility: "public",
    privateLessonEnabled: false,
    managementAccess: true,
    groupNames: ["נבחרות — חזרות", "חימום וטכניקה"]
  },
  {
    id: "fac_u_office",
    userId: "u_office",
    fullName: "משרד הסטודיו",
    role: "management",
    danceStyles: [],
    visibility: "internal",
    privateLessonEnabled: false,
    managementAccess: true,
    groupNames: []
  },
  { id: "fac_u_t_simor", userId: "u_t_simor", fullName: "סימור דניאל", role: "mentor", danceStyles: ["hiphop"], visibility: "public", privateLessonEnabled: true, groupNames: HH_SEL },
  { id: "fac_u_t_yakir", userId: "u_t_yakir", fullName: "יקיר גבאי", role: "mentor", danceStyles: ["hiphop"], visibility: "public", privateLessonEnabled: true, groupNames: [...HH_TEEN, ...HH_NEW] },
  { id: "fac_u_t_hazan", userId: "u_t_hazan", fullName: "דניאל חזן", role: "mentor", danceStyles: ["hiphop"], visibility: "public", privateLessonEnabled: true, groupNames: HH_NEW },
  { id: "fac_u_t_almog", userId: "u_t_almog", fullName: "אלמוג דוד", role: "mentor", danceStyles: ["modern"], visibility: "public", privateLessonEnabled: true, groupNames: ["Modern Ensemble"] },
  {
    id: "fac_u_t_shabi",
    userId: "u_t_shabi",
    fullName: "שבי שלום אברמוביץ",
    role: "mentor",
    danceStyles: ["modern", "ballet"],
    visibility: "public",
    privateLessonEnabled: true,
    groupNames: ["Modern Ensemble", "מודרן — ביניים", "בלט קלאסי — נבחרת"]
  },
  {
    id: "fac_u_t_lena",
    userId: "u_t_lena",
    fullName: "לנה קרושקו",
    role: "mentor",
    danceStyles: ["ballet", "pointe"],
    visibility: "public",
    privateLessonEnabled: true,
    groupNames: ["Classical Foundations", "בלט קלאסי — נבחרת"]
  },
  {
    id: "fac_u_t_michael",
    userId: "u_t_michael",
    fullName: "מיכאל שניידר",
    role: "mentor",
    danceStyles: ["ballet"],
    visibility: "public",
    privateLessonEnabled: true,
    groupNames: ["Classical Foundations"]
  },
  {
    id: "fac_u_t_yigal",
    userId: "u_t_yigal",
    fullName: "יגאל משינסקי",
    role: "mentor",
    danceStyles: ["ballet"],
    visibility: "public",
    privateLessonEnabled: true,
    groupNames: ["בלט קלאסי — נבחרת"]
  },
  {
    id: "fac_u_t_cornelia",
    userId: "u_t_cornelia",
    fullName: "קורנליה זוהר",
    role: "mentor",
    danceStyles: ["repertoire"],
    visibility: "public",
    privateLessonEnabled: true,
    groupNames: ["נבחרות — חזרות"]
  }
];

export function seedFacultyRecords(): FacultyRecord[] {
  return ROWS.map((r) => ({
    id: r.id,
    studioId: STUDIO_LK,
    userId: r.userId,
    fullName: r.fullName,
    role: r.role,
    danceStyles: r.danceStyles as DanceStyle[],
    visibility: r.visibility,
    profileImage: r.profileImage,
    assignedGroupIds: gids(r.groupNames),
    privateLessonEnabled: r.privateLessonEnabled,
    managementAccess: r.managementAccess,
    shortDescription: r.shortDescription
  }));
}
