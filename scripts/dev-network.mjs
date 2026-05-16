#!/usr/bin/env node
/**
 * Prints LAN URLs for iPhone testing, then starts `next dev` on 0.0.0.0:3000.
 */
import { spawn } from "node:child_process";
import os from "node:os";

function lanIpv4Addresses() {
  const addrs = [];
  for (const ifaces of Object.values(os.networkInterfaces())) {
    for (const iface of ifaces ?? []) {
      if (iface.family === "IPv4" && !iface.internal) addrs.push(iface.address);
    }
  }
  return [...new Set(addrs)];
}

const port = process.env.PORT || "3000";
const ips = lanIpv4Addresses();

console.log("\n  LK Student Space — dev server\n");
console.log(`  Mac:     http://localhost:${port}`);
if (ips.length) {
  for (const ip of ips) {
    console.log(`  iPhone:  http://${ip}:${port}  (same Wi‑Fi, not 0.0.0.0)`);
  }
} else {
  console.log("  iPhone:  (no LAN IP found — check Wi‑Fi / VPN)");
}
console.log("\n  Keep this terminal open. Allow Node in macOS Firewall if prompted.\n");

const child = spawn("npx", ["next", "dev", "--hostname", "0.0.0.0", "--port", port], {
  stdio: "inherit",
  env: process.env,
  shell: process.platform === "win32"
});

child.on("exit", (code) => process.exit(code ?? 0));
