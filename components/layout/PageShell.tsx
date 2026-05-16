"use client";

import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import { screen } from "@/lib/design-system/tokens";
import { Header, PrimaryButton } from "../ui";

/**
 * Standard screen frame: rhythm, title, optional single primary CTA.
 */
export function PageShell({
  title,
  subtitle,
  children,
  className,
  primaryAction
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  className?: string;
  primaryAction?: { label: string; onClick: () => void; tone?: "accent" | "teacher" | "management" | "urgent" };
}) {
  return (
    <div className={cx(screen.className, className)}>
      <Header title={title} subtitle={subtitle} />
      {primaryAction ? (
        <PrimaryButton tone={primaryAction.tone ?? "accent"} onClick={primaryAction.onClick}>
          {primaryAction.label}
        </PrimaryButton>
      ) : null}
      {children}
    </div>
  );
}
