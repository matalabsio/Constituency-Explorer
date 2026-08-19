"use client";

import { useMemo, useState } from "react";
import { DataTableShell, SectionTitle } from "@/components/ui";
import { groupBoothsByMandal, type BoothRow } from "@/lib/booths";
import type { TargetMandalSlug } from "@/lib/mandals";

export function BoothExplorer({
  parts,
  mandalCounts,
}: {
  parts: BoothRow[];
  mandalCounts: { slug: TargetMandalSlug; name: string; count: number }[];
}) {
  const [query, setQuery] = useState("");
  const [mandal, setMandal] = useState<"all" | TargetMandalSlug>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return parts.filter((part) => {
      if (mandal !== "all" && part.mandalSlug !== mandal) return false;
      if (!q) return true;
      return part.name.toLowerCase().includes(q) || String(part.partNo).includes(q);
    });
  }, [parts, query, mandal]);

  const groups = useMemo(
    () => groupBoothsByMandal(filtered).filter((group) => mandal === "all" || group.slug === mandal),
    [filtered, mandal]
  );

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search part number or booth name…"
          className="w-full max-w-md rounded-[var(--radius-md)] border border-[var(--border)] bg-white px-4 py-2.5 text-sm shadow-[var(--shadow-sm)] outline-none focus:ring-2 focus:ring-[var(--brand-green)]/40"
        />
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={mandal}
            onChange={(e) => setMandal(e.target.value as "all" | TargetMandalSlug)}
            className="rounded-[var(--radius-md)] border border-[var(--border)] bg-white px-3 py-2.5 text-sm"
          >
            <option value="all">All 5 mandals</option>
            {mandalCounts.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.name} ({item.count})
              </option>
            ))}
          </select>
          <p className="text-sm text-[var(--muted)]">
            {filtered.length.toLocaleString("en-IN")} booths
          </p>
        </div>
      </div>

      <div className="space-y-10">
        {groups.map((group) => (
          <section key={group.slug}>
            <SectionTitle
              title={group.name}
              description={`${group.booths.length.toLocaleString("en-IN")} polling stations`}
            />
            {group.booths.length === 0 ? (
              <p className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white px-6 py-10 text-center text-sm text-[var(--muted)]">
                No booths in {group.name} match this search.
              </p>
            ) : (
              <DataTableShell>
                <table className="data-table min-w-full text-sm">
                  <thead>
                    <tr>
                      <th className="w-28">Part no.</th>
                      <th>Booth name</th>
                      <th>Mandal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.booths.map((part) => (
                      <tr key={part.partNo}>
                        <td className="tabular-nums font-medium">{part.partNo}</td>
                        <td>{part.name}</td>
                        <td>{part.mandalName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </DataTableShell>
            )}
          </section>
        ))}
      </div>
    </>
  );
}
