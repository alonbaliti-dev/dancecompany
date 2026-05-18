import { Heart, AlertTriangle, Clock } from "lucide-react";
import type { AttentionStudent } from "@/lib/lovable/types";

const TONE = {
  warn: { Icon: AlertTriangle, color: "text-rose" },
  info: { Icon: Clock, color: "text-primary" },
  soft: { Icon: Heart, color: "text-muted-foreground" },
} as const;

export function StudentsNeedingAttention({
  items,
  title = "תלמידות שדורשות תשומת לב",
}: {
  items: AttentionStudent[];
  title?: string;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-base font-semibold tracking-tight">{title}</h2>
      <ul className="flex flex-col gap-2">
        {items.map((s) => {
          const t = TONE[s.tone];
          const Icon = t.Icon;
          return (
            <li
              key={s.id}
              className="glass flex items-center gap-3 rounded-2xl p-3.5 text-right"
            >
              <span className={`${t.color}`}>
                <Icon size={18} strokeWidth={1.8} />
              </span>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-semibold text-foreground">
                  {s.name}
                </span>
                <span className="truncate text-[11px] text-muted-foreground">
                  {s.reason}
                </span>
              </div>
              <button className="shrink-0 rounded-full bg-white/6 px-3 py-1 text-[11px] font-medium text-foreground">
                פתחי שיחה
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
