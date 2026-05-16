"use client";

import { useMemo } from "react";
import {
  getFeaturedMedia,
  getPerformanceMedia,
  getRehearsalMedia,
  getStudioMediaFeed
} from "@/lib/integrations/media-feed";
import { STUDIO_SOCIAL_LINKS } from "@/lib/integrations/social-links";
import { openExternalMedia } from "@/lib/integrations/open-external";
import { Card, Header, SectionEyebrow, screenClass } from "../ui";
import { ExternalMediaCard } from "./ExternalMediaCard";
import { SocialLinksStrip } from "./SocialLinksStrip";

export function StudioMediaFeed({ embedded = false }: { embedded?: boolean }) {
  const featured = useMemo(() => getFeaturedMedia(), []);
  const rehearsals = useMemo(() => getRehearsalMedia().slice(0, 3), []);
  const performances = useMemo(() => getPerformanceMedia().slice(0, 3), []);
  const highlights = useMemo(
    () =>
      getStudioMediaFeed()
        .filter((m) => m.category === "studio_update" || m.category === "achievement")
        .slice(0, 2),
    []
  );

  const website = STUDIO_SOCIAL_LINKS.find((l) => l.platform === "website");

  return (
    <div className={embedded ? "space-y-8" : screenClass}>
      {!embedded ? (
        <Header
          title="מדיה מהסטודיו"
          subtitle="עדכונים, חזרות וזיכרונות מהפלטפורמות הציבוריות של LK — נפתח בחלון חדש."
        />
      ) : null}

      <Card animated={false} className="!p-4">
        <SectionEyebrow>עקבו אחרינו</SectionEyebrow>
        <p className="mt-2 text-right text-sm leading-relaxed text-white/48">
          תוכן חיצוני מאינסטגרם, יוטיוב ופייסבוק. האפליקציה מפנה לערוצים הרשמיים — לא מחליפה את הרשתות.
        </p>
        <SocialLinksStrip className="mt-4" variant="cards" />
        {website ? (
          <button
            type="button"
            onClick={() => openExternalMedia(website.url)}
            className="mt-3 w-full rounded-xl border border-white/10 py-2.5 text-center text-[12px] font-medium text-white/50 transition hover:bg-white/[0.04]"
          >
            lidance.co.il — אתר הסטודיו
          </button>
        ) : null}
      </Card>

      <div>
        <SectionEyebrow>מומלצים עכשיו</SectionEyebrow>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {featured.map((item) => (
            <ExternalMediaCard key={item.id} item={item} />
          ))}
        </div>
      </div>

      <div>
        <SectionEyebrow>חזרות והכנה לבמה</SectionEyebrow>
        <div className="mt-3 space-y-2">
          {rehearsals.map((item) => (
            <ExternalMediaCard key={item.id} item={item} layout="row" />
          ))}
        </div>
      </div>

      <div>
        <SectionEyebrow>הופעות וזיכרונות</SectionEyebrow>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {performances.map((item) => (
            <ExternalMediaCard key={item.id} item={item} />
          ))}
        </div>
      </div>

      {highlights.length > 0 ? (
        <div>
          <SectionEyebrow>עדכונים מהסטודיו</SectionEyebrow>
          <div className="mt-3 space-y-2">
            {highlights.map((item) => (
              <ExternalMediaCard key={item.id} item={item} layout="row" />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
