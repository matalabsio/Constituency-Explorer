"use client";

import Link from "next/link";
import { DhoneShell } from "@/components/DhoneShell";
import {
  ASSEMBLY_DETAILS,
  PROFILE,
  VOTER_DEMOGRAPHICS,
  ELECTION_2024,
  ELECTION_HISTORY,
  MANDALS,
  CONSTITUENCY_TOTALS,
} from "./data";
import { BAR, BarChart, ChartCard, ColumnChart, PieChart, Section, StatCard, TableWrap, focusRing, fmt } from "./ui";

const JUMP = [
  { id: "breakdown", label: "Breakdown" },
  { id: "electorate", label: "Electorate" },
  { id: "facts", label: "Facts" },
  { id: "demographics", label: "Census" },
  { id: "compare", label: "Compare" },
  { id: "election-2024", label: "2024 result" },
  { id: "history", label: "History" },
  { id: "mandals", label: "Mandals" },
];

export default function DhonePage() {
  const d = ASSEMBLY_DETAILS;
  const v = VOTER_DEMOGRAPHICS;
  const e = ELECTION_2024;
  const c = CONSTITUENCY_TOTALS;
  const femalesPer1000 = Math.round((c.totalFemale / c.totalMale) * 1000);
  const otherPop = c.totalPopulation - c.totalSC - c.totalST;

  return (
    <DhoneShell>
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-[var(--muted)]">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className={`cursor-pointer hover:text-[var(--foreground)] ${focusRing}`}>
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>Andhra Pradesh</li>
          <li aria-hidden="true">/</li>
          <li className="font-semibold text-[var(--foreground)]">Dhone</li>
        </ol>
      </nav>

      <header className="mb-8">
        <p className="mark-yellow text-xs font-semibold uppercase tracking-[0.18em]">AC 141 · GEN · Nandyal</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-pretty text-[var(--foreground)] sm:text-4xl">
          Dhone constituency
        </h1>
        <p className="mt-3 max-w-prose text-sm leading-relaxed text-[var(--muted)]">
          Three revenue mandals, {c.totalVillages} villages, {fmt(v.totalVoters)} electors (2024).
          Historically Dronachalam ({d.assemblyNameTelugu}).
        </p>
      </header>

      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Registered electors" value={v.totalVoters} sub="2024 rolls" />
        <StatCard label="2024 turnout" value={`${v.turnout2024}%`} sub={`${fmt(v.votesPolled2024)} votes polled`} />
        <StatCard label="Mandals" value={c.mandals} sub="Dhone, Bethamcherla, Peapully" />
        <StatCard label="Revenue villages" value={c.totalVillages} sub={`${c.totalGPs} gram panchayats`} />
      </div>

      <nav aria-label="On this page" className="mb-10">
        <ul className="flex flex-wrap gap-2">
          {JUMP.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={`inline-flex cursor-pointer rounded-[var(--radius-sm)] border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--surface-muted)] ${focusRing}`}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="space-y-14">
        <Section
          id="breakdown"
          title="Constituency breakdown"
          description="Census 2011 population and households by mandal. Village and GP counts from Nandyal district records."
        >
          <TableWrap caption="Mandal breakdown: villages, gram panchayats, population, households">
            <thead>
              <tr>
                <th>Mandal</th>
                <th className="text-right">Villages</th>
                <th className="text-right">Gram panchayats</th>
                <th className="text-right">Population</th>
                <th className="text-right">Households</th>
              </tr>
            </thead>
            <tbody>
              {MANDALS.map((m) => (
                <tr key={m.slug}>
                  <td className="font-medium">
                    <Link
                      href={`/dhone/mandals/${m.slug}`}
                      className={`cursor-pointer text-[var(--foreground)] underline-offset-2 hover:underline ${focusRing}`}
                    >
                      {m.name}
                    </Link>
                  </td>
                  <td className="text-right tabular-nums">{m.villages}</td>
                  <td className="text-right tabular-nums">{m.gramPanchayats}</td>
                  <td className="text-right tabular-nums">{fmt(m.population)}</td>
                  <td className="text-right tabular-nums">{fmt(m.households)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td>Total</td>
                <td className="text-right tabular-nums">{c.totalVillages}</td>
                <td className="text-right tabular-nums">{c.totalGPs}</td>
                <td className="text-right tabular-nums">{fmt(c.totalPopulation)}</td>
                <td className="text-right tabular-nums">{fmt(c.totalHouseholds)}</td>
              </tr>
            </tfoot>
          </TableWrap>
        </Section>

        <Section
          id="electorate"
          title="Electorate"
          description={`${fmt(v.totalVoters)} registered electors on 2024 assembly rolls. Rural ${v.ruralPercent}%, urban ${v.urbanPercent}%.`}
        >
          <ChartCard title="Voters by gender">
            <PieChart
              caption={`Voters: male ${fmt(v.maleVoters)}, female ${fmt(v.femaleVoters)}, third gender ${v.thirdGender}`}
              slices={[
                { label: "Male", value: v.maleVoters, color: BAR.black },
                { label: "Female", value: v.femaleVoters, color: BAR.red },
                { label: "Third gender", value: v.thirdGender, color: BAR.green },
              ]}
            />
          </ChartCard>
          <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Male voters", value: fmt(v.maleVoters) },
              { label: "Female voters", value: fmt(v.femaleVoters) },
              { label: "Third gender", value: fmt(v.thirdGender) },
              { label: "Census sex ratio", value: String(femalesPer1000) },
            ].map(({ label, value }) => (
              <div key={label} className="border-t border-[var(--border)] pt-3">
                <dt className="text-xs text-[var(--muted)]">{label}</dt>
                <dd className="mt-1 text-lg font-semibold tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section id="facts" title="Assembly facts">
          <dl className="grid gap-px overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--border)] sm:grid-cols-2">
            {[
              { label: "Assembly number", value: d.assemblyNo },
              { label: "Name", value: `${d.assemblyName} (${d.assemblyNameTelugu})` },
              { label: "Category", value: `${d.category} (no reservation)` },
              { label: "District", value: `${d.district} (${d.districtCode})` },
              { label: "Lok Sabha", value: d.parliamentName },
              { label: "PIN (Dhone HQ)", value: PROFILE.pinCode },
              { label: "Nearest town", value: PROFILE.nearestTown },
              { label: "River", value: PROFILE.rivers },
              { label: "Municipality", value: `${d.municipalArea}, ${d.municipalWards} wards` },
              { label: "Heritage", value: PROFILE.heritage },
            ].map(({ label, value }) => (
              <div key={label} className="bg-[var(--card)] px-4 py-3.5">
                <dt className="text-xs text-[var(--muted)]">{label}</dt>
                <dd className="mt-1 text-sm font-medium text-[var(--foreground)]">{value}</dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section
          id="demographics"
          title="Census 2011 demographics"
          description={`Aggregated from the three mandals. ${fmt(c.totalPopulation)} people, ${femalesPer1000} females per 1,000 males.`}
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard title="Gender">
              <PieChart
                caption={`Population: male ${fmt(c.totalMale)}, female ${fmt(c.totalFemale)}`}
                slices={[
                  { label: "Male", value: c.totalMale, color: BAR.black },
                  { label: "Female", value: c.totalFemale, color: BAR.red },
                ]}
              />
            </ChartCard>
            <ChartCard title="Social category">
              <PieChart
                caption={`SC ${fmt(c.totalSC)}, ST ${fmt(c.totalST)}, other ${fmt(otherPop)}`}
                slices={[
                  { label: "SC", value: c.totalSC, color: BAR.red },
                  { label: "ST", value: c.totalST, color: BAR.gold },
                  { label: "Other", value: otherPop, color: BAR.green },
                ]}
              />
            </ChartCard>
          </div>
        </Section>

        <Section id="compare" title="Compare mandals" description="Census 2011. Bars are scaled within each chart, not across charts.">
          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard title="Sex ratio">
              <BarChart
                caption="Sex ratio by mandal"
                maxValue={1100}
                slices={MANDALS.map((m, i) => ({
                  label: m.name,
                  value: m.sexRatio,
                  color: [BAR.green, BAR.red, BAR.gold][i],
                }))}
              />
            </ChartCard>
            <ChartCard title="Scheduled Castes (%)">
              <BarChart
                caption="SC percent by mandal"
                maxValue={25}
                formatValue={(n) => `${n}%`}
                slices={MANDALS.map((m, i) => ({
                  label: m.name,
                  value: m.scPercent,
                  color: [BAR.green, BAR.red, BAR.gold][i],
                }))}
              />
            </ChartCard>
            <ChartCard title="Population">
              <ColumnChart
                caption={MANDALS.map((m) => `${m.name} ${fmt(m.population)}`).join(", ")}
                slices={MANDALS.map((m, i) => ({
                  label: m.name,
                  value: m.population,
                  color: [BAR.green, BAR.red, BAR.gold][i],
                }))}
              />
            </ChartCard>
            <ChartCard title="Population share">
              <PieChart
                caption={MANDALS.map((m) => `${m.name} ${fmt(m.population)}`).join(", ")}
                slices={MANDALS.map((m, i) => ({
                  label: m.name,
                  value: m.population,
                  color: [BAR.green, BAR.red, BAR.gold][i],
                }))}
              />
            </ChartCard>
          </div>
        </Section>

        <Section id="election-2024" title="2024 assembly result" description="TDP won Dhone from YSRCP. Figures from the 2024 legislative assembly election.">
          <div className="grid gap-4 sm:grid-cols-2">
            <article className="rounded-[var(--radius-lg)] border-2 border-[var(--brand-green)] bg-[var(--card)] p-5">
              <p className="text-xs font-semibold text-[var(--brand-green)]">Winner · {e.winnerParty}</p>
              <h3 className="mt-2 text-lg font-semibold">{e.winner}</h3>
              <p className="mt-3 text-2xl font-semibold tabular-nums">{fmt(e.winnerVotes!)}</p>
              <p className="text-xs text-[var(--muted)]">votes</p>
            </article>
            <article className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--card)] p-5">
              <p className="text-xs font-semibold text-[var(--muted)]">Runner-up · {e.runnerUpParty}</p>
              <h3 className="mt-2 text-lg font-semibold">{e.runnerUp}</h3>
              <p className="mt-3 text-2xl font-semibold tabular-nums">{fmt(e.runnerUpVotes!)}</p>
              <p className="text-xs text-[var(--muted)]">votes</p>
            </article>
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <ChartCard title="Top-two vote share">
              <PieChart
                caption={`${e.winnerParty} ${fmt(e.winnerVotes!)}, ${e.runnerUpParty} ${fmt(e.runnerUpVotes!)}`}
                slices={[
                  { label: e.winnerParty, value: e.winnerVotes!, color: BAR.green },
                  { label: e.runnerUpParty ?? "Runner-up", value: e.runnerUpVotes!, color: BAR.red },
                ]}
              />
              <p className="mt-3 text-xs text-[var(--muted)]">Share of the top-two total, not the full electorate. Margin {fmt(e.margin)} votes.</p>
            </ChartCard>
            <ChartCard title="Votes">
              <ColumnChart
                caption={`${e.winnerParty} ${fmt(e.winnerVotes!)}, ${e.runnerUpParty} ${fmt(e.runnerUpVotes!)}`}
                slices={[
                  { label: e.winnerParty, value: e.winnerVotes!, color: BAR.green },
                  { label: e.runnerUpParty ?? "Runner-up", value: e.runnerUpVotes!, color: BAR.red },
                ]}
              />
            </ChartCard>
          </div>
        </Section>

        <Section id="history" title="Election history" description="Assembly results with turnout and margin where recorded.">
          <TableWrap caption="Dhone assembly election history">
            <thead>
              <tr>
                <th>Year</th>
                <th className="text-right">Electors</th>
                <th className="text-right">Turnout</th>
                <th className="text-right">Votes polled</th>
                <th>Winner</th>
                <th>Runner-up</th>
                <th className="text-right">Margin</th>
              </tr>
            </thead>
            <tbody>
              {ELECTION_HISTORY.map((el) => (
                <tr key={el.year}>
                  <td className="font-semibold tabular-nums">{el.year}</td>
                  <td className="text-right tabular-nums">{el.registeredVoters ? fmt(el.registeredVoters) : "—"}</td>
                  <td className="text-right tabular-nums">{el.turnout ? `${el.turnout}%` : "—"}</td>
                  <td className="text-right tabular-nums">{el.votesPolled ? fmt(el.votesPolled) : "—"}</td>
                  <td>
                    {el.winner}
                    <span className="text-[var(--muted)]"> ({el.winnerParty})</span>
                  </td>
                  <td>
                    {el.runnerUp ? (
                      <>
                        {el.runnerUp}
                        <span className="text-[var(--muted)]"> ({el.runnerUpParty})</span>
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="text-right tabular-nums font-semibold">{el.margin > 0 ? fmt(el.margin) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        </Section>

        <Section id="mandals" title="Open a mandal">
          <ul className="grid gap-3 sm:grid-cols-3">
            {MANDALS.map((m) => (
              <li key={m.slug}>
                <Link
                  href={`/dhone/mandals/${m.slug}`}
                  className={`block cursor-pointer rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--card)] p-5 hover:bg-[var(--surface-muted)] ${focusRing}`}
                >
                  <p className="font-semibold">{m.name}</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {m.villages} villages · {fmt(m.population)} people
                  </p>
                  <dl className="mt-4 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <dt className="text-[var(--muted)]">Sex ratio</dt>
                      <dd className="font-semibold tabular-nums">{m.sexRatio}</dd>
                    </div>
                    <div>
                      <dt className="text-[var(--muted)]">Literacy</dt>
                      <dd className="font-semibold tabular-nums">{m.literacy}%</dd>
                    </div>
                  </dl>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      </div>

      <footer className="mt-16 border-t border-[var(--border)] pt-6 pb-8 text-xs text-[var(--muted)]">
        <p>Sources: Election Commission of India, Census 2011, nandyal.ap.gov.in. Population figures are Census 2011; elector figures are 2024 rolls.</p>
      </footer>
    </DhoneShell>
  );
}
