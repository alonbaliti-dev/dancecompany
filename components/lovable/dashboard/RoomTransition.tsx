import { ArrowLeft, DoorOpen } from "lucide-react";
import type { RoomTransitionInfo } from "@/lib/lovable/types";

export function RoomTransition({
  info,
  title = "המעבר הבא שלך",
}: {
  info: RoomTransitionInfo;
  title?: string;
}) {
  const sameRoom = info.fromRoom === info.toRoom;
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-base font-semibold tracking-tight">{title}</h2>
      <div className="glass flex items-center justify-between gap-3 rounded-2xl p-4 text-right">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white/6 text-foreground">
            <DoorOpen size={18} strokeWidth={1.6} />
          </span>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-semibold text-foreground">
              {info.nextGroup}
            </span>
            <span className="flex items-center gap-1.5 truncate text-[11px] text-muted-foreground">
              <span>{info.fromRoom}</span>
              <ArrowLeft size={11} />
              <span>{info.toRoom}</span>
              {sameRoom && <span>· אותו אולפן</span>}
            </span>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-primary/15 px-2.5 py-1 text-[11px] font-semibold text-primary">
          בעוד {info.inMinutes} דק׳
        </span>
      </div>
    </section>
  );
}
