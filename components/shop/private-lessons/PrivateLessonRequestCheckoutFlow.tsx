"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { usePrivateLessons } from "@/context/PrivateLessonsContext";
import { defaultPaymentProvider } from "@/lib/payments/payment-device-detection";
import { externalRedirectMessageHe, pendingPaymentHintHe, paymentProviderLabelHe } from "@/lib/payments/labels-he";
import { isExternalAppProvider, providerToShopMethod, shopMethodToProvider } from "@/lib/payments/shop-bridge";
import { formatSuggestedSlot, selectedSlotForRequest } from "@/lib/private-lessons/availability-logic";
import { priceLabelForDuration } from "@/lib/private-lessons/logic";
import type { PaymentProvider } from "@/lib/payments/types";
import type { PrivateLessonAvailabilityRequest, ShopPaymentMethod } from "@/lib/types";
import { GhostButton, Header, PrimaryButton, SectionEyebrow, screenClass } from "../../ui";
import { PaymentMethodSelector } from "../checkout/PaymentMethodSelector";
import { WarmupPolicyCard } from "./WarmupPolicyCard";
import { PRIVATE_LESSON_WARMUP_POLICY } from "@/lib/private-lessons/constants";

type Step = "methods" | "processing" | "external" | "success";

export function PrivateLessonRequestCheckoutFlow({
  request,
  onBack,
  onConfirmed
}: {
  request: PrivateLessonAvailabilityRequest;
  onBack: () => void;
  onConfirmed: (request: PrivateLessonAvailabilityRequest) => void;
}) {
  const pl = usePrivateLessons();
  const product = pl.getProduct(request.productId);
  const slot = selectedSlotForRequest(request);

  const [method, setMethod] = useState<ShopPaymentMethod>(() => providerToShopMethod(defaultPaymentProvider()));
  const [step, setStep] = useState<Step>("methods");
  const [error, setError] = useState<string | null>(null);
  const [externalProvider, setExternalProvider] = useState<PaymentProvider | null>(null);

  const provider = useMemo(() => shopMethodToProvider(method === "card" ? "credit_card" : method), [method]);
  const priceLabel = priceLabelForDuration(request.durationMinutes);

  const handlePay = async () => {
    setError(null);
    setStep("processing");
    try {
      const result = await pl.payAndReserveRequest(request.id, method);
      if (!result) {
        setError("לא ניתן להשלים את התשלום. נסו שוב.");
        setStep("methods");
        return;
      }
      if (result.status === "reserved") {
        setStep("success");
        return;
      }
      if (provider && isExternalAppProvider(provider)) {
        setExternalProvider(provider);
        setStep("external");
        return;
      }
      if (result.paymentStatus === "paid") {
        setStep("success");
      } else {
        setStep("methods");
        setError("התשלום עדיין ממתין לאישור.");
      }
    } catch {
      setError("שגיאת תשלום. נסו שוב או בחרו אמצעי אחר.");
      setStep("methods");
    }
  };

  const handleConfirmExternal = async () => {
    setStep("processing");
    const updated = await pl.confirmRequestPayment(request.id);
    if (updated?.status === "reserved") {
      setStep("success");
    } else {
      setError("התשלום עדיין לא אושר.");
      setStep("external");
    }
  };

  useEffect(() => {
    if (step === "success") {
      const fresh = pl.getAvailabilityRequest(request.id);
      if (fresh) onConfirmed(fresh);
    }
  }, [step, request.id, pl, onConfirmed]);

  if (!slot || request.status !== "ready_for_payment") {
    return (
      <div className={screenClass}>
        <Header title="תשלום" subtitle="יש לבחור מועד לפני התשלום." />
        <GhostButton onClick={onBack}>חזרה</GhostButton>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className={screenClass}>
        <div className="flex items-center justify-center gap-2 py-12 text-white/55">
          <Loader2 className="animate-spin" size={20} />
          <span className="text-sm">מעביר לאישור…</span>
        </div>
      </div>
    );
  }

  if (step === "external" && externalProvider) {
    return (
      <div className={screenClass}>
        <Header title="ממתין לאישור תשלום" subtitle={externalRedirectMessageHe(externalProvider)} />
        <div className="rounded-[22px] border border-sky-400/20 bg-sky-500/[0.08] px-5 py-5 text-right">
          <p className="text-sm leading-relaxed text-white/55">{pendingPaymentHintHe(externalProvider)}</p>
          <p className="mt-3 text-xs text-white/38">
            {paymentProviderLabelHe(externalProvider)} · בקשה #{request.id.slice(-6)}
          </p>
        </div>
        <PrimaryButton onClick={handleConfirmExternal}>אישרתי בתשלום — בדיקת סטטוס</PrimaryButton>
        <GhostButton className="w-full" onClick={() => pl.getAvailabilityRequest(request.id) && onConfirmed(pl.getAvailabilityRequest(request.id)!)}>
          המשך לאישור
        </GhostButton>
      </div>
    );
  }

  return (
    <div className={screenClass}>
      <GhostButton onClick={onBack} className="!mb-2 !px-0 !py-1 !text-sm">
        ← חזרה
      </GhostButton>
      <Header title="תשלום ושריון" subtitle={`${request.teacherName} · ${request.durationMinutes} דק׳`} />

      <div className="rounded-[22px] border border-white/[0.1] bg-white/[0.04] px-5 py-4 text-right">
        <SectionEyebrow>מועד שנבחר</SectionEyebrow>
        <p className="mt-2 text-lg font-semibold text-white">{formatSuggestedSlot(slot)}</p>
        <p className="mt-2 text-sm text-white/45">{priceLabel}</p>
      </div>

      {product ? <WarmupPolicyCard policy={product.warmupPolicy} /> : null}
      <p className="text-right text-[11px] leading-relaxed text-white/35">{PRIVATE_LESSON_WARMUP_POLICY}</p>

      <PaymentMethodSelector selected={method} onSelect={setMethod} includeBankTransfer />

      {error ? <p className="text-right text-sm text-rose-300/90">{error}</p> : null}

      {step === "processing" ? (
        <div className="flex items-center justify-center gap-2 py-6 text-white/55">
          <Loader2 className="animate-spin" size={20} />
          <span className="text-sm">מעבד תשלום…</span>
        </div>
      ) : (
        <PrimaryButton onClick={handlePay}>
          <span className="inline-flex items-center gap-2">
            <ShieldCheck size={18} />
            שלמו ושריינו · {priceLabel}
          </span>
        </PrimaryButton>
      )}
    </div>
  );
}
