import Link from "next/link";
import { DhoneShell } from "@/components/DhoneShell";
import { MANDALS, CONSTITUENCY_TOTALS } from "../data";

function fmt(n: number): string {
  return n.toLocaleString("en-IN");
}

export default function DhoneMandalsPage() {
  const c = CONSTITUENCY_TOTALS;

  return (
    <DhoneShell>
      <header className="mb-8">
        <p className="mark-yellow text-xs font-semibold uppercase tracking-[0.18em]">
          Dhone Constituency
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
          Revenue Mandals
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          {c.mandals} mandals &middot; {c.totalVillages} villages &middot; {fmt(c.totalPopulation)} population (Census 2011)
        </p>
      </header>

      {/* Summary stats */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total Mandals", value: c.mandals },
          { label: "Revenue Villages", value: c.totalVillages },
          { label: "Gram Panchayats", value: c.totalGPs },
          { label: "Total Population", value: fmt(c.totalPopulation) },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow-sm)]">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">{label}</p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-[var(--foreground)]">{value}</p>
          </div>
        ))}
      </div>

      {/* Mandal cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {MANDALS.map((m) => (
          <Link
            key={m.slug}
            href={`/dhone/mandals/${m.slug}`}
            className="group rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--shadow-sm)] transition hover:border-[var(--brand-green)] hover:shadow-md"
          >
            <p className="text-lg font-semibold text-[var(--foreground)] group-hover:text-[var(--brand-green)] transition">{m.name}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">{m.villages} villages &middot; {m.gramPanchayats} GPs</p>

            <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
              {[
                { label: "Population", value: fmt(m.population) },
                { label: "Households", value: fmt(m.households) },
                { label: "Sex Ratio", value: m.sexRatio },
                { label: "Literacy", value: `${m.literacy}%` },
                { label: "SC %", value: `${m.scPercent}%` },
                { label: "ST %", value: `${m.stPercent}%` },
                { label: "Area (km²)", value: m.area },
                { label: "Density", value: `${m.density}/km²` },
              ].map(({ label, value }) => (
                <div key={label}>
                  <dt className="text-[10px] font-medium uppercase tracking-wide text-[var(--muted)]">{label}</dt>
                  <dd className="mt-0.5 font-semibold tabular-nums text-[var(--foreground)]">{value}</dd>
                </div>
              ))}
            </dl>

            <p className="mt-4 text-xs font-medium text-[var(--brand-green)] opacity-0 transition group-hover:opacity-100">
              View details &rarr;
            </p>
          </Link>
        ))}
      </div>

      <footer className="mt-12 text-center text-xs text-[var(--muted)]">
        Source: Census 2011 &middot; nandyal.ap.gov.in &middot; villageinfo.in
      </footer>
    </DhoneShell>
  );
}
