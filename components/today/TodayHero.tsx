"use client";

import { getTone, type SemanticTone } from "@/lib/design-system/colors";
import type { StudioDayContext } from "@/lib/product/studio-day";
import { PrimaryButton, RingStat } from "../ui";

export function TodayHero({
  greeting,
  firstName,
  studioDay,
  heroGradient,
  glowRgb,
  primaryLabel,
  primaryTone = "accent",
  onPrimary,
  rings
}: {
  greeting: string;
  firstName: string;
  studioDay: StudioDayContext;
  heroGradient: string;
  glowRgb: string;
  primaryLabel: string;
  primaryTone?: SemanticTone;
  onPrimary: () => void;
  rings?: { value: number; label: string; tone?: SemanticTone }[];
}) {
  const t = getTone(studioDay.tone);

  return (
    <section
      className="premium-hero"
      style={{
        background: heroGradient,
        boxShadow: `0 24px 64px rgba(0,0,0,0.45), 0 0 80px rgba(${glowRgb},0.12)`
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_0%,rgba(255,255,255,0.1),transparent_55%)]"
        aria-hidden
      />
      <div className="relative">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: t.core }}>
          {studioDay.ambientLabel}
        </p>
        <h1 className="mt-2 text-[1.65rem] font-semibold leading-tight tracking-tight text-white">
          {greeting}, {firstName}
        </h1>
        <p className="mt-2 max-w-[20rem] text-[14px] leading-relaxed text-white/52">{studioDay.heroLine}</p>

        {rings?.length ? (
          <div className="mt-5 flex flex-wrap items-center justify-end gap-4">
            {rings.map((r) => (
              <RingStat key={r.label} value={r.value} label={r.label} size={56} tone={r.tone ?? "accent"} />
            ))}
          </div>
        ) : null}

        <PrimaryButton className="mt-5" tone={primaryTone} onClick={onPrimary}>
          {primaryLabel}
        </PrimaryButton>
      </div>
    </section>
  );
}
