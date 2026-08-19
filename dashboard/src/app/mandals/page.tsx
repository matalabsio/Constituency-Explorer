import { AppShell } from "@/components/AppShell";
import { MandalCard } from "@/components/MandalCard";
import { PageHeader, SectionTitle } from "@/components/ui";
import { getExploreData } from "@/lib/explore";

export default function MandalsPage() {
  const { mandals } = getExploreData();

  return (
    <AppShell>
      <PageHeader
        eyebrow="Administrative units"
        title="All mandals"
        description="Five revenue mandals in Kurupam constituency — village counts, gram panchayats, and population totals."
      />
      <SectionTitle title="Browse by mandal" description="Select a mandal to view villages and demographics" />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {mandals.map((mandal, index) => (
          <MandalCard key={mandal.slug} mandal={mandal} index={index} />
        ))}
      </div>
    </AppShell>
  );
}
