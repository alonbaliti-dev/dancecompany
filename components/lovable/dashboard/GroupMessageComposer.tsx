"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";

const PRESETS = [
  "השיעור היום מתקיים כרגיל ב-17:00, אולפן ב׳.",
  "מחר חזרה ארוכה — נא להגיע 15 דק׳ מוקדם.",
  "תזכורת: להביא בגדי שחורים למופע ביום שישי.",
];

export function GroupMessageComposer() {
  const [text, setText] = useState("");

  const send = (body: string) => {
    if (!body.trim()) return;
    toast.success("ההודעה נשלחה לקבוצה", {
      description: `28 חברי קבוצה · ${body.slice(0, 32)}${body.length > 32 ? "…" : ""}`,
    });
    setText("");
  };

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-base font-semibold tracking-tight">
        עדכון הודעה לקבוצה
      </h2>
      <div className="glass-strong flex flex-col gap-3 rounded-3xl p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-foreground">
            להקת מודרני · 28 חברים
          </span>
          <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success">
            פעיל
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-2xl bg-white/4 px-3 py-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="כתוב/י הודעה לקבוצה…"
            dir="rtl"
            className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            onKeyDown={(e) => e.key === "Enter" && send(text)}
          />
          <button
            onClick={() => send(text)}
            aria-label="שלח"
            className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground disabled:opacity-40"
            disabled={!text.trim()}
          >
            <Send size={15} strokeWidth={2} className="-scale-x-100" />
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => setText(p)}
              className="rounded-full border border-hairline bg-white/3 px-3 py-1 text-[11px] text-muted-foreground hover:text-foreground"
            >
              {p.slice(0, 28)}…
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
