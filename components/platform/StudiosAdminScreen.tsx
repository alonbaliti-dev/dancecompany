"use client";

import { usePlatform } from "@/context/PlatformContext";
import { STUDIO_DEMO } from "@/lib/platform/constants";
import { Card, GhostButton, Header, PrimaryButton, SectionEyebrow, screenClass, cx } from "../ui";

export function StudiosAdminScreen() {
  const { studios, activeStudioId, setActiveStudioId, setStudioStatus, startImpersonation, branding } = usePlatform();

  return (
    <div className={screenClass}>
      <Header title="סטודיואים" subtitle="יצירה, השבתה ומעבר בין סטודיואים." />
      <PrimaryButton onClick={() => setStudioStatus(STUDIO_DEMO, "active")}>הפעלת סטודיו מאייר</PrimaryButton>
      <div className="space-y-2">
        {studios.map((s) => (
          <Card key={s.id} animated={false} className={cx(activeStudioId === s.id && "border-emerald-400/25")}>
            <div className="flex flex-wrap items-start justify-between gap-3 text-right">
              <div>
                <p className="font-semibold text-white">{s.name}</p>
                <p className="mt-1 text-sm text-white/45">{s.plan} · {s.activeUsers} משתמשים · {s.storageGb} GB</p>
                <p className="mt-1 text-xs text-white/38">{s.status === "active" ? "פעיל" : "מושבת"}</p>
              </div>
              <div className="flex flex-col gap-2">
                <GhostButton className="!text-[11px]" onClick={() => setActiveStudioId(s.id)}>בחירה</GhostButton>
                <GhostButton className="!text-[11px]" onClick={() => startImpersonation(s.id)}>צפייה כהנהלה</GhostButton>
                <GhostButton className="!text-[11px]" onClick={() => setStudioStatus(s.id, s.status === "active" ? "disabled" : "active")}>
                  {s.status === "active" ? "השבתה" : "הפעלה"}
                </GhostButton>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <Card animated={false}><p className="text-sm text-white/45">מיתוג נוכחי: {branding.appName}</p></Card>
    </div>
  );
}
