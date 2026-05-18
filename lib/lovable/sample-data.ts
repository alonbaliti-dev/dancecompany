/**
 * Dance Company OS — Hebrew domain data.
 * Models a real recurring-group dance academy: closed groups, fixed weekly
 * timetable, named rosters, parent-aware payments, studio operations.
 * Pure data. Drop straight into a Next.js + Tailwind app.
 */

import type {
  Role,
  ClassSession,
  WeekEntry,
  DanceGroup,
  JourneyInsight,
  StudioNewsItem,
  StoreItem,
  StudentSubscription,
  QuickAction,
  TeacherLesson,
  RosterStudent,
  AttentionStudent,
  RoomTransitionInfo,
  PulseStat,
  LiveLesson,
  Room,
  StaffMember,
  ActiveGroup,
  ExceptionItem,
  PaymentRow,
  SystemBroadcast,
  Message,
  TaskItem,
  AppNotification
} from "./types";

export const ROLES: { id: Role; label: string; tagline: string }[] = [
  { id: "student", label: "תלמיד/ה", tagline: "השיעורים, הקבוצות והדרך שלך" },
  { id: "teacher", label: "מורה", tagline: "יום ההוראה שלך באקדמיה" },
  { id: "admin", label: "ניהול", tagline: "הדופק התפעולי של הסטודיו" },
];

export const ROLE_NAME: Record<Role, string> = {
  student: "רים אבו־חסן",
  teacher: "שירה ברק",
  admin: "יואב כהן",
};

export const STUDIO_NAME = "Dance Company · תל אביב";

/* ---------- Time helpers ---------- */

const today = new Date();
const at = (h: number, m: number, addDays = 0) => {
  const d = new Date(today);
  d.setDate(d.getDate() + addDays);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};

/* ---------- Classes / sessions ---------- */



export const TODAY_CLASSES: ClassSession[] = [
  {
    id: "c1",
    title: "ווג פאם · מתקדמות",
    style: "Vogue Femme",
    teacher: "שירה ברק",
    room: "אולפן הגדול",
    startsAt: at(17, 30),
    durationMin: 75,
    level: "מתקדם",
    capacity: 14,
    enrolled: 12,
    groupId: "g1",
  },
  {
    id: "c2",
    title: "היפ הופ תחרותית",
    style: "Hip Hop Choreo",
    teacher: "עומר דדון",
    room: "אולפן ב׳",
    startsAt: at(19, 0),
    durationMin: 90,
    level: "מתקדם",
    capacity: 16,
    enrolled: 15,
    groupId: "g2",
  },
  {
    id: "c3",
    title: "דאנסהול · נשים",
    style: "Dancehall",
    teacher: "תמר אלון",
    room: "אולפן א׳",
    startsAt: at(20, 45),
    durationMin: 60,
    level: "בינוני",
    capacity: 18,
    enrolled: 13,
    groupId: "g3",
  },
];

/* ---------- Weekly timeline (lifestyle view, not a calendar) ---------- */



export const STUDENT_WEEK: WeekEntry[] = [
  {
    id: "w1",
    day: "sun",
    dayLabel: "היום",
    date: "18.5",
    startsAt: "17:30",
    endsAt: "18:45",
    title: "ווג פאם · מתקדמות",
    style: "Vogue Femme",
    room: "אולפן הגדול",
    teacher: "שירה",
    accent: "amber",
    state: "today",
  },
  {
    id: "w2",
    day: "mon",
    dayLabel: "מחר",
    date: "19.5",
    startsAt: "19:00",
    endsAt: "20:30",
    title: "היפ הופ תחרותית",
    style: "Choreo",
    room: "אולפן ב׳",
    teacher: "עומר",
    accent: "rose",
    state: "tomorrow",
  },
  {
    id: "w3",
    day: "wed",
    dayLabel: "רביעי",
    date: "21.5",
    startsAt: "20:45",
    endsAt: "21:45",
    title: "דאנסהול · נשים",
    style: "Dancehall",
    room: "אולפן א׳",
    teacher: "תמר",
    accent: "violet",
  },
  {
    id: "w4",
    day: "thu",
    dayLabel: "חמישי",
    date: "22.5",
    startsAt: "18:00",
    endsAt: "19:30",
    title: "חזרת להקה · מופע סיום",
    style: "Rehearsal",
    room: "אולפן הגדול",
    teacher: "שירה",
    accent: "emerald",
  },
];

/* ---------- Groups (closed recurring rosters) ---------- */


export const STUDENT_GROUPS: DanceGroup[] = [
  {
    id: "g1",
    name: "ווג פאם · מתקדמות",
    style: "Vogue Femme",
    teacher: "שירה ברק",
    schedule: "ראשון · רביעי · 17:30",
    members: 12,
    level: "מתקדם",
    accent: "amber",
    tag: "להקה תחרותית",
  },
  {
    id: "g2",
    name: "היפ הופ תחרותית",
    style: "Hip Hop Choreo",
    teacher: "עומר דדון",
    schedule: "שני · חמישי · 19:00",
    members: 15,
    level: "מתקדם",
    accent: "rose",
    tag: "סגורה",
  },
  {
    id: "g3",
    name: "דאנסהול · נשים",
    style: "Dancehall",
    teacher: "תמר אלון",
    schedule: "רביעי · 20:45",
    members: 13,
    level: "בינוני",
    accent: "violet",
  },
];

/* ---------- The journey (replaces "attendance analytics") ---------- */


export const STUDENT_JOURNEY = {
  attendanceRate: 0.92,
  classesThisMonth: 11,
  streakWeeks: 4,
  insights: [
    { id: "j1", emoji: "🔥", text: "הגעת ל־11 שיעורים החודש" },
    { id: "j2", emoji: "💫", text: "4 שבועות רצופים של התמדה" },
    { id: "j3", emoji: "✨", text: "92% נוכחות — שיא אישי" },
  ] as JourneyInsight[],
};

/* ---------- Studio news ---------- */


export const STUDIO_NEWS: StudioNewsItem[] = [
  {
    id: "n1",
    kind: "rehearsal",
    title: "חזרה גנרלית · מופע סיום",
    body: "כל הלהקות התחרותיות, אולפן הגדול, יום שישי 16:00.",
    when: "שישי · 23.5",
  },
  {
    id: "n2",
    kind: "filming",
    title: "יום צילומים לקטלוג 2026",
    body: "מצלמים את כל הלהקות עם הצלמת נועה אבני.",
    when: "ראשון · 25.5",
  },
  {
    id: "n3",
    kind: "event",
    title: "סדנה אורחת · Leiomy Maldonado",
    body: "סדנת Vogue חד פעמית, הרשמה פתוחה לחברות מתקדמות.",
    when: "10.6",
  },
];

/* ---------- Store ---------- */


export const STORE_FEATURED: StoreItem[] = [
  { id: "s1", name: "Hoodie · הלהקה", category: "ביגוד", price: "₪245", badge: "חדש" },
  { id: "s2", name: "טי שירט אימון", category: "אימון", price: "₪95" },
  { id: "s3", name: "בקבוק סטודיו", category: "אקססוריז", price: "₪65", badge: "אהוב" },
  { id: "s4", name: "ז׳קט קטיפה", category: "מופע", price: "₪320" },
];

/* ---------- Subscription / parent-aware payments ---------- */


export const STUDENT_SUBSCRIPTION: StudentSubscription = {
  status: "active",
  plan: "מנוי חודשי · 3 קבוצות",
  cycle: "מאי 2026",
  nextCharge: "1.6 · ₪780",
  managedBy: "parent",
  managedByName: "מנוהל ע״י ההורה · חשבון משפחתי",
  pendingAction: "אישור תשלום אחד ממתין להורה",
};

/* ---------- Quick actions ---------- */



export const STUDENT_QUICK_ACTIONS: QuickAction[] = [
  { key: "schedule", label: "המערכת השבועית", hint: "כל השיעורים שלי" },
  { key: "contact", label: "הודעה למורה", hint: "ישירות לשירה ברק" },
  { key: "absence", label: "דיווח היעדרות", hint: "עדכון מראש לקבוצה" },
  { key: "navigate", label: "ניווט לסטודיו", hint: "רח׳ שלמה 14, ת״א" },
];

export const TEACHER_QUICK_ACTIONS: QuickAction[] = [
  { key: "rollcall", label: "פתח נוכחות", hint: "השיעור הקרוב" },
  { key: "broadcast", label: "הודעה לקבוצה", hint: "כל החברות פעילות" },
  { key: "notes", label: "הערות מקצועיות", hint: "פרטי לי בלבד" },
  { key: "schedule", label: "יום ההוראה", hint: "הקבוצות של היום" },
];

export const ADMIN_QUICK_ACTIONS: QuickAction[] = [
  { key: "students", label: "תלמידים פעילים" },
  { key: "groups", label: "קבוצות פעילות" },
  { key: "rooms", label: "סטודיואים וחדרים" },
  { key: "payments", label: "תשלומים ומעקב" },
];

/* ---------- Teacher domain ---------- */


export const TEACHER_DAY: TeacherLesson[] = [
  {
    id: "tl1",
    time: "16:00",
    endTime: "17:15",
    group: "ילדות מתחילות",
    style: "Hip Hop",
    room: "אולפן ב׳",
    students: 14,
    status: "done",
  },
  {
    id: "tl2",
    time: "17:30",
    endTime: "18:45",
    group: "ווג פאם · מתקדמות",
    style: "Vogue Femme",
    room: "אולפן הגדול",
    students: 12,
    status: "now",
  },
  {
    id: "tl3",
    time: "19:00",
    endTime: "20:30",
    group: "להקת מודרני · בוגרות",
    style: "Modern",
    room: "אולפן הגדול",
    students: 16,
    status: "upcoming",
  },
];


export const TEACHER_ROSTER: RosterStudent[] = [
  { id: "r1", name: "מאיה כהן", status: "present" },
  { id: "r2", name: "ליאם פרץ", status: "late", note: "מאחרת ב־10 דק׳" },
  { id: "r3", name: "יעל בן דוד", status: "absent", note: "חולה" },
  { id: "r4", name: "אורי שמש", status: "present" },
  { id: "r5", name: "תמר אלוני", status: "pending" },
  { id: "r6", name: "רוני אבידן", status: "present" },
  { id: "r7", name: "רים אבו־חסן", status: "pending" },
  { id: "r8", name: "עידן ברק", status: "absent" },
];


export const TEACHER_ATTENTION: AttentionStudent[] = [
  { id: "at1", name: "יעל בן דוד", reason: "היעדרות שלישית החודש", tone: "warn" },
  { id: "at2", name: "ליאם פרץ", reason: "מאחרת לאחרונה באופן קבוע", tone: "info" },
  { id: "at3", name: "נועה אורן", reason: "פציעה זמנית · קרסול", tone: "soft" },
];


export const TEACHER_TRANSITION: RoomTransitionInfo = {
  fromRoom: "אולפן הגדול",
  toRoom: "אולפן הגדול",
  inMinutes: 15,
  nextGroup: "להקת מודרני · בוגרות",
  note: "אותו אולפן · 15 דק׳ הפסקה",
};

/* ---------- Admin domain ---------- */


export const ADMIN_PULSE: PulseStat[] = [
  { key: "classes", label: "שיעורים היום", value: "18", hint: "3 פעילים כרגע" },
  { key: "students", label: "תלמידים פעילים", value: "284", hint: "+12 החודש" },
  { key: "occupancy", label: "ניצול אולפנים", value: "87%", hint: "שיא שבועי" },
  { key: "open", label: "פתוח לטיפול", value: "6", hint: "חריגות פתוחות" },
];


export const ADMIN_LIVE: LiveLesson[] = [
  {
    id: "ll1",
    state: "now",
    time: "מתקיים עכשיו",
    title: "ווג פאם · מתקדמות",
    teacher: "שירה ברק",
    room: "אולפן הגדול",
    students: 12,
  },
  {
    id: "ll2",
    state: "next",
    time: "בעוד 12 דק׳",
    title: "היפ הופ תחרותית",
    teacher: "עומר דדון",
    room: "אולפן ב׳",
    students: 15,
  },
  {
    id: "ll3",
    state: "soon",
    time: "20:45",
    title: "דאנסהול · נשים",
    teacher: "תמר אלון",
    room: "אולפן א׳",
    students: 13,
  },
];


export const ADMIN_ROOMS: Room[] = [
  { id: "rm1", name: "אולפן הגדול", capacity: 22, inUse: true, current: "ווג פאם · שירה", nextAt: "19:00" },
  { id: "rm2", name: "אולפן א׳", capacity: 16, inUse: false, nextAt: "20:45" },
  { id: "rm3", name: "אולפן ב׳", capacity: 18, inUse: false, nextAt: "19:00" },
];


export const ADMIN_STAFF: StaffMember[] = [
  { id: "st1", name: "שירה ברק", styles: "Vogue · Modern", todayLessons: 3, state: "teaching", next: "מלמדת כעת" },
  { id: "st2", name: "עומר דדון", styles: "Hip Hop · Choreo", todayLessons: 2, state: "break", next: "19:00 · אולפן ב׳" },
  { id: "st3", name: "תמר אלון", styles: "Dancehall · Heels", todayLessons: 1, state: "break", next: "20:45 · אולפן א׳" },
  { id: "st4", name: "נועם פלד", styles: "Ballet", todayLessons: 0, state: "off", next: "חוזר ביום ג׳" },
];


export const ADMIN_GROUPS: ActiveGroup[] = [
  { id: "ag1", name: "ווג פאם · מתקדמות", teacher: "שירה ברק", members: 12, capacity: 14, attendance: 0.94, accent: "amber" },
  { id: "ag2", name: "היפ הופ תחרותית", teacher: "עומר דדון", members: 15, capacity: 16, attendance: 0.88, accent: "rose" },
  { id: "ag3", name: "דאנסהול · נשים", teacher: "תמר אלון", members: 13, capacity: 18, attendance: 0.79, accent: "violet" },
  { id: "ag4", name: "להקת מודרני · בוגרות", teacher: "שירה ברק", members: 16, capacity: 16, attendance: 0.96, accent: "emerald" },
];


export const ADMIN_EXCEPTIONS: ExceptionItem[] = [
  {
    id: "ex1",
    kind: "schedule",
    title: "חפיפת אולפן · חמישי 18:30",
    body: "חזרת להקה חופפת לשיעור מודרני באולפן הגדול.",
    time: "לפני 8 דק׳",
  },
  {
    id: "ex2",
    kind: "payment",
    title: "4 תשלומים פתוחים מעל 7 ימים",
    body: "סך פתוח: ₪6,420 · מומלץ פנייה ידנית.",
    time: "היום",
  },
  {
    id: "ex3",
    kind: "attendance",
    title: "ירידת נוכחות · דאנסהול נשים",
    body: "79% השבוע — לבדוק אם נדרשת שיחה.",
    time: "אתמול",
  },
  {
    id: "ex4",
    kind: "registration",
    title: "רישום חדש · שלי אברהם",
    body: "ממתינה לשיבוץ לקבוצת מתחילות ה׳.",
    time: "אתמול",
  },
];


export const ADMIN_PAYMENTS: PaymentRow[] = [
  { id: "p1", name: "משפ׳ לוי · נועה", amount: "₪1,240", status: "overdue", due: "באיחור 5 ימים" },
  { id: "p2", name: "משפ׳ כהן · מאיה", amount: "₪890", status: "due", due: "עד 25.5" },
  { id: "p3", name: "משפ׳ פרץ · ליאם", amount: "₪520", status: "partial", due: "תשלום חלקי" },
  { id: "p4", name: "משפ׳ אבידן · רוני", amount: "₪1,640", status: "overdue", due: "באיחור 11 ימים" },
];


export const ADMIN_BROADCASTS: SystemBroadcast[] = [
  {
    id: "b1",
    to: "כל הסטודיו",
    preview: "תזכורת: יום הצילומים השנתי מתקיים ב־25.5. לוז מפורט נשלח בקבוצות.",
    when: "היום · 09:14",
    sender: "הנהלת האקדמיה",
  },
  {
    id: "b2",
    to: "להקות תחרותיות",
    preview: "חזרה גנרלית למופע הסיום ביום שישי, נוכחות חובה.",
    when: "אתמול",
    sender: "שירה ברק",
  },
];

/* ---------- Student lists (kept for compatibility) ---------- */


export const STUDENT_MESSAGES: Message[] = [
  {
    id: "m1",
    from: "שירה · המורה שלך",
    preview: "ראיתי את ההתקדמות שלך בפראזה החדשה, ממש גאה. ממשיכות חזק.",
    time: "10 דק׳",
    unread: true,
    pinned: true,
  },
  {
    id: "m2",
    from: "הנהלת האקדמיה",
    preview: "אישור הורה לטיול הלהקה ממתין במערכת — מוזמנת להעביר להורייך.",
    time: "1 שעה",
    unread: true,
  },
  {
    id: "m3",
    from: "ווג פאם · מתקדמות",
    preview: "מי שיכולה להישאר אחרי השיעור היום לחזרה קצרה של הקטע השני?",
    time: "אתמול",
    unread: false,
  },
];


export const STUDENT_TASKS: TaskItem[] = [
  { id: "t1", title: "אישור הורה · טיול להקה", due: "השבוע", done: false, tone: "urgent" },
  { id: "t2", title: "צפייה בסרטון הכוריאוגרפיה", due: "לפני יום ה׳", done: false },
  { id: "t3", title: "הזמנת נעלי אימון מהחנות", due: "בקרוב", done: true },
];

/* ---------- Shared notifications ---------- */


export const NOTIFICATIONS: AppNotification[] = [
  {
    id: "n1",
    title: "אישור מקום · ווג פאם",
    body: "המקום שלך ביום ראשון 17:30 שמור, אולפן הגדול.",
    time: "לפני 12 דק׳",
    tone: "success",
    unread: true,
  },
  {
    id: "n2",
    title: "עדכון מנוי",
    body: "המנוי החודשי שלך עודכן ע״י ההורה לחודש מאי.",
    time: "לפני שעה",
    tone: "info",
    unread: true,
  },
  {
    id: "n3",
    title: "הודעה משירה",
    body: "״כל הכבוד לכולן על החזרה אתמול, ממשיכות בעוצמה.״",
    time: "אתמול",
    tone: "info",
    unread: false,
  },
];

/* ---------- Greeting helpers ---------- */

export function getDynamicGreeting(role: Role, firstName: string) {
  const hour = new Date().getHours();
  const part =
    hour < 5 ? "לילה טוב" : hour < 12 ? "בוקר טוב" : hour < 17 ? "צהריים טובים" : hour < 21 ? "ערב טוב" : "לילה טוב";

  if (role === "student") {
    return {
      headline: `${part} ${firstName} ✨`,
      sub: "יש לך חזרה היום ב־17:30 · אולפן הגדול",
    };
  }
  if (role === "teacher") {
    return {
      headline: `${part}, ${firstName}`,
      sub: "3 קבוצות היום · השיעור הבא בעוד 22 דק׳",
    };
  }
  return {
    headline: `${part}, ${firstName}`,
    sub: "18 שיעורים מתוכננים · 3 מתקיימים כעת",
  };
}
