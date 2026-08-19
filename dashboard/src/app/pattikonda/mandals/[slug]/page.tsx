import Link from "next/link";
import { notFound } from "next/navigation";
import { PattikondaShell } from "@/components/PattikondaShell";
import { SatelliteMapCard } from "@/components/SatelliteMapCard";
import { MANDALS, GRAM_PANCHAYATS, getBoothCountByVillage, getMandalMap } from "../../data";
import { getVillagesByMandal } from "../../villages";
import { BAR, focusRing } from "@/lib/colors";
import { ChartCard, PieChart } from "@/app/dhone/ui";
import { constituencyEyebrow, getConstituencyMeta } from "@/lib/constituencies";

function fmt(n: number): string {
  return n.toLocaleString("en-IN");
}

export function generateStaticParams() {
  return MANDALS.map((m) => ({ slug: m.slug }));
}

export default async function PattikondaMandalDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const mandal = MANDALS.find((m) => m.slug === slug);

  if (!mandal) notFound();

  const m = mandal;
  const villages = getVillagesByMandal(slug);
  const gps = GRAM_PANCHAYATS[m.slug] ?? [];
  const otherPop = m.population - m.scPopulation - m.stPopulation;
  const boothCounts = getBoothCountByVillage();
  const mandalBooths = villages.reduce((sum, v) => sum + (boothCounts.get(v.village_name) ?? 0), 0);
  const map = getMandalMap(m.slug);

  return (
    <PattikondaShell>
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-[var(--muted)]">
        <ol className="flex items-center gap-1.5">
          <li>
            <Link href="/pattikonda" className={`hover:text-[var(--foreground)] ${focusRing}`}>Pattikonda</Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/pattikonda/mandals" className={`hover:text-[var(--foreground)] ${focusRing}`}>Mandals</Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="font-semibold text-[var(--foreground)]">{m.name}</li>
        </ol>
      </nav>

      <header className="mb-8">
        <p className="mark-yellow text-xs font-semibold uppercase tracking-[0.18em]">
          {constituencyEyebrow(getConstituencyMeta("pattikonda"))}
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
          {m.name} Mandal
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          {m.villages} villages &middot; {m.gramPanchayats} gram panchayats &middot; Kurnool district
        </p>
      </header>

      <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {[
          { label: "Population", value: fmt(m.population), accent: "var(--brand-green)" },
          { label: "Households", value: fmt(m.households), accent: "var(--brand-yellow)" },
          { label: "Sex Ratio", value: String(m.sexRatio), accent: "var(--brand-red)" },
          { label: "Literacy", value: `${m.literacy}%`, accent: "var(--accent)" },
          { label: "Polling Booths", value: String(mandalBooths), accent: "var(--brand-green)" },
        ].map(({ label, value, accent }) => (
          <div key={label} className="relative overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--shadow-sm)]">
            <div className="absolute inset-x-0 top-0 h-0.5" style={{ background: accent }} />
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">{label}</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-[var(--foreground)]">{value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-12">
        <section>
          <h2 className="mb-5 text-lg font-semibold tracking-tight text-[var(--foreground)]">Demographics</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <ChartCard title="Gender">
              <PieChart
                caption={`${m.name} gender: male ${fmt(m.male)}, female ${fmt(m.female)}`}
                slices={[
                  { label: "Male", value: m.male, color: BAR.male },
                  { label: "Female", value: m.female, color: BAR.female },
                ]}
              />
            </ChartCard>
            <ChartCard title="Social category">
              <PieChart
                caption={`${m.name} social category: SC ${fmt(m.scPopulation)}, ST ${fmt(m.stPopulation)}, other ${fmt(otherPop)}`}
                slices={[
                  { label: "SC", value: m.scPopulation, color: BAR.sc },
                  { label: "ST", value: m.stPopulation, color: BAR.st },
                  { label: "Other", value: otherPop, color: BAR.other },
                ]}
              />
            </ChartCard>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Area (km²)", value: m.area },
              { label: "Density (/km²)", value: m.density },
              { label: "Villages", value: m.villages },
              { label: "Gram Panchayats", value: m.gramPanchayats },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow-sm)]">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">{label}</p>
                <p className="mt-1 text-lg font-semibold tabular-nums text-[var(--foreground)]">{fmt(value)}</p>
              </div>
            ))}
          </div>
        </section>

        {villages.length > 0 && (
          <section>
            <h2 className="mb-5 text-lg font-semibold tracking-tight text-[var(--foreground)]">
              Villages
            </h2>
            <p className="mb-4 text-sm text-[var(--muted)]">
              Village-level Census 2011 counts are not listed here. Population below is an em dash, not an estimate.
            </p>
            <div className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--surface-muted)]">
                    <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">Village</th>
                    <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">Population</th>
                    <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">Booths</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">Gram Panchayat</th>
                  </tr>
                </thead>
                <tbody>
                  {villages.map((v) => (
                    <tr key={v.village_name} className="border-t border-[var(--border)] transition hover:bg-[var(--surface-muted)]">
                      <td className="px-4 py-3 font-medium text-[var(--foreground)]">{v.village_name}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-[var(--foreground)]">{v.population != null ? fmt(v.population) : "—"}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-[var(--foreground)]">{boothCounts.get(v.village_name) ?? 0}</td>
                      <td className="px-4 py-3 text-[var(--muted)]">{v.gram_panchayat ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-right">
              <Link href="/pattikonda/villages" className="text-xs font-medium text-[var(--brand-green)] hover:underline">
                View all villages &rarr;
              </Link>
            </p>
          </section>
        )}

        {map ? (
          <section className="mb-10">
            <h2 className="mb-5 text-lg font-semibold tracking-tight text-[var(--foreground)]">
              Location map
            </h2>
            <SatelliteMapCard map={map} displayName={m.name} />
          </section>
        ) : null}

        {gps.length > 0 && (
          <section>
            <h2 className="mb-5 text-lg font-semibold tracking-tight text-[var(--foreground)]">
              Gram Panchayats ({gps.length})
            </h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {gps.map((gp) => (
                <div key={gp} className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)]">
                  {gp}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <footer className="mt-12 text-center text-xs text-[var(--muted)]">
        Source: Census 2011 &middot; kurnool.ap.gov.in
      </footer>
    </PattikondaShell>
  );
}
