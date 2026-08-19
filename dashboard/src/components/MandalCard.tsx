"use client";

import Link from "next/link";
import { mandalColor, mandalLabelColor } from "@/lib/colors";
import type { LandingMandal } from "@/lib/landing";
import { formatNumber } from "@/lib/mandals";

export function MandalCard({
  mandal,
  index,
  basePath = "",
}: {
  mandal: LandingMandal;
  index: number;
  basePath?: string;
}) {
  const color = mandalColor(index);
  const onColor = mandalLabelColor(color);
  const href = `${basePath}/mandals/${mandal.slug}`;

  return (
    <article className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-sm)] transition duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]">
      <div className="h-1 w-full" style={{ background: color }} />
      {mandal.mapEmbedUrl ? (
        <div className="h-44 w-full overflow-hidden border-b border-[var(--border)] bg-[var(--surface-muted)]">
          <iframe
            title={`${mandal.displayName} satellite map`}
            src={mandal.mapEmbedUrl}
            className="h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      ) : mandal.mapImageUrl ? (
        <Link href={href} className="block overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={mandal.mapImageUrl}
            alt={`${mandal.displayName} map`}
            className="h-36 w-full border-b border-[var(--border)] bg-[var(--surface-muted)] object-cover transition duration-300 hover:scale-[1.02]"
          />
        </Link>
      ) : (
        <Link
          href={href}
          className="flex h-36 items-center justify-center border-b border-[var(--border)] text-4xl font-bold"
          style={{ background: color, color: onColor }}
        >
          {mandal.displayName.slice(0, 1)}
        </Link>
      )}
      <Link href={href} className="block p-5">
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
      </Link>
    </article>
  );
}

/** @deprecated Use PopulationBarChart from charts.tsx */
export { PopulationBarChart as PopulationChart } from "@/components/charts";
