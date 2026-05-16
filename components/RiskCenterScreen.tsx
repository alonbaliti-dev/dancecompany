"use client";

import { useStudioOS } from "@/context/StudioOSContext";
import { Card, Header, cx } from "./ui";

export function RiskCenterScreen() {
  const { riskAlerts, user } = useStudioOS();
  if (!user.permissions.isTeacher && !user.permissions.isManagement) {
    return <Header title="מרכז סיכונים" subtitle="לצוות בלבד" />;
  }

  return (
    <div className="space-y-8 pb-6">
      <Header title="זיהוי סיכונים" subtitle="נוכחות, משימות ומעורבות — במבט אחד." />
      <div className="space-y-2">
        {riskAlerts.map((r) => (
          <Card key={r.id} animated={false} className={cx(r.severity === "high" && "border-rose-400/20", r.severity === "medium" && "border-amber-400/15")}>
            <div className="flex justify-end gap-2">
              <span className={cx("rounded-full px-2 py-0.5 text-[10px] font-bold", r.severity === "high" ? "bg-rose-500/20 text-rose-100" : r.severity === "medium" ? "bg-amber-500/15 text-amber-100" : "bg-white/10 text-white/50")}>{r.severity === "high" ? "גבוה" : r.severity === "medium" ? "בינוני" : "נמוך"}</span>
            </div>
            <p className="mt-2 font-semibold text-white">{r.title}</p>
            <p className="mt-1 text-sm text-white/45">{r.detail}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
