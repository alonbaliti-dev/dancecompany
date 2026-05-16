"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { useLocalDatabase } from "@/context/LocalDatabaseContext";
import type { ProductDataBundle } from "@/lib/local-db/db-types";
import { mockAiGenerate } from "@/lib/ai-mock-he";
import type {
  AiToolId,
  AttendanceMark,
  AttendanceSession,
  ChecklistItem,
  DigitalStudentFile,
  GamificationState,
  ManagementReportSummary,
  ParentDashboardData,
  PerformanceEventDetail,
  PracticeVideo,
  PracticeVideoStatus,
  StudentGoal,
  UserProfile
} from "@/lib/types";

type Ctx = {
  user: UserProfile;
  goals: StudentGoal[];
  updateGoalProgress: (goalId: string, delta: number) => void;
  filesByStudentId: Record<string, DigitalStudentFile>;
  updateFileTeacherNotes: (studentId: string, notes: string) => void;
  videos: PracticeVideo[];
  submitPracticeVideo: (input: {
    title: string;
    note: string;
    attachedTaskId?: string;
    attachedGoalId?: string;
  }) => void;
  reviewPracticeVideo: (
    id: string,
    status: PracticeVideoStatus,
    teacherFeedback?: string,
    technicalNotes?: string
  ) => void;
  attendanceSessions: AttendanceSession[];
  setAttendanceMark: (sessionId: string, studentId: string, mark: AttendanceMark) => void;
  performance: PerformanceEventDetail;
  togglePerformanceChecklist: (index: number) => void;
  gamification: GamificationState;
  bumpWeeklyChallenge: () => void;
  reports: ManagementReportSummary;
  parentDashboard: ParentDashboardData | null;
  generateAi: (tool: AiToolId) => string;
};

const ProductDataContext = createContext<Ctx | null>(null);

function newId(p: string) {
  return `${p}_${Date.now().toString(36)}`;
}

export function ProductDataProvider({ user, children }: { user: UserProfile; children: ReactNode }) {
  const { db, setDb } = useLocalDatabase();
  const product = db.productData;
  const attendanceSessions = db.attendance.sessions;

  const patchProduct = useCallback(
    (updater: (p: ProductDataBundle) => ProductDataBundle) => {
      setDb((prev) => ({ ...prev, productData: updater(prev.productData) }));
    },
    [setDb]
  );

  const parentDashboard = useMemo(() => {
    if (!user.isParent) return null;
    return product.parentDashboardByParentId[user.id] ?? null;
  }, [user.isParent, user.id, product.parentDashboardByParentId]);

  const updateGoalProgress = useCallback(
    (goalId: string, delta: number) => {
      patchProduct((p) => ({
        ...p,
        goals: p.goals.map((g) => {
          if (g.id !== goalId || g.studentId !== user.id) return g;
          const next = Math.min(100, Math.max(0, g.progressPercent + delta));
          return {
            ...g,
            progressPercent: next,
            monthlyProgressPct: Math.min(100, g.monthlyProgressPct + Math.round(delta / 2))
          };
        })
      }));
    },
    [patchProduct, user.id]
  );

  const updateFileTeacherNotes = useCallback(
    (studentId: string, notes: string) => {
      patchProduct((p) => {
        const f = p.filesByStudentId[studentId];
        if (!f) return p;
        return { ...p, filesByStudentId: { ...p.filesByStudentId, [studentId]: { ...f, teacherNotes: notes } } };
      });
    },
    [patchProduct]
  );

  const submitPracticeVideo = useCallback(
    (input: { title: string; note: string; attachedTaskId?: string; attachedGoalId?: string }) => {
      const row = {
        id: newId("vid"),
        studentId: user.id,
        studentName: user.name,
        title: input.title.trim() || "העלאה חדשה",
        note: input.note.trim(),
        mockUri: `mock://upload/${Date.now()}.mp4`,
        attachedTaskId: input.attachedTaskId,
        attachedGoalId: input.attachedGoalId,
        status: "pending_review" as const,
        submittedAt: new Date().toISOString()
      };
      patchProduct((p) => {
        const f = p.filesByStudentId[user.id];
        return {
          ...p,
          videos: [row, ...p.videos],
          filesByStudentId: f
            ? { ...p.filesByStudentId, [user.id]: { ...f, uploadedVideoIds: [row.id, ...f.uploadedVideoIds] } }
            : p.filesByStudentId
        };
      });
    },
    [patchProduct, user.id, user.name]
  );

  const reviewPracticeVideo = useCallback(
    (id: string, status: PracticeVideoStatus, teacherFeedback?: string, technicalNotes?: string) => {
      patchProduct((p) => ({
        ...p,
        videos: p.videos.map((v) =>
          v.id === id
            ? {
                ...v,
                status,
                teacherFeedback: teacherFeedback ?? v.teacherFeedback,
                technicalNotes: technicalNotes ?? v.technicalNotes,
                reviewedAt: new Date().toISOString()
              }
            : v
        )
      }));
    },
    [patchProduct]
  );

  const setAttendanceMark = useCallback(
    (sessionId: string, studentId: string, mark: AttendanceMark) => {
      setDb((prev) => ({
        ...prev,
        attendance: {
          ...prev.attendance,
          sessions: prev.attendance.sessions.map((s) => {
            if (s.id !== sessionId) return s;
            return {
              ...s,
              updatedAt: new Date().toISOString(),
              rows: s.rows.map((r) => (r.studentId === studentId ? { ...r, mark } : r))
            };
          })
        }
      }));
    },
    [setDb]
  );

  const togglePerformanceChecklist = useCallback(
    (index: number) => {
      patchProduct((p) => ({
        ...p,
        performance: {
          ...p.performance,
          equipmentChecklist: p.performance.equipmentChecklist.map((it: ChecklistItem, i: number) =>
            i === index ? { ...it, done: !it.done } : it
          )
        }
      }));
    },
    [patchProduct]
  );

  const bumpWeeklyChallenge = useCallback(() => {
    patchProduct((p) => ({
      ...p,
      gamification: {
        ...p.gamification,
        weeklyChallengeProgressPct: Math.min(100, p.gamification.weeklyChallengeProgressPct + 8)
      }
    }));
  }, [patchProduct]);

  const generateAi = useCallback((tool: AiToolId) => mockAiGenerate(tool), []);

  const value = useMemo(
    () => ({
      user,
      goals: product.goals.filter((g) => g.studentId === user.id),
      updateGoalProgress,
      filesByStudentId: product.filesByStudentId,
      updateFileTeacherNotes,
      videos: product.videos,
      submitPracticeVideo,
      reviewPracticeVideo,
      attendanceSessions,
      setAttendanceMark,
      performance: product.performance,
      togglePerformanceChecklist,
      gamification: product.gamification,
      bumpWeeklyChallenge,
      reports: product.reports,
      parentDashboard,
      generateAi
    }),
    [
      user,
      product,
      updateGoalProgress,
      updateFileTeacherNotes,
      submitPracticeVideo,
      reviewPracticeVideo,
      attendanceSessions,
      setAttendanceMark,
      togglePerformanceChecklist,
      bumpWeeklyChallenge,
      parentDashboard,
      generateAi
    ]
  );

  return <ProductDataContext.Provider value={value}>{children}</ProductDataContext.Provider>;
}

export function useProductData(): Ctx {
  const x = useContext(ProductDataContext);
  if (!x) throw new Error("useProductData requires ProductDataProvider");
  return x;
}
