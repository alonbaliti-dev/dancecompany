import { STUDIO_LK } from "@/lib/platform/constants";
import { studioGroups } from "@/lib/studio-groups-catalog";
import type { StudentTask, StudioUpdate } from "@/lib/types";

const gid = (name: string) => studioGroups.find((g) => g.name === name)?.id ?? "";

const HH_SEL = gid("LK Hip Hop Crew");
const HH_TEEN = gid("היפ הופ — מתבגרים");
const MOD_ADV = gid("Modern Ensemble");
const HH_NEW = gid("היפ הופ — בסיס");
const FLAMENCO = gid("Junior Flamenco");

function T(p: Omit<StudentTask, "progressPercent" | "status" | "studioId"> & Partial<Pick<StudentTask, "progressPercent" | "status">>): StudentTask {
  return {
    studioId: STUDIO_LK,
    ...p,
    progressPercent: p.progressPercent ?? 0,
    status: p.status ?? "not_started"
  };
}

/** Rich seed: studio / group / personal tasks across demo users. */
export function createInitialStudentTasks(): StudentTask[] {
  return [
    T({
      id: "st_studio_warmup",
      title: "חימום יומי לכל הסטודיו",
      description: "חמש דקות חימום דינמי לפני כל אימון — מומלץ לתעד בבית פעם בשבוע.",
      targetType: "studio",
      createdByUserId: "u_liata",
      createdByName: "מנהלת סטודיו LK (דמו)",
      startDate: "2026-05-01",
      dueDate: "2026-05-17",
      endDate: "2026-06-30",
      frequency: "weekly",
      timesPerWeek: 3,
      targetCompletions: 4,
      completedCount: 0,
      xpReward: 25,
      relatedGoal: "הכנה להופעה",
      perStudentCompletions: { u_maya: 2, u_yuval: 1, u_tal: 0 }
    }),
    T({
      id: "st_group_sel_video",
      title: "העלאת סרטון — מופע סוף שנה",
      description: "לצלם את הקומבינציה המלאה למופע סוף השנה בזווית רחבה ולהעלות עד חמישי — לאחר עדכון ההנהלה.",
      targetType: "group",
      assignedGroupIds: HH_SEL ? [HH_SEL] : [],
      createdByUserId: "u_noa",
      createdByName: "שירה מ. (דמו)",
      startDate: "2026-05-11",
      dueDate: "2026-05-14",
      frequency: "once",
      targetCompletions: 1,
      completedCount: 0,
      xpReward: 50,
      relatedGoal: "LK Hip Hop Crew · מופע סוף שנה",
      perStudentCompletions: { u_maya: 0 }
    }),
    T({
      id: "st_group_sel_practice",
      title: "תרגול ביתי ×3 השבוע",
      description: "שלושה סשןים קצרים של תרגול ביתי — כל סשן מינימום 12 דקות.",
      targetType: "group",
      assignedGroupIds: HH_SEL ? [HH_SEL] : [],
      createdByUserId: "u_liata",
      createdByName: "מנהלת סטודיו LK (דמו)",
      startDate: "2026-05-12",
      dueDate: "2026-05-18",
      frequency: "weekly",
      timesPerWeek: 3,
      targetCompletions: 3,
      completedCount: 0,
      xpReward: 40,
      perStudentCompletions: { u_maya: 1 }
    }),
    T({
      id: "st_personal_maya_flex",
      title: "גמישות — יעד אישי",
      description: "שמונה דקות שפגט וירידת גב לאחרי כל שיעור נבחרת.",
      targetType: "personal",
      assignedStudentIds: ["u_maya"],
      createdByUserId: "u_noa",
      createdByName: "שירה מ. (דמו)",
      startDate: "2026-05-10",
      dueDate: "2026-05-14",
      frequency: "daily",
      targetCompletions: 5,
      completedCount: 3,
      xpReward: 35,
      relatedGoal: "גמישות אישית"
    }),
    T({
      id: "st_personal_maya_done",
      title: "להביא תלבושת שחורה",
      description: "לחזרה והופעה: שחור מלא, סניקרס לבנות.",
      targetType: "personal",
      assignedStudentIds: ["u_maya"],
      createdByUserId: "u_liata",
      createdByName: "מנהלת סטודיו LK (דמו)",
      startDate: "2026-05-01",
      dueDate: "2026-05-12",
      frequency: "once",
      targetCompletions: 1,
      completedCount: 1,
      xpReward: 10,
      relatedGoal: "הופעה"
    }),
    T({
      id: "st_overdue_modern",
      title: "תרגול מודרני — סרטון כיתה",
      description: "לצפות בסרטון הקומבינציה מ-Modern Ensemble ולסמן צפייה.",
      targetType: "group",
      assignedGroupIds: MOD_ADV ? [MOD_ADV] : [],
      createdByUserId: "u_noa",
      createdByName: "שירה מ. (דמו)",
      startDate: "2026-05-01",
      dueDate: "2026-05-10",
      frequency: "once",
      targetCompletions: 1,
      completedCount: 0,
      xpReward: 15,
      perStudentCompletions: { u_yuval: 0 }
    }),
    T({
      id: "st_teen_weekly",
      title: "תרגיל פריסטייל — היפ הופ מתבגרים",
      description: "שלושה סרטונים קצרים של פריסטייל בבית.",
      targetType: "group",
      assignedGroupIds: HH_TEEN ? [HH_TEEN] : [],
      createdByUserId: "u_noa",
      createdByName: "שירה מ. (דמו)",
      startDate: "2026-05-13",
      dueDate: "2026-05-20",
      frequency: "weekly",
      targetCompletions: 3,
      completedCount: 0,
      xpReward: 30,
      perStudentCompletions: { u_tal: 2 }
    }),
    T({
      id: "st_newbies_once",
      title: "שיעורי בית — היפ הופ בסיס",
      description: "לתרגל את הבסיס של השבוע ולצלם סיכום אחד.",
      targetType: "group",
      assignedGroupIds: HH_NEW ? [HH_NEW] : [],
      createdByUserId: "u_noa",
      createdByName: "שירה מ. (דמו)",
      startDate: "2026-05-13",
      dueDate: "2026-05-16",
      frequency: "once",
      targetCompletions: 1,
      completedCount: 0,
      xpReward: 20,
      perStudentCompletions: {}
    }),
    T({
      id: "st_flamenco_compas",
      title: "תרגול קומפאס — Junior Flamenco",
      description: "חמש דקות קצב ועיגון לפני השיעור — להקליט 30 שניות ולשלוח לקבוצה.",
      targetType: "group",
      assignedGroupIds: FLAMENCO ? [FLAMENCO] : [],
      createdByUserId: "u_liata",
      createdByName: "מנהלת סטודיו LK (דמו)",
      startDate: "2026-05-13",
      dueDate: "2026-05-17",
      frequency: "weekly",
      timesPerWeek: 2,
      targetCompletions: 2,
      completedCount: 0,
      xpReward: 30,
      relatedGoal: "פלמנקו · קצב וביטוי"
    }),
    T({
      id: "st_mgmt_audit",
      title: "סיכום נוכחות שבועי — כל המורים",
      description: "לוודא שסימון נוכחות הושלם לכל השיעורים.",
      targetType: "studio",
      createdByUserId: "u_liata",
      createdByName: "מנהלת סטודיו LK (דמו)",
      startDate: "2026-05-11",
      dueDate: "2026-05-15",
      frequency: "weekly",
      targetCompletions: 1,
      completedCount: 0,
      xpReward: 0,
      perStudentCompletions: {}
    })
  ];
}

export function createInitialStudioUpdates(): StudioUpdate[] {
  return [
    {
      id: "up_studio_urgent",
      studioId: STUDIO_LK,
      title: "חזרת מופע סוף שנה — שינוי זמן",
      body: "ביום חמישי תתחיל החזרה ב־18:00 במקום 18:30. לאחר מכן תופיע משימת העלאת סרטון ל-LK Hip Hop Crew. נא להגיע עם מים ושיער אסוף.",
      targetType: "studio",
      createdByUserId: "u_liata",
      createdByName: "מנהלת סטודיו LK (דמו)",
      createdAt: "2026-05-14T08:00:00",
      priority: "urgent",
      readByUserIds: []
    },
    {
      id: "up_studio_norm",
      studioId: STUDIO_LK,
      title: "צילומי סוף שנה",
      body: "הצילומים יתקיימו בשבוע הבא — נפרסם סלוטים מדויקים בימים הקרובים.",
      targetType: "studio",
      createdByUserId: "u_admin2",
      createdByName: "מנהל משנה (דמו)",
      createdAt: "2026-05-13T10:00:00",
      priority: "normal",
      readByUserIds: ["u_maya"]
    },
    {
      id: "up_group_sel",
      studioId: STUDIO_LK,
      title: "נבחרת — תלבושת לחזרה",
      body: "השבוע: שחור מלא. נא לאשר בקבוצת הווטסאפ עד מחר.",
      targetType: "group",
      assignedGroupIds: HH_SEL ? [HH_SEL] : [],
      createdByUserId: "u_liata",
      createdByName: "מנהלת סטודיו LK (דמו)",
      createdAt: "2026-05-13T16:30:00",
      priority: "important",
      readByUserIds: []
    },
    {
      id: "up_personal_maya",
      studioId: STUDIO_LK,
      title: "מאיה — פידבק אישי",
      body: "התקדמות מצוינת בקומבינציה. נשמור על קצב הרגליים בכניסה לשבירה.",
      targetType: "personal",
      assignedStudentIds: ["u_maya"],
      createdByUserId: "u_noa",
      createdByName: "שירה מ. (דמו)",
      createdAt: "2026-05-12T19:00:00",
      priority: "normal",
      readByUserIds: []
    }
  ];
}
