import type { V6Database } from "@/lib/v6/types";
import { computeV6AttendanceRisks } from "./attendance-risk-engine";
import { computeV6EventReadiness } from "./event-readiness-engine";

export type V6ManagementHealth = {
  urgentCount: number;
  responseQueue: number;
  attendanceIssues: number;
  privateLessonBottlenecks: number;
  eventAttention: number;
  summary: string;
};

export function computeV6ManagementHealth(db: V6Database): V6ManagementHealth {
  const attendanceIssues = computeV6AttendanceRisks(db).filter((risk) => risk.riskLevel !== "low").length;
  const privateLessonBottlenecks = db.privateLessons.filter((item) => item.status === "requested" || item.status === "teacher_suggested").length;
  const responseQueue = db.notifications.filter((item) => item.type === "system" || item.type === "private_lesson").length;
  const eventAttention = computeV6EventReadiness(db).filter((item) => item.status !== "calm").length;
  const urgentCount = attendanceIssues + privateLessonBottlenecks + eventAttention;
  return {
    urgentCount,
    responseQueue,
    attendanceIssues,
    privateLessonBottlenecks,
    eventAttention,
    summary: urgentCount ? "יש כמה נקודות שדורשות טיפול היום" : "הסטודיו נראה בשליטה כרגע"
  };
}
