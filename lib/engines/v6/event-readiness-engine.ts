import type { V6Database } from "@/lib/v6/types";

export type V6EventReadiness = {
  eventId: string;
  title: string;
  status: "calm" | "attention" | "critical";
  score: number;
  nextAction: string;
};

export function computeV6EventReadiness(db: V6Database): V6EventReadiness[] {
  return db.events.map((event) => {
    const openTasks = db.tasks.filter((task) => !task.doneByUserIds.length).length;
    const missingAttendance = db.attendance.filter((item) => item.status === "missing").length;
    const score = Math.max(38, 100 - openTasks * 8 - missingAttendance * 6);
    const status = score < 55 ? "critical" : score < 78 ? "attention" : "calm";
    return {
      eventId: event.id,
      title: event.title,
      status,
      score,
      nextAction: status === "critical" ? "לפתוח מצב אירוע ולטפל בחסמים" : status === "attention" ? "לעבור על משימות ונוכחות" : "לשמר מעקב רגוע"
    };
  });
}
