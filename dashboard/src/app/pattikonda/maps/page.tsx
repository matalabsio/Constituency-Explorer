import { AppShell } from "@/components/AppShell";
import { SatelliteMapCard } from "@/components/SatelliteMapCard";
import { PageHeader } from "@/components/ui";
import { MANDALS, MANDAL_MAPS } from "../data";

export default function PattikondaMapsPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Location maps"
        title="Mandal maps"
        description="Pattikonda, Maddikera, Tuggali, Krishnagiri, and Veldurthy satellite views from VillageMap.in (Google Maps). Official NIC boundary sheets are not on the district site."
      />
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {MANDAL_MAPS.map((map) => {
          const mandal = MANDALS.find((m) => m.slug === map.slug);
          return (
            <SatelliteMapCard
              key={map.slug}
              map={map}
              displayName={mandal?.name ?? map.listedName}
              detailsHref={`/pattikonda/mandals/${map.slug}`}
            />
          );
        })}
      </div>
      <p className="mt-8 max-w-3xl text-xs leading-relaxed text-[var(--muted)]">
        Source:{" "}
        <a
          href="https://villagemap.in/andhra-pradesh/kurnool/pattikonda.html"
          className="font-medium text-[var(--accent)] hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          villagemap.in
        </a>{" "}
        (Census 2001 village lists, Google Maps hybrid tiles). Maddikera is listed as Maddikera (east); Veldurthy as
        Veldurthi.
      </p>
    </AppShell>
  );
}
