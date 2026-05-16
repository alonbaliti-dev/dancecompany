import { CheckCircle2, Flame, Star, Trophy, type LucideIcon } from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  flame: Flame,
  check: CheckCircle2,
  star: Star,
  trophy: Trophy
};

export function achievementIcon(name?: string): LucideIcon {
  if (!name) return Star;
  return ICONS[name] ?? Star;
}
