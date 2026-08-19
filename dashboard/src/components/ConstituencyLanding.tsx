import { ConstituencyProfilePanel, ElectionHistoryPanel } from "@/components/ConstituencyElection";
import { MandalCompareSection } from "@/components/MandalCompareSection";
import { PopulationBarChart, SexRatioChart, SocialCategoryChart } from "@/components/charts";
import { LandingHero, LandingSection } from "@/components/LandingHero";
import { MandalCard } from "@/components/MandalCard";
import {
  ButtonPrimary,
  ButtonSecondary,
  Card,
  CardBody,
  ChartFigure,
  DataTableShell,
  MiniStat,
  MiniStatGrid,
  SectionTitle,
} from "@/components/ui";
import { BRAND } from "@/lib/colors";
import type { ConstituencyLandingModel } from "@/lib/landing";
import { formatNumber } from "@/lib/mandals";
import Link from "next/link";

export function ConstituencyLanding({ data }: { data: ConstituencyLandingModel }) {
  const {
    stats,
    mandals,
    electorate,
    hasVoterGender,
    profile,
    elections,
    constituencyDemo,
    source,
    meta,
  } = data;

  const mandalGrid =
    mandals.length <= 3
      ? "grid gap-4 sm:grid-cols-3 lg:col-span-3"
      : "grid gap-4 sm:grid-cols-2 lg:col-span-3";

  return (
    <>
      <LandingHero data={data} />

      <div className="space-y-14 lg:space-y-16">
        <LandingSection
          id="breakdown"
          title="Constituency breakdown"
          description="Revenue villages, gram panchayats, and registered voters per mandal. District records plus 2024 assembly rolls."
          accent={BRAND.black}
        >
          <Card accent={BRAND.black}>
            <CardBody className="p-0 sm:p-0">
              <DataTableShell>
                <table className="data-table w-full min-w-[32rem] text-sm">
                  <thead>
                    <tr>
                      <th>Mandal</th>
                      <th className="text-right">Revenue villages</th>
                      <th className="text-right">Gram panchayats</th>
                      <th className="text-right">Collected</th>
                      {electorate ? (
                        <th className="text-right">Registered voters</th>
                      ) : null}
                    </tr>
                  </thead>
                  <tbody>
                    {mandals.map((mandal) => (
                      <tr key={mandal.slug}>
                        <td>
                          <Link
                            href={`${meta.basePath}/mandals/${mandal.slug}`}
                            className="font-medium text-[var(--accent)] hover:underline"
                          >
                            {mandal.displayName}
                          </Link>
                        </td>
                        <td className="text-right tabular-nums">{formatNumber(mandal.villages)}</td>
                        <td className="text-right tabular-nums">
                          {formatNumber(mandal.gramPanchayats)}
                        </td>
                        <td className="text-right tabular-nums text-[var(--muted)]">
                          {formatNumber(mandal.collectedCount)}
                          {mandal.detailedCount < mandal.collectedCount ? (
                            <span className="text-xs"> ({mandal.detailedCount} detailed)</span>
                          ) : null}
                        </td>
                        {electorate ? (
                          <td className="text-right tabular-nums">
                            {formatNumber(mandal.registeredVotersEstimate)}
                          </td>
                        ) : null}
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td>Total</td>
                      <td className="text-right tabular-nums">
                        {formatNumber(stats.officialVillages)}
                      </td>
                      <td className="text-right tabular-nums">
                        {formatNumber(stats.gramPanchayats)}
                      </td>
                      <td className="text-right tabular-nums text-[var(--muted)]">
                        {formatNumber(stats.collectedVillages)}
                      </td>
                      {electorate ? (
                        <td className="text-right tabular-nums font-medium">
                          {formatNumber(electorate.totalRegisteredVoters)}
                        </td>
                      ) : null}
                    </tr>
                  </tfoot>
                </table>
              </DataTableShell>
              <p className="border-t border-[var(--border)] px-6 py-4 text-xs leading-relaxed text-[var(--muted)]">
                Source:{" "}
                <a
                  href={source.href}
                  className="font-medium text-[var(--accent)] hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {source.label}
                </a>
                . {source.note}
                {source.voterNote ? <> {source.voterNote}</> : null}
              </p>
            </CardBody>
          </Card>
        </LandingSection>

        {electorate ? (
          <LandingSection
            id="electorate"
            title={`${electorate.constituencyName} electorate`}
            description={`${formatNumber(electorate.totalRegisteredVoters)} registered electors · ${electorate.dataYear} assembly rolls${electorate.turnoutPct != null ? ` · ${electorate.turnoutPct}% turnout` : ""}`}
            accent={BRAND.red}
          >
            <Card accent={BRAND.red}>
              <CardBody>
                <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
                  {hasVoterGender ? (
                    <SexRatioChart
                      male={electorate.maleVoters}
                      female={electorate.femaleVoters}
                      ratio={electorate.sexRatio}
                      maleLabel="Male voters"
                      femaleLabel="Female voters"
                    />
                  ) : (
                    <p className="text-sm leading-relaxed text-[var(--muted)]">
                      {electorate.sexRatioLabel}
                    </p>
                  )}
                  <MiniStatGrid>
                    <MiniStat label="Total registered" value={electorate.totalRegisteredVoters} />
                    {hasVoterGender ? (
                      <>
                        <MiniStat label="Male voters" value={electorate.maleVoters} />
                        <MiniStat label="Female voters" value={electorate.femaleVoters} />
                        <MiniStat label="Third gender" value={electorate.thirdGenderVoters} />
                      </>
                    ) : null}
                    {electorate.turnoutPct != null ? (
                      <MiniStat label="2024 turnout" value={`${electorate.turnoutPct}%`} />
                    ) : null}
                    {electorate.votesPolled != null ? (
                      <MiniStat label="Votes polled (2024)" value={electorate.votesPolled} />
                    ) : null}
                  </MiniStatGrid>
                </div>
                <p className="mt-5 border-t border-[var(--border)] pt-4 text-xs text-[var(--muted)]">
                  {electorate.reservation} reserved
                  {electorate.lokSabhaSegment ? ` · ${electorate.lokSabhaSegment} Lok Sabha segment` : ""}
                  {electorate.district ? ` · ${electorate.district}` : ""}
                  {" · "}
                  {electorate.sexRatioLabel}
                </p>
              </CardBody>
            </Card>
          </LandingSection>
        ) : null}

        {profile ? (
          <LandingSection
            id="profile"
            title="Constituency profile"
            description="Geography, administrative boundaries, and electorate landscape across the revenue mandals"
            accent={BRAND.green}
          >
            <ConstituencyProfilePanel profile={profile} />
          </LandingSection>
        ) : null}

        {elections.length > 0 ? (
          <LandingSection
            id="elections"
            title="Election history"
            description="Assembly election results: registered voters, turnout, and winning margins"
            accent={BRAND.black}
          >
            <ElectionHistoryPanel elections={elections} constituencyName={meta.name} />
          </LandingSection>
        ) : null}

        <LandingSection
          id="demographics"
          title="Constituency demographics"
          description={`Census ${stats.censusYear}: aggregated from mandal records`}
          accent={BRAND.yellow}
        >
          <div className="grid gap-6 lg:grid-cols-2">
            <Card accent={BRAND.black}>
              <CardBody>
                <SectionTitle title="Gender breakdown" description="Whole constituency" />
                <ChartFigure
                  title="Constituency gender breakdown"
                  summary={`Male ${formatNumber(constituencyDemo.populationMale)}; Female ${formatNumber(constituencyDemo.populationFemale)}; sex ratio ${constituencyDemo.sexRatio ?? "unknown"}`}
                  tableRows={[
                    { label: "Male", value: constituencyDemo.populationMale },
                    { label: "Female", value: constituencyDemo.populationFemale },
                    {
                      label: "Sex ratio (females per 1,000 males)",
                      value: constituencyDemo.sexRatio ?? "—",
                    },
                  ]}
                >
                  <SexRatioChart
                    male={constituencyDemo.populationMale}
                    female={constituencyDemo.populationFemale}
                    ratio={constituencyDemo.sexRatio}
                    maleLabel="Male population"
                    femaleLabel="Female population"
                  />
                </ChartFigure>
              </CardBody>
            </Card>
            <Card accent={BRAND.green}>
              <CardBody>
                <SectionTitle title="Social category profile" description="SC / ST / Other" />
                <ChartFigure
                  title="Constituency social category profile"
                  summary={`ST ${constituencyDemo.stPct}%; SC ${constituencyDemo.scPct}%; Other ${constituencyDemo.otherPct}%`}
                  tableRows={[
                    { label: "Scheduled Tribes", value: constituencyDemo.populationSt, pct: constituencyDemo.stPct },
                    { label: "Scheduled Castes", value: constituencyDemo.populationSc, pct: constituencyDemo.scPct },
                    { label: "Other (General / OBC)", value: constituencyDemo.populationOther, pct: constituencyDemo.otherPct },
                  ]}
                >
                  <SocialCategoryChart demographics={constituencyDemo} />
                </ChartFigure>
              </CardBody>
            </Card>
          </div>
          <Card className="mt-6" accent={BRAND.red}>
            <CardBody>
              <SectionTitle title="Compare mandals" description="Side-by-side metrics across revenue mandals" />
              <MandalCompareSection mandals={mandals} />
            </CardBody>
          </Card>
        </LandingSection>

        <LandingSection
          id="mandals"
          title="Explore mandals"
          description={`${stats.mandals} revenue mandals. Open any card for villages, demographics, and maps.`}
          accent={BRAND.green}
        >
          <div className="grid gap-8 lg:grid-cols-5">
            <div className={mandalGrid}>
              {mandals.map((mandal, index) => (
                <MandalCard
                  key={mandal.slug}
                  mandal={mandal}
                  index={index}
                  basePath={meta.basePath}
                />
              ))}
            </div>
            <Card className="lg:col-span-2" accent={BRAND.green}>
              <CardBody>
                <h3 className="text-base font-semibold text-[var(--foreground)]">
                  Population by mandal
                </h3>
                <p className="mt-1 mb-5 text-sm text-[var(--muted)]">
                  Census {stats.censusYear} · share of constituency total
                </p>
                <PopulationBarChart mandals={mandals} />
              </CardBody>
            </Card>
          </div>
        </LandingSection>

        <section className="flex flex-col gap-4 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface-muted)] px-6 py-8 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-[var(--foreground)]">Ready to dig deeper?</p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Search all {formatNumber(stats.collectedVillages)} villages by name, GP, census code, or PIN.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonPrimary href={data.villagesHref}>Open village directory</ButtonPrimary>
            <ButtonSecondary href={data.mapsHref}>Mandal maps</ButtonSecondary>
          </div>
        </section>
      </div>
    </>
  );
}
