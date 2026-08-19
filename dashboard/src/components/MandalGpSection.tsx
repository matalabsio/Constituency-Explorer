"use client";

import { VillageExplorer } from "@/components/VillageExplorer";
import { SectionTitle } from "@/components/ui";
import type { VillageRow } from "@/lib/types";

export function MandalGpSection({
  villages,
  mandalSlug,
}: {
  villages: VillageRow[];
  mandalSlug: string;
}) {
  return (
    <>
      <SectionTitle title="Villages" description={`${villages.length} revenue villages`} />
      <VillageExplorer villages={villages} initialMandal={mandalSlug} />
    </>
  );
}
