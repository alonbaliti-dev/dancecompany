import { getStudioGroups } from "@/lib/studio-groups-access";

export function groupNameToId(name: string): string | undefined {
  return getStudioGroups().find((g) => g.name === name)?.id;
}

export function groupIdToName(id: string): string | undefined {
  return getStudioGroups().find((g) => g.id === id)?.name;
}
