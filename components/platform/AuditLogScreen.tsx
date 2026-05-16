"use client";

import { PLATFORM_OWNER_NAME } from "@/lib/demo/identity";
import { auditService } from "@/lib/services/audit-service";
import { usePlatform } from "@/context/PlatformContext";
import { Card, Header, screenClass, cx } from "../ui";

export function AuditLogScreen({ scope }: { scope: "studio" | "platform" }) {
  const { auditLog, activeStudioId, user } = usePlatform();
  const studioId = scope === "platform" && user?.permissions.isSuperAdmin ? null : activeStudioId;
  const rows = auditService.filter(auditLog, studioId);

  return (
    <div className={screenClass}>
      <Header
        title="יומן ביקורת"
        subtitle={scope === "platform" ? `יומן פלטפורמה · ${PLATFORM_OWNER_NAME}` : "פעילות בסטודיו שלך"}
      />
      <div className="space-y-2">
        {rows.map((e) => (
          <Card key={e.id} animated={false} className={cx(e.severity === "critical" && "border-rose-400/20", e.severity === "warning" && "border-amber-400/15")}>
            <p className="text-right font-medium text-white">{e.action}</p>
            <p className="mt-1 text-right text-xs text-white/42">{e.actorName} · {e.targetType}{e.targetId ? ` · ${e.targetId}` : ""}</p>
            <p className="mt-1 text-right text-[10px] text-white/32">{new Date(e.timestamp).toLocaleString("he-IL")}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
