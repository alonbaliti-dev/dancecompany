import type { ExternalMediaCategory, ExternalMediaPlatform } from "@/lib/types";

export function mediaCardGradient(platform: ExternalMediaPlatform, category: ExternalMediaCategory): string {
  if (category === "flamenco") {
    return "linear-gradient(145deg, rgba(127,29,29,0.85) 0%, rgba(69,10,10,0.9) 45%, rgba(251,191,36,0.25) 100%)";
  }
  if (platform === "youtube") {
    return "linear-gradient(145deg, rgba(127,29,29,0.55) 0%, rgba(15,15,18,0.92) 50%, rgba(220,38,38,0.2) 100%)";
  }
  if (platform === "instagram") {
    return "linear-gradient(145deg, rgba(131,58,180,0.45) 0%, rgba(225,48,108,0.35) 40%, rgba(15,15,18,0.9) 100%)";
  }
  return "linear-gradient(145deg, rgba(37,99,235,0.4) 0%, rgba(15,15,18,0.92) 60%, rgba(59,130,246,0.15) 100%)";
}

export function platformLabelHe(platform: ExternalMediaPlatform): string {
  if (platform === "instagram") return "Instagram";
  if (platform === "youtube") return "YouTube";
  return "Facebook";
}
