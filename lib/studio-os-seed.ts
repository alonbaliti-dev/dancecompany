import { getSchedule } from "@/lib/schedule-access";
import { MOCK_TODAY } from "@/lib/studio-task-logic";
import { LEVEL_SKILLS } from "@/lib/studio-os-constants";
import type {
  LiveFeedPost,
  PracticeHeatmapDay,
  ProfessionalFeedbackEntry,
  RehearsalSession,
  RiskAlert,
  StudentLevelProgress,
  StudioCalendarEntry,
  StudioHealthSnapshot
} from "@/lib/types";

function daysAgo(n: number): string {
  const d = new Date(MOCK_TODAY);
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export function seedHeatmapDays(): PracticeHeatmapDay[] {
  const days: PracticeHeatmapDay[] = [];
  for (let i = 89; i >= 0; i--) {
    const d = daysAgo(i);
    const r = (i * 7 + 3) % 11;
    const minutes = r === 0 ? 0 : r < 3 ? 12 : r < 6 ? 28 : r < 9 ? 45 : 60;
    const level = (minutes === 0 ? 0 : minutes < 15 ? 1 : minutes < 30 ? 2 : minutes < 45 ? 3 : 4) as 0 | 1 | 2 | 3 | 4;
    days.push({ date: d, minutes, level });
  }
  return days;
}

export function seedStudentLevels(): Record<string, StudentLevelProgress> {
  const maya: StudentLevelProgress = {
    userId: "u_maya",
    currentLevel: "team",
    progressPct: 72,
    skills: LEVEL_SKILLS.team.map((label, i) => ({
      id: `sk_maya_${i}`,
      label,
      completed: i < 2,
      teacherApproved: i < 1
    }))
  };
  return { u_maya: maya };
}

export function seedFeedback(): ProfessionalFeedbackEntry[] {
  return [
    {
      id: "fb_1",
      studentId: "u_maya",
      teacherId: "u_noa",
      teacherName: "שירה מ. (דמו)",
      category: "technique",
      score: 8,
      note: "שיפור ברור בשבירה — להמשיך בגובה ברך.",
      visibleToStudent: true,
      relatedVideoId: "vid_1",
      createdAt: daysAgo(5) + "T14:00:00"
    },
    {
      id: "fb_2",
      studentId: "u_maya",
      teacherId: "u_noa",
      teacherName: "שירה מ. (דמו)",
      category: "energy",
      score: 9,
      note: "נוכחות במה טובה בהופעה האחרונה — מגמת שיפור.",
      visibleToStudent: true,
      relatedEventId: "evt_past_show",
      createdAt: daysAgo(20) + "T10:00:00"
    },
    {
      id: "fb_3",
      studentId: "u_maya",
      teacherId: "u_liata",
      teacherName: "מנהלת סטודיו LK (דמו)",
      category: "teamwork",
      score: 7,
      note: "לעודד יותר תמיכה בזוגות בחזרה — פנימי לצוות.",
      visibleToStudent: false,
      createdAt: daysAgo(2) + "T09:00:00"
    }
  ];
}

export function seedRehearsalSessions(): RehearsalSession[] {
  return [
    {
      id: "reh_showcase",
      title: "חזרה גנרלית — ערב הצגה",
      groupId: "grp_hh_sel",
      eventId: "evt_current_showcase",
      date: daysAgo(0),
      musicLabel: "Showcase Mix v3.mp3",
      orderOfAppearance: ["פתיחה קבוצתית", "סולו מאיה", "קומבינציה נבחרת", "פינאלה"],
      equipmentChecklist: [
        { item: "מיקרופונים במה", done: true },
        { item: "תאורה — בדיקה", done: false },
        { item: "רשימת נוכחות", done: true }
      ],
      attendance: [
        { studentId: "u_maya", name: "מאיה כהן", present: true },
        { studentId: "u_tal", name: "טל מזרחי", present: null }
      ],
      notes: "להדגיש כניסה לשבירה אחרי הפסקה.",
      studentBrief: {
        arriveBy: "17:30",
        location: "תיאטרון העיר — כניסה אחורית",
        bring: ["תלבושת במה", "מים", "נעלי ריקוד נקיות"],
        lineupPosition: 2
      }
    }
  ];
}

export function seedLiveFeed(eventId = "evt_current_showcase"): LiveFeedPost[] {
  return [
    {
      id: "lf_1",
      eventId,
      status: "arrived",
      message: "הנבחרת הגיעה לאולם — התחלת חימום.",
      createdByUserId: "u_noa",
      createdByName: "שירה מ. (דמו)",
      createdAt: daysAgo(0) + "T16:00:00",
      parentVisible: true
    },
    {
      id: "lf_2",
      eventId,
      status: "warming_up",
      message: "חימום קבוצתי בעיצומו.",
      createdByUserId: "u_liata",
      createdByName: "מנהלת סטודיו LK (דמו)",
      createdAt: daysAgo(0) + "T16:45:00",
      parentVisible: true
    }
  ];
}

export function seedRiskAlerts(): RiskAlert[] {
  return [
    {
      id: "risk_1",
      severity: "high",
      title: "ירידה בנוכחות",
      detail: "היפ הופ — מתבגרים — 3 תלמידים חסרו בשבועיים האחרונים.",
      groupId: "grp_hh_teen",
      kind: "attendance"
    },
    {
      id: "risk_2",
      severity: "medium",
      title: "משימות פתוחות",
      detail: "Modern Ensemble — השלמה נמוכה מהממוצע.",
      groupId: "grp_mod_adv",
      kind: "tasks"
    },
    {
      id: "risk_3",
      severity: "low",
      title: "חוסר עדכון נוכחות",
      detail: "שיעור אתמול — סימון לא הושלם.",
      teacherId: "u_noa",
      kind: "teacher_ops"
    },
    {
      id: "risk_4",
      severity: "medium",
      title: "תרגול ביתי דליל",
      detail: "מאיה כהן — לא הועלה תרגול בשבוע האחרון.",
      studentId: "u_maya",
      kind: "inactive"
    }
  ];
}

export function seedCalendarEntries(): StudioCalendarEntry[] {
  const fromSchedule: StudioCalendarEntry[] = getSchedule().map((c, i) => ({
    id: `cal_cls_${i}`,
    title: c.title,
    type: "class" as const,
    date: daysAgo(c.section === "today" ? 0 : 2),
    time: c.time,
    groupName: c.group,
    teacherId: "u_noa",
    location: c.room
  }));
  return [
    ...fromSchedule,
    {
      id: "cal_reh",
      title: "חזרה גנרלית",
      type: "rehearsal",
      date: daysAgo(0),
      time: "18:00",
      groupId: "grp_hh_sel",
      groupName: "LK Hip Hop Crew",
      location: "תיאטרון העיר"
    },
    {
      id: "cal_comp",
      title: "תחרות ארצית",
      type: "competition",
      date: "2026-06-20",
      groupId: "grp_hh_sel",
      groupName: "LK Hip Hop Crew"
    },
    {
      id: "cal_bday",
      title: "יום הולדת — מאיה",
      type: "birthday",
      date: daysAgo(-12),
      groupName: "LK Hip Hop Crew"
    }
  ];
}

export function seedStudioHealth(): StudioHealthSnapshot {
  return {
    score: 78,
    alertsCount: 4,
    teacherActivityPct: 86,
    lowEngagementGroups: ["היפ הופ — מתבגרים", "Modern Ensemble"],
    urgentUpdates: 2
  };
}

export function seedAiDailyForStudent(userId: string) {
  if (userId === "u_maya") {
    return {
      title: "שכפול קומבינציה לחזרה",
      why: "לפני חזרת הערב: לחזק נוכחות במה ואת הכניסה מפידבק נועה.",
      durationMinutes: 18,
      relatedTaskId: "st_group_sel_video",
      relatedVideoLabel: "סרטון LK Hip Hop Crew"
    };
  }
  return {
    title: "חימום + קצב",
    why: "שמירה על רצף — טכניקה וביטוי יחד, בקצב של LK.",
    durationMinutes: 12
  };
}
