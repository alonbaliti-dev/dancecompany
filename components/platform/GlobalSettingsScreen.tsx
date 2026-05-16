"use client";

import { PLATFORM_OWNER_NAME } from "@/lib/demo/identity";
import { usePlatform } from "@/context/PlatformContext";
import { APP_VERSION } from "@/lib/platform/constants";
import { Card, Header, screenClass } from "../ui";

export function GlobalSettingsScreen() {
  const { impersonating, stopImpersonation } = usePlatform();

  return (
    <div className={screenClass}>
      <Header title="הגדרות פלטפורמה" subtitle={`בעלות ${PLATFORM_OWNER_NAME} · סביבה, גרסה ומצב מערכת.`} />
      <Card animated={false}>
        <p className="text-sm text-white/45">סביבה</p>
        <p className="mt-1 text-white">{process.env.NEXT_PUBLIC_APP_ENV ?? "development"}</p>
        <p className="mt-4 text-sm text-white/45">גרסה</p>
        <p className="mt-1 text-white">{APP_VERSION.current}</p>
        {impersonating ? (
          <button type="button" className="mt-4 text-sm text-amber-200/80" onClick={stopImpersonation}>
            חזרה ל{PLATFORM_OWNER_NAME}
          </button>
        ) : null}
      </Card>
    </div>
  );
}
