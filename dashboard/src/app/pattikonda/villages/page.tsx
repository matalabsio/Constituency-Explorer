"use client";

import { useEffect, useMemo, useState } from "react";
import { PattikondaShell } from "@/components/PattikondaShell";
import { CONSTITUENCY_TOTALS, MANDALS, getBoothsForVillage, getBoothCountByVillage } from "../data";
import { BAR, CHART_COLORS, PieChart, fmt as fmtNum } from "@/app/dhone/ui";
import { PATTIKONDA_VILLAGES, type PattikondaVillageRow } from "../villages";

function fmt(n: number | null | undefined): string {
  if (n == null) return "—";
  return fmtNum(n);
}

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

function VillageDetailPanel({ village, onClose }: { village: PattikondaVillageRow; onClose: () => void }) {
  useEscape(onClose, true);
  const v = village;
  const pop = v.population ?? 0;
  const male = v.population_male ?? 0;
  const female = v.population_female ?? 0;
  const sc = v.population_sc ?? 0;
  const st = v.population_st ?? 0;
  const other = pop - sc - st;
  const booths = getBoothsForVillage(v.village_name);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div
        className="scrollbar-thin flex h-full w-full max-w-lg flex-col overflow-y-auto bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="village-detail-title"
      >
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-[var(--border)] bg-white/95 px-6 py-5 backdrop-blur">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--brand-green)]">{v.mandal_name} Mandal</p>
            <h2 id="village-detail-title" className="mt-1 text-2xl font-semibold text-[var(--foreground)]">{v.village_name}</h2>
            {v.gram_panchayat && <p className="mt-1 text-sm text-[var(--muted)]">GP: {v.gram_panchayat}</p>}
          </div>
          <button type="button" onClick={onClose} className="cursor-pointer rounded-lg px-3 py-1.5 text-sm text-[var(--muted)] hover:bg-[var(--surface-muted)]" aria-label="Close panel">
            ✕
          </button>
        </div>

        <div className="space-y-8 p-6">
          {pop > 0 && (
            <section>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">Gender breakdown</h3>
              <PieChart
                caption={`${v.village_name} gender: male ${fmt(male)}, female ${fmt(female)}`}
                slices={[
                  { label: "Male", value: male, color: BAR.male },
                  { label: "Female", value: female, color: BAR.female },
                ]}
              />
              {v.sex_ratio != null && (
                <p className="mt-2 text-xs text-[var(--muted)]">{v.sex_ratio} females per 1,000 males</p>
              )}
            </section>
          )}

          {pop > 0 && (sc > 0 || st > 0) && (
            <section>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">Social category</h3>
              <PieChart
                caption={`${v.village_name} social category`}
                slices={[
                  { label: "SC", value: sc, color: BAR.sc },
                  { label: "ST", value: st, color: BAR.st },
                  { label: "Other", value: other, color: BAR.other },
                ]}
              />
            </section>
          )}

          <section>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">Population &middot; Census 2011</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Total population", value: fmt(v.population) },
                { label: "Households", value: fmt(v.households) },
                { label: "Male", value: fmt(v.population_male) },
                { label: "Female", value: fmt(v.population_female) },
                { label: "Scheduled Castes", value: fmt(v.population_sc) },
                { label: "Scheduled Tribes", value: fmt(v.population_st) },
                { label: "Sex ratio", value: v.sex_ratio ?? "—" },
                { label: "Literacy", value: v.literacy ? `${v.literacy}%` : "—" },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2.5">
                  <dt className="text-[10px] font-medium uppercase tracking-wide text-[var(--muted)]">{label}</dt>
                  <dd className="mt-0.5 text-sm font-semibold tabular-nums text-[var(--foreground)]">{value}</dd>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-[var(--muted)]">Village-level census fields are shown as an em dash when not published in this dataset.</p>
          </section>

          {booths.length > 0 && (
            <section>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
                Polling booths ({booths.length})
              </h3>
              <div className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-[var(--surface-muted)]">
                      <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">Part</th>
                      <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">Station Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {booths.map((b) => (
                      <tr key={b.part} className="border-t border-[var(--border)]">
                        <td className="px-3 py-2 tabular-nums font-medium text-[var(--foreground)]">{b.part}</td>
                        <td className="px-3 py-2 text-[var(--foreground)]">{b.name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          <section>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">Location &amp; administration</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Gram Panchayat", value: v.gram_panchayat ?? "—" },
                { label: "Mandal", value: v.mandal_name },
                { label: "District", value: "Kurnool" },
                { label: "State", value: "Andhra Pradesh" },
                { label: "PIN code", value: v.pin_code ?? "—" },
                { label: "Category", value: v.category },
                { label: "Area", value: v.area ?? "—" },
                { label: "Nearest town", value: v.nearest_town ?? "—" },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2.5">
                  <dt className="text-[10px] font-medium uppercase tracking-wide text-[var(--muted)]">{label}</dt>
                  <dd className="mt-0.5 text-sm font-semibold text-[var(--foreground)]">{value}</dd>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition ${
        active
          ? "bg-[var(--accent)] text-white shadow-[var(--shadow-sm)]"
          : "border border-[var(--border)] bg-white text-[var(--foreground)] hover:bg-[var(--surface-muted)]"
      }`}
    >
      {label}
    </button>
  );
}

type GpGroup = { key: string; name: string; mandal: string; villages: PattikondaVillageRow[]; population: number };

function buildGpGroups(villages: PattikondaVillageRow[]): GpGroup[] {
  const map = new Map<string, GpGroup>();
  for (const v of villages) {
    const gp = v.gram_panchayat ?? "Unknown GP";
    const key = `${v.mandal_slug}/${gp}`;
    if (!map.has(key)) map.set(key, { key, name: gp, mandal: v.mandal_name, villages: [], population: 0 });
    const g = map.get(key)!;
    g.villages.push(v);
    g.population += v.population ?? 0;
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export default function PattikondaVillagesPage() {
  const [query, setQuery] = useState("");
  const [mandal, setMandal] = useState<string | "all">("all");
  const [sortBy, setSortBy] = useState<"name" | "population">("name");
  const [view, setView] = useState<"table" | "gp">("table");
  const [selected, setSelected] = useState<PattikondaVillageRow | null>(null);
  const [expandedGp, setExpandedGp] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = PATTIKONDA_VILLAGES as PattikondaVillageRow[];
    if (mandal !== "all") list = list.filter((v) => v.mandal_slug === mandal);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((v) =>
        v.village_name.toLowerCase().includes(q) ||
        (v.gram_panchayat?.toLowerCase().includes(q) ?? false) ||
        (v.pin_code?.includes(q) ?? false)
      );
    }
    return [...list].sort((a, b) => {
      if (sortBy === "population") return (b.population ?? 0) - (a.population ?? 0);
      return a.village_name.localeCompare(b.village_name);
    });
  }, [query, mandal, sortBy]);

  const gpGroups = useMemo(() => buildGpGroups(filtered), [filtered]);
  const c = CONSTITUENCY_TOTALS;
  const avgSexRatio = c.totalMale > 0 ? Math.round((c.totalFemale / c.totalMale) * 1000) : 0;
  const boothCounts = useMemo(() => getBoothCountByVillage(), []);
  const otherPop = c.totalPopulation - c.totalSC - c.totalST;

  return (
    <PattikondaShell>
      <header className="mb-8">
        <p className="mark-yellow text-xs font-semibold uppercase tracking-[0.18em]">
          AC 142 GEN · Kurnool
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
          Village directory
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          {PATTIKONDA_VILLAGES.length} villages across 5 mandals &middot; Census 2011 at mandal level &middot; click any row for booths
        </p>
      </header>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total Population", value: fmt(c.totalPopulation), accent: "var(--brand-green)" },
          { label: "Households", value: fmt(c.totalHouseholds), accent: "var(--brand-green)" },
          { label: "Avg Sex Ratio", value: String(avgSexRatio), accent: "var(--brand-red)" },
          { label: "Villages", value: String(PATTIKONDA_VILLAGES.length), accent: "var(--accent)" },
        ].map(({ label, value, accent }) => (
          <div key={label} className="relative overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--shadow-sm)]">
            <div className="absolute inset-x-0 top-0 h-0.5" style={{ background: accent }} />
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">{label}</p>
            <p className="mt-1.5 text-2xl font-semibold tabular-nums tracking-tight text-[var(--foreground)]">{value}</p>
          </div>
        ))}
      </div>

      <div className="mb-10 grid gap-4 sm:grid-cols-2">
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--card)] p-5">
          <p className="mb-4 text-sm font-semibold">Gender (Census 2011, mandal totals)</p>
          <PieChart
            caption={`Gender: male ${fmt(c.totalMale)}, female ${fmt(c.totalFemale)}`}
            slices={[
              { label: "Male", value: c.totalMale, color: BAR.male },
              { label: "Female", value: c.totalFemale, color: BAR.female },
            ]}
          />
          <p className="mt-3 text-xs text-[var(--muted)]">{avgSexRatio} females per 1,000 males</p>
        </div>
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--card)] p-5">
          <p className="mb-4 text-sm font-semibold">Population by mandal</p>
          <PieChart
            caption={MANDALS.map((m) => `${m.name} ${fmt(m.population)}`).join(", ")}
            slices={MANDALS.map((m, i) => ({
              label: m.name,
              value: m.population,
              color: CHART_COLORS[i],
            }))}
          />
          <p className="mt-3 text-xs text-[var(--muted)]">SC {fmt(c.totalSC)} · ST {fmt(c.totalST)} · other {fmt(otherPop)}</p>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search village, GP, PIN..."
          className="w-full max-w-md rounded-[var(--radius-md)] border border-[var(--border)] bg-white px-4 py-2.5 text-sm shadow-[var(--shadow-sm)] outline-none focus:ring-2 focus:ring-[var(--brand-green)]/40 lg:flex-1"
        />
        <div className="flex flex-wrap gap-2">
          <div className="inline-flex rounded-[var(--radius-md)] border border-[var(--border)] bg-white p-1">
            <button
              type="button"
              onClick={() => setView("table")}
              className={`cursor-pointer rounded-[var(--radius-sm)] px-3.5 py-2 text-sm font-medium transition ${
                view === "table" ? "bg-[var(--accent)] text-white" : "text-[var(--foreground)] hover:bg-[var(--surface-muted)]"
              }`}
            >
              Table
            </button>
            <button
              type="button"
              onClick={() => setView("gp")}
              className={`cursor-pointer rounded-[var(--radius-sm)] px-3.5 py-2 text-sm font-medium transition ${
                view === "gp" ? "bg-[var(--accent)] text-white" : "text-[var(--foreground)] hover:bg-[var(--surface-muted)]"
              }`}
            >
              By GP
            </button>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "name" | "population")}
            className="cursor-pointer rounded-[var(--radius-md)] border border-[var(--border)] bg-white px-3 py-2.5 text-sm"
          >
            <option value="name">Sort by name</option>
            <option value="population">Sort by population</option>
          </select>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <FilterChip active={mandal === "all"} onClick={() => setMandal("all")} label="All mandals" />
        {MANDALS.map((m) => (
          <FilterChip key={m.slug} active={mandal === m.slug} onClick={() => setMandal(m.slug)} label={m.name} />
        ))}
      </div>

      <p className="mb-4 text-sm text-[var(--muted)]">
        Showing {filtered.length} of {PATTIKONDA_VILLAGES.length} villages
        {view === "gp" ? ` · ${gpGroups.length} gram panchayats` : " · click a row for details"}
      </p>

      {view === "table" ? (
        <div className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-white shadow-[var(--shadow-sm)]">
          <div className="scrollbar-thin overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface-muted)]">
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">Village</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">Mandal</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">Gram Panchayat</th>
                  <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">Population</th>
                  <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">Households</th>
                  <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">Sex Ratio</th>
                  <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">Literacy</th>
                  <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">Booths</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">PIN</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-[var(--muted)]">No villages match your search.</td>
                  </tr>
                ) : (
                  filtered.map((v) => (
                    <tr
                      key={`${v.mandal_slug}-${v.village_name}`}
                      className="group cursor-pointer border-t border-[var(--border)] transition hover:bg-[var(--surface-muted)]"
                      onClick={() => setSelected(v)}
                    >
                      <td className="px-4 py-3 font-medium text-[var(--foreground)] group-hover:text-[var(--brand-green)]">{v.village_name}</td>
                      <td className="px-4 py-3 text-[var(--muted)]">{v.mandal_name}</td>
                      <td className="px-4 py-3 text-[var(--muted)]">{v.gram_panchayat ?? "—"}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-[var(--foreground)]">{fmt(v.population)}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-[var(--foreground)]">{fmt(v.households)}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-[var(--foreground)]">{v.sex_ratio ?? "—"}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-[var(--foreground)]">{v.literacy ? `${v.literacy}%` : "—"}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-[var(--foreground)]">{boothCounts.get(v.village_name) ?? 0}</td>
                      <td className="px-4 py-3 text-[var(--muted)]">{v.pin_code ?? "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {gpGroups.length === 0 ? (
            <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white px-6 py-12 text-center text-[var(--muted)]">
              No gram panchayats match your search.
            </div>
          ) : (
            gpGroups.map((gp) => {
              const open = expandedGp === gp.key;
              return (
                <article key={gp.key} className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-white shadow-[var(--shadow-sm)]">
                  <button
                    type="button"
                    onClick={() => setExpandedGp(open ? null : gp.key)}
                    className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-[var(--surface-muted)]"
                  >
                    <div>
                      <p className="font-semibold text-[var(--foreground)]">{gp.name}</p>
                      <p className="mt-0.5 text-sm text-[var(--muted)]">
                        {gp.mandal} &middot; {gp.villages.length} village{gp.villages.length > 1 ? "s" : ""}
                      </p>
                    </div>
                    <span className="text-[var(--muted)]">{open ? "▴" : "▾"}</span>
                  </button>
                  {open && (
                    <ul className="divide-y divide-[var(--border)] border-t border-[var(--border)]">
                      {gp.villages.map((v) => (
                        <li key={`${v.mandal_slug}-${v.village_name}`}>
                          <button
                            type="button"
                            onClick={() => setSelected(v)}
                            className="flex w-full cursor-pointer items-center justify-between px-5 py-3 text-left text-sm transition hover:bg-[var(--surface-muted)]"
                          >
                            <span className="font-medium text-[var(--foreground)]">{v.village_name}</span>
                            <span className="tabular-nums text-[var(--muted)]">{boothCounts.get(v.village_name) ?? 0} booths</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              );
            })
          )}
        </div>
      )}

      {selected && <VillageDetailPanel village={selected} onClose={() => setSelected(null)} />}

      <footer className="mt-12 text-center text-xs text-[var(--muted)]">
        Source: Census 2011 &middot; villageinfo.in &middot; kurnool.ap.gov.in
      </footer>
    </PattikondaShell>
  );
}
