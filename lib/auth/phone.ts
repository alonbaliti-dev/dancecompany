/**
 * Normalize Israeli mobile input for comparison (mock auth).
 * Accepts 05XXXXXXXX, 5XXXXXXXX, spaces/dashes.
 */
export function normalizeIsraeliMobile(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 9 && digits.startsWith("5")) return `0${digits}`;
  if (digits.length === 10 && digits.startsWith("05")) return digits;
  return digits;
}
