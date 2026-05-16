"use client";

import { usePlatformOS } from "@/context/PlatformOSContext";
import { Header, SectionEyebrow, screenClass } from "../ui";

export function ActivityFeedScreen() {
  const { activityForUser } = usePlatformOS();

  return (
    <div className={screenClass}>
      <Header title="פעילות בסטודיו" subtitle="עדכונים אנושיים — משימות, גלריה, שיעורים ועוד" />
      {activityForUser.length === 0 ? (
        <p className="text-right text-sm text-white/45">אין פעילות להצגה כרגע.</p>
      ) : (
        <ul className="space-y-2">
          {activityForUser.map((item) => (
            <li key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-right">
              <p className="text-sm text-white/85">{item.messageHe}</p>
              <p className="mt-1 text-[11px] text-white/40">
                {new Date(item.createdAt).toLocaleString("he-IL")}
                {item.actorName ? ` · ${item.actorName}` : ""}
              </p>
            </li>
          ))}
        </ul>
      )}
      <SectionEyebrow>הערה</SectionEyebrow>
      <p className="text-right text-xs text-white/40">יומן הביקורת הטכני זמין להנהלה תחת יומן ביקורת.</p>
    </div>
  );
}
