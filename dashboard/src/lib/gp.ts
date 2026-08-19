import type { VillageRow } from "@/lib/types";

export type GpGroup = {
  key: string;
  name: string;
  mandal: string;
  entitySlug: string;
  villages: VillageRow[];
  population: number;
};

export function buildGpGroups(rows: VillageRow[]): GpGroup[] {
  const map = new Map<string, GpGroup>();
  for (const v of rows) {
    const gpName = v.gram_panchayat?.trim() || "Unassigned GP";
    const key = `${v.entity_slug}:${gpName.toLowerCase()}`;
    const existing = map.get(key);
    if (existing) {
      existing.villages.push(v);
      existing.population += v.population ?? 0;
    } else {
      map.set(key, {
        key,
        name: gpName,
        mandal: v.mandal_name,
        entitySlug: v.entity_slug,
        villages: [v],
        population: v.population ?? 0,
      });
    }
  }
  return [...map.values()].sort(
    (a, b) => a.mandal.localeCompare(b.mandal) || a.name.localeCompare(b.name)
  );
}
