"use client";

import { usePlatform } from "@/context/PlatformContext";
import { createAuditLog, auditActorFromUser } from "@/lib/security/audit";
import { canViewAuditLog } from "@/lib/security/permissions";
import { checkRateLimit } from "@/lib/security/rate-limits";
import { Card, GhostButton, Header, SectionEyebrow, screenClass } from "../ui";

const PRIVACY_MATRIX: { role: string; canSee: string }[] = [
  { role: "תלמיד/ה", canSee: "פרופיל אישי, משימות, קבוצות משויכות, גלריה לפי הרשאה" },
  { role: "הורה", canSee: "סיכום התקדמות ילד/ה — לא הערות צוות" },
  { role: "מורה", canSee: "תלמידים בקבוצות משויכות, צ׳אט קבוצה, לא צ׳אט צוות לתלמידים" },
  { role: "הנהלה", canSee: "כל נתוני הסטודיו, יומן ביקורת, דוחות" },
  { role: "מנהל על", canSee: "ניהול פלטפורמה — גישה חוצת סטודיואים בשרת בלבד" }
];

export function DataSafetyScreen() {
  const { studioBilling, activeStudioId, appendAudit, user } = usePlatform();

  return (
    <div className={screenClass}>
      <Header title="נתונים, פרטיות ובטיחות" subtitle="בעלות, גיבוי, ייצוא ומי רואה מה." />

      <Card animated={false}>
        <SectionEyebrow>בעלות על הנתונים</SectionEyebrow>
        <p className="mt-2 text-sm leading-relaxed text-white/55">
          הסטודיו הוא בעל הנתונים. הפלטפורמה מעבדת מידע לצורך הפעלת השירות בלבד. בפרודקשן: מדיניות פרטיות + הסכם עיבוד נתונים (DPA).
        </p>
      </Card>

      <Card animated={false}>
        <SectionEyebrow>מי רואה מה</SectionEyebrow>
        <ul className="mt-3 space-y-2 text-right text-sm text-white/50">
          {PRIVACY_MATRIX.map((row) => (
            <li key={row.role}>
              <span className="font-medium text-white/70">{row.role}:</span> {row.canSee}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[11px] text-white/35">פירוט מלא: docs/DATA_PRIVACY.md · מדיניות RLS: docs/SECURITY_RLS_POLICIES.md</p>
      </Card>

      <Card animated={false}>
        <SectionEyebrow>הערות מורים פנימיות</SectionEyebrow>
        <p className="mt-2 text-sm leading-relaxed text-white/50">
          הערות בצ׳אט צוות, גלריית «מורים בלבד» ותיקים דיגיטליים — לא נחשפים לתלמידים. תלמידים לא יכולים לשלוח הודעות ישירות לתלמידים אחרים.
        </p>
      </Card>

      <Card animated={false}>
        <SectionEyebrow>גיבויים</SectionEyebrow>
        <p className="text-sm text-white/45">אחסון בשימוש</p>
        <p className="mt-1 text-2xl font-semibold text-white">{studioBilling.storageGb} GB</p>
        <p className="mt-2 text-xs text-white/38">גיבוי אחרון (יעד פרודקשן): יומי מוצפן · Supabase PITR</p>
      </Card>

      <Card animated={false}>
        <SectionEyebrow>בקשות מחיקה וייצוא</SectionEyebrow>
        <p className="mt-2 text-sm text-white/48">ייצוא ומחיקת חשבון מתבצעים דרך ההנהלה ומערכת הפלטפורמה — עם רישום ביומן ביקורת.</p>
      </Card>

      {user && canViewAuditLog(user, activeStudioId) ? (
        <GhostButton
          className="w-full"
          onClick={() => {
            const rate = checkRateLimit(activeStudioId, "dataExport");
            if (!rate.allowed) return;
            const entry = createAuditLog({
              action: "data_export_requested",
              actor: auditActorFromUser(user),
              target: { type: "export", studioId: activeStudioId },
              severity: "info"
            });
            appendAudit({
              studioId: entry.studioId,
              actorUserId: entry.actorUserId,
              actorName: entry.actorName,
              action: entry.action,
              targetType: entry.targetType,
              severity: entry.severity
            });
          }}
        >
          בקשת ייצוא נתונים
        </GhostButton>
      ) : null}
    </div>
  );
}
