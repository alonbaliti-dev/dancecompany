"use client";

import { Check, Lock, Smartphone } from "lucide-react";
import { getPaymentMethodOptions } from "@/lib/payments/payment-device-detection";
import type { PaymentProvider } from "@/lib/payments/types";
import { providerToShopMethod } from "@/lib/payments/shop-bridge";
import type { ShopPaymentMethod } from "@/lib/types";
import { cx } from "../../ui";

function ProviderIcon({ provider }: { provider: PaymentProvider }) {
  if (provider === "apple_pay") {
    return <span className="text-[13px] font-semibold tracking-tight text-white">Apple Pay</span>;
  }
  if (provider === "google_pay") {
    return <span className="text-[12px] font-semibold text-white/90">G Pay</span>;
  }
  if (provider === "bit") {
    return <span className="text-[13px] font-bold text-sky-300">Bit</span>;
  }
  if (provider === "paybox") {
    return <span className="text-[12px] font-bold text-violet-300">PayBox</span>;
  }
  return <Lock size={18} className="text-white/55" strokeWidth={1.5} />;
}

export function PaymentMethodSelector({
  selected,
  onSelect,
  includeBankTransfer
}: {
  selected: ShopPaymentMethod;
  onSelect: (m: ShopPaymentMethod) => void;
  includeBankTransfer?: boolean;
}) {
  const options = getPaymentMethodOptions();

  return (
    <div className="space-y-2">
      {options.map((opt) => {
        const method = providerToShopMethod(opt.provider);
        const isSelected = selected === method || (selected === "card" && method === "credit_card");
        return (
          <button
            key={opt.provider}
            type="button"
            disabled={!opt.available}
            onClick={() => opt.available && onSelect(method)}
            className={cx(
              "flex w-full items-center gap-3 rounded-[20px] border px-4 py-3.5 text-right transition active:scale-[0.99]",
              !opt.available && "cursor-not-allowed opacity-45",
              isSelected ? "border-emerald-400/35 bg-emerald-500/[0.08]" : "border-white/[0.09] bg-white/[0.03] hover:border-white/[0.14]"
            )}
          >
            <span
              className={cx(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border",
                isSelected ? "border-emerald-400/50 bg-emerald-500/20" : "border-white/15 bg-white/[0.04]"
              )}
            >
              {isSelected ? <Check size={14} className="text-emerald-200" /> : null}
            </span>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/30">
              <ProviderIcon provider={opt.provider} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-end gap-2">
                {opt.recommended ? (
                  <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] font-semibold text-emerald-100">
                    מומלץ
                  </span>
                ) : null}
                <p className="font-semibold text-white">{opt.labelHe}</p>
              </div>
              <p className="mt-0.5 text-xs text-white/42">{opt.available ? opt.subtitleHe : opt.unavailableReason}</p>
            </div>
          </button>
        );
      })}

      {includeBankTransfer ? (
        <button
          type="button"
          onClick={() => onSelect("bank_transfer")}
          className={cx(
            "flex w-full items-center gap-3 rounded-[20px] border px-4 py-3.5 text-right transition",
            selected === "bank_transfer" ? "border-white/25 bg-white/[0.08]" : "border-white/[0.09] bg-white/[0.03]"
          )}
        >
          <Smartphone size={20} className="shrink-0 text-white/45" />
          <div className="flex-1">
            <p className="font-semibold text-white">העברה בנקאית</p>
            <p className="text-xs text-white/40">אישור ידני על ידי ההנהלה</p>
          </div>
        </button>
      ) : null}
    </div>
  );
}
