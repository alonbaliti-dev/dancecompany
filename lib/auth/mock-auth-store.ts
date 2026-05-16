import type { LocalAuthCredential } from "./credentials";

/**
 * MOCK ONLY — in-memory password map for local development login.
 * Rebuilt from `LocalDatabase.authCredentials` on every DB change.
 */
let passwordByUserId: Record<string, string> = {};

export function rebuildAuthPasswordMap(credentials: LocalAuthCredential[]): void {
  passwordByUserId = {};
  for (const c of credentials) {
    if (c.passwordHashOrDevPassword) {
      passwordByUserId[c.userId] = c.passwordHashOrDevPassword;
    }
  }
}

export function getStoredPassword(userId: string): string {
  return passwordByUserId[userId] ?? "";
}

/** Updates in-memory map; persist via domain mutation on `authCredentials`. */
export function setStoredPassword(userId: string, password: string): void {
  passwordByUserId[userId] = password;
}
