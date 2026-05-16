import type { V6Database } from "@/lib/v6/types";
import type { V6AttendanceRisk } from "@/lib/domains/attendance/types";

export function computeV6AttendanceRisks(db: V6Database): V6AttendanceRisk[] {
  return db.users
    .filter((user) => user.role === "student")
    .map((student) => {
      const entries = db.attendance.filter((item) => item.studentId === student.id);
      const missingCount = entries.filter((item) => item.status === "missing").length;
      const presentCount = entries.filter((item) => item.status === "present").length;
      const riskLevel: V6AttendanceRisk["riskLevel"] = missingCount >= 3 ? "high" : missingCount >= 1 ? "medium" : "low";
      return {
        studentId: student.id,
        missingCount,
        presentCount,
        riskLevel,
        reason: riskLevel === "high" ? "היעדרויות חוזרות דורשות מעקב הורה/מורה" : riskLevel === "medium" ? "כדאי לעקוב אחרי השיעור הקרוב" : "נוכחות יציבה"
      };
    })
    .filter((risk) => risk.missingCount > 0)
    .sort((a, b) => b.missingCount - a.missingCount);
}
