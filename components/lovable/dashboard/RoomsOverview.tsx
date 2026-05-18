import type { Room } from "@/lib/lovable/types";

export function RoomsOverview({
  rooms,
  title = "סטודיואים וחדרים",
}: {
  rooms: Room[];
  title?: string;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-base font-semibold tracking-tight">{title}</h2>
      <ul className="grid grid-cols-1 gap-2">
        {rooms.map((r) => (
          <li
            key={r.id}
            className="glass flex items-center justify-between gap-3 rounded-2xl p-3.5 text-right"
          >
            <div className="flex min-w-0 flex-col">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-semibold text-foreground">
                  {r.name}
                </span>
                <span className="shrink-0 text-[10px] text-muted-foreground">
                  · עד {r.capacity} תלמידות
                </span>
              </div>
              <span className="truncate text-[11px] text-muted-foreground">
                {r.inUse ? `מתקיים: ${r.current}` : `פנוי · השיעור הבא ${r.nextAt}`}
              </span>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                r.inUse
                  ? "bg-success/15 text-success"
                  : "bg-white/6 text-muted-foreground"
              }`}
            >
              {r.inUse ? "תפוס" : "פנוי"}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
