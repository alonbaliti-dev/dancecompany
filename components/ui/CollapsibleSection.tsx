"use client";

import { ChevronDown } from "lucide-react";
import { getTone, type SemanticTone } from "@/lib/design-system/colors";
import { stackSection, text } from "@/lib/design-system/tokens";

export function CollapsibleSection({
  title,
  count,
  defaultOpen = false,
  children,
  tone
}: {
  title: string;
  count?: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
  tone?: SemanticTone;
}) {
  const t = tone ? getTone(tone) : null;
  return (
    <details className="group" open={defaultOpen}>
      <summary className={stackSection.summary}>
        <ChevronDown size={18} className="shrink-0 text-white/30 transition group-open:rotate-180" />
        <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
          {count != null && count > 0 ? (
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-white/55">
              {count}
            </span>
          ) : null}
          <span className={text.eyebrow} style={t ? { color: t.core } : undefined}>
            {title}
          </span>
        </div>
      </summary>
      <div className={stackSection.panel}>{children}</div>
    </details>
  );
}
