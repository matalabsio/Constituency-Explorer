import { AppShell } from "@/components/AppShell";
import { BoothExplorer } from "@/components/BoothExplorer";
import {
  Card,
  CardBody,
  EmptyState,
  FieldGrid,
  Metric,
  PageHeader,
} from "@/components/ui";
import { assignBoothMandals, boothCountsByMandal } from "@/lib/booths";
import { BRAND } from "@/lib/colors";
import { getExploreData } from "@/lib/explore";
import { formatNumber } from "@/lib/mandals";

export default function BoothsPage() {
  const { pollingStations, villages } = getExploreData();

  if (!pollingStations) {
    return (
      <AppShell>
        <EmptyState
          title="No polling-station directory yet"
          description="Seed the polling_stations manual record, then refresh this page."
        />
      </AppShell>
    );
  }

  const booths = assignBoothMandals(pollingStations.parts, villages);
  const mandalCounts = boothCountsByMandal(booths);

  return (
    <AppShell>
      <PageHeader
        eyebrow="Five mandals · Kurupam (ST)"
        title="Polling stations"
        description={`${formatNumber(booths.length)} booths across Komarada, Gummalakshmipuram, Kurupam, Jiyammavalasa, and Garugubilli`}
      />

      <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {mandalCounts.map((item, index) => (
          <Metric
            key={item.slug}
            label={item.name}
            value={item.count}
            sub="polling stations"
            accent={[BRAND.yellow, BRAND.red, BRAND.green, BRAND.black, BRAND.yellow][index]}
          />
        ))}
      </section>

      <Card className="mb-8" accent={BRAND.green}>
        <CardBody>
          <FieldGrid
            fields={[
              { label: "District", value: pollingStations.district },
              {
                label: "District code",
                value: pollingStations.districtCode,
              },
              {
                label: "State",
                value: pollingStations.stateCode
                  ? `${pollingStations.state} (${pollingStations.stateCode})`
                  : pollingStations.state,
              },
              {
                label: "Available rolls listed",
                value: pollingStations.availableRolls.join(" · ") || null,
              },
              {
                label: "Assembly",
                value: `AC ${pollingStations.assemblyNo} ${pollingStations.assemblyName} (${pollingStations.reservation})`,
              },
            ]}
          />
        </CardBody>
      </Card>

      <BoothExplorer parts={booths} mandalCounts={mandalCounts} />

      <p className="mt-6 text-xs leading-relaxed text-[var(--muted)]">
        Booths are the 269 polling stations of Kurupam AC, grouped into the five revenue mandals.
        Mandal blocks follow the voterslist.in / ECI part order (HQ booth names). Source:{" "}
        <a
          href={pollingStations.sourceUrl}
          className="font-medium text-[var(--accent)] hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          voterslist.in
        </a>
        . Names are kept as published.
      </p>
    </AppShell>
  );
}
