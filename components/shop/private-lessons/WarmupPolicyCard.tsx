"use client";

import { Flame } from "lucide-react";
import { PRIVATE_LESSON_WARMUP_POLICY } from "@/lib/private-lessons/constants";
import { Card, SectionEyebrow } from "../../ui";

export function WarmupPolicyCard({ policy }: { policy?: string }) {
  const text = policy ?? PRIVATE_LESSON_WARMUP_POLICY;
  return (
    <Card animated={false} tone="teacher" className="border-amber-400/20 bg-amber-500/[0.06]">
      <div className="flex items-start justify-end gap-3 text-right">
        <div className="min-w-0 flex-1">
          <SectionEyebrow>מדיניות חימום</SectionEyebrow>
          <p className="mt-2 text-sm leading-relaxed text-white/58">{text}</p>
        </div>
        <Flame className="shrink-0 text-amber-300/80" size={22} />
      </div>
    </Card>
  );
}
