import { STUDIO_LK } from "@/lib/platform/constants";
import { groupNameToId } from "@/lib/studio-roster";
import type { AttendanceRecord, AttendanceStatus } from "@/lib/types";
import { DEFAULT_GROUP_TEACHER, GROUP_TEACHERS } from "./group-teachers";

type RosterRow = {
  studentId: string;
  studentName: string;
  groupName: string;
  /** 0–1 absence rate bias */
  absenceBias: number;
  /** recent weeks: extra absences */
  recentSlump?: boolean;
  streak?: boolean;
};

const ROSTER: RosterRow[] = [
  { studentId: "u_maya", studentName: "מאיה כהן", groupName: "LK Hip Hop Crew", absenceBias: 0.05 },
  { studentId: "u_yuval", studentName: "יובל אברהם", groupName: "Modern Ensemble", absenceBias: 0.22, recentSlump: true },
  { studentId: "u_tal", studentName: "טל מזרחי", groupName: "היפ הופ — מתבגרים", absenceBias: 0.28, streak: true },
  { studentId: "stu_shai", studentName: "שי לוי", groupName: "היפ הופ — מתבגרים", absenceBias: 0.35, recentSlump: true, streak: true },
  { studentId: "stu_omer", studentName: "עומר כהן", groupName: "היפ הופ — בסיס", absenceBias: 0.3, recentSlump: true },
  { studentId: "stu_noam", studentName: "נועם דוד", groupName: "LK Hip Hop Crew", absenceBias: 0.12 },
  { studentId: "stu_yael", studentName: "יעל פרץ", groupName: "Junior Flamenco", absenceBias: 0.08 },
  { studentId: "stu_amit", studentName: "עמית גולן", groupName: "Junior Flamenco", absenceBias: 0.18, recentSlump: true },
  { studentId: "stu_lia", studentName: "ליה אשכנזי", groupName: "Classical Foundations", absenceBias: 0.1 },
  { studentId: "stu_ido", studentName: "עידו בר", groupName: "Acro Team", absenceBias: 0.15 },
  { studentId: "stu_hila", studentName: "הילה רוזן", groupName: "Acro Team", absenceBias: 0.25, streak: true },
  { studentId: "stu_gal", studentName: "גל אוחנה", groupName: "Modern Ensemble", absenceBias: 0.14 },
  { studentId: "stu_reut", studentName: "רעות מלכה", groupName: "היפ הופ — בסיס", absenceBias: 0.2 },
  { studentId: "stu_tom", studentName: "תום וייס", groupName: "חימום וטכניקה", absenceBias: 0.11 },
  { studentId: "stu_noga", studentName: "נוגה שמש", groupName: "נבחרות — חזרות", absenceBias: 0.09 }
];

function seededRand(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function pickStatus(rand: () => number, bias: number, weekIndex: number, totalWeeks: number, row: RosterRow): AttendanceStatus {
  const recent = weekIndex >= totalWeeks - 4;
  let p = bias;
  if (row.recentSlump && recent) p += 0.25;
  if (row.streak && recent && weekIndex >= totalWeeks - 2) p = 0.85;
  const r = rand();
  if (r < p * 0.15) return "excused";
  if (r < p) return "absent";
  if (r < p + 0.08) return "late";
  return "present";
}

const CLASS_TITLES: Record<string, string[]> = {
  "LK Hip Hop Crew": ["Hip Hop — קומבו שבועי", "נבחרת — טכניקה"],
  "Modern Ensemble": ["מודרן — קומבינציה", "מודרן — improv"],
  "היפ הופ — מתבגרים": ["היפ הופ — רמה 2", "פריסטייל בסיס"],
  "היפ הופ — בסיס": ["היפ הופ — יסוד", "קואורדינציה"],
  "Junior Flamenco": ["פלמנקו — קומפאס", "פלמנקו — חזרות"],
  "Classical Foundations": ["בלט — בר", "בלט — מרכז"],
  "Acro Team": ["אקרו — כוח", "אקרו — partnering"],
  "חימום וטכניקה": ["חימום כללי", "גמישות"],
  "נבחרות — חזרות": ["חזרה כללית", "סדר כניסות"]
};

export function seedAttendanceRecords(asOf = new Date("2026-05-15")): AttendanceRecord[] {
  const start = new Date(asOf.getFullYear() - (asOf.getMonth() >= 8 ? 0 : 1), 8, 1);
  const records: AttendanceRecord[] = [];
  let id = 0;

  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const totalWeeks = Math.max(1, Math.floor((asOf.getTime() - start.getTime()) / msPerWeek));

  for (const row of ROSTER) {
    const groupId = groupNameToId(row.groupName) ?? "grp_hh_sel";
    const teacher = GROUP_TEACHERS[groupId] ?? DEFAULT_GROUP_TEACHER;
    const titles = CLASS_TITLES[row.groupName] ?? ["שיעור שבועי"];
    const rand = seededRand(row.studentId.length * 997 + row.groupName.length);

    for (let w = 0; w < totalWeeks; w++) {
      const classDate = new Date(start.getTime() + w * msPerWeek + 2 * 24 * 60 * 60 * 1000);
      if (classDate > asOf) break;
      const iso = classDate.toISOString().slice(0, 10);
      const title = titles[w % titles.length]!;
      const status = pickStatus(rand, row.absenceBias, w, totalWeeks, row);
      const note =
        status === "absent" && rand() > 0.6
          ? "לא הודיע מראש"
          : status === "excused"
            ? "אישור הורה / רפואי"
            : undefined;

      records.push({
        id: `att_rec_${++id}`,
        studioId: STUDIO_LK,
        studentId: row.studentId,
        studentName: row.studentName,
        groupId,
        groupName: row.groupName,
        teacherId: teacher.teacherId,
        teacherName: teacher.teacherName,
        classDate: iso,
        classTitle: title,
        status,
        note
      });
    }
  }

  return records;
}
