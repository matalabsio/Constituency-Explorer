import { AppShell } from "@/components/AppShell";
import { MandalCard } from "@/components/MandalCard";
import { PageHeader, SectionTitle } from "@/components/ui";
import { getLandingData } from "@/lib/landing";

export default function DhoneMandalsPage() {
  const { mandals, stats, meta } = getLandingData("dhone");

  return (
    <AppShell>
      <PageHeader
        eyebrow="Administrative units"
        title="All mandals"
        description={`${stats.mandals} revenue mandals in ${meta.name} constituency: village counts, gram panchayats, and population totals.`}
      />
      <SectionTitle title="Browse by mandal" description="Select a mandal to view villages and demographics" />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {mandals.map((mandal, index) => (
          <MandalCard key={mandal.slug} mandal={mandal} index={index} basePath={meta.basePath} />
        ))}
      </div>
    </AppShell>
  );
}
