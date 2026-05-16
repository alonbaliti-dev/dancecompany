import type { V6Database } from "@/lib/v6/types";

export type V6AttendanceEntry = V6Database["attendance"][number];

export type V6AttendanceRisk = {
  studentId: string;
  missingCount: number;
  presentCount: number;
  riskLevel: "low" | "medium" | "high";
  reason: string;
};
