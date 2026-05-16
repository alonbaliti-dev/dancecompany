"use client";

import { CheckCircle2, Circle } from "lucide-react";
import { usePlatformOS } from "@/context/PlatformOSContext";
import type { StackTabId, UserProfile } from "@/lib/types";
import { Header, screenClass } from "../ui";

export function RoleOnboardingScreen({
  user,
  onNavigate
}: {
  user: UserProfile;
  onNavigate: (s: StackTabId) => void;
}) {
  const { onboarding, completeOnboardingStep } = usePlatformOS();
  if (!onboarding) return null;

  const done = onboarding.steps.filter((s) => s.completed).length;
  const total = onboarding.steps.length;

  return (
    <div className={screenClass}>
      <Header title="מדריך התחלה" subtitle={`${done}/${total} שלבים הושלמו`} />
      <ul className="space-y-2">
        {onboarding.steps.map((step) => (
          <li key={step.id}>
            <button
              type="button"
              onClick={() => {
                if (!step.completed) completeOnboardingStep(step.id);
                if (step.stackTarget) onNavigate(step.stackTarget as StackTabId);
              }}
              className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-right"
            >
              {step.completed ? (
                <CheckCircle2 className="shrink-0 text-emerald-400/90" size={22} aria-hidden />
              ) : (
                <Circle className="shrink-0 text-white/30" size={22} aria-hidden />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">{step.titleHe}</p>
                <p className="mt-0.5 text-xs text-white/45">{step.descriptionHe}</p>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
