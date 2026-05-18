/**
 * Type contracts for the contained Lovable prototype port.
 * Runtime sample values live in ./sample-data.
 */

export type Role = "student" | "teacher" | "admin";

export type Level = "מתחילים" | "בינוני" | "מתקדם" | "מקצועי";

export type WeekDayKey = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";

export type QuickActionKey =
  | "schedule"
  | "absence"
  | "contact"
  | "navigate"
  | "rollcall"
  | "broadcast"
  | "notes"
  | "students"
  | "attendance"
  | "payments"
  | "groups"
  | "rooms";

export interface ClassSession {
  id: string;
  title: string;
  style: string;
  teacher: string;
  room: string;
  startsAt: string;
  durationMin: number;
  level: Level;
  capacity: number;
  enrolled: number;
  groupId?: string;
}

export interface WeekEntry {
  id: string;
  day: WeekDayKey;
  dayLabel: string; // "היום" | "מחר" | "ראשון"
  date: string; // "21.5"
  startsAt: string; // "17:30"
  endsAt: string; // "18:45"
  title: string;
  style: string;
  room: string;
  teacher: string;
  accent: "amber" | "rose" | "violet" | "emerald" | "sky";
  state?: "today" | "tomorrow" | "rest";
}

export interface DanceGroup {
  id: string;
  name: string;
  style: string;
  teacher: string;
  schedule: string; // "ראשון 17:30 · רביעי 19:00"
  members: number;
  level: Level;
  accent: "amber" | "rose" | "violet" | "emerald" | "sky";
  tag?: string; // "להקה תחרותית" | "קבוצה סגורה"
}

export interface JourneyInsight {
  id: string;
  emoji: string;
  text: string;
}

export interface StudioNewsItem {
  id: string;
  kind: "rehearsal" | "filming" | "event" | "update";
  title: string;
  body: string;
  when: string;
}

export interface StoreItem {
  id: string;
  name: string;
  category: string;
  price: string;
  badge?: string;
}

export interface StudentSubscription {
  status: "active" | "pending" | "expiring";
  plan: string;
  cycle: string;
  nextCharge: string;
  managedBy: "parent" | "self";
  managedByName?: string;
  pendingAction?: string;
}

export interface QuickAction {
  key: QuickActionKey;
  label: string;
  hint?: string;
}

export interface TeacherLesson {
  id: string;
  time: string;
  endTime: string;
  group: string;
  style: string;
  room: string;
  students: number;
  status: "upcoming" | "now" | "done";
}

export interface RosterStudent {
  id: string;
  name: string;
  status: "present" | "absent" | "late" | "pending";
  note?: string;
}

export interface AttentionStudent {
  id: string;
  name: string;
  reason: string;
  tone: "warn" | "info" | "soft";
}

export interface RoomTransitionInfo {
  fromRoom: string;
  toRoom: string;
  inMinutes: number;
  nextGroup: string;
  note?: string;
}

export interface PulseStat {
  key: string;
  label: string;
  value: string;
  hint: string;
}

export interface LiveLesson {
  id: string;
  state: "now" | "next" | "soon";
  time: string;
  title: string;
  teacher: string;
  room: string;
  students: number;
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  inUse: boolean;
  current?: string; // "ווג פאם · שירה"
  nextAt?: string;
}

export interface StaffMember {
  id: string;
  name: string;
  styles: string;
  todayLessons: number;
  state: "teaching" | "break" | "off";
  next?: string;
}

export interface ActiveGroup {
  id: string;
  name: string;
  teacher: string;
  members: number;
  capacity: number;
  attendance: number; // 0..1
  accent: "amber" | "rose" | "violet" | "emerald" | "sky";
}

export interface ExceptionItem {
  id: string;
  kind: "attendance" | "payment" | "schedule" | "registration";
  title: string;
  body: string;
  time: string;
}

export interface PaymentRow {
  id: string;
  name: string;
  amount: string;
  status: "overdue" | "due" | "partial";
  due: string;
}

export interface SystemBroadcast {
  id: string;
  to: string;
  preview: string;
  when: string;
  sender: string;
}

export interface Message {
  id: string;
  from: string;
  preview: string;
  time: string;
  unread: boolean;
  pinned?: boolean;
}

export interface TaskItem {
  id: string;
  title: string;
  due: string;
  done: boolean;
  tone?: "default" | "urgent";
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  time: string;
  tone: "info" | "success" | "warn";
  unread: boolean;
}
