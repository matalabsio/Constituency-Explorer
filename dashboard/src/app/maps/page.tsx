import { AppShell } from "@/components/AppShell";
import { MandalMapsGallery } from "@/components/MandalMapsGallery";
import { PageHeader } from "@/components/ui";
import { getExploreData } from "@/lib/explore";

export default function MapsPage() {
  const { mandals, stats } = getExploreData();

  return (
    <AppShell>
      <PageHeader
        eyebrow="District records"
        title="Mandal maps"
        description={`Official boundary maps for all ${stats.mandals} revenue mandals in Kurupam (ST). Click any map to expand.`}
      />
      <MandalMapsGallery mandals={mandals} />
    </AppShell>
  );
}
