import type { V6Database, V6Permissions, V6Role } from "./types";
import aiPrompts from "@/database/ai-prompts.json";
import aiInsights from "@/database/ai-insights.json";

export const roleLabel: Record<V6Role, string> = {
  student: "תלמיד/ה",
  parent: "הורה",
  teacher: "מורה",
  management: "הנהלה",
  super_admin: "מנהל מערכת"
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

const studioId = "studio_lk";

export const safeInitialV6Database: V6Database = {
  version: 6,
  studios: [
    {
      id: studioId,
      name: "LK Dance School",
      branding: {
        name: "LK Student Space",
        tagline: "מרחב פרימיום למחול, התקדמות וקהילה",
        accent: "emerald"
      }
    }
  ],
  users: [
    { id: "alon", studioId, name: "אלון בליטי", role: "super_admin", phone: "0501110000", permissions: permissionsFor("super_admin"), groupIds: [], linkedStudentIds: [], active: true },
    { id: "liat", studioId, name: "ליאת קפלינסקי", role: "management", phone: "0502220000", permissions: permissionsFor("management"), groupIds: ["flamenco"], linkedStudentIds: [], active: true },
    { id: "shahar", studioId, name: "שחר קפלינסקי", role: "management", phone: "0502220001", permissions: permissionsFor("management"), groupIds: [], linkedStudentIds: [], active: true },
    { id: "office", studioId, name: "מזכירה / משרד", role: "management", phone: "0502220002", permissions: permissionsFor("management"), groupIds: [], linkedStudentIds: [], active: true },
    { id: "simor", studioId, name: "סימור דניאל", role: "teacher", phone: "0503330001", permissions: permissionsFor("teacher"), groupIds: ["hiphop"], linkedStudentIds: [], active: true },
    { id: "yakir", studioId, name: "יקיר גבאי", role: "teacher", phone: "0503330002", permissions: permissionsFor("teacher"), groupIds: ["hiphop"], linkedStudentIds: [], active: true },
    { id: "daniel", studioId, name: "דניאל חזן", role: "teacher", phone: "0503330003", permissions: permissionsFor("teacher"), groupIds: ["hiphop"], linkedStudentIds: [], active: true },
    { id: "almog", studioId, name: "אלמוג דוד", role: "teacher", phone: "0503330004", permissions: permissionsFor("teacher"), groupIds: ["modern"], linkedStudentIds: [], active: true },
    { id: "shabi", studioId, name: "שבי שלום אברמוביץ", role: "teacher", phone: "0503330005", permissions: permissionsFor("teacher"), groupIds: ["modern", "classic"], linkedStudentIds: [], active: true },
    { id: "lena", studioId, name: "לנה קרושקו", role: "teacher", phone: "0503330006", permissions: permissionsFor("teacher"), groupIds: ["classic", "pointe"], linkedStudentIds: [], active: true },
    { id: "michael", studioId, name: "מיכאל שניידר", role: "teacher", phone: "0503330007", permissions: permissionsFor("teacher"), groupIds: ["classic"], linkedStudentIds: [], active: true },
    { id: "igal", studioId, name: "יגאל משינסקי", role: "teacher", phone: "0503330008", permissions: permissionsFor("teacher"), groupIds: ["classic"], linkedStudentIds: [], active: true },
    { id: "kornelia", studioId, name: "קורנליה זוהר", role: "teacher", phone: "0503330009", permissions: permissionsFor("teacher"), groupIds: ["repertoire"], linkedStudentIds: [], active: true },
    { id: "student_noa", studioId, name: "נועה כהן", role: "student", phone: "0504440001", permissions: permissionsFor("student"), groupIds: ["modern"], linkedStudentIds: [], active: true },
    { id: "student_maya", studioId, name: "מאיה לוי", role: "student", phone: "0504440002", permissions: permissionsFor("student"), groupIds: ["hiphop"], linkedStudentIds: [], active: true },
    { id: "parent_ronit", studioId, name: "רונית כהן", role: "parent", phone: "0505550001", permissions: permissionsFor("parent"), groupIds: [], linkedStudentIds: ["student_noa"], active: true }
  ],
  credentials: [
    { userId: "alon", phone: "0501110000", password: "creator2026" },
    { userId: "liat", phone: "0502220000", password: "lk2026" },
    { userId: "simor", phone: "0503330001", password: "teacher2026" },
    { userId: "student_noa", phone: "0504440001", password: "student2026" },
    { userId: "parent_ronit", phone: "0505550001", password: "parent2026" }
  ],
  groups: [
    { id: "flamenco", studioId, name: "פלמנקו", style: "פלמנקו", teacherIds: ["liat"], studentIds: [] },
    { id: "hiphop", studioId, name: "היפ הופ", style: "היפ הופ", teacherIds: ["simor", "yakir", "daniel"], studentIds: ["student_maya"] },
    { id: "modern", studioId, name: "מודרני", style: "מודרני", teacherIds: ["almog", "shabi"], studentIds: ["student_noa"] },
    { id: "classic", studioId, name: "קלאסי", style: "קלאסי", teacherIds: ["shabi", "lena", "michael", "igal"], studentIds: [] },
    { id: "repertoire", studioId, name: "רפרטואר", style: "רפרטואר", teacherIds: ["kornelia"], studentIds: [] },
    { id: "pointe", studioId, name: "פוינט", style: "פוינט", teacherIds: ["lena"], studentIds: [] }
  ],
  lessons: [
    { id: "lesson_flamenco", studioId, groupId: "flamenco", title: "פלמנקו", weekday: "ראשון", time: "17:00", room: "סטודיו 1" },
    { id: "lesson_hiphop", studioId, groupId: "hiphop", title: "היפ הופ", weekday: "שני", time: "18:30", room: "סטודיו 2" },
    { id: "lesson_modern", studioId, groupId: "modern", title: "מודרני", weekday: "שלישי", time: "17:45", room: "סטודיו 1" },
    { id: "lesson_classic", studioId, groupId: "classic", title: "קלאסי", weekday: "רביעי", time: "16:30", room: "סטודיו 3" }
  ],
  messages: [
    { id: "msg_welcome", studioId, title: "ברוכים הבאים ל־V6", body: "מרחב חדש, נקי וממוקד לתפעול הסטודיו.", createdAt: "2026-05-16T09:00:00.000Z" }
  ],
  notifications: [
    { id: "ntf_welcome", studioId, userIds: ["alon"], title: "V6 מוכן לבדיקה", body: "הבסיס החדש נטען מיידית ומוכן להמשך בנייה.", type: "system", tab: "dashboard", readBy: [], createdAt: "2026-05-16T09:00:00.000Z" }
  ],
  products: [
    { id: "prod_bottle", studioId, title: "בקבוק LK", description: "בקבוק אימון אלגנטי לשיעורים וחזרות.", category: "אביזרים", price: 59, active: true, imageMediaIds: [] },
    { id: "prod_ticket", studioId, title: "כרטיס למופע סוף שנה", description: "כניסה לאירוע המרכזי של הסטודיו.", category: "כרטיסים למופעים", price: 85, active: true, imageMediaIds: [] },
    { id: "prod_private_30", studioId, title: "שיעור פרטי 30 דקות", description: "בקשת זמינות, בחירת מועד ותשלום.", category: "שיעורים פרטיים", price: 150, active: true, imageMediaIds: [] }
  ],
  privateLessons: [],
  media: [],
  attendance: [{ id: "att_noa_1", studentId: "student_noa", lessonId: "lesson_modern", status: "present", createdAt: "2026-05-16T09:00:00.000Z" }],
  tasks: [{ id: "task_modern", groupId: "modern", title: "חזרה על קומבינציה", doneByUserIds: [] }],
  events: [{ id: "event_show", studioId, title: "מופע סוף שנה", date: "2026-06-20" }],
  achievements: [{ id: "ach_noa", studentId: "student_noa", title: "נוכחות עקבית", createdAt: "2026-05-16T09:00:00.000Z" }],
  editableTexts: {
    loginTitle: "LK Student Space",
    loginSubtitle: "מרחב פרימיום למחול, התקדמות וקהילה"
  },
  aiPrompts: aiPrompts as V6Database["aiPrompts"],
  aiInsights: aiInsights as V6Database["aiInsights"],
  featureFlags: {
    shop: true,
    privateLessons: true,
    media: true,
    events: true
  },
  auditLog: []
};

export function cloneV6Database(): V6Database {
  return JSON.parse(JSON.stringify(safeInitialV6Database)) as V6Database;
}
