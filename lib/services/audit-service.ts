/**
 * Audit log — mock in-memory via PlatformContext.
 * Supabase: `from('audit_logs').insert`, ordered by timestamp desc.
 * Production: inserts via server trigger or Edge Function using service role.
 */
import { createAuditLog } from "@/lib/security/audit";
import type { CreateAuditLogInput } from "@/lib/security/types";
import type { AuditLogEntry } from "@/lib/types";

export const auditService = {
  filter(entries: AuditLogEntry[], studioId: string | null): AuditLogEntry[] {
    const sorted = [...entries].sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));
    if (!studioId) return sorted;
    return sorted.filter((e) => e.studioId === studioId);
  },

  buildEntry(input: CreateAuditLogInput): AuditLogEntry {
    return createAuditLog(input);
  }
};
