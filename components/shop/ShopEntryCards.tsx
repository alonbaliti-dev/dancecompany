"use client";

import { ChevronLeft, ShoppingBag, Sparkles, Ticket, UserRound } from "lucide-react";
import { cardGradients } from "@/lib/theme/gradients";
import { Card, cx } from "../ui";

type Entry = {
  id: string;
  title: string;
  subtitle: string;
  icon: typeof ShoppingBag;
  gradient: string;
  onPress: () => void;
};

export function ShopEntryCards({
  onShop,
  onPrivateLessons,
  onTickets,
  onApparel,
  className
}: {
  onShop: () => void;
  onPrivateLessons?: () => void;
  onTickets?: () => void;
  onApparel?: () => void;
  className?: string;
}) {
  const entries: Entry[] = [
    {
      id: "shop",
      title: "חנות הסטודיו",
      subtitle: "בוטיק LK · בגדים, ציוד וכרטיסים",
      icon: ShoppingBag,
      gradient: cardGradients.commercial,
      onPress: onShop
    },
    {
      id: "private",
      title: "שיעורים פרטיים",
      subtitle: "30 או 45 דק׳ עם מורה · ₪150 / ₪225",
      icon: UserRound,
      gradient: "linear-gradient(160deg, rgba(56,189,248,0.2), rgba(16,185,129,0.12), rgba(0,0,0,0.55))",
      onPress: onPrivateLessons ?? onShop
    },
    {
      id: "tickets",
      title: "כרטיסים למופעים",
      subtitle: "מופע סוף שנה ובמה חיה",
      icon: Ticket,
      gradient: cardGradients.competition,
      onPress: onTickets ?? onShop
    },
    {
      id: "wear",
      title: "ציוד וביגוד לריקוד",
      subtitle: "חולצות, נעליים ואביזרים",
      icon: Sparkles,
      gradient: cardGradients.jazz,
      onPress: onApparel ?? onShop
    }
  ];

  return (
    <div className={cx("grid grid-cols-1 gap-3 sm:grid-cols-2", className)}>
      {entries.map((e) => {
        const Icon = e.icon;
        return (
          <button
            key={e.id}
            type="button"
            onClick={e.onPress}
            className="w-full text-right transition active:scale-[0.99]"
          >
            <Card animated={false} className="overflow-hidden border-white/[0.1] p-0">
              <div className="flex items-center justify-between gap-3 px-4 py-4" style={{ background: e.gradient }}>
                <ChevronLeft className="shrink-0 text-white/25" size={20} />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-white">{e.title}</p>
                  <p className="mt-1 text-xs text-white/48">{e.subtitle}</p>
                </div>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-black/25">
                  <Icon size={20} className="text-white/80" />
                </span>
              </div>
            </Card>
          </button>
        );
      })}
    </div>
  );
}
