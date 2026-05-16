"use client";

import { useStudioOS } from "@/context/StudioOSContext";
import { Card, Header, RingStat, SectionEyebrow } from "./ui";

export function StudioHealthScreen() {
  const { studioHealth, riskAlerts } = useStudioOS();
  if (!studioHealth) return null;

  return (
    <div className="space-y-8 pb-6">
      <Header title="בריאות הסטודיו" subtitle="מבט מנהלי על הסטודיו" />
      <Card animated={false} className="flex flex-wrap items-center justify-between gap-6">
        <RingStat value={studioHealth.score} label="ציון כללי" size={88} />
        <div className="text-right">
          <p className="text-3xl font-semibold text-white">{studioHealth.alertsCount}</p>
          <p className="text-sm text-white/45">התראות סיכון פעילות</p>
          <p className="mt-3 text-sm text-white/50">פעילות מורים: {studioHealth.teacherActivityPct}%</p>
        </div>
      </Card>
      <div>
        <SectionEyebrow>קבוצות שדורשות תשומת לב</SectionEyebrow>
        {studioHealth.lowEngagementGroups.map((g) => (
          <Card key={g} animated={false} className="mt-2"><p className="text-white">{g}</p></Card>
        ))}
      </div>
      <div>
        <SectionEyebrow>סיכונים</SectionEyebrow>
        {riskAlerts.map((r) => (
          <Card key={r.id} animated={false} className="mt-2 border-rose-400/10">
            <p className="font-semibold text-white">{r.title}</p>
            <p className="mt-1 text-sm text-white/45">{r.detail}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
