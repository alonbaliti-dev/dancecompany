"use client";

import { toast } from "sonner";
import { DynamicGreeting } from "./DynamicGreeting";
import { NextClassHero } from "./NextClassHero";
import { WeeklyTimeline } from "./WeeklyTimeline";
import { GroupsList } from "./GroupsList";
import { JourneyCard } from "./JourneyCard";
import { StudioNews } from "./StudioNews";
import { SubscriptionCard } from "./SubscriptionCard";
import { StoreTeaser } from "./StoreTeaser";
import { QuickActions } from "./QuickActions";
import { MessagesList } from "./MessagesList";
import { TasksList } from "./TasksList";

import { TeachingDayHero } from "./TeachingDayHero";
import { TodayGroupsFlow } from "./TodayGroupsFlow";
import { AttendanceRoster } from "./AttendanceRoster";
import { StudentsNeedingAttention } from "./StudentsNeedingAttention";
import { GroupMessageComposer } from "./GroupMessageComposer";
import { ClassNotesEditor } from "./ClassNotesEditor";
import { RoomTransition } from "./RoomTransition";

import { StudioPulse } from "./StudioPulse";
import { LiveActivity } from "./LiveActivity";
import { ActiveGroups } from "./ActiveGroups";
import { RoomsOverview } from "./RoomsOverview";
import { TeachingStaff } from "./TeachingStaff";
import { Exceptions } from "./Exceptions";
import { PaymentsList } from "./PaymentsList";
import { SystemBroadcasts } from "./SystemBroadcasts";

import { ADMIN_BROADCASTS, ADMIN_EXCEPTIONS, ADMIN_GROUPS, ADMIN_LIVE, ADMIN_PAYMENTS, ADMIN_PULSE, ADMIN_QUICK_ACTIONS, ADMIN_ROOMS, ADMIN_STAFF, ROLE_NAME, STORE_FEATURED, STUDENT_GROUPS, STUDENT_JOURNEY, STUDENT_MESSAGES, STUDENT_QUICK_ACTIONS, STUDENT_SUBSCRIPTION, STUDENT_TASKS, STUDENT_WEEK, STUDIO_NEWS, TEACHER_ATTENTION, TEACHER_DAY, TEACHER_QUICK_ACTIONS, TEACHER_ROSTER, TEACHER_TRANSITION, TODAY_CLASSES, getDynamicGreeting } from "@/lib/lovable/sample-data";
import type { ClassSession, QuickActionKey, Role } from "@/lib/lovable/types";

interface DashboardProps {
  role: Role;
  onOpenClass: (s: ClassSession) => void;
}

const ACTION_TOASTS: Partial<Record<QuickActionKey, string>> = {
  schedule: "פתיחת המערכת השבועית",
  absence: "דיווח היעדרות נשלח לקבוצה",
  contact: "פותח שיחה עם המורה",
  navigate: "פתיחת הניווט לסטודיו",
  rollcall: "נוכחות נפתחה לשיעור הקרוב",
  broadcast: "טופס הודעה לקבוצה",
  notes: "פתיחת מחברת הערות מקצועיות",
  students: "מעבר לתלמידים הפעילים",
  attendance: "מסך נוכחות הסטודיו",
  payments: "מסך תשלומים ומעקב",
  groups: "מסך קבוצות פעילות",
  rooms: "מפת אולפנים וחדרים",
};

export function Dashboard({ role, onOpenClass }: DashboardProps) {
  const firstName = ROLE_NAME[role].split(" ")[0];
  const greet = getDynamicGreeting(role, firstName);
  const date = new Date().toLocaleDateString("he-IL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const onAction = (k: QuickActionKey) =>
    toast(ACTION_TOASTS[k] ?? "בוצע");

  return (
    <div className="flex flex-col gap-7 px-5 pb-32 pt-1">
      <DynamicGreeting context={date} headline={greet.headline} sub={greet.sub} />

      {role === "student" && <StudentHome onOpenClass={onOpenClass} onAction={onAction} />}
      {role === "teacher" && <TeacherHome onAction={onAction} />}
      {role === "admin" && <AdminHome onAction={onAction} />}
    </div>
  );
}

/* ---------- Student ---------- */
function StudentHome({
  onOpenClass,
  onAction,
}: {
  onOpenClass: (s: ClassSession) => void;
  onAction: (k: QuickActionKey) => void;
}) {
  return (
    <>
      <NextClassHero session={TODAY_CLASSES[0]} onOpen={onOpenClass} />
      <WeeklyTimeline entries={STUDENT_WEEK} />
      <GroupsList groups={STUDENT_GROUPS} />
      <JourneyCard
        attendanceRate={STUDENT_JOURNEY.attendanceRate}
        classesThisMonth={STUDENT_JOURNEY.classesThisMonth}
        streakWeeks={STUDENT_JOURNEY.streakWeeks}
        insights={STUDENT_JOURNEY.insights}
      />
      <StudioNews items={STUDIO_NEWS} />
      <StoreTeaser items={STORE_FEATURED} />
      <SubscriptionCard sub={STUDENT_SUBSCRIPTION} />
      <MessagesList items={STUDENT_MESSAGES} title="ההודעות שלי" />
      <TasksList items={STUDENT_TASKS} title="מה מחכה לי" />
      <QuickActions
        actions={STUDENT_QUICK_ACTIONS}
        onAction={onAction}
        title="פעולות מהירות"
      />
    </>
  );
}

/* ---------- Teacher ---------- */
function TeacherHome({ onAction }: { onAction: (k: QuickActionKey) => void }) {
  const next = TEACHER_DAY.find((l) => l.status !== "done") ?? TEACHER_DAY[0];
  const totalStudents = TEACHER_DAY.reduce((s, l) => s + l.students, 0);

  return (
    <>
      <TeachingDayHero
        lessonsCount={TEACHER_DAY.length}
        studentsCount={totalStudents}
        nextGroup={next.group}
        nextTime={`${next.time}–${next.endTime}`}
        nextRoom={next.room}
      />
      <TodayGroupsFlow lessons={TEACHER_DAY} />
      <AttendanceRoster initial={TEACHER_ROSTER} title="נוכחות תלמידות" />
      <StudentsNeedingAttention items={TEACHER_ATTENTION} />
      <RoomTransition info={TEACHER_TRANSITION} />
      <GroupMessageComposer />
      <ClassNotesEditor />
      <QuickActions
        actions={TEACHER_QUICK_ACTIONS}
        onAction={onAction}
        title="פעולות מהירות"
      />
    </>
  );
}

/* ---------- Admin ---------- */
function AdminHome({ onAction }: { onAction: (k: QuickActionKey) => void }) {
  return (
    <>
      <StudioPulse stats={ADMIN_PULSE} />
      <LiveActivity items={ADMIN_LIVE} />
      <ActiveGroups groups={ADMIN_GROUPS} />
      <RoomsOverview rooms={ADMIN_ROOMS} />
      <TeachingStaff staff={ADMIN_STAFF} />
      <Exceptions items={ADMIN_EXCEPTIONS} />
      <PaymentsList items={ADMIN_PAYMENTS} />
      <SystemBroadcasts items={ADMIN_BROADCASTS} />
      <QuickActions
        actions={ADMIN_QUICK_ACTIONS}
        onAction={onAction}
        title="מרכז שליטה"
      />
    </>
  );
}
