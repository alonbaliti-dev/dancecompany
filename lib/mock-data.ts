import { STUDIO_LK } from "@/lib/platform/constants";
import { CheckCircle2, Flame, Star } from "lucide-react";
import { authAccountSeeds } from "@/lib/auth/studio-accounts";
import { normalizePermissions } from "@/lib/permissions";
import { getDirectoryUsers } from "@/lib/directory-store";
import { enrichUserProfile } from "@/lib/users/user-type";
import { buildStudioDirectoryUsers } from "@/lib/studio/build-directory-users";
import type {
  Announcement,
  DirectoryUser,
  ManagementOverview,
  PerformanceCountdown,
  StudioClass,
  StudioGroup,
  StudioTask,
  StudentStats,
  TeacherDashboardData,
  TrainingItem,
  UserProfile
} from "./types";

// ——— Studio catalog (management assigns teachers to these) ———

export { getStudioGroups } from "@/lib/studio-groups-access";
export { getSchedule } from "@/lib/schedule-access";

// ——— Full teacher ops pool (filtered by assignedGroups for each teacher) ———

const TEACHER_MASTER: TeacherDashboardData = {
  groups: [
    {
      id: "g1",
      name: "Modern Ensemble",
      level: "רמה 4",
      students: 14,
      attendancePct: 88,
      practiceCompletionPct: 76,
      nextSession: "היום 17:45"
    },
    {
      id: "g2",
      name: "היפ הופ — מתבגרים",
      level: "רמה 2",
      students: 18,
      attendancePct: 91,
      practiceCompletionPct: 62,
      nextSession: "שלישי 16:00"
    },
    {
      id: "g3",
      name: "LK Hip Hop Crew",
      level: "רמה 3",
      students: 16,
      attendancePct: 94,
      practiceCompletionPct: 81,
      nextSession: "היום 18:30"
    },
    {
      id: "g4",
      name: "נבחרות — חזרות",
      level: "כל הרמות",
      students: 42,
      attendancePct: 89,
      practiceCompletionPct: 70,
      nextSession: "שבת 10:00"
    },
    {
      id: "g5",
      name: "חימום וטכניקה",
      level: "פתוח",
      students: 24,
      attendancePct: 85,
      practiceCompletionPct: 64,
      nextSession: "חמישי 16:30"
    },
    {
      id: "g6",
      name: "Classical Foundations",
      level: "ילדים",
      students: 12,
      attendancePct: 90,
      practiceCompletionPct: 79,
      nextSession: "ראשון 09:00"
    },
    {
      id: "g7",
      name: "מודרן — ביניים",
      level: "ביניים",
      students: 15,
      attendancePct: 87,
      practiceCompletionPct: 71,
      nextSession: "שני 19:15"
    },
    {
      id: "g8",
      name: "היפ הופ — בסיס",
      level: "בסיס",
      students: 20,
      attendancePct: 88,
      practiceCompletionPct: 69,
      nextSession: "שלישי 18:00"
    }
  ],
  todaysClasses: [
    { id: "tc1", time: "17:45", title: "פלמנקו — קומפאס ועיגון", room: "סטודיו 2", groupName: "Junior Flamenco", expected: 12, marked: 10 },
    { id: "tc1b", time: "16:00", title: "Modern Ensemble — קומבינציה", room: "סטודיו 3", groupName: "Modern Ensemble", expected: 14, marked: 11 },
    { id: "tc2", time: "20:00", title: "סדנת פריסטייל", room: "סטודיו 2", groupName: "פתוח לכולם", expected: 22, marked: 0 },
    { id: "tc3", time: "18:30", title: "LK Hip Hop Crew", room: "סטודיו 1", groupName: "LK Hip Hop Crew", expected: 16, marked: 14 },
    { id: "tc4", time: "16:30", title: "גמישות וטכניקה", room: "סטודיו 1", groupName: "כל הרמות", expected: 24, marked: 20 }
  ],
  homePracticeByGroup: [
    { groupName: "Modern Ensemble", completionPct: 76 },
    { groupName: "היפ הופ — מתבגרים", completionPct: 62 },
    { groupName: "LK Hip Hop Crew", completionPct: 81 },
    { groupName: "נבחרות — חזרות", completionPct: 70 },
    { groupName: "כל הרמות", completionPct: 64 },
    { groupName: "בלט קלאסי — ילדים", completionPct: 82 },
    { groupName: "מודרן — ביניים", completionPct: 74 },
    { groupName: "היפ הופ — בסיס", completionPct: 69 }
  ],
  studentsAtRisk: [
    { id: "r1", name: "עומר כהן", group: "Modern Ensemble", reason: "2 משימות באיחור" },
    { id: "r2", name: "שי לוי", group: "היפ הופ — מתבגרים", reason: "נוכחות נמוכה בשבועיים האחרונים" },
    { id: "r3", name: "נועה דוד", group: "LK Hip Hop Crew", reason: "לא הועלו סרטוני תרגול השבוע" },
    { id: "r4", name: "אורי בן-משה", group: "כל הרמות", reason: "לא סומנה נוכחות בשני שיעורים" }
  ],
  pendingReviews: [
    { id: "p1", title: "סרטוני קומבינציה", group: "Modern Ensemble", count: 6 },
    { id: "p2", title: "תרגיל גמישות", group: "היפ הופ — מתבגרים", count: 4 },
    { id: "p3", title: "קומבינציית הופעה", group: "LK Hip Hop Crew", count: 9 },
    { id: "p4", title: "סרטון טכניקה", group: "כל הרמות", count: 3 }
  ],
  quickActions: [
    { id: "qa1", label: "סימון נוכחות" },
    { id: "qa5", label: "מעקב נוכחות" },
    { id: "qa2", label: "הודעה לקבוצה" },
    { id: "qa3", label: "העלאת סרטון תרגול" },
    { id: "qa4", label: "הוספת משימה שבועית" },
    { id: "qa6", label: "שיעורים פרטיים" }
  ]
};

function filterTeacherDashboard(assignedGroupNames: string[]): TeacherDashboardData {
  const allow = new Set(assignedGroupNames);
  const inGroup = (name: string) => allow.has(name);
  return {
    groups: TEACHER_MASTER.groups.filter((g) => inGroup(g.name)),
    todaysClasses: TEACHER_MASTER.todaysClasses.filter((c) => inGroup(c.groupName)),
    homePracticeByGroup: TEACHER_MASTER.homePracticeByGroup.filter((h) => inGroup(h.groupName)),
    studentsAtRisk: TEACHER_MASTER.studentsAtRisk.filter((s) => inGroup(s.group)),
    pendingReviews: TEACHER_MASTER.pendingReviews.filter((p) => inGroup(p.group)),
    quickActions: TEACHER_MASTER.quickActions
  };
}

/** Full teacher ops template — persisted to `/database/product-data.json`. */
export function seedTeacherDashboardMaster(): TeacherDashboardData {
  return TEACHER_MASTER;
}

export function getTeacherDashboard(user: UserProfile): TeacherDashboardData | null {
  if (!user.permissions.isTeacher && !user.permissions.isManagement) return null;
  if (user.permissions.isManagement && !user.permissions.isTeacher) {
    return TEACHER_MASTER;
  }
  if (!user.assignedGroups.length) {
    return {
      groups: [],
      todaysClasses: [],
      homePracticeByGroup: [],
      studentsAtRisk: [],
      pendingReviews: [],
      quickActions: TEACHER_MASTER.quickActions
    };
  }
  return filterTeacherDashboard(user.assignedGroups);
}

// ——— Directory for Management → User permissions (rich mock; sign-in only for `authAccountSeeds`) ———

const seedDirectoryAudit: Record<
  string,
  Pick<DirectoryUser, "lastActiveAt" | "permissionsModifiedBy" | "permissionsModifiedAt">
> = {
  u_maya: { lastActiveAt: "לפני 12 דק׳", permissionsModifiedBy: "מנהלת סטודיו LK (דמו)", permissionsModifiedAt: "12.5.2026" },
  u_noa: { lastActiveAt: "לפני שעה", permissionsModifiedBy: "מנהלת סטודיו LK (דמו)", permissionsModifiedAt: "3.5.2026" },
  u_liata: { lastActiveAt: "עכשיו", permissionsModifiedBy: null, permissionsModifiedAt: null }
};

/** @deprecated Use `getDirectoryUsers()` — loaded from `/database/users.json`. */
export function getInitialDirectoryUsers(): DirectoryUser[] {
  const loaded = getDirectoryUsers();
  if (loaded.length > 0) return loaded;
  return buildStudioDirectoryUsers();
}

// ——— Shared student experience (studio context) ———

export const studentStats: StudentStats = {
  name: "מאיה כהן",
  group: "LK Hip Hop Crew",
  level: "רמה 3",
  streak: 5,
  xp: 740,
  attendance: 92,
  xpToNextLevel: 260,
  monthlyProgressPct: 72
};

export const performanceCountdown: PerformanceCountdown = {
  label: "מופע סוף שנה",
  daysRemaining: 12,
  eventTitle: "מופע סוף השנה — פרטים יפורסמו"
};

export const schedule: StudioClass[] = [
  {
    id: "c1", studioId: STUDIO_LK,
    section: "today",
    day: "היום",
    time: "18:30",
    title: "LK Hip Hop Crew",
    group: "LK Hip Hop Crew",
    teacher: "מנהלת סטודיו LK (דמו)",
    room: "סטודיו 1",
    style: "Hip Hop",
    status: "confirmed"
  },
  {
    id: "c2", studioId: STUDIO_LK,
    section: "today",
    day: "היום",
    time: "20:00",
    title: "סדנת פריסטייל",
    group: "פתוח לכולם",
    teacher: "שירה מ. (דמו)",
    room: "סטודיו 2",
    style: "Freestyle",
    status: "optional"
  },
  {
    id: "c3", studioId: STUDIO_LK,
    section: "week",
    day: "שלישי",
    time: "17:45",
    title: "מודרן — קומבינציה",
    group: "Modern Ensemble",
    teacher: "שירה מ. (דמו)",
    room: "סטודיו 2",
    style: "Modern",
    status: "confirmed"
  },
  {
    id: "c4", studioId: STUDIO_LK,
    section: "week",
    day: "חמישי",
    time: "16:30",
    title: "גמישות וטכניקה",
    group: "חימום וטכניקה",
    teacher: "עומר ד. (דמו)",
    room: "סטודיו 1",
    style: "Technique",
    status: "confirmed"
  },
  {
    id: "c5", studioId: STUDIO_LK,
    section: "week",
    day: "שבת",
    time: "10:00",
    title: "חזרה כללית",
    group: "נבחרות",
    teacher: "מנהלת סטודיו LK (דמו)",
    room: "אולם ראשי",
    style: "Rehearsal",
    status: "confirmed"
  },
  {
    id: "c6", studioId: STUDIO_LK,
    section: "week",
    day: "ראשון",
    time: "09:00",
    title: "Jazz — בסיס",
    group: "Classical Foundations",
    teacher: "רות ל. (דמו)",
    room: "סטודיו 3",
    style: "Jazz",
    status: "confirmed"
  },
  {
    id: "c7", studioId: STUDIO_LK,
    section: "week",
    day: "שני",
    time: "19:15",
    title: "Contemporary",
    group: "מודרן — ביניים",
    teacher: "יעל כ. (דמו)",
    room: "סטודיו 1",
    style: "Contemporary",
    status: "confirmed"
  },
  {
    id: "c8", studioId: STUDIO_LK,
    section: "week",
    day: "שלישי",
    time: "18:00",
    title: "היפ הופ — בסיס",
    group: "היפ הופ — בסיס",
    teacher: "שירה מ. (דמו)",
    room: "סטודיו 2",
    style: "Hip Hop",
    status: "confirmed"
  }
];

export const trainingCategories = ["הכל", "חימום", "גמישות", "כוח", "פריסטייל", "טכניקה"];

export const trainings: TrainingItem[] = [
  {
    id: "t1",
    title: "חימום דינמי לפני שיעור",
    category: "חימום",
    duration: "5 דק׳",
    xp: 20,
    done: true,
    difficulty: "קל",
    featured: true
  },
  {
    id: "t2",
    title: "שפגט — בסיס יומי",
    category: "גמישות",
    duration: "8 דק׳",
    xp: 35,
    done: false,
    difficulty: "בינוני"
  },
  {
    id: "t3",
    title: "כוח לרקדנים",
    category: "כוח",
    duration: "10 דק׳",
    xp: 45,
    done: false,
    difficulty: "בינוני"
  },
  {
    id: "t4",
    title: "Freestyle Challenge",
    category: "פריסטייל",
    duration: "6 דק׳",
    xp: 30,
    done: true,
    difficulty: "מתקדם"
  },
  {
    id: "t5",
    title: "בידוד גוף עליון",
    category: "טכניקה",
    duration: "7 דק׳",
    xp: 28,
    done: false,
    difficulty: "קל"
  }
];

export const tasks: StudioTask[] = [
  {
    id: "s1",
    title: "תרגול קומבינציה",
    body: "לתרגל את הקומבינציה של השבוע שלוש פעמים מלאות ולצלם סיכום קצר.",
    due: "עד חמישי",
    xp: 50,
    done: false,
    relatedGroup: "LK Hip Hop Crew",
    relatedClass: "LK Hip Hop Crew"
  },
  {
    id: "s2",
    title: "להביא תלבושת שחורה",
    body: "לחזרה הקרובה: שחור מלא וסניקרס לבנות.",
    due: "חמישי",
    xp: 10,
    done: true,
    relatedGroup: "LK Hip Hop Crew",
    relatedClass: "חזרה כללית"
  },
  {
    id: "s3",
    title: "גמישות יומית",
    body: "שמונה דקות גמישות, לפחות ארבע פעמים השבוע.",
    due: "השבוע",
    xp: 40,
    done: false,
    relatedGroup: "LK Hip Hop Crew"
  },
  {
    id: "s4",
    title: "תרגול מודרני — סרטון כיתה",
    body: "לצפות בסרטון הקומבינציה מ-Modern Ensemble ולסמן צפייה.",
    due: "מחר",
    xp: 15,
    done: false,
    relatedGroup: "LK Hip Hop Crew",
    relatedClass: "Modern Ensemble"
  }
];

export const announcements: Announcement[] = [
  {
    id: "a1",
    title: "חזרה לקראת מופע סוף שנה",
    body: "ביום חמישי להגיע בזמן עם מים, שיער אסוף ובגד שחור מלא — אנרגיית חזרה.",
    tag: "נבחרת",
    date: "היום",
    important: true
  },
  {
    id: "a2",
    title: "צילומי סוף שנה",
    body: "הצילומים יתקיימו בשבוע הבא. נעדכן בזמנים המדויקים.",
    tag: "כל הסטודיו",
    date: "אתמול"
  }
];

export const achievements = [
  { title: "5 ימים ברצף", body: "תרגול ביתי — רצף שמחזק ביטחון לפני מופע סוף שנה", icon: Flame },
  { title: "נוכחות גבוהה", body: "מעל 90% נוכחות החודש בסטודיו", icon: CheckCircle2 },
  { title: "זיכרון במה", body: "השתתפות במופע סוף שנה — רגע על הבמה", icon: Star }
];

// ——— Management (executive) ———

export const managementOverview: ManagementOverview = {
  totalTeachers: 8,
  totalGroups: 22,
  totalStudents: 186,
  sessionsThisWeek: 54,
  averageAttendancePct: 89,
  homeTaskCompletionPct: 74,
  teachers: [
    {
      userId: "u_liata",
      name: "מנהלת סטודיו LK (דמו)",
      groups: 5,
      attendancePct: 94,
      taskCompletionPct: 81,
      studentsAtRisk: 2,
      lastAttendanceUpdate: "לפני שעה",
      engagementScore: 94
    },
    {
      userId: "u_noa",
      name: "שירה מ. (דמו)",
      groups: 4,
      attendancePct: 88,
      taskCompletionPct: 72,
      studentsAtRisk: 4,
      lastAttendanceUpdate: "אתמול",
      engagementScore: 86
    },
    {
      userId: "u_dan",
      name: "עומר ד. (דמו)",
      groups: 4,
      attendancePct: 85,
      taskCompletionPct: 68,
      studentsAtRisk: 5,
      lastAttendanceUpdate: "לפני 3 ימים",
      engagementScore: 78
    },
    {
      userId: "u_roni",
      name: "רות ל. (דמו)",
      groups: 3,
      attendancePct: 90,
      taskCompletionPct: 79,
      studentsAtRisk: 1,
      lastAttendanceUpdate: "היום",
      engagementScore: 88
    },
    {
      userId: "u_mai",
      name: "יעל כ. (דמו)",
      groups: 3,
      attendancePct: 87,
      taskCompletionPct: 71,
      studentsAtRisk: 3,
      lastAttendanceUpdate: "לפני יומיים",
      engagementScore: 81
    }
  ],
  alerts: [
    {
      id: "al1",
      kind: "attendance",
      title: "עדכון נוכחות לא בוצע",
      detail: "מורה דמו (עומר ד.) לא סימן נוכחות לשלושת השיעורים האחרונים בקבוצות גמישות וטכניקה."
    },
    {
      id: "al2",
      kind: "practice",
      title: "השלמת תרגול ביתי נמוכה",
      detail: "קבוצת היפ הופ — מתבגרים — 62% בלבד השלימו משימות השבוע."
    },
    {
      id: "al3",
      kind: "inactive",
      title: "תלמידים פחות פעילים",
      detail: "זוהו 6 תלמידים שלא צפו בסרטוני תרגול ולא סימנו משימות מעל 10 ימים."
    },
    {
      id: "al4",
      kind: "practice",
      title: "דדליין משימות קרוב",
      detail: "ב־14 משימות פתוחות לנבחרות — 30% עדיין ללא צפייה בסרטון ההדרכה."
    }
  ],
  ranking: [
    { rank: 1, name: "מנהלת סטודיו LK (דמו)", score: 94, note: "מדד דמו — נוכחות ותרגול ביתי" },
    { rank: 2, name: "רות ל. (דמו)", score: 88, note: "מדד דמו — יציבות בקבוצות ילדים" },
    { rank: 3, name: "שירה מ. (דמו)", score: 86, note: "מדד דמו — מעורבות גבוהה" },
    { rank: 4, name: "יעל כ. (דמו)", score: 81, note: "מדד דמו — מגמה חיובית" },
    { rank: 5, name: "עומר ד. (דמו)", score: 78, note: "מדד דמו — לשפר מעקב משימות" }
  ],
  studioInsight:
    "נוכחות ממוצעת 87% ומשימות בית ב־72% — בטווח המטרה לעונה. שתי קבוצות נבחרות עם פער בתרגול ביתי; מומלץ שיח קצר עם המורים המשויכים לפני מופע סוף השנה."
};
