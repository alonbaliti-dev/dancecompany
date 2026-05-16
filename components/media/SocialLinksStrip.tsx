"use client";

import { Camera, Globe, Share2, Video } from "lucide-react";
import { openExternalMedia } from "@/lib/integrations/open-external";
import { STUDIO_SOCIAL_LINKS, type StudioSocialLink } from "@/lib/integrations/social-links";
import { cx } from "@/lib/cx";

function iconFor(link: StudioSocialLink) {
  if (link.platform === "instagram") return Camera;
  if (link.platform === "youtube") return Video;
  if (link.platform === "facebook") return Share2;
  return Globe;
}

export function SocialLinksStrip({
  className,
  variant = "pills",
  links = STUDIO_SOCIAL_LINKS.filter((l) => l.platform !== "website")
}: {
  className?: string;
  variant?: "pills" | "compact" | "cards";
  links?: StudioSocialLink[];
}) {
  if (variant === "cards") {
    return (
      <div className={cx("grid gap-2 sm:grid-cols-3", className)}>
        {links.map((link) => {
          const Icon = iconFor(link);
          return (
            <button
              key={link.platform}
              type="button"
              onClick={() => openExternalMedia(link.url)}
              className="rounded-[18px] border border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-white/[0.02] px-4 py-3.5 text-right transition hover:border-white/[0.14] active:scale-[0.99]"
            >
              <Icon size={20} className="mb-2 text-white/55" strokeWidth={1.5} />
              <p className="font-semibold text-white">{link.labelHe}</p>
              <p className="mt-0.5 text-[11px] text-white/40">{link.handle}</p>
            </button>
          );
        })}
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={cx("flex flex-wrap justify-center gap-2", className)}>
        {links.map((link) => {
          const Icon = iconFor(link);
          return (
            <button
              key={link.platform}
              type="button"
              onClick={() => openExternalMedia(link.url)}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-medium text-white/55 transition hover:bg-white/[0.08]"
            >
              <Icon size={14} />
              {link.labelHe}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cx("flex flex-wrap justify-end gap-2", className)}>
      {links.map((link) => {
        const Icon = iconFor(link);
        return (
          <button
            key={link.platform}
            type="button"
            onClick={() => openExternalMedia(link.url)}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white/75 transition hover:border-white/16 hover:bg-white/[0.07]"
          >
            <Icon size={18} strokeWidth={1.5} />
            {link.labelHe}
          </button>
        );
      })}
    </div>
  );
}
