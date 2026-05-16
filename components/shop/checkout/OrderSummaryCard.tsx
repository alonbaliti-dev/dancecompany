"use client";

import { formatPrice } from "@/lib/shop-logic";
import { productHeroGradient } from "@/lib/shop-boutique";
import type { ShopCartLine } from "@/lib/types";

export function OrderSummaryCard({ lines, total }: { lines: ShopCartLine[]; total: number }) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-white/[0.1] bg-gradient-to-b from-white/[0.06] to-transparent">
      <div className="border-b border-white/[0.06] px-5 py-4 text-right">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/38">סיכום הזמנה</p>
      </div>
      <div className="space-y-3 px-5 py-4">
        {lines.map((line) => (
          <div key={line.productId} className="flex items-center gap-3 text-right">
            <span className="shrink-0 text-sm font-semibold tabular-nums text-white">
              {formatPrice(line.product.price * line.quantity)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-white">{line.product.title}</p>
              <p className="text-xs text-white/40">
                ×{line.quantity}
                {line.size ? ` · ${line.size}` : ""}
                {line.color ? ` · ${line.color}` : ""}
              </p>
            </div>
            <div
              className="h-12 w-12 shrink-0 rounded-xl border border-white/[0.08]"
              style={{ background: productHeroGradient(line.product) }}
            />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between border-t border-white/[0.08] px-5 py-4">
        <span className="text-2xl font-semibold tabular-nums text-white">{formatPrice(total)}</span>
        <span className="text-sm text-white/45">סה״כ לתשלום</span>
      </div>
    </div>
  );
}
