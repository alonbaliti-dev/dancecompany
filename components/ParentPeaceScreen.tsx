"use client";

import { useProductData } from "@/context/ProductDataContext";
import { Card, Header, SectionEyebrow } from "./ui";

export function ParentPeaceScreen() {
  const { parentDashboard } = useProductData();
  if (!parentDashboard) {
    return <Header title="שקט נפשי" subtitle="אזור הורים" />;
  }
  const p = parentDashboard;
  const nextClass = p.schedulePreview[0];

  return (
    <div className="space-y-8 pb-6">
      <Header title="שקט נפשי" subtitle="סיכום רגוע — בלי הערות פנימיות של צוות." />
      <Card animated={false} className="border-emerald-400/12">
        <p className="text-sm text-white/50">מצב כללי</p>
        <p className="mt-2 text-sm leading-relaxed text-emerald-200/90">{p.generalProgressSummary}</p>
        <p className="mt-3 text-sm text-white/45">{p.paymentStatusLabel}</p>
      </Card>
      {nextClass ? (
        <Card animated={false}>
          <SectionEyebrow>השיעור הבא</SectionEyebrow>
          <p className="mt-2 font-semibold text-white">{nextClass.title}</p>
          <p className="mt-1 text-sm text-white/45">
            {nextClass.day} · {nextClass.time} · {nextClass.group}
          </p>
        </Card>
      ) : null}
      <Card animated={false}>
        <SectionEyebrow>הופעה ואירועים</SectionEyebrow>
        <p className="mt-2 text-sm text-white/55">{p.performanceSummary}</p>
      </Card>
      {p.pendingApprovals.length ? (
        <div>
          <SectionEyebrow>ממתין לאישור</SectionEyebrow>
          {p.pendingApprovals.map((a) => (
            <Card key={a.id} animated={false} className="mt-2">
              <p className="font-medium text-white">{a.title}</p>
              <p className="text-xs text-white/40">{a.dueDate}</p>
            </Card>
          ))}
        </div>
      ) : null}
      {p.equipmentList.length ? (
        <Card animated={false}>
          <SectionEyebrow>ציוד לשיעור</SectionEyebrow>
          <ul className="mt-2 space-y-1 text-right text-sm text-white/50">
            {p.equipmentList.map((x) => (
              <li key={x}>· {x}</li>
            ))}
          </ul>
        </Card>
      ) : null}
    </div>
  );
}
