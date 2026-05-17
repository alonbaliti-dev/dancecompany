import "server-only";

import { randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);
const KEY_LENGTH = 64;

export function normalizePhoneForAuth(input: string) {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 9 && digits.startsWith("5")) return `+972${digits}`;
  if (digits.length === 10 && digits.startsWith("05")) return `+972${digits.slice(1)}`;
  if (digits.length === 12 && digits.startsWith("9725")) return `+${digits}`;
  if (digits.length === 13 && digits.startsWith("009725")) return `+${digits.slice(2)}`;
  return digits;
}

export function legacyIsraeliPhoneForAuth(input: string) {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 9 && digits.startsWith("5")) return `0${digits}`;
  if (digits.length === 10 && digits.startsWith("05")) return digits;
  if (digits.length === 12 && digits.startsWith("9725")) return `0${digits.slice(3)}`;
  if (digits.length === 13 && digits.startsWith("009725")) return `0${digits.slice(5)}`;
  return digits;
}

export function isSupportedIsraeliPhone(input: string) {
  return /^\+9725\d{8}$/.test(normalizePhoneForAuth(input));
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("base64url");
  const derived = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
  return `scrypt$${salt}$${derived.toString("base64url")}`;
}

export async function verifyPassword(password: string, storedHash: string) {
  const [scheme, salt, hash] = storedHash.split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;

  const derived = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
  const expected = Buffer.from(hash, "base64url");
  if (expected.length !== derived.length) return false;

  return timingSafeEqual(expected, derived);
}
