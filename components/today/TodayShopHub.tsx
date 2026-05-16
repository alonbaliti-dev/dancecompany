"use client";

import { ShoppingBag, Sparkles, Ticket, UserRound } from "lucide-react";
import { useEditableTextOptional } from "@/context/EditableTextContext";
import { SectionEyebrow } from "../ui";

export function TodayShopHub({
  onOpenShop,
  onPrivateLessons,
  onTickets,
  onWear
}: {
  onOpenShop: () => void;
  onPrivateLessons: () => void;
  onTickets: () => void;
  onWear: () => void;
}) {
  const copy = useEditableTextOptional();
  const t = (key: string, fb: string) => copy?.t(key, fb) ?? fb;

  return (
    <section
      className="overflow-hidden rounded-[24px] border border-violet-400/15 text-right shadow-[0_16px_48px_rgba(0,0,0,0.35)]"
      style={{
        background:
          "linear-gradient(155deg, rgba(139,92,246,0.14) 0%, rgba(16,185,129,0.08) 45%, rgba(0,0,0,0.55) 100%)"
      }}
    >
      <div className="px-5 py-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/12 bg-white/[0.08]">
            <ShoppingBag className="text-violet-200/90" size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <SectionEyebrow tone="commercial">בוטיק LK</SectionEyebrow>
            <h2 className="mt-1 text-xl font-semibold text-white">{t("today.shop.title", "חנות הסטודיו")}</h2>
            <p className="mt-1 text-sm text-white/48">{t("today.shop.subtitle", "בגדים · כרטיסים · שיעורים פרטיים")}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <button
            type="button"
            onClick={onPrivateLessons}
            className="rounded-2xl border border-white/[0.1] bg-black/25 px-3 py-3 text-right transition active:scale-[0.99]"
          >
            <UserRound size={18} className="text-sky-200/85" />
            <p className="mt-2 text-sm font-semibold text-white">{t("today.shop.private", "שיעורים פרטיים")}</p>
          </button>
          <button
            type="button"
            onClick={onTickets}
            className="rounded-2xl border border-white/[0.1] bg-black/25 px-3 py-3 text-right transition active:scale-[0.99]"
          >
            <Ticket size={18} className="text-amber-200/85" />
            <p className="mt-2 text-sm font-semibold text-white">{t("today.shop.tickets", "כרטיסים למופעים")}</p>
          </button>
          <button
            type="button"
            onClick={onWear}
            className="rounded-2xl border border-white/[0.1] bg-black/25 px-3 py-3 text-right transition active:scale-[0.99]"
          >
            <Sparkles size={18} className="text-emerald-200/85" />
            <p className="mt-2 text-sm font-semibold text-white">{t("today.shop.wear", "ביגוד וציוד")}</p>
          </button>
        </div>

        <button
          type="button"
          onClick={onOpenShop}
          className="mt-3 w-full rounded-2xl border border-violet-400/25 bg-violet-500/15 py-3 text-sm font-semibold text-violet-100 transition active:scale-[0.99]"
        >
          כניסה לבוטיק
        </button>
      </div>
    </section>
  );
}
