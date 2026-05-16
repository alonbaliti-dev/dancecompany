import { STUDIO_LK } from "@/lib/platform/constants";
import type { GalleryItem } from "@/lib/types";

export function seedGalleryItems(): GalleryItem[] {
  return [
    {
      id: "gal_sel_combo",
      studioId: STUDIO_LK,
      title: "LK Hip Hop Crew — שבירה וכניסה",
      description: "הדגמה מלאה לחזרת מופע סוף שנה. שימי לב ליישור כתפיים ולאנרגיית הבמה.",
      videoUrl: "mock://gallery/sel_combo.mp4",
      thumbnailUrl: "mock://thumb/sel_combo.jpg",
      createdByUserId: "u_noa",
      createdByName: "שירה מ. (דמו)",
      sourceType: "manual_upload",
      visibility: "student_group",
      assignedGroupIds: ["grp_hh_sel"],
      tags: ["כוריאוגרפיה", "מופע סוף שנה"],
      relatedTaskId: "st_group_sel_video",
      createdAt: "2026-05-12T10:00:00",
      isPinned: true
    },
    {
      id: "gal_flamenco",
      studioId: STUDIO_LK,
      title: "Junior Flamenco — קומפאס ועיגון",
      description: "חימום פלמנקו לפני חזרה — קצב, נשימה וביטוי. הדגמה בדמו.",
      videoUrl: "mock://gallery/flamenco_compas.mp4",
      createdByUserId: "u_liata",
      createdByName: "מנהלת סטודיו LK (דמו)",
      sourceType: "manual_upload",
      visibility: "student_group",
      assignedGroupIds: ["grp_flamenco"],
      tags: ["פלמנקו", "קצב"],
      createdAt: "2026-05-13T16:00:00",
      isPinned: true
    },
    {
      id: "gal_sel_stretch",
      studioId: STUDIO_LK,
      title: "מתיחות לפני חזרה",
      description: "חמש דקות חימום מומלצות לפני תרגול הביתי — ביטחון בגוף.",
      videoUrl: "mock://gallery/sel_stretch.mp4",
      createdByUserId: "u_liata",
      createdByName: "מנהלת סטודיו LK (דמו)",
      sourceType: "group_chat",
      sourceMessageId: "msg_sel_vid",
      visibility: "student_group",
      assignedGroupIds: ["grp_hh_sel"],
      tags: ["טכניקה", "גמישות"],
      createdAt: "2026-05-13T18:00:00",
      isPinned: false
    },
    {
      id: "gal_mod_adv",
      studioId: STUDIO_LK,
      title: "Modern Ensemble — קו ונשימה",
      description: "תרגיל מוביל מהשיעור — חיבור רגשי לתנועה.",
      videoUrl: "mock://gallery/mod_adv.mp4",
      createdByUserId: "u_noa",
      createdByName: "שירה מ. (דמו)",
      sourceType: "manual_upload",
      visibility: "student_group",
      assignedGroupIds: ["grp_mod_adv"],
      tags: ["מודרן", "ביטוי"],
      createdAt: "2026-05-11T14:00:00",
      isPinned: false
    },
    {
      id: "gal_rise_memory",
      studioId: STUDIO_LK,
      title: "זיכרון מהבמה — מופע סוף שנה",
      description: "רגע מההופעה — אנרגיית קהילה ורגש על הבמה.",
      videoUrl: "mock://gallery/rise_memory.mp4",
      createdByUserId: "u_liata",
      createdByName: "מנהלת סטודיו LK (דמו)",
      sourceType: "manual_upload",
      visibility: "student_group",
      assignedGroupIds: ["grp_hh_sel", "grp_flamenco", "grp_mod_adv"],
      tags: ["מופע סוף שנה", "מופע", "זיכרון"],
      createdAt: "2026-03-23T12:00:00",
      isPinned: false
    }
  ];
}
