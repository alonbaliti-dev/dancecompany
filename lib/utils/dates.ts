export function toIsoDateTime(d: Date = new Date()): string {
  return d.toISOString();
}

export function parseIsoSafe(value?: string): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}
