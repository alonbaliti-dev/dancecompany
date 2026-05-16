"use client";
import { getDirectoryUsers } from "@/lib/directory-store";

import { useMemo } from "react";
import { AlertTriangle, Bell } from "lucide-react";

import { useCommunication } from "@/context/CommunicationContext";
import { useProductData } from "@/context/ProductDataContext";
import { useToast } from "@/context/ToastContext";
import { buildSessionParentUpdatePayload, parentIdsForStudent } from "@/lib/attendance/parent-notify";
import type { AttendanceMark, UserProfile } from "@/lib/types";
import { Card, Header, SectionEyebrow, SectionTitle, GhostButton, cx } from "./ui";

const markLabel: Record<AttendanceMark, string> = {
  present: "נוכח",
  late: "איחור",
  absent: "חיסור"
};

export function AttendanceScreen({ user }: { user: UserProfile }) {
  const { attendanceSessions, setAttendanceMark } = useProductData();
  const { sendStudioUpdate } = useCommunication();
  const { showToast } = useToast();

  function notifyParent(
    row: { studentId: string; studentName: string },
    session: { classTitle: string; groupName: string; date: string },
    mark: AttendanceMark
  ) {
    if (!parentIdsForStudent(row.studentId).length) {
      showToast("לא נמצאו הורים מקושרים", "error");
      return;
    }
    const payload = buildSessionParentUpdatePayload({
      studentId: row.studentId,
      studentName: row.studentName,
      classTitle: session.classTitle,
      groupName: session.groupName,
      date: session.date,
      mark
    });
    const result = sendStudioUpdate(payload);
    if (result.recipientCount) {
      showToast(`עדכון נשלח ל־${result.recipientCount} הורים`, "success");
    } else {
      showToast("לא ניתן לשלוח עדכון — בדקו הרשאות", "error");
    }
  }

  const sessions = useMemo(() => {
    if (user.permissions.isManagement) return attendanceSessions;
    return attendanceSessions.filter((s) => s.teacherId === user.id);
  }, [attendanceSessions, user]);

  const lowGroups = useMemo(() => {
    if (!user.permissions.isManagement) return [];
    return ["היפ הופ — מתבגרים", "חימום וטכניקה"].map((name) => ({ name, pct: 78 }));
  }, [user]);

  const idleTeachers = useMemo(() => {
    if (!user.permissions.isManagement) return [];
    const activeIds = new Set(sessions.map((s) => s.teacherId));
    return getDirectoryUsers().filter(
      (t) => t.permissions.isTeacher && !t.permissions.isManagement && !activeIds.has(t.id)
    );
  }, [user, sessions]);

  return (
    <div className="space-y-10 pb-6">
      <Header title="נוכחות חכמה" subtitle="סימון נוכחות מהיר לפי שיעור." />

      {user.permissions.isManagement ? (
        <section className="space-y-3">
          <SectionEyebrow>הנהלה</SectionEyebrow>
          <SectionTitle className="mt-0.5">מבט מערכתי</SectionTitle>
          <div className="mt-3 space-y-3">
            <Card animated={false}>
              <p className="text-right text-sm font-semibold text-white">קבוצות עם נוכחות נמוכה</p>
              <div className="mt-3 space-y-2">
                {lowGroups.map((g) => (
                  <div key={g.name} className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5 text-right">
                    <span className="text-sm tabular-nums text-amber-200/90">{g.pct}%</span>
                    <span className="text-sm text-white/70">{g.name}</span>
                  </div>
                ))}
              </div>
            </Card>
            <Card animated={false}>
              <p className="text-right text-sm font-semibold text-white">מורים ללא עדכון נוכחות</p>
              <ul className="mt-3 space-y-2 text-right text-sm text-white/48">
                {idleTeachers.map((t) => (
                  <li key={t.id}>· {t.name}</li>
                ))}
              </ul>
            </Card>
          </div>
        </section>
      ) : null}

      <section className="space-y-3">
        <SectionTitle>שיעורים היום</SectionTitle>
        {sessions.length === 0 ? (
          <Card animated={false}>
            <p className="text-center text-sm text-white/42">אין שיעורים בתאריך זה</p>
          </Card>
        ) : (
          sessions.map((s) => (
            <Card key={s.id} animated={false}>
              <div className="text-right">
                <p className="text-[11px] text-white/38">{new Date(s.date).toLocaleDateString("he-IL")}</p>
                <p className="mt-1 text-lg font-semibold text-white">{s.classTitle}</p>
                <p className="mt-0.5 text-sm text-white/42">{s.groupName}</p>
                <div className="mt-5 space-y-3 border-t border-white/[0.06] pt-4">
                  {s.rows.map((r) => (
                    <div key={r.studentId} className="flex flex-col gap-2 rounded-2xl border border-white/[0.06] bg-black/25 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="text-right">
                        <p className="font-medium text-white">{r.studentName}</p>
                        {r.repeatedAbsences ? <p className="mt-1 text-[11px] text-amber-200/75">חיסורים חוזרים: {r.repeatedAbsences}</p> : null}
                      </div>
                      <div className="flex flex-wrap justify-end gap-1.5">
                        {(["present", "late", "absent"] as AttendanceMark[]).map((m) => (
                          <GhostButton
                            key={m}
                            className={cx("!px-3 !py-2 !text-[11px] !font-semibold", r.mark === m && "!border-emerald-400/35 !bg-emerald-500/12")}
                            onClick={() => setAttendanceMark(s.id, r.studentId, m)}
                          >
                            {markLabel[m]}
                          </GhostButton>
                        ))}
                        <GhostButton
                          className="!px-2 !py-2 !text-[10px]"
                          onClick={() => notifyParent(r, s, r.mark ?? "absent")}
                          aria-label={`עדכון להורה של ${r.studentName}`}
                        >
                          <Bell size={14} />
                        </GhostButton>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-[11px] text-white/32">עודכן: {s.updatedAt ? new Date(s.updatedAt).toLocaleString("he-IL") : "טרם עודכן"}</p>
              </div>
            </Card>
          ))
        )}
      </section>

      <Card animated={false}>
        <div className="flex gap-3 text-right">
          <AlertTriangle className="mt-0.5 shrink-0 text-amber-300/85" size={20} />
          <p className="text-sm leading-relaxed text-white/48">שליחת עדכון להורים לפי נוכחות בשיעור.</p>
        </div>
      </Card>
    </div>
  );
}
