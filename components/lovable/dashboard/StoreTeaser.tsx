"use client";

import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import type { StoreItem } from "@/lib/lovable/types";

export function StoreTeaser({
  items,
  title = "חנות הסטודיו",
}: {
  items: StoreItem[];
  title?: string;
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-end justify-between">
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        <button className="text-xs font-medium text-primary">לכל המוצרים</button>
      </div>
      <div className="-mx-5 overflow-x-auto no-scrollbar">
        <div className="flex gap-2.5 px-5">
          {items.map((it) => (
            <motion.button
              key={it.id}
              whileTap={{ scale: 0.97 }}
              className="glass relative flex w-44 shrink-0 flex-col gap-3 rounded-3xl p-4 text-right"
            >
              <div className="relative grid h-28 w-full place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-rose/10 to-transparent">
                <ShoppingBag size={30} className="text-primary/70" strokeWidth={1.4} />
                <span className="absolute bottom-2 right-2 text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
                  {it.category}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground">
                  {it.name}
                </span>
                <span className="text-xs text-muted-foreground">{it.price}</span>
              </div>
              {it.badge && (
                <span className="absolute left-3 top-3 rounded-full bg-primary/90 px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                  {it.badge}
                </span>
              )}
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
