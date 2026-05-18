import { Megaphone } from "lucide-react";
import type { SystemBroadcast } from "@/lib/lovable/types";

export function SystemBroadcasts({
  items,
  title = "הודעות מערכת",
}: {
  items: SystemBroadcast[];
  title?: string;
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-end justify-between">
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        <button className="text-xs font-medium text-primary">חדשה</button>
      </div>
      <ul className="flex flex-col gap-2">
        {items.map((b) => (
          <li
            key={b.id}
            className="glass flex items-start gap-3 rounded-2xl p-3.5 text-right"
          >
            <span className="mt-0.5 text-primary">
              <Megaphone size={18} strokeWidth={1.8} />
            </span>
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate text-sm font-semibold text-foreground">
                  {b.to}
                </span>
                <span className="shrink-0 text-[10px] text-muted-foreground">
                  {b.when}
                </span>
              </div>
              <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                {b.preview}
              </p>
              <span className="mt-1 text-[10px] text-muted-foreground/80">
                נשלח ע״י {b.sender}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
