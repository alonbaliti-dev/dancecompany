"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { groupNameToId, userGroupIds } from "@/lib/studio-roster";
import { nextLevelId, levelLabelHe } from "@/lib/studio-os-constants";
import { computeConsistencyStats, filterRiskForUser } from "@/lib/studio-os-logic";
import { useLocalDatabase } from "@/context/LocalDatabaseContext";
import type { StudioOsData } from "@/lib/local-db/db-types";
import type {
  AiDailyRecommendation,
  LiveFeedPost,
  LiveFeedStatus,
  ProfessionalFeedbackEntry,
  RehearsalSession,
  RiskAlert,
  StudentLevelProgress,
  StudioCalendarEntry,
  StudioHealthSnapshot,
  UserProfile
} from "@/lib/types";

type Ctx = {
  user: UserProfile;
  levelProgress: StudentLevelProgress | null;
  consistency: ReturnType<typeof computeConsistencyStats>;
  feedbackForStudent: ProfessionalFeedbackEntry[];
  allFeedback: ProfessionalFeedbackEntry[];
  rehearsalSessions: RehearsalSession[];
  liveFeed: LiveFeedPost[];
  riskAlerts: RiskAlert[];
  calendarEntries: StudioCalendarEntry[];
  studioHealth: StudioHealthSnapshot | null;
  aiDaily: AiDailyRecommendation;
  getLevelForUser: (userId: string) => StudentLevelProgress | null;
  approveSkill: (skillId: string) => void;
  requestPromotion: () => void;
  addFeedback: (entry: Omit<ProfessionalFeedbackEntry, "id" | "createdAt" | "teacherId" | "teacherName">) => void;
  updateRehearsal: (id: string, patch: Partial<RehearsalSession>) => void;
  toggleRehearsalChecklist: (sessionId: string, index: number) => void;
  setRehearsalAttendance: (sessionId: string, studentId: string, present: boolean) => void;
  postLiveUpdate: (eventId: string, status: LiveFeedStatus, message: string, parentVisible: boolean) => void;
  calendarFilter: "all" | "mine" | "group";
  setCalendarFilter: (f: "all" | "mine" | "group") => void;
  filteredCalendar: StudioCalendarEntry[];
  gallerySearch: string;
  setGallerySearch: (s: string) => void;
};

const StudioOSContext = createContext<Ctx | null>(null);

function newId(p: string) {
  return `${p}_${Date.now().toString(36)}`;
}

export function StudioOSProvider({ user, children }: { user: UserProfile; children: ReactNode }) {
  const { db, setDb } = useLocalDatabase();
  const studioOs = db.studioOs;
  const [calendarFilter, setCalendarFilter] = useState<"all" | "mine" | "group">("mine");
  const [gallerySearch, setGallerySearch] = useState("");

  const patchStudioOs = useCallback(
    (updater: (os: StudioOsData) => StudioOsData) => {
      setDb((prev) => ({ ...prev, studioOs: updater(prev.studioOs) }));
    },
    [setDb]
  );

  const levelsByUser = studioOs.levelsByUser;
  const heatmapDays = studioOs.heatmapDays;
  const feedback = studioOs.feedback;
  const rehearsals = studioOs.rehearsals;
  const liveFeed = studioOs.liveFeed;
  const riskAlerts = studioOs.riskAlerts;
  const calendarEntries = studioOs.calendarEntries;

  const levelProgress = levelsByUser[user.id] ?? null;
  const consistency = useMemo(() => computeConsistencyStats(heatmapDays), [heatmapDays]);
  const aiDaily = useMemo(
    () =>
      studioOs.aiDailyByUser[user.id] ?? {
        title: "חימום + קצב",
        why: "שמירה על רצף — טכניקה וביטוי יחד.",
        durationMinutes: 12
      },
    [studioOs.aiDailyByUser, user.id]
  );

  const feedbackForStudent = useMemo(
    () => feedback.filter((f) => f.studentId === user.id && (f.visibleToStudent || user.permissions.isTeacher || user.permissions.isManagement)),
    [feedback, user]
  );

  const visibleRisk = useMemo(() => {
    const base = filterRiskForUser(user, riskAlerts);
    if (user.permissions.isManagement) return base;
    if (user.permissions.isTeacher) {
      const names = user.assignedGroups;
      return base.filter((a) => {
        if (a.teacherId === user.id) return true;
        if (!a.groupId) return false;
        return names.some((gn) => {
          const gid = groupNameToId(gn);
          return gid === a.groupId;
        });
      });
    }
    return [];
  }, [user, riskAlerts]);

  const studioHealth = user.permissions.isManagement ? studioOs.studioHealth : null;

  const filteredCalendar = useMemo(() => {
    let list = calendarEntries;
    if (calendarFilter === "mine" && !user.permissions.isManagement) {
      const gids = new Set(userGroupIds(user));
      list = list.filter((e) => !e.groupId || gids.has(e.groupId));
    }
    if (calendarFilter === "group" && user.assignedGroups.length) {
      list = list.filter((e) => e.groupName && user.assignedGroups.includes(e.groupName));
    }
    return [...list].sort((a, b) => +new Date(a.date) - +new Date(b.date));
  }, [calendarEntries, calendarFilter, user]);

  const getLevelForUser = useCallback((userId: string) => levelsByUser[userId] ?? null, [levelsByUser]);

  const approveSkill = useCallback(
    (skillId: string) => {
      if (!user.permissions.isTeacher && !user.permissions.isManagement) return;
      patchStudioOs((os) => {
        const copy = { ...os.levelsByUser };
        for (const uid of Object.keys(copy)) {
          const lp = copy[uid];
          if (!lp) continue;
          copy[uid] = {
            ...lp,
            skills: lp.skills.map((s) => (s.id === skillId ? { ...s, completed: true, teacherApproved: true } : s))
          };
          const done = copy[uid].skills.filter((s) => s.teacherApproved).length;
          copy[uid].progressPct = Math.round((done / lp.skills.length) * 100);
        }
        return { ...os, levelsByUser: copy };
      });
    },
    [user, patchStudioOs]
  );

  const requestPromotion = useCallback(() => {
    patchStudioOs((os) => {
      const lp = os.levelsByUser[user.id];
      if (!lp) return os;
      return { ...os, levelsByUser: { ...os.levelsByUser, [user.id]: { ...lp, promotionRequestedAt: new Date().toISOString() } } };
    });
  }, [user.id, patchStudioOs]);

  const addFeedback = useCallback(
    (entry: Omit<ProfessionalFeedbackEntry, "id" | "createdAt" | "teacherId" | "teacherName">) => {
      if (!user.permissions.isTeacher && !user.permissions.isManagement) return;
      const row: ProfessionalFeedbackEntry = {
        ...entry,
        id: newId("fb"),
        teacherId: user.id,
        teacherName: user.name,
        createdAt: new Date().toISOString()
      };
      patchStudioOs((os) => ({ ...os, feedback: [row, ...os.feedback] }));
    },
    [user, patchStudioOs]
  );

  const updateRehearsal = useCallback(
    (id: string, patch: Partial<RehearsalSession>) => {
      patchStudioOs((os) => ({
        ...os,
        rehearsals: os.rehearsals.map((r) => (r.id === id ? { ...r, ...patch } : r))
      }));
    },
    [patchStudioOs]
  );

  const toggleRehearsalChecklist = useCallback(
    (sessionId: string, index: number) => {
      patchStudioOs((os) => ({
        ...os,
        rehearsals: os.rehearsals.map((r) => {
          if (r.id !== sessionId) return r;
          const list = [...r.equipmentChecklist];
          if (list[index]) list[index] = { ...list[index], done: !list[index].done };
          return { ...r, equipmentChecklist: list };
        })
      }));
    },
    [patchStudioOs]
  );

  const setRehearsalAttendance = useCallback(
    (sessionId: string, studentId: string, present: boolean) => {
      patchStudioOs((os) => ({
        ...os,
        rehearsals: os.rehearsals.map((r) => {
          if (r.id !== sessionId) return r;
          return {
            ...r,
            attendance: r.attendance.map((a) => (a.studentId === studentId ? { ...a, present } : a))
          };
        })
      }));
    },
    [patchStudioOs]
  );

  const postLiveUpdate = useCallback(
    (eventId: string, status: LiveFeedStatus, message: string, parentVisible: boolean) => {
      if (!user.permissions.isTeacher && !user.permissions.isManagement) return;
      patchStudioOs((os) => ({
        ...os,
        liveFeed: [
          {
            id: newId("lf"),
            eventId,
            status,
            message,
            createdByUserId: user.id,
            createdByName: user.name,
            createdAt: new Date().toISOString(),
            parentVisible
          },
          ...os.liveFeed
        ]
      }));
    },
    [user, patchStudioOs]
  );

  const value = useMemo(
    () => ({
      user,
      levelProgress,
      consistency,
      feedbackForStudent,
      allFeedback: feedback,
      rehearsalSessions: rehearsals,
      liveFeed,
      riskAlerts: visibleRisk,
      calendarEntries,
      studioHealth,
      aiDaily,
      getLevelForUser,
      approveSkill,
      requestPromotion,
      addFeedback,
      updateRehearsal,
      toggleRehearsalChecklist,
      setRehearsalAttendance,
      postLiveUpdate,
      calendarFilter,
      setCalendarFilter,
      filteredCalendar,
      gallerySearch,
      setGallerySearch
    }),
    [
      user,
      levelProgress,
      consistency,
      feedbackForStudent,
      feedback,
      rehearsals,
      liveFeed,
      visibleRisk,
      calendarEntries,
      studioHealth,
      aiDaily,
      getLevelForUser,
      approveSkill,
      requestPromotion,
      addFeedback,
      updateRehearsal,
      toggleRehearsalChecklist,
      setRehearsalAttendance,
      postLiveUpdate,
      calendarFilter,
      filteredCalendar,
      gallerySearch
    ]
  );

  return <StudioOSContext.Provider value={value}>{children}</StudioOSContext.Provider>;
}

export function useStudioOS(): Ctx {
  const x = useContext(StudioOSContext);
  if (!x) throw new Error("useStudioOS requires StudioOSProvider");
  return x;
}

export { levelLabelHe, nextLevelId };
