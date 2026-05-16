import type {
  AttendanceSession,
  DigitalStudentFile,
  GamificationState,
  ManagementReportSummary,
  ParentDashboardData,
  PerformanceEventDetail,
  PracticeVideo,
  StudentGoal
} from "./types";
import { announcements, schedule } from "./mock-data";

export function seedGoals(studentId: string): StudentGoal[] {
  return [
    {
      id: "g_flex",
      studentId,
      category: "flexibility",
      title: "גמישות — שפגט יומי",
      description: "שמונה דקות בוקר, חמש פעמים בשבוע. צילום קצר בסוף השבוע.",
      monthlyProgressPct: 68,
      deadline: "2026-06-01",
      progressPercent: 72,
      teacherNotes: "שיפור ברור בירידת גב. לשמור על קצב נשימה באחיזות.",
      createdAt: "2026-05-01"
    },
    {
      id: "g_att",
      studentId,
      category: "attendance",
      title: "נוכחות לשיעורי נבחרת",
      description: "לפחות 90% נוכחות בחודש.",
      monthlyProgressPct: 82,
      deadline: "2026-05-31",
      progressPercent: 88,
      teacherNotes: "מצוין. רק לוודא הגעה בזמן לחזרות.",
      createdAt: "2026-05-01"
    },
    {
      id: "g_home",
      studentId,
      category: "home_practice",
      title: "תרגול ביתי — קומבינציה",
      description: "שלושה סשןים מלאים + סרטון אחד מסכם.",
      monthlyProgressPct: 54,
      deadline: "2026-05-22",
      progressPercent: 45,
      teacherNotes: "להקפיד על סיום רגליים ביציאה מהשבירה.",
      createdAt: "2026-05-03"
    },
    {
      id: "g_perf",
      studentId,
      category: "performance_prep",
      title: "הכנה להופעת סוף שנה",
      description: "זכרון מיקום במה, כניסות ויציאות אחידות.",
      monthlyProgressPct: 61,
      deadline: "2026-06-15",
      progressPercent: 58,
      createdAt: "2026-05-05"
    }
  ];
}

export function seedDigitalFiles(): Record<string, DigitalStudentFile> {
  return {
    u_maya: {
      studentId: "u_maya",
      strengths: ["ביטחון במה", "קצב מדויק", "זכרון תנועה מהיר"],
      improvementAreas: ["גמישות מפרקי ירך", "סיום קו בזוגות"],
      teacherNotes: "מאיה מראה מנהיגות בקבוצה. כדאי לחזק עבודת רצפה בזוגות.",
      attendanceHistory: [
        { date: "2026-05-12", status: "present", classTitle: "LK Hip Hop Crew" },
        { date: "2026-05-10", status: "late", classTitle: "LK Hip Hop Crew" },
        { date: "2026-05-07", status: "present", classTitle: "חזרה כללית" },
        { date: "2026-05-05", status: "absent", classTitle: "LK Hip Hop Crew" }
      ],
      taskHistorySummary: "12 משימות בחודש — 9 הושלמו. דגש על סרטוני תרגול בזמן.",
      practiceStreakDays: 5,
      uploadedVideoIds: ["vid_1", "vid_2"],
      timeline: [
        { date: "2026-05-12", label: "פידבק וידאו", detail: "קומבינציה — אושר עם הערות טכניות" },
        { date: "2026-05-02", label: "יעד גמישות", detail: "עודכן התקדמות חודשית ל־68%" },
        { date: "2026-04-20", label: "נוכחות", detail: "חודש עם 92% נוכחות" }
      ]
    },
    u_yuval: {
      studentId: "u_yuval",
      strengths: ["פריסה במרחב", "אנרגיה גבוהה"],
      improvementAreas: ["עמידה בסיום תנועה", "האזנה למוזיקה"],
      teacherNotes: "יובל מתקדם יפה ב־מודרן. לעודד שקט פנימי בתנועה.",
      attendanceHistory: [
        { date: "2026-05-11", status: "present", classTitle: "Modern Ensemble" },
        { date: "2026-05-04", status: "present", classTitle: "Modern Ensemble" }
      ],
      taskHistorySummary: "7 משימות — 5 הושלמו.",
      practiceStreakDays: 3,
      uploadedVideoIds: [],
      timeline: [{ date: "2026-05-01", label: "הצטרפות", detail: "נפתח תיק דיגיטלי" }]
    }
  };
}

export function seedVideos(): PracticeVideo[] {
  return [
    {
      id: "vid_1",
      studentId: "u_maya",
      studentName: "מאיה כהן",
      title: "קומבינציה — סיבוב שבועי",
      note: "הייתי שמחה לפידבק על הכניסה לשבירה",
      mockUri: "mock://video/maya-combo-1.mp4",
      attachedGoalId: "g_home",
      status: "approved",
      teacherFeedback: "עבודה נקייה. בשבירה השנייה — יותר גובה בברך.",
      technicalNotes: "לשמור על מרכז גוף ביציאה.",
      submittedAt: "2026-05-11T18:00:00",
      reviewedAt: "2026-05-12T09:00:00"
    },
    {
      id: "vid_2",
      studentId: "u_maya",
      studentName: "מאיה כהן",
      title: "שפגט — יעד גמישות",
      note: "ניסיון יומי קצר",
      mockUri: "mock://video/maya-split.mp4",
      attachedGoalId: "g_flex",
      status: "pending_review",
      submittedAt: "2026-05-13T20:30:00"
    }
  ];
}

export function seedAttendance(): AttendanceSession[] {
  return [
    {
      id: "att_sess_1",
      classId: "tc3",
      classTitle: "LK Hip Hop Crew",
      groupName: "LK Hip Hop Crew",
      date: "2026-05-14",
      teacherId: "u_noa",
      updatedAt: "2026-05-14T16:00:00",
      rows: [
        { studentId: "u_maya", studentName: "מאיה כהן", mark: "present", repeatedAbsences: 0 }
      ]
    },
    {
      id: "att_sess_2",
      classId: "tc1",
      classTitle: "מודרן",
      groupName: "Modern Ensemble",
      date: "2026-05-14",
      teacherId: "u_noa",
      updatedAt: null,
      rows: [
        { studentId: "u_yuval", studentName: "יובל אברהם", mark: null, repeatedAbsences: 0 }
      ]
    }
  ];
}

export function seedPerformance(): PerformanceEventDetail {
  return {
    id: "perf_main",
    title: "הופעת סוף שנה — נבחרות LK",
    daysRemaining: 12,
    venue: "תיאטרון העיר · אולם ראשי",
    rehearsalSchedule: [
      { date: "2026-05-14", time: "19:30", note: "נבחרת — חזרת גמר (תלבושת שחורה)" },
      { date: "2026-05-15", time: "18:30", note: "נבחרת היפ הופ — חזרת עומק" },
      { date: "2026-05-17", time: "10:00", note: "כל הנבחרות — סדר כניסות" },
      { date: "2026-05-20", time: "19:00", note: "תלבושות מלאות" }
    ],
    costumeRequirements: ["שחור מלא", "סניקרס לבנות", "שיער אסוף"],
    equipmentChecklist: [
      { item: "מים אישיים", done: true },
      { item: "מגבת קטנה", done: false },
      { item: "עזרת האזנה (אם נדרש)", done: false }
    ],
    orderOfAppearance: ["פתיחה — כל הסטודיו", "מודרן", "LK Hip Hop Crew", "סיום משותף"],
    parentApprovalsPending: 4,
    musicFileLabel: "קובץ אודיו ראשי (מקום לאחסון בענן)"
  };
}

export function seedGamification(): GamificationState {
  return {
    xp: 1840,
    level: 4,
    levelLabel: "רקדן/ית פעיל/ה",
    streakDays: 5,
    badges: [
      { id: "b1", title: "נוכחות זהובה", unlockedAt: "2026-04-01" },
      { id: "b2", title: "תרגול ביתי שבועי", unlockedAt: "2026-05-10" }
    ],
    weeklyChallengeTitle: "שלושה סרטוני תרגול קצרים",
    weeklyChallengeProgressPct: 66,
    groupChallengeTitle: "LK Hip Hop Crew — 90% השלמת משימות",
    groupChallengeProgressPct: 74
  };
}

export function seedReports(): ManagementReportSummary {
  return {
    teacherActivity: [
      { name: "מנהלת סטודיו LK (דמו)", score: "גבוה", detail: "עדכונים שבועיים, נוכחות מסומנת בזמן" },
      { name: "שירה מ. (דמו)", score: "בינוני", detail: "משימות פעילות — לשפר מעקב נוכחות" },
      { name: "עומר ד. (דמו)", score: "נמוך", detail: "עיכוב בסימון נוכחות בשלושה מחזורים" }
    ],
    attendanceCompletionPct: 87,
    taskCompletionPct: 74,
    homePracticeEngagementPct: 69,
    atRiskStudents: [
      { name: "עומר כהן", reason: "שלושה חיסורים בשבועיים האחרונים" },
      { name: "שי לוי", reason: "משימות בית פתוחות ללא צפייה בסרטונים" }
    ],
    retentionRisk: [
      { segment: "היפ הופ — מתבגרים", note: "ירידה קלה במעורבות לאחר חגים" },
      { segment: "גילאי 12–14", note: "דורש חיזוק מסרים אישיים מהמורים" }
    ],
    unreadImportantUpdates: 3,
    groupsNeedingAttention: [
      { groupName: "היפ הופ — מתבגרים", reason: "השלמת תרגול ביתי מתחת ליעד" },
      { groupName: "כל הרמות", reason: "נוכחות ממוצעת ירדה ב־6%" }
    ],
    weeklyHebrewInsight:
      "השבוע ראינו יציבות טובה בנבחרות לצד פער קטן בתרגול ביתי בקבוצות טינס. מומלץ לשלוח עדכון קצר להורים בקבוצות עם פחות מ־65% השלמה, ולתאם חזרה נוספת לפני ההופעה. שיתוף פעולה בין מורים להנהלה ישמור על מומנטום חיובי עד סוף העונה."
  };
}

export function seedParentDashboard(parentId: string): ParentDashboardData {
  return {
    parentId,
    announcements: announcements.slice(0, 2),
    schedulePreview: schedule.slice(0, 4),
    paymentStatusLabel: "תשלום עדכני",
    pendingApprovals: [
      { id: "ap1", title: "אישור השתתפות בהופעה", dueDate: "2026-05-18" },
      { id: "ap2", title: "שחרור צילום", dueDate: "2026-05-20" }
    ],
    equipmentList: ["נעלי ריקוד נקיות", "בקבוק מים", "חולצת סטודיו שחורה"],
    performanceSummary: "ההופעה מתקרבת — נדרשת אישור נוכחות בחזרה האחרונה.",
    generalProgressSummary: "מאיה מציגה מגמת שיפור בנוכחות, בביטחון במה ובחיבור הרגשי לתנועה — בהכנה להופעה."
  };
}
