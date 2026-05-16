"use client";

import { APP_VERSION } from "@/lib/platform/constants";
import { usePlatform } from "@/context/PlatformContext";
import { Card, GhostButton, Header, PrimaryButton, SectionEyebrow, screenClass } from "../ui";

export function SystemUpdatesScreen() {
  const { releaseNotes, forceRefreshMock } = usePlatform();
  const needsUpdate = APP_VERSION.current !== APP_VERSION.latest;

  return (
    <div className={screenClass}>
      <Header title="עדכוני מערכת" subtitle="גרסה, שחרורים ותחזוקה." />
      <Card animated={false}>
        <p className="text-sm text-white/45">גרסה מותקנת</p>
        <p className="mt-1 text-xl font-semibold text-white">{APP_VERSION.current}</p>
        {needsUpdate ? <p className="mt-2 text-sm text-emerald-200/80">זמינה: {APP_VERSION.latest}</p> : <p className="mt-2 text-sm text-white/40">הגרסה עדכנית</p>}
        <PrimaryButton className="mt-4" onClick={forceRefreshMock}>רענון גרסה</PrimaryButton>
      </Card>
      <Card animated={false}>
        <SectionEyebrow>PWA</SectionEyebrow>
        <p className="mt-2 text-sm leading-relaxed text-white/50">בהתקנה מהמסך הראשי, עדכונים ייטענו אוטומטית. רענון כפוי מבטיח קבלת הגרסה האחרונה.</p>
      </Card>
      <div>
        <SectionEyebrow>יומן שינויים</SectionEyebrow>
        <div className="mt-3 space-y-2">
          {releaseNotes.map((r) => (
            <Card key={r.id} animated={false}>
              <p className="text-[10px] uppercase tracking-wide text-white/38">{r.type} · {r.version}</p>
              <p className="mt-1 font-semibold text-white">{r.title}</p>
              <p className="mt-2 text-sm text-white/48">{r.body}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
