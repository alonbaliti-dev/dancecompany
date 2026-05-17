import type { AIAgent } from "./ai-types";

export const riskDetectionAgent: AIAgent = {
  id: "risk_detection",
  label: "Risk Detection Agent",
  run: ({ actor, db }) => {
    const missingAttendance = db.attendance.filter((item) => item.status === "missing" || item.status === "absent").length;
    if (actor.role === "student" || actor.role === "parent") return [];
    return [
      {
        id: "risk_attendance",
        agentId: "risk_detection",
        title: "זיהוי סיכון",
        body: missingAttendance > 0 ? `נראה שיש ${missingAttendance} חוסרים. כדאי לבדוק נוכחות ומשימות לפני השיעור הבא.` : "המצב נראה רגוע. כדאי לשמור על מעקב קצר אחרי משימות ואישורים.",
        riskLevel: missingAttendance > 0 ? "medium" : "low",
        requiresApproval: true,
        suggestedActions: ["בדיקת נוכחות", "איתור אישורים חסרים"]
      }
    ];
  }
};
