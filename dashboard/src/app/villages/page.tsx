import { AppShell } from "@/components/AppShell";
import { VillageExplorer } from "@/components/VillageExplorer";
import { PageHeader } from "@/components/ui";
import { getExploreData } from "@/lib/explore";

export default function VillagesPage() {
  const { villages, stats } = getExploreData();

  return (
    <AppShell>
      <PageHeader
        eyebrow="Full directory"
        title="Village directory"
        description={`${stats.collectedVillages} villages across ${stats.mandals} mandals · Census ${stats.censusYear} · click any row for full details`}
      />
      <VillageExplorer villages={villages} />
    </AppShell>
  );
}
