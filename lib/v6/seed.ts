import type { Academy, V6Database, V6Permissions, V6Role } from "./types";
import aiPrompts from "@/database/ai-prompts.json";
import aiInsights from "@/database/ai-insights.json";
import { normalizeV6Database } from "./dedupe";

export const roleLabel: Record<V6Role, string> = {
  student: "תלמיד/ה",
  parent: "הורה",
  teacher: "מורה",
  management: "הנהלה",
  super_admin: "מנהל האפליקציה"
};

export function permissionsFor(role: V6Role): V6Permissions {
  const empty: V6Permissions = {
    manageUsers: false,
    editCredentials: false,
    editPermissions: false,
    manageStudio: false,
    manageAttendance: false,
    manageShop: false,
    managePrivateLessons: false,
    manageMedia: false,
    exportImportDb: false,
    editText: false,
    viewAudit: false,
    manageFlags: false,
    manageBranding: false,
    systemHealth: false
  };
  if (role === "super_admin") return Object.fromEntries(Object.keys(empty).map((key) => [key, true])) as V6Permissions;
  if (role === "management") {
    return {
      ...empty,
      manageUsers: true,
      editCredentials: true,
      editPermissions: true,
      manageStudio: true,
      manageAttendance: true,
      manageShop: true,
      managePrivateLessons: true,
      manageMedia: true,
      exportImportDb: true,
      editText: true,
      viewAudit: true,
      manageFlags: true,
      manageBranding: true
    };
  }
  if (role === "teacher") {
    return { ...empty, manageAttendance: true, managePrivateLessons: true, manageMedia: true };
  }
  return empty;
}

export const DEFAULT_ACADEMY_ID = "lk-studio";
export const DEFAULT_ACADEMY_SLUG = "lk-studio";

const studioId = DEFAULT_ACADEMY_ID;

export const lkStudioAcademy: Academy = {
  id: DEFAULT_ACADEMY_ID,
  name: "LK Studio by Liat Kaplinski",
  slug: DEFAULT_ACADEMY_SLUG,
  location: "כפר ויתקין, ישראל",
  country: "Israel",
  timezone: "Asia/Jerusalem",
  status: "active",
  branding: {
    name: "LK Student Space",
    tagline: "מרחב פרימיום למחול, התקדמות וקהילה",
    accent: "gold",
    displayName: "LK Studio",
    accentColors: {
      primary: "#D7B56D",
      secondary: "#8A6A2D",
      highlight: "#F6E6B5"
    },
    backgroundMood: "premium dark luxury with warm stage lighting",
    danceStylePalette: ["flamenco", "classical", "modern", "hip-hop"],
    heroImagery: ["warm-stage-light", "elegant-dance-silhouette", "kfar-vitkin-studio"],
    typographyPreference: "Hebrew RTL-first, elegant and readable",
    shopMood: "boutique studio merchandise and event tickets",
    eventMood: "annual show, rehearsals, competitions and backstage readiness",
    galleryMood: "studio memories, lesson timelines and approved public moments",
    pwaAppName: "LK Student Space"
  },
  settings: {
    defaultLocale: "he-IL",
    direction: "rtl",
    defaultRouteStrategy: "/academy/[slug]",
    communicationMode: "mixed",
    schoolYearLabel: "2025-2026",
    adultGroupsEnabled: true,
    superAdminUserIds: ["alon"],
    enabledFeatureFlags: [
      "shop",
      "private_lessons",
      "media_gallery",
      "ai_insights",
      "event_mode",
      "attendance",
      "payments",
      "public_legacy_gallery",
      "adult_groups",
      "student_uploads",
      "daily_practice"
    ],
    mediaStorage: {
      provider: "cloudflare-r2",
      bucket: "academy-media",
      keyPrefix: "academies/lk-studio",
      privateByDefault: true
    }
  },
  createdAt: "2026-05-16T09:00:00.000Z",
  updatedAt: "2026-05-17T17:00:00.000Z"
};

export const safeInitialV6Database: V6Database = {
  version: 6,
  studios: [lkStudioAcademy],
  academies: [lkStudioAcademy],
  users: [
    { id: "alon", studioId, academyId: studioId, academyIds: [studioId], activeAcademyId: studioId, platformRole: "super_admin", name: "אלון בליטי", role: "super_admin", phone: "0501110000", permissions: permissionsFor("super_admin"), groupIds: [], linkedStudentIds: [], status: "active", responsibility: "ניהול האפליקציה, אקדמיות, בריאות מערכת, מדיה, גיבויים ובקרה", active: true },
    { id: "liat", studioId, name: "ליאת קפלינסקי", role: "management", phone: "0502220000", permissions: permissionsFor("management"), groupIds: ["flamenco_adults"], linkedStudentIds: [], status: "active", responsibility: "ניהול סטודיו ופדגוגיה", active: true },
    { id: "shahar", studioId, name: "שחר קפלינסקי", role: "management", phone: "0502220001", permissions: permissionsFor("management"), groupIds: [], linkedStudentIds: [], active: true },
    { id: "office", studioId, name: "מזכירה / משרד", role: "management", phone: "0502220002", permissions: permissionsFor("management"), groupIds: [], linkedStudentIds: [], active: true },
    { id: "simor", studioId, name: "סימור דניאל", role: "teacher", phone: "0503330001", permissions: permissionsFor("teacher"), groupIds: ["hiphop_middle"], linkedStudentIds: [], active: true },
    { id: "yakir", studioId, name: "יקיר גבאי", role: "teacher", phone: "0503330002", permissions: permissionsFor("teacher"), groupIds: ["hiphop_middle"], linkedStudentIds: [], active: true },
    { id: "daniel", studioId, name: "דניאל חזן", role: "teacher", phone: "0503330003", permissions: permissionsFor("teacher"), groupIds: ["hiphop_middle"], linkedStudentIds: [], active: true },
    { id: "almog", studioId, name: "אלמוג דוד", role: "teacher", phone: "0503330004", permissions: permissionsFor("teacher"), groupIds: ["modern_high"], linkedStudentIds: [], active: true },
    { id: "shabi", studioId, name: "שבי שלום אברמוביץ", role: "teacher", phone: "0503330005", permissions: permissionsFor("teacher"), groupIds: ["early_movement", "modern_high", "classic_elementary"], linkedStudentIds: [], active: true },
    { id: "lena", studioId, name: "לנה קרושקו", role: "teacher", phone: "0503330006", permissions: permissionsFor("teacher"), groupIds: ["classic_elementary", "pointe_high"], linkedStudentIds: [], active: true },
    { id: "michael", studioId, name: "מיכאל שניידר", role: "teacher", phone: "0503330007", permissions: permissionsFor("teacher"), groupIds: ["classic_elementary"], linkedStudentIds: [], active: true },
    { id: "igal", studioId, name: "יגאל משינסקי", role: "teacher", phone: "0503330008", permissions: permissionsFor("teacher"), groupIds: ["classic_elementary"], linkedStudentIds: [], active: true },
    { id: "kornelia", studioId, name: "קורנליה זוהר", role: "teacher", phone: "0503330009", permissions: permissionsFor("teacher"), groupIds: ["repertoire_high"], linkedStudentIds: [], active: true },
    { id: "student_tamar", studioId, name: "תמר בן דוד", role: "student", phone: "0504440000", permissions: permissionsFor("student"), groupIds: ["early_movement"], linkedStudentIds: [], linkedParentIds: ["parent_dana"], ageGroup: "גיל הרך", danceStyleIds: ["תנועה יצירתית"], status: "active", active: true },
    { id: "student_noa", studioId, name: "נועה כהן", role: "student", phone: "0504440001", permissions: permissionsFor("student"), groupIds: ["modern_high"], linkedStudentIds: [], linkedParentIds: ["parent_ronit"], ageGroup: "תיכון", danceStyleIds: ["מודרני"], status: "active", active: true },
    { id: "student_maya", studioId, name: "מאיה לוי", role: "student", phone: "0504440002", permissions: permissionsFor("student"), groupIds: ["hiphop_middle"], linkedStudentIds: [], ageGroup: "חטיבה", danceStyleIds: ["היפ הופ"], status: "active", active: true },
    { id: "student_yael_adult", studioId, name: "יעל רוזן", role: "student", phone: "0504440080", permissions: permissionsFor("student"), groupIds: ["flamenco_adults"], linkedStudentIds: [], linkedParentIds: [], ageGroup: "מבוגרים", danceStyleIds: ["פלמנקו"], communicationPrefs: "תקשורת ישירה", status: "active", active: true },
    { id: "parent_dana", studioId, name: "דנה בן דוד", role: "parent", phone: "0505550000", permissions: permissionsFor("parent"), groupIds: [], linkedStudentIds: ["student_tamar"], communicationPrefs: "וואטסאפ", primaryContact: true, status: "active", active: true },
    { id: "parent_ronit", studioId, name: "רונית כהן", role: "parent", phone: "0505550001", permissions: permissionsFor("parent"), groupIds: [], linkedStudentIds: ["student_noa"], communicationPrefs: "וואטסאפ", primaryContact: true, status: "active", active: true }
  ],
  credentials: [
    { userId: "alon", phone: "0501110000", password: "creator2026" },
    { userId: "liat", phone: "0502220000", password: "lk2026" },
    { userId: "simor", phone: "0503330001", password: "teacher2026" },
    { userId: "student_noa", phone: "0504440001", password: "student2026" },
    { userId: "student_yael_adult", phone: "0504440080", password: "adult2026" },
    { userId: "parent_ronit", phone: "0505550001", password: "parent2026" }
  ],
  ageGroups: [
    { id: "age_early", studioId, stage: "early_childhood", name: "גיל הרך", ageRange: "3-4", sortOrder: 10, parentVisibilityDefault: true, communicationMode: "parent", notes: "תוכן והודעות דרך הורים." },
    { id: "age_kindergarten", studioId, stage: "kindergarten", name: "גן", ageRange: "5-6", sortOrder: 20, parentVisibilityDefault: true, communicationMode: "parent" },
    { id: "age_elementary", studioId, stage: "elementary", name: "יסודי", ageRange: "7-12", sortOrder: 30, parentVisibilityDefault: true, communicationMode: "parent" },
    { id: "age_middle", studioId, stage: "middle_school", name: "חטיבה", ageRange: "13-15", sortOrder: 40, parentVisibilityDefault: true, communicationMode: "mixed" },
    { id: "age_high", studioId, stage: "high_school", name: "תיכון", ageRange: "16-18", sortOrder: 50, parentVisibilityDefault: true, communicationMode: "mixed" },
    { id: "age_adults", studioId, stage: "adults", name: "מבוגרים", ageRange: "18-80", sortOrder: 60, parentVisibilityDefault: false, communicationMode: "direct", notes: "תקשורת ישירה מול הרוקדים/ות, ללא הנחת קישור הורים." }
  ],
  danceStyles: [
    { id: "style_creative", studioId, name: "תנועה יצירתית", category: "other", active: true },
    { id: "style_flamenco", studioId, name: "פלמנקו", category: "flamenco", active: true },
    { id: "style_hiphop", studioId, name: "היפ הופ", category: "hiphop", active: true },
    { id: "style_modern", studioId, name: "מודרני", category: "modern", active: true },
    { id: "style_classic", studioId, name: "קלאסי", category: "ballet", active: true },
    { id: "style_repertoire", studioId, name: "רפרטואר", category: "repertoire", active: true },
    { id: "style_pointe", studioId, name: "פוינט", category: "ballet", active: true }
  ],
  groups: [
    { id: "early_movement", studioId, name: "גיל הרך · תנועה יצירתית", style: "תנועה יצירתית", ageGroup: "גיל הרך", ageGroupId: "age_early", danceStyle: "תנועה יצירתית", danceStyleId: "style_creative", schedule: "ראשון 16:15", teacherIds: ["shabi"], studentIds: ["student_tamar"], yearlyEventIds: ["event_show"], galleryCollectionIds: ["gallery_current_year"], parentVisibility: true, communicationMode: "parent", location: "סטודיו 3" },
    { id: "flamenco_adults", studioId, name: "פלמנקו מבוגרים", style: "פלמנקו", ageGroup: "מבוגרים", ageGroupId: "age_adults", danceStyle: "פלמנקו", danceStyleId: "style_flamenco", schedule: "ראשון 19:30", teacherIds: ["liat"], studentIds: ["student_yael_adult"], yearlyEventIds: ["event_flamenco_rehearsal", "event_show"], galleryCollectionIds: ["gallery_flamenco"], parentVisibility: false, communicationMode: "direct", location: "סטודיו 1", notes: "קבוצת מבוגרים עם תקשורת ישירה ואירועי פלמנקו." },
    { id: "hiphop_middle", studioId, name: "היפ הופ חטיבה", style: "היפ הופ", ageGroup: "חטיבה", ageGroupId: "age_middle", danceStyle: "היפ הופ", danceStyleId: "style_hiphop", schedule: "שני 18:30", teacherIds: ["simor", "yakir", "daniel"], studentIds: ["student_maya"], yearlyEventIds: ["event_competition", "event_show"], parentVisibility: true, communicationMode: "mixed", location: "סטודיו 2" },
    { id: "modern_high", studioId, name: "מודרני תיכון", style: "מודרני", ageGroup: "תיכון", ageGroupId: "age_high", danceStyle: "מודרני", danceStyleId: "style_modern", schedule: "שלישי 17:45", teacherIds: ["almog", "shabi"], studentIds: ["student_noa"], yearlyEventIds: ["event_general_rehearsal", "event_competition", "event_show"], galleryCollectionIds: ["gallery_show"], parentVisibility: true, communicationMode: "mixed", location: "סטודיו 1" },
    { id: "classic_elementary", studioId, name: "קלאסי יסודי", style: "קלאסי", ageGroup: "יסודי", ageGroupId: "age_elementary", danceStyle: "קלאסי", danceStyleId: "style_classic", schedule: "רביעי 16:30", teacherIds: ["shabi", "lena", "michael", "igal"], studentIds: [], parentVisibility: true, communicationMode: "parent", location: "סטודיו 3" },
    { id: "repertoire_high", studioId, name: "רפרטואר תיכון", style: "רפרטואר", ageGroup: "תיכון", ageGroupId: "age_high", danceStyle: "רפרטואר", danceStyleId: "style_repertoire", teacherIds: ["kornelia"], studentIds: [], parentVisibility: true, communicationMode: "mixed" },
    { id: "pointe_high", studioId, name: "פוינט תיכון", style: "פוינט", ageGroup: "תיכון", ageGroupId: "age_high", danceStyle: "פוינט", danceStyleId: "style_pointe", teacherIds: ["lena"], studentIds: [], parentVisibility: true, communicationMode: "mixed" }
  ],
  lessons: [
    { id: "lesson_early", studioId, groupId: "early_movement", title: "תנועה יצירתית", weekday: "ראשון", time: "16:15", room: "סטודיו 3" },
    { id: "lesson_flamenco", studioId, groupId: "flamenco_adults", title: "פלמנקו מבוגרים", weekday: "ראשון", time: "19:30", room: "סטודיו 1" },
    { id: "lesson_hiphop", studioId, groupId: "hiphop_middle", title: "היפ הופ חטיבה", weekday: "שני", time: "18:30", room: "סטודיו 2" },
    { id: "lesson_modern", studioId, groupId: "modern_high", title: "מודרני תיכון", weekday: "שלישי", time: "17:45", room: "סטודיו 1" },
    { id: "lesson_classic", studioId, groupId: "classic_elementary", title: "קלאסי יסודי", weekday: "רביעי", time: "16:30", room: "סטודיו 3" }
  ],
  messages: [
    { id: "msg_welcome", studioId, title: "ברוכים הבאים", body: "מרחב חדש, נקי ונוח ליום־יום של הסטודיו.", createdAt: "2026-05-16T09:00:00.000Z" }
  ],
  notifications: [
    { id: "ntf_welcome", studioId, userIds: ["alon"], title: "האפליקציה מוכנה לבדיקה", body: "המסך הראשי נטען ומוכן להמשך עבודה.", type: "system", tab: "dashboard", readBy: [], createdAt: "2026-05-16T09:00:00.000Z" }
  ],
  products: [
    { id: "prod_bottle", studioId, title: "בקבוק LK", description: "בקבוק אימון אלגנטי לשיעורים וחזרות.", category: "אביזרים", type: "accessory", price: 59, priceMode: "paid", inventoryStatus: "in_stock", visibility: "public", active: true, imageMediaIds: [] },
    { id: "prod_ticket", studioId, title: "כרטיס למופע סוף שנה", description: "כניסה לאירוע המרכזי של הסטודיו.", category: "כרטיסים", type: "event_ticket", price: 85, priceMode: "paid", inventoryStatus: "limited", visibility: "public", eventId: "event_show", active: true, imageMediaIds: [] },
    { id: "prod_private_30", studioId, title: "שיעור פרטי 30 דקות", description: "בקשת זמינות, בחירת מועד ותשלום.", category: "שיעורים פרטיים", type: "private_lesson", price: 150, priceMode: "paid", inventoryStatus: "preorder", visibility: "members", active: true, imageMediaIds: [] }
  ],
  privateLessons: [],
  media: [],
  attendance: [
    { id: "att_tamar_1", studioId, studentId: "student_tamar", lessonId: "lesson_early", groupId: "early_movement", classDate: "2026-05-17", status: "present", createdAt: "2026-05-17T09:00:00.000Z" },
    { id: "att_noa_1", studioId, studentId: "student_noa", lessonId: "lesson_modern", groupId: "modern_high", classDate: "2026-05-17", status: "present", createdAt: "2026-05-16T09:00:00.000Z" },
    { id: "att_yael_1", studioId, studentId: "student_yael_adult", lessonId: "lesson_flamenco", groupId: "flamenco_adults", classDate: "2026-05-17", status: "present", createdAt: "2026-05-17T19:00:00.000Z" }
  ],
  tasks: [
    { id: "task_modern", groupId: "modern_high", title: "חזרה על קומבינציה למופע", doneByUserIds: [] },
    { id: "task_flamenco", groupId: "flamenco_adults", title: "בדיקת ציוד פלמנקו לחזרה", doneByUserIds: ["student_yael_adult"] }
  ],
  events: [
    { id: "event_flamenco_rehearsal", studioId, title: "חזרת פלמנקו מבוגרים", type: "rehearsal", date: "2026-05-24", startTime: "19:30", endTime: "21:00", location: "סטודיו 1", schoolYear: "2025-2026", groupIds: ["flamenco_adults"], studentIds: ["student_yael_adult"], teacherIds: ["liat"], ageGroupIds: ["age_adults"], danceStyleIds: ["style_flamenco"], whatToBring: ["נעלי פלמנקו", "בקבוק מים"], adultInstructions: "הגעה ישירה לסטודיו, ללא צורך בקישור הורים.", attachmentMediaIds: [], galleryCollectionIds: ["gallery_flamenco"], status: "scheduled", reminderIds: [], createdAt: "2026-05-16T09:00:00.000Z" },
    { id: "event_general_rehearsal", studioId, title: "חזרה כללית למופע", type: "general_rehearsal", date: "2026-06-12", startTime: "17:00", endTime: "21:30", location: "אולם מופעים", schoolYear: "2025-2026", groupIds: ["early_movement", "modern_high", "flamenco_adults"], studentIds: ["student_tamar", "student_noa", "student_yael_adult"], teacherIds: ["shabi", "almog", "liat"], ageGroupIds: ["age_early", "age_high", "age_adults"], danceStyleIds: ["style_creative", "style_modern", "style_flamenco"], whatToBring: ["תלבושת מלאה", "מים", "חטיף קל"], parentInstructions: "הורים לילדים צעירים מקבלים זמני הגעה ואיסוף.", adultInstructions: "תלמידי מבוגרים מקבלים הודעות ישירות.", attachmentMediaIds: [], galleryCollectionIds: ["gallery_show"], status: "needs_attention", reminderIds: [], createdAt: "2026-05-16T09:00:00.000Z" },
    { id: "event_competition", studioId, title: "תחרות מחול", type: "competition", date: "2026-06-05", startTime: "10:00", location: "אולם חיצוני", schoolYear: "2025-2026", groupIds: ["hiphop_middle", "modern_high"], studentIds: ["student_maya", "student_noa"], teacherIds: ["simor", "almog"], ageGroupIds: ["age_middle", "age_high"], danceStyleIds: ["style_hiphop", "style_modern"], whatToBring: ["תלבושת", "אישור הורים", "ציוד אישי"], parentInstructions: "אישור והסעות יוזנו על ידי ההנהלה.", attachmentMediaIds: [], galleryCollectionIds: ["gallery_competition"], status: "needs_attention", reminderIds: [], createdAt: "2026-05-16T09:00:00.000Z" },
    { id: "event_show", studioId, title: "מופע סוף שנה", type: "annual_show", date: "2026-06-20", startTime: "18:30", location: "היכל התרבות", schoolYear: "2025-2026", groupIds: ["early_movement", "hiphop_middle", "modern_high", "flamenco_adults"], studentIds: ["student_tamar", "student_maya", "student_noa", "student_yael_adult"], teacherIds: ["shabi", "simor", "almog", "liat"], ageGroupIds: ["age_early", "age_middle", "age_high", "age_adults"], danceStyleIds: ["style_creative", "style_hiphop", "style_modern", "style_flamenco"], whatToBring: ["תלבושת מופע", "מים", "איפור לפי הנחיה"], parentInstructions: "זמני הגעה, איסוף וכרטיסים יעודכנו על ידי ההנהלה.", adultInstructions: "קבוצת המבוגרים מקבלת זמני הגעה וציוד ישירות.", attachmentMediaIds: [], galleryCollectionIds: ["gallery_show"], status: "scheduled", reminderIds: [], ticketProductId: "prod_ticket", createdAt: "2026-05-16T09:00:00.000Z" }
  ],
  eventParticipants: [
    { id: "ep_tamar_show", studioId, eventId: "event_show", studentId: "student_tamar", groupId: "early_movement", status: "confirmed", costumeStatus: "in_progress", equipmentStatus: "ready", approvalStatus: "pending", ticketStatus: "pending" },
    { id: "ep_noa_show", studioId, eventId: "event_show", studentId: "student_noa", groupId: "modern_high", status: "confirmed", costumeStatus: "ready", equipmentStatus: "ready", approvalStatus: "approved", ticketStatus: "pending" },
    { id: "ep_yael_show", studioId, eventId: "event_show", studentId: "student_yael_adult", groupId: "flamenco_adults", status: "confirmed", costumeStatus: "ready", equipmentStatus: "ready", approvalStatus: "not_required", ticketStatus: "not_required" },
    { id: "ep_noa_comp", studioId, eventId: "event_competition", studentId: "student_noa", groupId: "modern_high", status: "confirmed", costumeStatus: "in_progress", equipmentStatus: "ready", approvalStatus: "approved", ticketStatus: "not_required" },
    { id: "ep_maya_comp", studioId, eventId: "event_competition", studentId: "student_maya", groupId: "hiphop_middle", status: "invited", costumeStatus: "missing", equipmentStatus: "in_progress", approvalStatus: "pending", ticketStatus: "not_required" }
  ],
  eventGroups: [
    { id: "eg_show_flamenco", studioId, eventId: "event_show", groupId: "flamenco_adults", role: "featured", rehearsalEventIds: ["event_flamenco_rehearsal"], generalRehearsalEventId: "event_general_rehearsal", callTime: "17:40", costumeNotes: "שמלה/אביזר לפי הנחיית המורה", equipmentNotes: "נעלי פלמנקו" },
    { id: "eg_show_modern", studioId, eventId: "event_show", groupId: "modern_high", role: "participant", rehearsalEventIds: ["event_general_rehearsal"], generalRehearsalEventId: "event_general_rehearsal", callTime: "17:15" },
    { id: "eg_comp_multi", studioId, eventId: "event_competition", groupId: "modern_high", role: "participant", rehearsalEventIds: ["event_general_rehearsal"], callTime: "08:30" }
  ],
  eventChecklists: [
    { id: "chk_show_costumes", studioId, eventId: "event_show", title: "וידוא תלבושות לכל הקבוצות", ownerRole: "management", category: "costume", status: "in_progress", dueDate: "2026-06-10", groupIds: ["early_movement", "modern_high", "flamenco_adults"], studentIds: [] },
    { id: "chk_comp_approvals", studioId, eventId: "event_competition", title: "אישורי הורים לתחרות", ownerRole: "office", category: "communication", status: "open", dueDate: "2026-05-28", groupIds: ["hiphop_middle", "modern_high"], studentIds: ["student_maya"] },
    { id: "chk_show_media", studioId, eventId: "event_show", title: "פתיחת אלבום מדיה לאחר המופע", ownerRole: "management", category: "media", status: "open", groupIds: ["early_movement", "hiphop_middle", "modern_high", "flamenco_adults"], studentIds: [] }
  ],
  eventMedia: [],
  galleryCollections: [
    { id: "gallery_current_year", studioId, title: "שנת 2025-2026", kind: "current_year", schoolYear: "2025-2026", groupIds: ["early_movement", "hiphop_middle", "modern_high", "flamenco_adults"], danceStyleIds: [], visibility: "students", description: "אלבום שנה נוכחית לפי קבוצות ואירועים.", itemIds: [], createdAt: "2026-05-16T09:00:00.000Z" },
    { id: "gallery_show", studioId, title: "מופע סוף שנה", kind: "annual_show", schoolYear: "2025-2026", groupIds: ["early_movement", "hiphop_middle", "modern_high", "flamenco_adults"], eventId: "event_show", danceStyleIds: [], visibility: "parents", description: "אלבום מופע מאושר לאחר סינון הנהלה.", itemIds: [], createdAt: "2026-05-16T09:00:00.000Z" },
    { id: "gallery_competition", studioId, title: "תחרויות", kind: "competition", schoolYear: "2025-2026", groupIds: ["hiphop_middle", "modern_high"], eventId: "event_competition", danceStyleIds: ["style_hiphop", "style_modern"], visibility: "staff", description: "מדיה ותיעוד תחרויות, ללא הישגים מומצאים.", itemIds: [], createdAt: "2026-05-16T09:00:00.000Z" },
    { id: "gallery_flamenco", studioId, title: "פלמנקו מבוגרים", kind: "group", schoolYear: "2025-2026", groupIds: ["flamenco_adults"], danceStyleIds: ["style_flamenco"], visibility: "students", description: "אלבום קבוצת מבוגרים עם תקשורת ישירה.", itemIds: [], createdAt: "2026-05-16T09:00:00.000Z" }
  ],
  galleryItems: [],
  achievements: [
    { id: "ach_placeholder_management", studioId, title: "מקום להישג שיוזן על ידי ההנהלה", category: "milestone", date: "2026-05-16", studentIds: [], groupIds: [], mediaIds: [], description: "רשומה לדוגמה להישג עתידי. אין כאן תיאור זכייה או היסטוריה אמיתית.", visibility: "management", enteredByUserId: "liat", createdAt: "2026-05-16T09:00:00.000Z" }
  ],
  legacyEntries: [
    { id: "legacy_placeholder_archive", studioId, title: "רשומת ארכיון לניהול עתידי", category: "archive_note", schoolYear: "2025-2026", groupIds: [], studentIds: [], mediaIds: [], summary: "מקום מסודר לזיכרונות, מופעים, תחרויות וסיכומים שיוזנו ידנית על ידי ההנהלה.", visibility: "management", enteredByUserId: "liat", status: "draft", createdAt: "2026-05-16T09:00:00.000Z" }
  ],
  showReadiness: [
    { id: "ready_show_all", studioId, eventId: "event_show", score: 76, rehearsalStatus: "in_progress", costumeStatus: "in_progress", equipmentStatus: "ready", approvalsMissing: ["student_tamar"], attendanceRiskStudentIds: [], ticketStatus: "open", nextAction: "לסגור אישורי הורים ותלבושות לקבוצות הצעירות.", updatedAt: "2026-05-16T09:00:00.000Z" },
    { id: "ready_comp_modern", studioId, eventId: "event_competition", groupId: "modern_high", score: 68, rehearsalStatus: "in_progress", costumeStatus: "in_progress", equipmentStatus: "ready", approvalsMissing: ["student_maya"], attendanceRiskStudentIds: [], ticketStatus: "not_required", nextAction: "לאשר השתתפות ולסגור תלבושת לתחרות.", updatedAt: "2026-05-16T09:00:00.000Z" }
  ],
  competitionResults: [
    { id: "comp_result_placeholder", studioId, eventId: "event_competition", groupIds: ["hiphop_middle", "modern_high"], studentIds: [], title: "תוצאה תוזן לאחר התחרות על ידי ההנהלה", category: "תחרות", resultText: "אין תוצאה אמיתית במידע הראשוני.", mediaIds: [], enteredByUserId: "liat", createdAt: "2026-05-16T09:00:00.000Z" }
  ],
  editableTexts: {
    loginTitle: "LK Student Space",
    loginSubtitle: "מרחב פרימיום למחול, התקדמות וקהילה"
  },
  aiPrompts: aiPrompts as V6Database["aiPrompts"],
  aiInsights: (aiInsights as V6Database["aiInsights"]).map((insight) => ({ ...insight, studioId })),
  featureFlags: {
    shop: true,
    privateLessons: true,
    media: true,
    events: true,
    mediaGallery: true,
    aiInsights: true,
    pushNotifications: false,
    eventMode: true,
    attendance: true,
    payments: false,
    publicLegacyGallery: false,
    adultGroups: true,
    studentUploads: true,
    dailyPractice: false
  },
  auditLog: []
};

export function cloneV6Database(): V6Database {
  return normalizeV6Database(JSON.parse(JSON.stringify(safeInitialV6Database)) as V6Database);
}
