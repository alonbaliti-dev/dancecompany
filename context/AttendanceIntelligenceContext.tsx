"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useCommunication } from "@/context/CommunicationContext";
import { usePlatform } from "@/context/PlatformContext";
import {
  buildAttendanceParentUpdatePayload,
  parentIdsForStudent,
  type ParentNotifyResult
} from "@/lib/attendance/parent-notify";
import {
  buildGroupSummaries,
  buildStudentSummaries,
  filterRecordsForUser,
  overviewFromSummaries
} from "@/lib/attendance-intelligence/logic";
import { useLocalDatabase } from "@/context/LocalDatabaseContext";
import { getSchoolYearBounds } from "@/lib/attendance-intelligence/school-year";
import { canViewAttendanceIntelligence } from "@/lib/security/permissions";
import type { AttendanceRecord, GroupAttendanceSummary, StudentAttendanceSummary, UserProfile } from "@/lib/types";

type Ctx = {
  user: UserProfile;
  studioId: string;
  schoolYearLabel: string;
  records: AttendanceRecord[];
  summaries: StudentAttendanceSummary[];
  groups: GroupAttendanceSummary[];
  overview: ReturnType<typeof overviewFromSummaries>;
  getStudentRecords: (studentId: string) => AttendanceRecord[];
  getStudentSummary: (studentId: string) => StudentAttendanceSummary | undefined;
  flagForReview: (studentId: string) => void;
  sendParentUpdate: (studentId: string) => ParentNotifyResult;
};

const AttendanceIntelligenceContext = createContext<Ctx | null>(null);

export function AttendanceIntelligenceProvider({ user, children }: { user: UserProfile; children: ReactNode }) {
  const { activeStudioId } = usePlatform();
  const studioId = user.permissions.isSuperAdmin ? activeStudioId : user.studioId;
  const { db } = useLocalDatabase();
  const { sendStudioUpdate } = useCommunication();
  const allRecords = db.attendance.intelligenceRecords;
  const [reviewFlags, setReviewFlags] = useState<Record<string, boolean>>({});

  const records = useMemo(
    () => filterRecordsForUser(allRecords, user, studioId),
    [allRecords, user, studioId]
  );

  const summaries = useMemo(() => {
    const base = buildStudentSummaries(records);
    return base.map((s) => ({
      ...s,
      flaggedForReview: reviewFlags[s.studentId] ?? s.flaggedForReview ?? false
    }));
  }, [records, reviewFlags]);

  const groups = useMemo(() => buildGroupSummaries(summaries), [summaries]);
  const overview = useMemo(() => overviewFromSummaries(summaries), [summaries]);
  const { label: schoolYearLabel } = getSchoolYearBounds();

  const getStudentRecords = useCallback(
    (studentId: string) =>
      records
        .filter((r) => r.studentId === studentId)
        .sort((a, b) => b.classDate.localeCompare(a.classDate)),
    [records]
  );

  const getStudentSummary = useCallback(
    (studentId: string) => summaries.find((s) => s.studentId === studentId),
    [summaries]
  );

  const flagForReview = useCallback((studentId: string) => {
    setReviewFlags((prev) => ({ ...prev, [studentId]: true }));
  }, []);

  const sendParentUpdate = useCallback(
    (studentId: string): ParentNotifyResult => {
      const summary = summaries.find((s) => s.studentId === studentId);
      if (!summary) return { ok: false, reason: "לא נמצא פרופיל תלמיד" };

      const parentIds = parentIdsForStudent(studentId);
      if (!parentIds.length) return { ok: false, reason: "לא נמצאו הורים מקושרים לתלמיד/ה" };

      const payload = buildAttendanceParentUpdatePayload(summary, schoolYearLabel);
      const result = sendStudioUpdate(payload);
      if (!result.recipientCount) {
        return { ok: false, reason: "לא ניתן לשלוח — בדקו הרשאות או יעד" };
      }
      return { ok: true, recipientCount: result.recipientCount, notificationId: result.notificationId };
    },
    [summaries, schoolYearLabel, sendStudioUpdate]
  );

  const value = useMemo(
    () => ({
      user,
      studioId,
      schoolYearLabel,
      records,
      summaries,
      groups,
      overview,
      getStudentRecords,
      getStudentSummary,
      flagForReview,
      sendParentUpdate
    }),
    [
      user,
      studioId,
      schoolYearLabel,
      records,
      summaries,
      groups,
      overview,
      getStudentRecords,
      getStudentSummary,
      flagForReview,
      sendParentUpdate
    ]
  );

  if (!canViewAttendanceIntelligence(user)) {
    return <>{children}</>;
  }

  return <AttendanceIntelligenceContext.Provider value={value}>{children}</AttendanceIntelligenceContext.Provider>;
}

export function useAttendanceIntelligence() {
  const ctx = useContext(AttendanceIntelligenceContext);
  if (!ctx) {
    throw new Error("useAttendanceIntelligence requires staff access and AttendanceIntelligenceProvider");
  }
  return ctx;
}

export function useAttendanceIntelligenceOptional() {
  return useContext(AttendanceIntelligenceContext);
}
