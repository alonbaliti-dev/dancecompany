"use client";

import { ChevronLeft, Ticket } from "lucide-react";
import type { ShopProduct } from "@/lib/types";
import { formatPrice, stockLabel, toneForCategory } from "@/lib/shop-logic";
import { getTone } from "@/lib/theme/semantic-tokens";
import { Card, cx } from "../ui";

export function ShopProductCard({ product, onPress }: { product: ShopProduct; onPress: () => void }) {
  const tone = toneForCategory(product.category);
  const t = getTone(tone);
  const isTicket = product.category === "event_ticket";

  return (
    <button type="button" onClick={onPress} className="w-full text-right transition active:scale-[0.99]">
      <Card
        animated={false}
        tone={tone}
        className={cx("!p-0 overflow-hidden", isTicket && "shadow-glow")}
        glow={isTicket}
      >
        <div className="flex gap-0">
          <div
            className="flex w-[88px] shrink-0 flex-col items-center justify-center border-l border-white/[0.06] bg-black/25"
            style={{ backgroundImage: isTicket ? `linear-gradient(160deg, ${t.soft}, transparent)` : undefined }}
          >
            {isTicket ? <Ticket size={28} style={{ color: t.core }} strokeWidth={1.5} /> : <span className="text-2xl opacity-40">◆</span>}
          </div>
          <div className="min-w-0 flex-1 px-4 py-3.5">
            <div className="flex items-start justify-between gap-2">
              <ChevronLeft className="mt-1 shrink-0 text-white/25" size={18} />
              <div className="min-w-0 flex-1">
                <p className="font-semibold leading-snug text-white">{product.title}</p>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/42">{product.description}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
              <span className="text-[15px] font-semibold tabular-nums" style={{ color: t.core }}>
                {formatPrice(product.price)}
              </span>
              <span
                className="rounded-full border px-2 py-0.5 text-[10px] font-semibold"
                style={{ borderColor: t.border, backgroundColor: t.soft, color: "rgba(255,255,255,0.9)" }}
              >
                {stockLabel(product.stockStatus)}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </button>
  );
}
