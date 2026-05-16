"use client";

import { Card, Header, SectionEyebrow } from "./ui";

export function StudioSettingsScreen() {
  return (
    <div className="space-y-8 pb-6">
      <Header title="הגדרות סטודיו" subtitle="פרטי סטודיו, מיתוג והודעות." />
      <Card animated={false}>
        <p className="mt-3 text-right text-sm leading-relaxed text-white/48">צוות ההנהלה מעדכן כאן פרטי סטודיו, תבניות הודעה ומיתוג.</p>
      </Card>
    </div>
  );
}
