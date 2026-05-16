import type { StudioEvent } from "@/lib/types";

export function seedLegacyEvents(): StudioEvent[] {
  return [
    {
      id: "evt_end_year_show",
      title: "מופע סוף שנה",
      type: "performance",
      status: "future",
      date: "2026-05-27",
      location: "אולם הופעות — פרטים יפורסמו",
      participatingGroupIds: ["grp_hh_sel", "grp_rep", "grp_mod_adv", "grp_flamenco"],
      teacherIds: ["u_liata", "u_noa"],
      description:
        "ערב סוף שנה של הסטודיו. כניסה לפי הוראות שיישלחו לקבוצות. הגעה מוקדמת לחימום ולהתארגנות.",
      achievements: [],
      equipmentChecklist: ["תלבושת במה", "נעליים מתאימות", "מים"],
      scheduleNotes: "זמני כניסה ועלייה לבמה יפורסמו בקבוצות",
      parentApprovalRequired: false,
      isPublicToStudents: true,
      createdByUserId: "u_liata",
      createdAt: "2026-03-15T10:00:00"
    },
    {
      id: "evt_future_camp",
      title: "קייטנת ריקוד קיץ",
      type: "camp",
      status: "future",
      date: "2026-07-01",
      endDate: "2026-07-07",
      location: "סטודיו LK · כפר ויתקין",
      participatingGroupIds: ["grp_all"],
      teacherIds: ["u_noa", "u_liata"],
      description: "שבוע אינטנסיבי בסטודיו — שיעורים, חזרות וסיכום קהילתי למשפחות.",
      achievements: [],
      scheduleNotes: "לוח זמנים מפורט יישלח להורים",
      parentApprovalRequired: true,
      parentApprovalCount: 28,
      isPublicToStudents: true,
      createdByUserId: "u_liata",
      createdAt: "2026-04-15T09:00:00"
    },
    {
      id: "evt_current_showcase",
      title: "ערב הצגה — נבחרות",
      type: "showcase",
      status: "current",
      date: "2026-05-13",
      endDate: "2026-05-15",
      location: "אולם חזרות / הופעה — לפי פרסום",
      participatingGroupIds: ["grp_hh_sel", "grp_rep", "grp_mod_adv", "grp_flamenco"],
      participatingStudentIds: ["u_maya"],
      teacherIds: ["u_liata", "u_noa"],
      description: "חזרות גנרליות וערב הופעה לנבחרות. פרטי הגעה ותלבושת יעודכנו בקבוצות.",
      achievements: [],
      equipmentChecklist: ["תלבושת במה", "נעליים שחורות", "בקבוק מים"],
      scheduleNotes: "לוח חזרות יעודכן בשבוע ההופעה",
      parentApprovalRequired: false,
      isPublicToStudents: true,
      teacherNotes: [
        {
          id: "ln_1",
          userId: "u_noa",
          userName: "שירה מ. (דמו)",
          body: "לוודא כניסה בזמן בסאונד — ולעבור על פריסה במה עם הקבוצה.",
          createdAt: "2026-05-13T18:00:00"
        }
      ],
      createdByUserId: "u_liata",
      createdAt: "2026-03-01T12:00:00"
    },
    {
      id: "evt_past_show",
      title: "מופע סוף שנה — עונה קודמת",
      type: "performance",
      status: "past",
      date: "2026-03-22",
      location: "סטודיו LK",
      participatingGroupIds: ["grp_hh_sel", "grp_flamenco"],
      participatingStudentIds: ["u_maya"],
      teacherIds: ["u_noa", "u_liata"],
      description: "ערב הופעה למשפחות וחברים — תיעוד נשמר בגלריה לפי הרשאות.",
      achievements: [
        {
          id: "ach_3",
          title: "השתתפות בהופעה",
          description: "הופעה מלאה עם הקבוצה",
          place: "participation",
          groupId: "grp_hh_sel",
          studentIds: ["u_maya"],
          eventId: "evt_past_show",
          awardedAt: "2026-03-22T21:00:00"
        }
      ],
      memoryVideoUrl: "mock://legacy/end-year-show.mp4",
      memoryVideoThumbnailUrl: "mock://legacy/thumb/end-year.jpg",
      photoGalleryUrls: ["mock://photo/show1.jpg", "mock://photo/show2.jpg"],
      parentApprovalRequired: false,
      isPublicToStudents: true,
      createdByUserId: "u_liata",
      createdAt: "2026-02-01T09:00:00"
    },
    {
      id: "evt_internal_workshop",
      title: "סדנת פלמנקו בסטודיו",
      type: "workshop",
      status: "past",
      date: "2026-01-18",
      location: "סטודיו LK · כפר ויתקין",
      participatingGroupIds: ["grp_flamenco"],
      teacherIds: ["u_liata"],
      description: "מפגש העשרה על קצב, עיגון וביטוי — חומר לשילוב בשיעורים.",
      achievements: [],
      parentApprovalRequired: false,
      isPublicToStudents: true,
      createdByUserId: "u_liata",
      createdAt: "2026-01-05T08:00:00"
    }
  ];
}
