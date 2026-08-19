"use client";

import Link from "next/link";
import { mandalColor, mandalLabelColor } from "@/lib/colors";
import { formatNumber } from "@/lib/mandals";
import type { MandalExplore } from "@/lib/explore";

export function MandalCard({
  mandal,
  index,
}: {
  mandal: MandalExplore;
  index: number;
}) {
  const color = mandalColor(index);
  const onColor = mandalLabelColor(color);

  return (
    <Link
      href={`/mandals/${mandal.slug}`}
      className="group block overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-sm)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
    >
      <div className="h-1 w-full" style={{ background: color }} />
      {mandal.mapImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={mandal.mapImageUrl}
          alt={`${mandal.displayName} map`}
          className="h-36 w-full border-b border-[var(--border)] bg-[var(--surface-muted)] object-cover transition duration-300 group-hover:scale-[1.02]"
        />
      ) : (
        <div
          className="flex h-36 items-center justify-center border-b border-[var(--border)] text-4xl font-bold"
          style={{ background: color, color: onColor }}
        >
          {mandal.displayName.slice(0, 1)}
        </div>
      )}
      <div className="p-5">
        <h3 className="text-lg font-semibold text-[var(--foreground)]">{mandal.displayName}</h3>
        <dl className="mt-4 grid grid-cols-2 gap-3">
          {[
            { label: "Villages", value: mandal.villageCount },
            { label: "Gram Panchayats", value: mandal.gramPanchayats },
            { label: "Population", value: mandal.totalPopulation },
            { label: "Households", value: mandal.totalHouseholds },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2.5"
            >
              <dt className="text-[10px] font-medium uppercase tracking-wide text-[var(--muted)]">{label}</dt>
              <dd className="mt-0.5 text-sm font-semibold tabular-nums">{formatNumber(value)}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Link>
  );
}

/** @deprecated Use PopulationBarChart from charts.tsx */
export { PopulationBarChart as PopulationChart } from "@/components/charts";
