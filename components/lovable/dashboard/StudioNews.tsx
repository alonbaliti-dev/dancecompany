import { Calendar, Camera, Sparkles, Megaphone } from "lucide-react";
import type { StudioNewsItem } from "@/lib/lovable/types";

const ICON = {
  rehearsal: Calendar,
  filming: Camera,
  event: Sparkles,
  update: Megaphone,
} as const;

const TONE = {
  rehearsal: "text-amber-300",
  filming: "text-sky-300",
  event: "text-rose",
  update: "text-foreground",
} as const;

export function StudioNews({
  items,
  title = "מה חדש בסטודיו",
}: {
  items: StudioNewsItem[];
  title?: string;
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-end justify-between">
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        <button className="text-xs font-medium text-primary">לכל העדכונים</button>
      </div>
      <ul className="flex flex-col gap-2">
        {items.map((n) => {
          const Icon = ICON[n.kind];
          return (
            <li
              key={n.id}
              className="glass flex items-start gap-3 rounded-2xl p-3.5 text-right"
            >
              <span className={`mt-0.5 ${TONE[n.kind]}`}>
                <Icon size={18} strokeWidth={1.8} />
              </span>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-sm font-semibold text-foreground">
                    {n.title}
                  </span>
                  <span className="shrink-0 text-[10px] text-muted-foreground">
                    {n.when}
                  </span>
                </div>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  {n.body}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
