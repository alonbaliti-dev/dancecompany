"use client";

import { DatabaseToolsPanel } from "@/components/platform/DatabaseToolsPanel";
import { BackupRestorePanel } from "./BackupRestorePanel";
import type { UserProfile } from "@/lib/types";
import { Header, screenClass } from "../ui";

export function BackupRestoreScreen({ user }: { user: UserProfile }) {
  return (
    <div className={screenClass}>
      <Header title="גיבוי ושחזור" subtitle="יצירה, שחזור, ייצוא וייבוא מסד נתונים" />
      <BackupRestorePanel user={user} />
      <DatabaseToolsPanel />
    </div>
  );
}
