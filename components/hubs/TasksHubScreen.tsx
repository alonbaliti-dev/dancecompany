"use client";

import { useMemo } from "react";
import { Flame, Mic2, School } from "lucide-react";
import { useStudioData } from "@/context/StudioDataContext";
import { statusForStudent, taskVisibleToStudent } from "@/lib/studio-task-logic";
import type { UserProfile } from "@/lib/types";
import { PracticeTasksSection } from "../TasksScreen";
import { Header, HubLinkRow, HubTile, PrimaryButton, screenClass } from "../ui";

export function TasksHubScreen({
  user,
  onOpenPractice,
  onOpenTeacher,
  onOpenRehearsal
}: {
  user: UserProfile;
  onOpenPractice?: () => void;
  onOpenTeacher?: () => void;
  onOpenRehearsal?: () => void;
}) {
  const { tasks } = useStudioData();
  const teacher = user.permissions.isTeacher;
  const mgmt = user.permissions.isManagement;

  const openCount = useMemo(() => {
    return tasks
      .filter((t) => taskVisibleToStudent(t, user))
      .filter((t) => {
        const st = statusForStudent(t, user.id);
        return st === "overdue" || st === "not_started" || st === "in_progress";
      }).length;
  }, [tasks, user]);

  if (teacher || mgmt) {
    return (
      <div className={screenClass}>
        <Header title="משימות" subtitle="הקצאה ומעקב — דרך מרכז המורה." />
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {onOpenTeacher ? (
            <HubTile icon={School} title="מרכז מורה" subtitle="הקצאה, מעקב והודעות" onClick={onOpenTeacher} tone="teacher" />
          ) : null}
          {onOpenRehearsal ? (
            <HubTile icon={Mic2} title="מצב חזרה" subtitle="סדר הופעה ונוכחות" onClick={onOpenRehearsal} tone="competition" />
          ) : null}
        </div>
        {onOpenTeacher ? (
          <PrimaryButton tone="teacher" onClick={onOpenTeacher}>
            פתיחת מרכז המורה
          </PrimaryButton>
        ) : null}
      </div>
    );
  }

  return (
    <div className={screenClass}>
      <Header title="משימות" subtitle={openCount > 0 ? `${openCount} פתוחות` : "הכול מעודכן — כל הכבוד."} />

      {onOpenPractice ? (
        <HubLinkRow icon={Flame} title="תרגול ביתי" subtitle="סרטונים ויעדים שבועיים" onClick={onOpenPractice} tone="achievement" />
      ) : null}

      <PracticeTasksSection />
    </div>
  );
}
