const os = require("os");

/** Private LAN IPs + wildcards — required for iPhone Safari on Next.js 16+ dev. */
function getAllowedDevOrigins() {
  const origins = [
    "localhost",
    "127.0.0.1",
    "*.localhost",
    "192.168.*",
    "10.*",
    "172.16.*",
    "172.17.*",
    "172.18.*",
    "172.19.*",
    "172.20.*",
    "172.21.*",
    "172.22.*",
    "172.23.*",
    "172.24.*",
    "172.25.*",
    "172.26.*",
    "172.27.*",
    "172.28.*",
    "172.29.*",
    "172.30.*",
    "172.31.*"
  ];

  for (const ifaces of Object.values(os.networkInterfaces())) {
    for (const iface of ifaces ?? []) {
      if (iface.family === "IPv4" && !iface.internal) {
        origins.push(iface.address);
      }
    }
  }

  return [...new Set(origins)];
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: getAllowedDevOrigins()
};

module.exports = nextConfig;
