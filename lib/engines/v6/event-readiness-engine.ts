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
    const eventGroupIds = new Set(event.groupIds);
    const openTasks = db.tasks.filter((task) => eventGroupIds.has(task.groupId) && !task.doneByUserIds.length).length;
    const openChecklist = db.eventChecklists.filter((item) => item.eventId === event.id && item.status !== "done").length;
    const missingApprovals = db.eventParticipants.filter((item) => item.eventId === event.id && item.approvalStatus === "pending").length;
    const missingCostumes = db.eventParticipants.filter((item) => item.eventId === event.id && (item.costumeStatus === "missing" || item.costumeStatus === "in_progress")).length;
    const missingAttendance = db.attendance.filter((item) => eventGroupIds.has(item.groupId ?? "") && (item.status === "missing" || item.status === "absent")).length;
    const explicitReadiness = db.showReadiness.filter((item) => item.eventId === event.id);
    const explicitScore = explicitReadiness.length ? Math.round(explicitReadiness.reduce((sum, item) => sum + item.score, 0) / explicitReadiness.length) : 100;
    const score = Math.max(32, Math.min(explicitScore, 100 - openTasks * 5 - openChecklist * 7 - missingApprovals * 8 - missingCostumes * 5 - missingAttendance * 3));
    const status = score < 55 ? "critical" : score < 78 ? "attention" : "calm";
    return {
      eventId: event.id,
      title: event.title,
      status,
      score,
      nextAction: explicitReadiness.find((item) => item.nextAction)?.nextAction
        ?? (missingApprovals ? "לסגור אישורים חסרים לפני האירוע" : missingCostumes ? "לעבור על תלבושות וציוד" : status === "critical" ? "לפתוח מצב אירוע ולטפל בחסמים" : status === "attention" ? "לעבור על משימות ונוכחות" : "לשמר מעקב רגוע")
    };
  });
}
