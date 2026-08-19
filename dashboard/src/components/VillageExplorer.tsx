"use client";

import { useEffect, useMemo, useState } from "react";
import { SexRatioChart, SocialCategoryChart } from "@/components/charts";
import { ChartFigure, DataTableShell, FieldGrid } from "@/components/ui";
import { formatNumber, mandalLabel } from "@/lib/mandals";
import { villageDemographics } from "@/lib/demographics";
import { buildGpGroups } from "@/lib/gp";
import type { VillageRow } from "@/lib/types";

type ViewMode = "table" | "gp";

function useEscape(onEscape: () => void, active: boolean) {
  useEffect(() => {
    if (!active) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onEscape();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [active, onEscape]);
}

export function VillageDetailPanel({
  village,
  onClose,
}: {
  village: VillageRow;
  onClose: () => void;
}) {
  useEscape(onClose, true);
  const demographics = villageDemographics(village);

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[var(--overlay)] backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="scrollbar-thin flex h-full w-full max-w-lg flex-col overflow-y-auto bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="village-detail-title"
      >
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-[var(--border)] bg-white/95 px-6 py-5 backdrop-blur">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--accent)]">
              {village.mandal_name}
            </p>
            <h2 id="village-detail-title" className="mt-1 text-2xl font-semibold text-[var(--foreground)]">
              {village.village_name}
            </h2>
            {village.gram_panchayat ? (
              <p className="mt-1 text-sm text-[var(--muted)]">GP: {village.gram_panchayat}</p>
            ) : null}
            {!village.has_detail ? (
              <p className="mt-2 inline-block rounded-full bg-[var(--highlight-soft)] px-2.5 py-0.5 text-xs font-medium text-[var(--foreground)] ring-1 ring-[var(--brand-yellow)]/50">
                Directory only — full census page not collected
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-sm text-[var(--muted)] hover:bg-[var(--surface-muted)]"
            aria-label="Close panel"
          >
            ✕
          </button>
        </div>

        <div className="space-y-8 p-6">
          {demographics ? (
            <section>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
                Demographics
              </h3>
              <div className="space-y-6">
                <ChartFigure
                  title={`${village.village_name} gender breakdown`}
                  summary={`Male ${formatNumber(demographics.populationMale)}; Female ${formatNumber(demographics.populationFemale)}`}
                  tableRows={[
                    { label: "Male", value: demographics.populationMale },
                    { label: "Female", value: demographics.populationFemale },
                    { label: "Sex ratio", value: demographics.sexRatio ?? "—" },
                  ]}
                >
                  <SexRatioChart
                    male={demographics.populationMale}
                    female={demographics.populationFemale}
                    ratio={demographics.sexRatio}
                    maleLabel="Male"
                    femaleLabel="Female"
                  />
                </ChartFigure>
                <ChartFigure
                  title={`${village.village_name} social category`}
                  summary={`ST ${demographics.stPct}%; SC ${demographics.scPct}%; Other ${demographics.otherPct}%`}
                  tableRows={[
                    { label: "Scheduled Tribes", value: demographics.populationSt, pct: demographics.stPct },
                    { label: "Scheduled Castes", value: demographics.populationSc, pct: demographics.scPct },
                    { label: "Other", value: demographics.populationOther, pct: demographics.otherPct },
                  ]}
                >
                  <SocialCategoryChart demographics={demographics} />
                </ChartFigure>
              </div>
            </section>
          ) : null}

          <section>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
              Population · Census {village.census_year ?? "2011"}
            </h3>
            <FieldGrid
              fields={[
                { label: "Total population", value: formatNumber(village.population) },
                { label: "Households", value: formatNumber(village.households) },
                { label: "Male", value: formatNumber(village.population_male) },
                { label: "Female", value: formatNumber(village.population_female) },
                { label: "Scheduled Castes", value: formatNumber(village.population_sc) },
                { label: "Scheduled Tribes", value: formatNumber(village.population_st) },
                { label: "Sex ratio", value: village.sex_ratio },
                { label: "Population density", value: village.population_density },
              ]}
            />
          </section>

          <section>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
              Location & administration
            </h3>
            <FieldGrid
              fields={[
                { label: "Census village code", value: village.census_village_code },
                { label: "Sub-district code", value: village.sub_district_code },
                { label: "Gram Panchayat", value: village.gram_panchayat },
                { label: "CD block", value: village.cd_block },
                { label: "District", value: village.district },
                { label: "State", value: village.state },
                { label: "Area", value: village.area },
                { label: "PIN code", value: village.pin_code },
                { label: "Nearest town", value: village.nearest_town },
                {
                  label: "Distance to town",
                  value: village.nearest_town_distance_km
                    ? `${village.nearest_town_distance_km} km`
                    : null,
                },
              ]}
            />
          </section>
        </div>
      </div>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
        active
          ? "bg-[var(--accent)] text-white shadow-[var(--shadow-sm)]"
          : "border border-[var(--border)] bg-white text-[var(--foreground)] hover:bg-[var(--surface-muted)]"
      }`}
    >
      {label}
    </button>
  );
}

type GpGroup = ReturnType<typeof buildGpGroups>[number];

export function VillageExplorer({
  villages,
  initialMandal,
}: {
  villages: VillageRow[];
  initialMandal?: string;
}) {
  const [query, setQuery] = useState("");
  const [mandal, setMandal] = useState<string | "all">(initialMandal ?? "all");
  const [sort, setSort] = useState<"name" | "population">("name");
  const [view, setView] = useState<ViewMode>("table");
  const [selected, setSelected] = useState<VillageRow | null>(null);
  const [expandedGp, setExpandedGp] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let rows = [...villages];
    if (mandal !== "all") rows = rows.filter((v) => v.entity_slug === mandal);
    if (query.trim()) {
      const q = query.toLowerCase();
      rows = rows.filter(
        (v) =>
          v.village_name.toLowerCase().includes(q) ||
          (v.gram_panchayat?.toLowerCase().includes(q) ?? false) ||
          (v.census_village_code?.includes(q) ?? false) ||
          v.pin_code?.includes(q)
      );
    }
    rows.sort((a, b) => {
      if (sort === "population") return (b.population ?? 0) - (a.population ?? 0);
      return a.village_name.localeCompare(b.village_name);
    });
    return rows;
  }, [villages, mandal, query, sort]);

  const gpGroups = useMemo(() => buildGpGroups(filtered), [filtered]);

  const mandalSlugs = useMemo(
    () => [...new Set(villages.map((v) => v.entity_slug))],
    [villages]
  );

  const withDetail = filtered.filter((v) => v.has_detail).length;

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search village, GP, census code, PIN…"
          className="w-full max-w-md rounded-[var(--radius-md)] border border-[var(--border)] bg-white px-4 py-2.5 text-sm shadow-[var(--shadow-sm)] outline-none focus:ring-2 focus:ring-[var(--brand-yellow)]/60 lg:flex-1"
        />
        <div className="flex flex-wrap gap-2">
          <div className="inline-flex rounded-[var(--radius-md)] border border-[var(--border)] bg-white p-1">
            <button
              type="button"
              onClick={() => setView("table")}
              className={`rounded-[var(--radius-sm)] px-3.5 py-2 text-sm font-medium transition ${
                view === "table"
                  ? "bg-[var(--accent)] text-white"
                  : "text-[var(--foreground)] hover:bg-[var(--surface-muted)]"
              }`}
            >
              Table
            </button>
            <button
              type="button"
              onClick={() => setView("gp")}
              className={`rounded-[var(--radius-sm)] px-3.5 py-2 text-sm font-medium transition ${
                view === "gp"
                  ? "bg-[var(--accent)] text-white"
                  : "text-[var(--foreground)] hover:bg-[var(--surface-muted)]"
              }`}
            >
              By GP
            </button>
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as "name" | "population")}
            className="rounded-[var(--radius-md)] border border-[var(--border)] bg-white px-3 py-2.5 text-sm"
          >
            <option value="name">Sort by name</option>
            <option value="population">Sort by population</option>
          </select>
        </div>
      </div>

      {!initialMandal ? (
        <div className="mb-6 flex flex-wrap gap-2">
          <FilterChip active={mandal === "all"} onClick={() => setMandal("all")} label="All mandals" />
          {mandalSlugs.map((slug) => (
            <FilterChip
              key={slug}
              active={mandal === slug}
              onClick={() => setMandal(slug)}
              label={mandalLabel(slug)}
            />
          ))}
        </div>
      ) : null}

      <p className="mb-4 text-sm text-[var(--muted)]">
        Showing {filtered.length.toLocaleString("en-IN")} of{" "}
        {villages.length.toLocaleString("en-IN")} villages
        {withDetail < filtered.length
          ? ` · ${withDetail} with full census details`
          : " · all with full census details"}
        {view === "gp" ? ` · ${gpGroups.length} gram panchayats` : " · click a row for details"}
      </p>

      {view === "table" ? (
        <DataTableShell>
          <table className="data-table min-w-full text-sm">
            <thead>
              <tr>
                <th>Village</th>
                {!initialMandal ? <th>Mandal</th> : null}
                <th>Gram Panchayat</th>
                <th>Code</th>
                <th className="text-right">Population</th>
                <th className="text-right">Households</th>
                <th>PIN</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[var(--muted)]">
                    No villages match your search.
                  </td>
                </tr>
              ) : (
                filtered.map((v) => (
                  <tr key={v.id} className="group">
                    <td className="p-0 font-medium text-[var(--foreground)]">
                      <button
                        type="button"
                        onClick={() => setSelected(v)}
                        className="flex w-full items-center px-4 py-3.5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--brand-yellow)] group-hover:bg-[var(--highlight-soft)]"
                      >
                        {v.village_name}
                        {!v.has_detail ? (
                          <span className="mark-yellow ml-2 text-[10px] font-normal uppercase">
                            partial
                          </span>
                        ) : null}
                      </button>
                    </td>
                    {!initialMandal ? (
                      <td className="text-[var(--muted)]">{v.mandal_name}</td>
                    ) : null}
                    <td className="text-[var(--muted)]">{v.gram_panchayat ?? "—"}</td>
                    <td className="font-mono text-xs">{v.census_village_code ?? "—"}</td>
                    <td className="text-right tabular-nums">{formatNumber(v.population)}</td>
                    <td className="text-right tabular-nums">{formatNumber(v.households)}</td>
                    <td>{v.pin_code ?? "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </DataTableShell>
      ) : (
        <div className="space-y-3">
          {gpGroups.length === 0 ? (
            <div className="rounded-2xl border border-[var(--border)] bg-white px-6 py-12 text-center text-[var(--muted)]">
              No gram panchayats match your search.
            </div>
          ) : (
            gpGroups.map((gp) => {
              const open = expandedGp === gp.key;
              return (
                <article
                  key={gp.key}
                  className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-white shadow-[var(--shadow-sm)]"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedGp(open ? null : gp.key)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left hover:bg-[var(--surface-muted)]"
                  >
                    <div>
                      <p className="font-semibold text-[var(--foreground)]">{gp.name}</p>
                      <p className="mt-0.5 text-sm text-[var(--muted)]">
                        {!initialMandal ? `${gp.mandal} · ` : ""}
                        {gp.villages.length} villages · {formatNumber(gp.population)} population
                      </p>
                    </div>
                    <span className="text-[var(--muted)]">{open ? "▴" : "▾"}</span>
                  </button>
                  {open ? (
                    <ul className="border-t border-[var(--border)] divide-y divide-[var(--border)]">
                      {gp.villages.map((v) => (
                        <li key={v.id}>
                          <button
                            type="button"
                            onClick={() => setSelected(v)}
                            className="flex w-full items-center justify-between px-5 py-3 text-left text-sm hover:bg-[var(--highlight-soft)]"
                          >
                            <span className="font-medium text-[var(--foreground)]">{v.village_name}</span>
                            <span className="tabular-nums text-[var(--muted)]">
                              {formatNumber(v.population)}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </article>
              );
            })
          )}
        </div>
      )}

      {selected ? (
        <VillageDetailPanel village={selected} onClose={() => setSelected(null)} />
      ) : null}
    </>
  );
}
