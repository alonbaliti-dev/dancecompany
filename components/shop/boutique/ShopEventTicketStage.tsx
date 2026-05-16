"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, QrCode, Ticket } from "lucide-react";
import { END_YEAR_SHOW, getCountdown, productHeroGradient } from "@/lib/shop-boutique";
import { cardGradients } from "@/lib/theme/gradients";
import { formatPrice, paymentStatusLabel, fulfillmentStatusLabel } from "@/lib/shop-logic";
import { getTone } from "@/lib/design-system/colors";
import type { ShopOrder, ShopProduct } from "@/lib/types";
import { GhostButton, cx } from "../../ui";

export function ShopEventTicketStage({
  tickets,
  myOrder,
  onSelectTicket
}: {
  tickets: ShopProduct[];
  myOrder?: ShopOrder;
  onSelectTicket: (id: string) => void;
}) {
  const t = getTone("competition");
  const [countdown, setCountdown] = useState(() => getCountdown(END_YEAR_SHOW.dateIso));

  useEffect(() => {
    const id = setInterval(() => setCountdown(getCountdown(END_YEAR_SHOW.dateIso)), 60_000);
    return () => clearInterval(id);
  }, []);

  const showDate = new Date(END_YEAR_SHOW.dateIso).toLocaleDateString("he-IL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit"
  });

  return (
    <section className="space-y-4">
      <div
        className="relative overflow-hidden rounded-[26px] border border-amber-400/20 px-5 py-6 text-right shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
        style={{
          background: cardGradients.competition,
          boxShadow: `0 24px 80px rgba(0,0,0,0.45), 0 0 60px rgba(251,191,36,0.12)`
        }}
      >
        <motion.div
          className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-amber-400/15 blur-3xl"
          animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.75, 0.5] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden
        />
        <div className="relative">
          <div className="flex items-center justify-end gap-2">
            <Ticket size={18} style={{ color: t.core }} />
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: t.core }}>
              חוויית במה
            </p>
          </div>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-white">{END_YEAR_SHOW.title}</h2>
          <p className="mt-2 text-sm text-white/50">{END_YEAR_SHOW.subtitle}</p>
          {countdown ? (
            <motion.p
              className="mt-4 inline-flex rounded-2xl border border-white/10 bg-black/30 px-4 py-2 text-sm font-semibold tabular-nums text-amber-100"
              key={countdown.label}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {countdown.label}
            </motion.p>
          ) : null}
          <div className="mt-4 flex flex-wrap justify-end gap-3 text-xs text-white/45">
            <span className="inline-flex items-center gap-1">
              <MapPin size={12} />
              {END_YEAR_SHOW.venue}
            </span>
            <span>{showDate}</span>
          </div>
          <p className="mt-3 text-[11px] text-white/35">{END_YEAR_SHOW.groups.join(" · ")}</p>
          {myOrder ? (
            <p className="mt-3 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-50">
              ההזמנה שלך: {paymentStatusLabel(myOrder.paymentStatus)} · {fulfillmentStatusLabel(myOrder.fulfillmentStatus)}
            </p>
          ) : null}
        </div>
      </div>

      <motion.div className="-mx-1 flex gap-3 overflow-x-auto pb-2 no-scrollbar" dir="rtl">
        {tickets.map((ticket, i) => (
          <WalletTicketCard key={ticket.id} product={ticket} index={i} onPress={() => onSelectTicket(ticket.id)} />
        ))}
      </motion.div>
    </section>
  );
}

function WalletTicketCard({ product, index, onPress }: { product: ShopProduct; index: number; onPress: () => void }) {
  const t = getTone("competition");
  const vip = /VIP/i.test(product.title);

  return (
    <motion.button
      type="button"
      onClick={onPress}
      className={cx(
        "relative w-[17rem] shrink-0 overflow-hidden rounded-[22px] border text-right active:scale-[0.99]",
        vip ? "border-amber-400/35" : "border-white/12"
      )}
      style={{
        background: `linear-gradient(145deg, rgba(251,191,36,0.18) 0%, rgba(0,0,0,0.65) 55%)`,
        boxShadow: vip ? "0 12px 40px rgba(251,191,36,0.15)" : undefined
      }}
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06 }}
    >
      <motion.div
        className="absolute left-0 top-1/2 z-10 h-6 w-3 -translate-y-1/2 rounded-r-full bg-[#050506]"
        aria-hidden
      />
      <motion.div
        className="absolute right-0 top-1/2 z-10 h-6 w-3 -translate-y-1/2 rounded-l-full bg-[#050506]"
        aria-hidden
      />
      <motion.div className="border-b border-dashed border-white/15 px-4 py-4" style={{ background: productHeroGradient(product) }}>
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/55">LK Dance School</p>
        <p className="mt-2 font-semibold leading-snug text-white">{product.title}</p>
        <p className="mt-2 text-lg font-semibold tabular-nums" style={{ color: t.core }}>
          {formatPrice(product.price)}
        </p>
      </motion.div>
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
          <QrCode size={22} className="text-white/35" />
        </div>
        <div className="min-w-0 flex-1 text-right">
          <p className="text-[10px] text-white/40">מושב · כניסה כללית</p>
          <p className="text-xs font-medium text-white/70">יוצג בכניסה לאחר תשלום</p>
        </div>
      </div>
    </motion.button>
  );
}
