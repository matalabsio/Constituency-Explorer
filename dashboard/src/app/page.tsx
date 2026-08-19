import { AppShell } from "@/components/AppShell";
import { ConstituencyLanding } from "@/components/ConstituencyLanding";
import { EmptyState } from "@/components/ui";
import { getLandingData } from "@/lib/landing";

export default function HomePage() {
  const data = getLandingData("kurupam");

  if (data.stats.collectedVillages === 0) {
    return (
      <AppShell>
        <EmptyState
          title="No local data yet"
          description="Run the collector to populate the local database, then refresh this page."
        />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <ConstituencyLanding data={data} />
    </AppShell>
  );
}
