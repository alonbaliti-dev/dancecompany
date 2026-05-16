"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { useLocalDatabase } from "@/context/LocalDatabaseContext";
import { enrichFacultyRecord } from "@/lib/faculty/faculty-access";
import { INSTITUTIONAL_STYLES } from "@/lib/institutional-styles";
import type {
  FacultyMember,
  InstitutionalDanceStyle,
  InstitutionalStyleId,
  LegacyMilestone,
  StudioLegacyQuote,
  StudioMission,
  UserProfile
} from "@/lib/types";

type Ctx = {
  user: UserProfile;
  mission: StudioMission | null;
  milestones: LegacyMilestone[];
  featuredMilestones: LegacyMilestone[];
  quotes: StudioLegacyQuote[];
  faculty: FacultyMember[];
  management: FacultyMember[];
  mentors: FacultyMember[];
  teachers: FacultyMember[];
  styles: InstitutionalDanceStyle[];
  getFaculty: (id: string) => FacultyMember | undefined;
  getMilestone: (id: string) => LegacyMilestone | undefined;
  styleFor: (id: InstitutionalStyleId) => InstitutionalDanceStyle | undefined;
};

const StudioIdentityContext = createContext<Ctx | null>(null);

export function StudioIdentityProvider({ user, children }: { user: UserProfile; children: ReactNode }) {
  const { db } = useLocalDatabase();
  const identity = db.studioIdentity;

  const mission = identity.missionsByStudio[user.studioId] ?? null;
  const milestones = useMemo(
    () => identity.milestones.filter((m) => m.studioId === user.studioId),
    [identity.milestones, user.studioId]
  );
  const featuredMilestones = useMemo(() => milestones.filter((m) => m.featured), [milestones]);
  const quotes = identity.quotes;
  const faculty = useMemo(() => {
    const rows = db.faculty.filter((f) => f.studioId === user.studioId);
    const visible = rows.filter(
      (f) => f.visibility === "public" || user.permissions.isManagement || user.permissions.isSuperAdmin
    );
    return visible.map((r, i) => enrichFacultyRecord(r, i));
  }, [db.faculty, user.studioId, user.permissions.isManagement, user.permissions.isSuperAdmin]);
  const management = useMemo(
    () => faculty.filter((f) => f.role === "owner" || f.role === "management"),
    [faculty]
  );
  const mentors = useMemo(
    () => faculty.filter((f) => f.role === "mentor" || f.role === "teacher"),
    [faculty]
  );
  const teachers = mentors;

  const styles = useMemo(() => Object.values(INSTITUTIONAL_STYLES), []);

  const getFaculty = useCallback((id: string) => faculty.find((f) => f.id === id), [faculty]);
  const getMilestone = useCallback((id: string) => milestones.find((m) => m.id === id), [milestones]);
  const styleFor = useCallback((id: InstitutionalStyleId) => styles.find((s) => s.id === id), [styles]);

  const value = useMemo(
    () => ({
      user,
      mission,
      milestones,
      featuredMilestones,
      quotes,
      faculty,
      management,
      mentors,
      teachers,
      styles,
      getFaculty,
      getMilestone,
      styleFor
    }),
    [user, mission, milestones, featuredMilestones, quotes, faculty, management, mentors, teachers, styles, getFaculty, getMilestone, styleFor]
  );

  return <StudioIdentityContext.Provider value={value}>{children}</StudioIdentityContext.Provider>;
}

export function useStudioIdentity(): Ctx {
  const x = useContext(StudioIdentityContext);
  if (!x) throw new Error("useStudioIdentity requires StudioIdentityProvider");
  return x;
}
