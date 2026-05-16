import { STUDIO_LK } from "@/lib/platform/constants";
import { getDirectoryUsers } from "@/lib/directory-store";
import { getStaffUserIds } from "@/lib/notification-logic";
import { STAFF_CHAT_ID } from "@/lib/communication-permissions";
import { isStudentRole } from "@/lib/studio-roster";
import type { ChatMessage, DanceGroupChat, Notification } from "@/lib/types";

function studentsInGroup(groupName: string): string[] {
  return getDirectoryUsers()
    .filter((u) => isStudentRole(u.permissions) && u.assignedGroups.includes(groupName))
    .map((u) => u.id);
}

export function seedGroupChats(): DanceGroupChat[] {
  const dance: DanceGroupChat[] = [
    {
      id: "chat_hh_sel", studioId: STUDIO_LK,
      chatType: "dance_group",
      groupId: "grp_hh_sel",
      groupName: "LK Hip Hop Crew",
      teacherIds: ["u_liata", "u_noa"],
      studentIds: studentsInGroup("LK Hip Hop Crew"),
      pinnedMessageIds: ["msg_pin_sel"]
    },
    {
      id: "chat_com_adv", studioId: STUDIO_LK,
      chatType: "dance_group",
      groupId: "grp_mod_adv",
      groupName: "Modern Ensemble",
      teacherIds: ["u_noa"],
      studentIds: studentsInGroup("Modern Ensemble"),
      pinnedMessageIds: []
    },
    {
      id: "chat_hh_teen", studioId: STUDIO_LK,
      chatType: "dance_group",
      groupId: "grp_hh_teen",
      groupName: "היפ הופ — מתבגרים",
      teacherIds: ["u_noa"],
      studentIds: studentsInGroup("היפ הופ — מתבגרים"),
      pinnedMessageIds: []
    },
    {
      id: "chat_hh_new", studioId: STUDIO_LK,
      chatType: "dance_group",
      groupId: "grp_hh_new",
      groupName: "היפ הופ — בסיס",
      teacherIds: ["u_noa"],
      studentIds: studentsInGroup("היפ הופ — בסיס"),
      pinnedMessageIds: []
    },
    {
      id: "chat_rep", studioId: STUDIO_LK,
      chatType: "dance_group",
      groupId: "grp_rep",
      groupName: "נבחרות — חזרות",
      teacherIds: ["u_liata"],
      studentIds: studentsInGroup("LK Hip Hop Crew"),
      pinnedMessageIds: []
    }
  ];

  const staffChat: DanceGroupChat = {
    id: STAFF_CHAT_ID,
    studioId: STUDIO_LK,
    chatType: "staff",
    groupName: "צוות הסטודיו",
    teacherIds: getStaffUserIds(),
    studentIds: [],
    pinnedMessageIds: ["msg_staff_pin"]
  };

  return [staffChat, ...dance];
}

export function seedChatMessages(): ChatMessage[] {
  return [
    {
      id: "msg_staff_pin",
      groupChatId: STAFF_CHAT_ID,
      senderUserId: "u_liata",
      senderName: "מנהלת סטודיו LK (דמו)",
      senderRoleLabel: "הנהלה",
      messageType: "text",
      body: "תזכורת: חזרת מופע סוף שנה בחמישי — נא לעדכן מורים על שינויי זמן לפני פרסום לתלמידים.",
      createdAt: "2026-05-14T07:30:00",
      isPinned: true,
      moderationStatus: "visible"
    },
    {
      id: "msg_staff_1",
      groupChatId: STAFF_CHAT_ID,
      senderUserId: "u_noa",
      senderName: "שירה מ. (דמו)",
      senderRoleLabel: "מורה",
      messageType: "note",
      body: "מאיה כהן מראה התקדמות חזקה בשבירה — ממליצה לשקול להעלות קושי בחזרה הבאה.",
      createdAt: "2026-05-14T10:00:00",
      isPinned: false,
      moderationStatus: "visible"
    },
    {
      id: "msg_pin_sel",
      groupChatId: "chat_hh_sel",
      senderUserId: "u_liata",
      senderName: "מנהלת סטודיו LK (דמו)",
      senderRoleLabel: "הנהלה",
      messageType: "text",
      body: "חזרה בחמישי 18:00 — תלבושת שחורה מלאה. הצ׳אט לשאלות על הקומבינציה והתרגול בלבד.",
      createdAt: "2026-05-13T09:00:00",
      isPinned: true,
      moderationStatus: "visible"
    },
    {
      id: "msg_sel_1",
      groupChatId: "chat_hh_sel",
      senderUserId: "u_maya",
      senderName: "מאיה כהן",
      senderRoleLabel: "תלמידה",
      messageType: "note",
      body: "שאלה על הכניסה לשבירה — האם להדגיש יד ימין או שמאל בפתיחה?",
      createdAt: "2026-05-13T16:20:00",
      isPinned: false,
      moderationStatus: "visible"
    },
    {
      id: "msg_sel_2",
      groupChatId: "chat_hh_sel",
      senderUserId: "u_noa",
      senderName: "שירה מ. (דמו)",
      senderRoleLabel: "מורה",
      messageType: "teacher_feedback",
      body: "מעולה ששאלת. בפתיחה — יד ימין מובילה, ושימי לב לקו גב בירידה.",
      replyToMessageId: "msg_sel_1",
      createdAt: "2026-05-13T17:05:00",
      isPinned: false,
      moderationStatus: "visible",
      reviewedAt: "2026-05-13T17:05:00"
    },
    {
      id: "msg_sel_vid",
      groupChatId: "chat_hh_sel",
      senderUserId: "u_maya",
      senderName: "מאיה כהן",
      senderRoleLabel: "תלמידה",
      messageType: "video",
      body: "העלאת תרגול — סיבוב מלא לפני חזרה",
      videoUrl: "mock://video/maya-combo-chat.mp4",
      attachedGoalId: "g_home",
      createdAt: "2026-05-14T11:30:00",
      isPinned: false,
      moderationStatus: "visible"
    },
    {
      id: "msg_sel_fb",
      groupChatId: "chat_hh_sel",
      senderUserId: "u_noa",
      senderName: "שירה מ. (דמו)",
      senderRoleLabel: "מורה",
      messageType: "teacher_feedback",
      body: "קצב טוב. בשבירה השנייה — עוד גובה בברך, וסיום רגליים חד.",
      replyToMessageId: "msg_sel_vid",
      createdAt: "2026-05-14T14:00:00",
      isPinned: false,
      moderationStatus: "visible"
    },
    {
      id: "msg_com_1",
      groupChatId: "chat_com_adv",
      senderUserId: "u_noa",
      senderName: "שירה מ. (דמו)",
      senderRoleLabel: "מורה",
      messageType: "text",
      body: "השבוע מתמקדים בפריסה במרחב — תרגול ביתי 12 דקות לפחות.",
      createdAt: "2026-05-12T10:00:00",
      isPinned: false,
      moderationStatus: "visible"
    },
    {
      id: "msg_com_vid",
      groupChatId: "chat_com_adv",
      senderUserId: "u_yuval",
      senderName: "יובל אברהם",
      senderRoleLabel: "תלמיד",
      messageType: "video",
      body: "סרטון טכניקה — Modern",
      videoUrl: "mock://video/yuval-tech.mp4",
      createdAt: "2026-05-14T09:15:00",
      isPinned: false,
      moderationStatus: "visible"
    },
    {
      id: "msg_teen_1",
      groupChatId: "chat_hh_teen",
      senderUserId: "u_tal",
      senderName: "טל מזרחי",
      senderRoleLabel: "תלמיד",
      messageType: "note",
      body: "האם אפשר לחזור על הקומבינציה מהשיעור האחרון בבית?",
      createdAt: "2026-05-14T08:40:00",
      isPinned: false,
      moderationStatus: "visible"
    }
  ];
}

/** Global notification store (broadcast records). */
export function seedNotifications(): Notification[] {
  return [
    {
      id: "notif_maya_fb", studioId: STUDIO_LK,
      title: "פידבק על סרטון תרגול",
      body: "שירה מ. (דמו) השאירה הערה בצ׳אט LK Hip Hop Crew",
      createdByUserId: "u_noa",
      createdByName: "שירה מ. (דמו)",
      targetType: "student",
      targetUserIds: ["u_maya"],
      priority: "important",
      relatedType: "chat",
      relatedId: "chat_hh_sel",
      readByUserIds: [],
      createdAt: "2026-05-14T14:05:00"
    },
    {
      id: "notif_sel_urgent", studioId: STUDIO_LK,
      title: "חזרה בחמישי — שינוי זמן",
      body: "עדכון דחוף מהסטודיו — קראי בלחיצה",
      createdByUserId: "u_liata",
      createdByName: "מנהלת סטודיו LK (דמו)",
      targetType: "dance_group",
      targetGroupIds: ["grp_hh_sel"],
      priority: "urgent",
      relatedType: "update",
      relatedId: "up_studio_urgent",
      readByUserIds: [],
      createdAt: "2026-05-14T08:05:00"
    },
    {
      id: "notif_maya_task", studioId: STUDIO_LK,
      title: "תזכורת משימה",
      body: "העלאת סרטון קומבינציה — מופע סוף שנה · LK Hip Hop Crew",
      createdByUserId: "u_noa",
      createdByName: "שירה מ. (דמו)",
      targetType: "student",
      targetUserIds: ["u_maya"],
      priority: "normal",
      relatedType: "task",
      relatedId: "st_group_sel_video",
      readByUserIds: ["u_maya"],
      createdAt: "2026-05-11T12:00:00"
    },
    {
      id: "notif_noa_video", studioId: STUDIO_LK,
      title: "סרטון חדש לבדיקה",
      body: "מאיה כהן העלתה תרגול לצ׳אט נבחרת",
      createdByUserId: "u_maya",
      createdByName: "מאיה כהן",
      targetType: "teacher",
      targetUserIds: ["u_noa"],
      priority: "important",
      relatedType: "chat",
      relatedId: "chat_hh_sel",
      readByUserIds: [],
      createdAt: "2026-05-14T11:35:00"
    },
    {
      id: "notif_liata_att", studioId: STUDIO_LK,
      title: "נוכחות ממתינה",
      body: "שיעור Modern — סימון לא הושלם",
      createdByUserId: "u_liata",
      createdByName: "מנהלת סטודיו LK (דמו)",
      targetType: "staff",
      priority: "important",
      relatedType: "attendance",
      relatedId: "att_sess_2",
      readByUserIds: [],
      createdAt: "2026-05-14T07:00:00"
    },
    {
      id: "notif_gallery_sel", studioId: STUDIO_LK,
      title: "חומר חדש בגלריה",
      body: "קומבינציה — שבירה וכניסה זמינה לצפייה",
      createdByUserId: "u_noa",
      createdByName: "שירה מ. (דמו)",
      targetType: "dance_group",
      targetGroupIds: ["grp_hh_sel"],
      priority: "normal",
      relatedType: "gallery",
      relatedId: "gal_sel_combo",
      readByUserIds: [],
      createdAt: "2026-05-12T10:30:00"
    }
  ];
}
