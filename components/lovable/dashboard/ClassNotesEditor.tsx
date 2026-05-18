"use client";

import { useState } from "react";
import { toast } from "sonner";

export function ClassNotesEditor() {
  const [text, setText] = useState(
    "התחלנו במאמר באר, המשכנו לפראזה האלכסונית של הקטע השני. לעבוד על תזמון הקפיצה השלישית.",
  );

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-end justify-between">
        <h2 className="text-base font-semibold tracking-tight">הערות לשיעור</h2>
        <span className="text-[11px] text-muted-foreground">נשמר אוטומטית</span>
      </div>
      <div className="glass-strong flex flex-col gap-3 rounded-3xl p-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          dir="rtl"
          placeholder="מה עבד טוב, מה לשפר, על מה לעבוד בשיעור הבא…"
          className="w-full resize-none bg-transparent text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground"
        />
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {["#כוריאוגרפיה", "#טכניקה", "#מופע"].map((t) => (
              <span
                key={t}
                className="rounded-full bg-white/5 px-2.5 py-1 text-[10px] text-muted-foreground"
              >
                {t}
              </span>
            ))}
          </div>
          <button
            onClick={() => toast.success("ההערה נשמרה בכרטיס השיעור")}
            className="rounded-full bg-primary px-3.5 py-1.5 text-[11px] font-semibold text-primary-foreground"
          >
            שמירה לכרטיס
          </button>
        </div>
      </div>
    </section>
  );
}
