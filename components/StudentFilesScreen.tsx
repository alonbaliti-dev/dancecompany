"use client";
import { getDirectoryUsers } from "@/lib/directory-store";

import { useMemo, useState } from "react";
import { Star, TrendingDown, Video } from "lucide-react";

import { getStudentsForTeacher } from "@/lib/studio-roster";
import { useProductData } from "@/context/ProductDataContext";
import type { UserProfile } from "@/lib/types";
import { Card, Divider, Header, SectionEyebrow, SectionTitle, GhostButton, cx } from "./ui";

export function StudentFilesScreen({ user }: { user: UserProfile }) {
  const { filesByStudentId, videos, updateFileTeacherNotes, reviewPracticeVideo } = useProductData();
  const [sid, setSid] = useState(() => {
    const pool = user.permissions.isManagement
      ? getDirectoryUsers().filter((u) => !u.permissions.isTeacher && !u.permissions.isManagement)
      : getStudentsForTeacher(user);
    return pool[0]?.id ?? "u_maya";
  });

  const pool = useMemo(() => {
    if (user.permissions.isManagement)
      return getDirectoryUsers().filter((u) => !u.permissions.isTeacher && !u.permissions.isManagement);
    return getStudentsForTeacher(user);
  }, [user]);

  const file = filesByStudentId[sid];
  const pending = videos.filter((v) => v.studentId === sid && v.status === "pending_review");

  return (
    <div className="space-y-10 pb-6">
      <Header title="תיק דיגיטלי" subtitle="נתונים רגישים — גלוי למורים ולהנהלה בלבד." />

      <Card animated={false}>
        <p className="text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-white/38">בחירת תלמיד</p>
        <select className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3.5 text-[15px] text-white outline-none" value={sid} onChange={(e) => setSid(e.target.value)}>
          {pool.map((s) => (
            <option key={s.id} value={s.id} className="bg-zinc-900">
              {s.name}
            </option>
          ))}
        </select>
      </Card>

      {!file ? (
        <Card animated={false}>
          <p className="text-center text-sm text-white/45">אין תיק דיגיטלי לתלמיד זה.</p>
        </Card>
      ) : (
        <>
          <section className="grid gap-3 sm:grid-cols-2">
            <Card animated={false}>
              <div className="flex items-center gap-2 text-right">
                <Star className="text-emerald-300/85" size={18} />
                <SectionEyebrow>חוזקות</SectionEyebrow>
              </div>
              <ul className="mt-3 space-y-2 text-right text-sm text-white/55">
                {file.strengths.map((s) => (
                  <li key={s}>· {s}</li>
                ))}
              </ul>
            </Card>
            <Card animated={false}>
              <div className="flex items-center gap-2 text-right">
                <TrendingDown className="text-amber-300/85" size={18} />
                <SectionEyebrow>לשיפור</SectionEyebrow>
              </div>
              <ul className="mt-3 space-y-2 text-right text-sm text-white/55">
                {file.improvementAreas.map((s) => (
                  <li key={s}>· {s}</li>
                ))}
              </ul>
            </Card>
          </section>

          <Card animated={false}>
            <SectionTitle>הערות מורה</SectionTitle>
            <textarea
              className="mt-4 min-h-[5rem] w-full resize-none rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none"
              defaultValue={file.teacherNotes}
              onBlur={(e) => updateFileTeacherNotes(sid, e.target.value)}
            />
          </Card>

          <section className="space-y-3">
            <SectionTitle>נוכחות אחרונה</SectionTitle>
            <div className="space-y-2">
              {file.attendanceHistory.map((a) => (
                <Card key={`${a.date}-${a.classTitle}`} animated={false} className="!py-3.5">
                  <div className="flex items-center justify-between gap-3 text-right">
                    <span
                      className={cx(
                        "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                        a.status === "present" && "border border-emerald-400/25 bg-emerald-500/12 text-emerald-100",
                        a.status === "late" && "border border-amber-400/25 bg-amber-500/12 text-amber-50",
                        a.status === "absent" && "border border-rose-400/25 bg-rose-500/12 text-rose-100"
                      )}
                    >
                      {a.status === "present" ? "נוכח" : a.status === "late" ? "איחור" : "חיסור"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white">{a.classTitle}</p>
                      <p className="text-[11px] text-white/38">{new Date(a.date).toLocaleDateString("he-IL")}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          <Card animated={false}>
            <SectionEyebrow>תרגול ומשימות</SectionEyebrow>
            <p className="mt-2 text-right text-sm leading-relaxed text-white/52">{file.taskHistorySummary}</p>
            <p className="mt-4 text-right text-[11px] text-white/38">רצף תרגול בית: {file.practiceStreakDays} ימים</p>
          </Card>

          <section className="space-y-3">
            <SectionTitle>ציר זמן</SectionTitle>
            <div className="space-y-3">
              {file.timeline.map((t) => (
                <Card key={`${t.date}-${t.label}`} animated={false}>
                  <p className="text-[11px] text-white/38">{new Date(t.date).toLocaleDateString("he-IL")}</p>
                  <p className="mt-1 font-semibold text-white">{t.label}</p>
                  <p className="mt-1 text-sm text-white/48">{t.detail}</p>
                </Card>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <SectionTitle>סרטונים לבדיקה</SectionTitle>
            {pending.length === 0 ? (
              <Card animated={false}>
                <p className="text-center text-sm text-white/42">אין סרטונים ממתינים</p>
              </Card>
            ) : (
              pending.map((v) => (
                <Card key={v.id} animated={false}>
                  <div className="flex items-start gap-3 text-right">
                    <Video className="mt-0.5 shrink-0 text-sky-300/85" size={22} />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-white">{v.title}</p>
                      <p className="mt-1 text-sm text-white/45">{v.note}</p>
                      <p className="mt-2 text-[11px] text-white/32">הוגש · {new Date(v.submittedAt).toLocaleDateString("he-IL")}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <GhostButton className="!text-xs !font-semibold" onClick={() => reviewPracticeVideo(v.id, "approved", "מצוין — מוכן להמשך.", "שים לב לכתף בכניסה.")}>
                          אישור
                        </GhostButton>
                        <GhostButton className="!text-xs !font-semibold" onClick={() => reviewPracticeVideo(v.id, "needs_correction", "נדרשת תיקון קטן.", "להדגיש סיום רגל.")}>
                          נדרש תיקון
                        </GhostButton>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </section>
        </>
      )}

      <Divider className="opacity-40" />
    </div>
  );
}
