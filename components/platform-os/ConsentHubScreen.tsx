"use client";

import { useMemo } from "react";
import { useLocalDatabase } from "@/context/LocalDatabaseContext";
import { usePlatform } from "@/context/PlatformContext";
import { CONSENT_LABELS, getMissingConsents } from "@/lib/services/consent-service";
import type { UserProfile } from "@/lib/types";
import { isManagement, isSuperAdmin } from "@/lib/permissions";
import { Header, screenClass } from "../ui";

export function ConsentHubScreen({ user }: { user: UserProfile }) {
  const { db } = useLocalDatabase();
  const { activeStudioId } = usePlatform();
  const studioId = isSuperAdmin(user) ? activeStudioId : user.studioId;

  const records = useMemo(() => {
    let list = db.consents.records.filter((c) => c.studioId === studioId);
    if (user.isParent && user.linkedStudentIds?.length) {
      list = list.filter((c) => user.linkedStudentIds!.includes(c.studentUserId));
    }
    if (user.permissions.isStudent && !user.isParent) {
      list = list.filter((c) => c.studentUserId === user.id);
    }
    return list;
  }, [db.consents.records, studioId, user]);

  const students = db.users.filter((u) => u.studioId === studioId && u.permissions.isStudent);

  return (
    <div className={screenClass}>
      <Header title="אישורי הורים ופרטיות" subtitle="צילום, וידאו, מופעים, תנאים ומדיניות" />
      {(isManagement(user) || isSuperAdmin(user)) && (
        <div className="rounded-2xl border border-amber-400/20 bg-amber-500/[0.08] px-4 py-3 text-right text-sm text-amber-100/85">
          {students.filter((s) => getMissingConsents(db, studioId, s.id).length > 0).length} תלמידים עם אישורים חסרים
        </div>
      )}
      <ul className="space-y-2">
        {records.map((c) => (
          <li key={c.id} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-right">
            <p className="text-sm font-medium text-white">{CONSENT_LABELS[c.consentType]}</p>
            <p className="mt-1 text-xs text-white/45">
              סטטוס: {c.status === "approved" ? "מאושר" : c.status === "pending" ? "ממתין" : c.status}
              {c.expiresAt ? ` · תוקף עד ${new Date(c.expiresAt).toLocaleDateString("he-IL")}` : ""}
            </p>
          </li>
        ))}
      </ul>
      <p className="text-right text-xs text-white/35">מדיניות פרטיות ותנאי שימוש — ניתנים לעריכה במצב עריכת טקסטים (מנהל על).</p>
    </div>
  );
}
