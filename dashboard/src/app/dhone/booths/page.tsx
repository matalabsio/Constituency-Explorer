"use client";

import { useState, useMemo } from "react";
import { DhoneShell } from "@/components/DhoneShell";
import {
  ASSEMBLY_DETAILS,
  POLLING_STATIONS,
  AVAILABLE_ROLLS,
  VOTER_DEMOGRAPHICS,
  BOOTH_VILLAGE_MAP,
} from "../data";

function fmt(n: number): string {
  return n.toLocaleString("en-IN");
}

function assignMandal(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("bethamcherla") || n.includes("pendakal") || n.includes("ambapuram") || n.includes("rangapuram") || n.includes("kolumulapalle") || n.includes("muddavaram") || n.includes("gutupalle") || n.includes("gollagutta") || n.includes("emboy") || n.includes("bugganipalle") || n.includes("kothapalle")) return "Bethamcherla";
  if (n.includes("peapully") || n.includes("peapally") || n.includes("jaladurgam") || n.includes("burugula") || n.includes("peddapodilla") || n.includes("gudipadu") || n.includes("kalachetla") || n.includes("mettupalle") || n.includes("nereducherla") || n.includes("kommemarri") || n.includes("chandrapalle") || n.includes("pothidoddi") || n.includes("racherla") || n.includes("munimadugu") || n.includes("vengalampalle") || n.includes("madhavaram") || n.includes("jakkasanikuntla")) return "Peapully";
  return "Dhone";
}

export default function DhoneBoothsPage() {
  const [query, setQuery] = useState("");
  const [mandalFilter, setMandalFilter] = useState("all");
  const v = VOTER_DEMOGRAPHICS;

  const stations = useMemo(() =>
    POLLING_STATIONS.map((s) => ({
      ...s,
      mandal: assignMandal(s.name),
      village: BOOTH_VILLAGE_MAP[s.name.toLowerCase()] ?? "—",
    })),
    []
  );

  const filtered = useMemo(() => {
    let list = stations;
    if (mandalFilter !== "all") list = list.filter((s) => s.mandal === mandalFilter);
    if (query) list = list.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()) || String(s.part).includes(query));
    return list;
  }, [query, mandalFilter, stations]);

  const mandalCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of stations) counts[s.mandal] = (counts[s.mandal] ?? 0) + 1;
    return counts;
  }, [stations]);

  return (
    <DhoneShell>
      <header className="mb-6">
        <p className="mark-yellow text-xs font-semibold uppercase tracking-[0.18em]">
          Dhone Constituency &middot; AC {ASSEMBLY_DETAILS.assemblyNo}
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
          Polling Stations
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          {POLLING_STATIONS.length} booths &middot; {fmt(v.totalVoters)} registered electors &middot; {v.turnout2024}% turnout (2024)
        </p>
      </header>

      {/* Summary cards */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow-sm)]">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">Total Booths</p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-[var(--foreground)]">{POLLING_STATIONS.length}</p>
        </div>
        {Object.entries(mandalCounts).sort((a, b) => b[1] - a[1]).map(([mandal, count]) => (
          <div key={mandal} className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow-sm)]">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">{mandal}</p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-[var(--foreground)]">{count}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          placeholder="Search by station name or part number..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 rounded-[var(--radius-md)] border border-[var(--border)] bg-white px-4 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] outline-none transition focus:border-[var(--brand-green)] focus:ring-2 focus:ring-[var(--brand-green)]/20"
        />
        <select
          value={mandalFilter}
          onChange={(e) => setMandalFilter(e.target.value)}
          className="rounded-[var(--radius-md)] border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--foreground)] outline-none"
        >
          <option value="all">All mandals</option>
          <option value="Dhone">Dhone</option>
          <option value="Bethamcherla">Bethamcherla</option>
          <option value="Peapully">Peapully</option>
        </select>
      </div>

      <p className="mb-3 text-xs text-[var(--muted)]">
        Showing {filtered.length} of {POLLING_STATIONS.length} polling stations
      </p>

      {/* Booth table */}
      <div className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-white shadow-[var(--shadow-sm)]">
        <div className="max-h-[560px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-[var(--surface-muted)]">
              <tr>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">Part No.</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">Polling Station Name</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">Village</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">Mandal</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.part} className="border-t border-[var(--border)] transition hover:bg-[var(--surface-muted)]">
                  <td className="px-4 py-2.5 tabular-nums font-medium text-[var(--foreground)]">{s.part}</td>
                  <td className="px-4 py-2.5 text-[var(--foreground)]">{s.name}</td>
                  <td className="px-4 py-2.5 text-[var(--foreground)]">{s.village}</td>
                  <td className="px-4 py-2.5 text-[var(--muted)]">{s.mandal}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-[var(--muted)]">No polling stations match your search</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Electoral Rolls */}
      <section className="mt-12">
        <h2 className="mb-5 text-lg font-semibold tracking-tight text-[var(--foreground)]">Download Electoral Roll PDF</h2>
        <div className="space-y-4">
          <div className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-sm)]">
            <div className="border-b border-[var(--border)] bg-[var(--surface-muted)] px-5 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Available Electoral Rolls</p>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {AVAILABLE_ROLLS.map((r) => (
                <div key={r.year} className="flex items-center gap-4 px-5 py-3.5">
                  <span className="text-sm font-bold tabular-nums text-[var(--foreground)]">{r.year}</span>
                  <div className="flex flex-wrap gap-1.5">
                    {r.rolls.map((roll) => (
                      <span key={roll} className="rounded-full bg-[var(--surface-muted)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--foreground)]">{roll}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--shadow-sm)]">
            <p className="text-sm font-semibold text-[var(--foreground)]">How to download Dhone Voter List PDF</p>
            <ol className="mt-3 space-y-2 text-sm leading-relaxed text-[var(--muted)]">
              <li><span className="mr-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--surface-muted)] text-[10px] font-bold text-[var(--foreground)]">1</span>Visit the ECI E-Roll download portal</li>
              <li><span className="mr-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--surface-muted)] text-[10px] font-bold text-[var(--foreground)]">2</span>Select <strong>Andhra Pradesh</strong> as the state</li>
              <li><span className="mr-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--surface-muted)] text-[10px] font-bold text-[var(--foreground)]">3</span>Select District: <strong>Nandyal</strong>, Assembly: <strong>Dhone</strong></li>
              <li><span className="mr-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--surface-muted)] text-[10px] font-bold text-[var(--foreground)]">4</span>Choose your polling station, enter captcha, and download PDF</li>
            </ol>
            <div className="mt-5">
              <a href="https://voters.eci.gov.in/download-eroll" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white shadow-[var(--shadow-sm)] transition hover:bg-[var(--accent-hover)]">
                Go to ECI Download Portal &rarr;
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="mt-12 text-center text-xs text-[var(--muted)]">
        Source: Election Commission of India &middot; voterslist.in
      </footer>
    </DhoneShell>
  );
}
