"use client";

import { useMemo, useState } from "react";
import { useStudioOS } from "@/context/StudioOSContext";
import { useProductData } from "@/context/ProductDataContext";
import type { AiToolId, UserProfile } from "@/lib/types";
import { Card, GhostButton, Header, PrimaryButton, SectionEyebrow } from "./ui";

function toolsForUser(user: UserProfile): { id: AiToolId; label: string }[] {
  if (user.permissions.isManagement) {
    return [
      { id: "at_risk", label: "מגמות סיכון" },
      { id: "summarize_progress", label: "תובנת שבועית לסטודיו" }
    ];
  }
  if (user.permissions.isTeacher) {
    return [
      { id: "weekly_task", label: "משימה שבועית" },
      { id: "parent_message", label: "טיוטת הודעה להורים" },
      { id: "summarize_progress", label: "סיכום התקדמות תלמיד" }
    ];
  }
  return [];
}

export function AiCoachScreen() {
  const { user, aiDaily } = useStudioOS();
  const { generateAi } = useProductData();
  const tools = useMemo(() => toolsForUser(user), [user]);
  const [out, setOut] = useState("");

  return (
    <div className="space-y-8 pb-6">
      <Header title="מאמן AI" subtitle="המלצה יומית מותאמת לקצב שלך." />
      {!user.permissions.isTeacher && !user.permissions.isManagement ? (
        <Card animated={false} className="border-emerald-400/15">
          <SectionEyebrow>להיום</SectionEyebrow>
          <p className="mt-2 text-lg font-semibold text-white">{aiDaily.title}</p>
          <p className="mt-2 text-sm leading-relaxed text-white/55">{aiDaily.why}</p>
          <p className="mt-3 text-sm text-emerald-200/80">{aiDaily.durationMinutes} דקות מומלצות</p>
          {aiDaily.relatedTaskId ? <p className="mt-1 text-xs text-white/40">קשור למשימה פעילה</p> : null}
        </Card>
      ) : (
        <div className="space-y-2">
          {tools.map((t) => (
            <GhostButton key={t.id} className="w-full !justify-between" onClick={() => setOut(generateAi(t.id))}>
              <span>{t.label}</span>
            </GhostButton>
          ))}
          {out ? <Card animated={false}><pre className="whitespace-pre-wrap text-right text-sm text-white/60">{out}</pre></Card> : null}
        </div>
      )}
    </div>
  );
}
