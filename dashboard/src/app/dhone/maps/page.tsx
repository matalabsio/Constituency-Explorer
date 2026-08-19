import { AppShell } from "@/components/AppShell";
import { SatelliteMapCard } from "@/components/SatelliteMapCard";
import { PageHeader } from "@/components/ui";
import { MANDALS, MANDAL_MAPS } from "../data";

export default function DhoneMapsPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="AC 141 GEN · Nandyal"
        title="Mandal maps"
        description="Dhone, Bethamcherla, and Peapully satellite views from VillageMap.in (Google Maps). Official NIC boundary sheets are not published on the Nandyal district site."
      />
      <div className="grid gap-6 lg:grid-cols-1 xl:grid-cols-3">
        {MANDAL_MAPS.map((map) => {
          const mandal = MANDALS.find((m) => m.slug === map.slug);
          return (
            <SatelliteMapCard
              key={map.slug}
              map={map}
              displayName={mandal?.name ?? map.listedName}
              detailsHref={`/dhone/mandals/${map.slug}`}
            />
          );
        })}
      </div>
      <p className="mt-8 max-w-3xl text-xs leading-relaxed text-[var(--muted)]">
        Source:{" "}
        <a
          href="https://villagemap.in/andhra-pradesh/kurnool/peapally.html"
          className="font-medium text-[var(--accent)] hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          villagemap.in
        </a>{" "}
        (Census 2001 village lists, Google Maps hybrid tiles). Peapully is spelled Peapally on that site. District
        overview:{" "}
        <a
          href="https://nandyal.ap.gov.in/map-of-district/"
          className="font-medium text-[var(--accent)] hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          nandyal.ap.gov.in/map-of-district
        </a>
        .
      </p>
    </AppShell>
  );
}
