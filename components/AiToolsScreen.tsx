"use client";

import { useState } from "react";
import { Brain, ClipboardList, HeartHandshake, Sparkles, Users } from "lucide-react";
import { useProductData } from "@/context/ProductDataContext";
import type { AiToolId } from "@/lib/types";
import { BottomSheet } from "./BottomSheet";
import { Card, Header, SectionEyebrow, SectionTitle, GhostButton } from "./ui";

const tools: { id: AiToolId; title: string; desc: string; icon: typeof Brain }[] = [
  { id: "weekly_task", title: "משימה שבועית", desc: "טיוטת משימה מובנית לפי הקבוצות שלך", icon: ClipboardList },
  { id: "parent_message", title: "הודעה להורים", desc: "ניסוח עדין וברור לעדכון הורים", icon: HeartHandshake },
  { id: "summarize_progress", title: "סיכום התקדמות", desc: "תמונת מצב קצרה לתלמיד או לקבוצה", icon: Sparkles },
  { id: "at_risk", title: "תלמידים בסיכון", desc: "סימון עדין לפי דפוסי פעילות", icon: Users }
];

export function AiToolsScreen() {
  const { generateAi } = useProductData();
  const [open, setOpen] = useState<AiToolId | null>(null);
  const [text, setText] = useState("");

  return (
    <div className="space-y-10 pb-6">
      <Header title="כלי AI" subtitle="טיוטות בעברית — ערכו לפני שליחה." />

      <Card animated={false} className="border-white/[0.06] bg-white/[0.02]">
        <div className="flex items-start gap-3 text-right">
          <Brain className="mt-0.5 shrink-0 text-emerald-300/85" size={22} />
          <p className="text-sm leading-relaxed text-white/48">הכלי מייצר טקסט דמה בעברית. לפני שליחה לאמת תוכן ולערוך אישית.</p>
        </div>
      </Card>

      <section className="space-y-3">
        <SectionEyebrow>פעולות</SectionEyebrow>
        <SectionTitle className="mt-0.5">בחירת כלי</SectionTitle>
        <div className="mt-3 grid grid-cols-1 gap-3">
          {tools.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setText(generateAi(t.id));
                  setOpen(t.id);
                }}
                className="w-full text-right transition active:scale-[0.99]"
              >
                <Card animated={false} className="!p-4 transition hover:border-white/[0.12]">
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06]">
                      <Icon className="text-white/70" size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-white">{t.title}</p>
                      <p className="mt-1 text-sm text-white/42">{t.desc}</p>
                    </div>
                  </div>
                </Card>
              </button>
            );
          })}
        </div>
      </section>

      <BottomSheet open={open !== null} title="תוצאה" onClose={() => setOpen(null)}>
        <pre className="whitespace-pre-wrap text-right text-[14px] leading-relaxed text-white/60">{text}</pre>
        <GhostButton className="mt-6 w-full !text-sm" onClick={() => navigator.clipboard?.writeText(text)}>
          העתקה ללוח
        </GhostButton>
      </BottomSheet>
    </div>
  );
}
