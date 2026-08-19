"use client";

import { MandalCompareChart } from "@/components/charts";
import type { MandalExplore } from "@/lib/explore";

export function MandalCompareSection({ mandals }: { mandals: MandalExplore[] }) {
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          Sex ratio (females per 1,000 males)
        </p>
        <MandalCompareChart
          mandals={mandals}
          getValue={(m) => m.demographics.sexRatio ?? 0}
        />
      </div>
      <div>
        <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          Scheduled Castes (%)
        </p>
        <MandalCompareChart
          mandals={mandals}
          getValue={(m) => parseFloat(m.demographics.scPct)}
          formatValue={(n) => `${n.toFixed(1)}%`}
        />
      </div>
    </div>
  );
}
