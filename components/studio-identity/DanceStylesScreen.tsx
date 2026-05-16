"use client";

import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useStudioIdentity } from "@/context/StudioIdentityContext";
import type { InstitutionalDanceStyle, InstitutionalStyleId } from "@/lib/types";
import { getMediaForStyle } from "@/lib/integrations/media-feed";
import { Card, GhostButton, Header, SectionEyebrow, screenClass } from "../ui";
import { ExternalMediaCard } from "../media/ExternalMediaCard";

function StyleGridCard({ style, onPress }: { style: InstitutionalDanceStyle; onPress: () => void }) {
  const c = style.signatureColors;
  return (
    <button type="button" onClick={onPress} className="w-full overflow-hidden rounded-[22px] border text-right transition active:scale-[0.99]" style={{ borderColor: c.border }}>
      <div className="relative min-h-[120px] px-4 py-5" style={{ background: style.heroGradient }}>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="relative">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/45">{style.nameEn}</p>
          <p className="mt-2 text-xl font-semibold text-white">{style.nameHe}</p>
          <p className="mt-1 text-xs" style={{ color: c.core }}>
            {style.energy}
          </p>
        </div>
      </div>
    </button>
  );
}

export function DanceStylesScreen({
  initialStyleId,
  onOpenFaculty
}: {
  initialStyleId?: InstitutionalStyleId;
  onOpenFaculty?: (id: string) => void;
}) {
  const { styles, getFaculty } = useStudioIdentity();
  const [styleId, setStyleId] = useState<InstitutionalStyleId | null>(initialStyleId ?? null);
  const style = styleId ? styles.find((s) => s.id === styleId) : undefined;

  if (style) {
    const c = style.signatureColors;
    const teachers = style.featuredTeacherIds.map((id) => getFaculty(id)).filter(Boolean);
    return (
      <div className={screenClass}>
        <GhostButton onClick={() => setStyleId(null)} className="!mb-2 !px-0 !py-1 !text-sm">
          ← כל הסגנונות
        </GhostButton>
        <div className="overflow-hidden rounded-[26px] border" style={{ borderColor: c.border }}>
          <div className="relative min-h-[240px] px-6 py-10 text-right" style={{ background: style.heroGradient }}>
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(255,255,255,0.08),transparent_50%)]" />
            <div className="relative">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">{style.nameEn}</p>
              <h1 className="mt-3 text-[2.2rem] font-semibold leading-tight text-white">{style.nameHe}</h1>
              <p className="mt-3 text-sm" style={{ color: c.core }}>
                {style.mood} · {style.energy}
              </p>
            </div>
          </div>
        </div>
        <Card animated={false}>
          <SectionEyebrow>על הסגנון</SectionEyebrow>
          <p className="mt-3 text-right text-sm leading-relaxed text-white/58">{style.description}</p>
        </Card>
        <div>
          <SectionEyebrow>מורים מובילים</SectionEyebrow>
          <div className="mt-3 space-y-2">
            {teachers.map((t) =>
              t ? (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onOpenFaculty?.(t.id)}
                  className="flex w-full items-center justify-between rounded-[18px] border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-right"
                >
                  <ChevronLeft size={16} className="text-white/30" />
                  <span className="font-semibold text-white">{t.fullName}</span>
                </button>
              ) : null
            )}
          </div>
        </div>
        <div>
          <SectionEyebrow>קבוצות</SectionEyebrow>
          <div className="mt-2 flex flex-wrap justify-end gap-2">
            {style.featuredGroupNames.map((g) => (
              <span key={g} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/55">
                {g}
              </span>
            ))}
          </div>
        </div>
        <div>
          <SectionEyebrow>מדיה מהסטודיו</SectionEyebrow>
          <p className="mt-1 text-right text-xs text-white/40">תוכן חיצוני לפי סגנון — נפתח בפלטפורמה המקורית.</p>
          <div className="mt-3 space-y-2">
            {getMediaForStyle(style.id)
              .slice(0, 3)
              .map((item) => (
                <ExternalMediaCard key={item.id} item={item} layout="row" />
              ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={screenClass}>
      <Header title="סגנונות מחול" subtitle="זהות אמנותית — כל סגנון עם אופי, צבע ואנרגיה משלו." />
      <div className="grid gap-3 sm:grid-cols-2">
        {styles.map((s) => (
          <StyleGridCard key={s.id} style={s} onPress={() => setStyleId(s.id)} />
        ))}
      </div>
    </div>
  );
}
