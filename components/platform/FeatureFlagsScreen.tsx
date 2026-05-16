"use client";

import { usePlatform } from "@/context/PlatformContext";
import { Header, SectionEyebrow, screenClass } from "../ui";
import { FeatureFlagList } from "./PlatformUi";

export function FeatureFlagsScreen() {
  const { user, globalFlags, studioFlags, setGlobalFlag, setStudioFlag, activeStudioId, studios } = usePlatform();
  const superAdmin = user?.permissions.isSuperAdmin;
  const studioName = studios.find((s) => s.id === activeStudioId)?.name ?? activeStudioId;

  return (
    <div className={screenClass}>
      <Header title="ניהול תכונות" subtitle={superAdmin ? "הגדרות גלובליות ולפי סטודיו" : "הפעלת תכונות בסטודיו שלך"} />
      {superAdmin ? (
        <div>
          <SectionEyebrow>גלובלי</SectionEyebrow>
          <FeatureFlagList flags={globalFlags} onChange={setGlobalFlag} />
        </div>
      ) : null}
      <div>
        <SectionEyebrow>סטודיו · {studioName}</SectionEyebrow>
        <FeatureFlagList flags={studioFlags} onChange={superAdmin || user?.permissions.isManagement ? setStudioFlag : undefined} readOnly={!superAdmin && !user?.permissions.isManagement} />
      </div>
    </div>
  );
}
