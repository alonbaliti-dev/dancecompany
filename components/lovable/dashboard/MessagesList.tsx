import { Pin } from "lucide-react";
import type { Message } from "@/lib/lovable/types";

export function MessagesList({
  items,
  title = "הודעות",
}: {
  items: Message[];
  title?: string;
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-end justify-between">
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        <button className="text-xs font-medium text-primary">לכל ההודעות</button>
      </div>
      <ul className="flex flex-col gap-2">
        {items.map((m) => (
          <li
            key={m.id}
            className="glass flex items-start gap-3 rounded-2xl p-3.5 text-right"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary/30 to-rose/20 text-sm font-semibold text-foreground">
              {m.from.charAt(0)}
            </span>
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-center justify-between gap-2">
                <span className="flex min-w-0 items-center gap-1.5">
                  {m.pinned && (
                    <Pin size={11} className="shrink-0 text-primary" />
                  )}
                  <span className="truncate text-sm font-medium text-foreground">
                    {m.from}
                  </span>
                </span>
                <span className="shrink-0 text-[10px] text-muted-foreground">
                  {m.time}
                </span>
              </div>
              <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                {m.preview}
              </p>
            </div>
            {m.unread && (
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
