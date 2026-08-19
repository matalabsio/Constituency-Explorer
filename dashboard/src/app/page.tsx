import { AppShell } from "@/components/AppShell";
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
  EmptyState,
  MiniStat,
  MiniStatGrid,
  SectionTitle,
} from "@/components/ui";
import { BRAND } from "@/lib/colors";
import { getConstituencyDemographics, getExploreData } from "@/lib/explore";
import { formatNumber } from "@/lib/mandals";
import Link from "next/link";

export default function HomePage() {
  const { stats, mandals, villages, electorate, profile, elections } = getExploreData();
  const constituencyDemo = getConstituencyDemographics();
  const hasData = villages.length > 0;

  if (!hasData) {
    return (
      <AppShell>
        <EmptyState
          title="No local data yet"
          description="Run the collector to populate the local database, then refresh this page."
        />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <LandingHero stats={stats} electorate={electorate} />

      <div className="space-y-14 lg:space-y-16">
        <LandingSection
          id="breakdown"
          title="Constituency breakdown"
          description="Revenue villages, gram panchayats, and registered voters per mandal — district records plus 2024 assembly rolls"
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
                    {mandals.map((mandal) => {
                      const collected = villages.filter((v) => v.entity_slug === mandal.slug).length;
                      const withDetail = villages.filter(
                        (v) => v.entity_slug === mandal.slug && v.has_detail
                      ).length;
                      return (
                        <tr key={mandal.slug}>
                          <td>
                            <Link
                              href={`/mandals/${mandal.slug}`}
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
                            {formatNumber(collected)}
                            {withDetail < collected ? (
                              <span className="text-xs"> ({withDetail} detailed)</span>
                            ) : null}
                          </td>
                          {electorate ? (
                            <td className="text-right tabular-nums">
                              {formatNumber(mandal.registeredVotersEstimate)}
                            </td>
                          ) : null}
                        </tr>
                      );
                    })}
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
                  href="https://parvathipurammanyam.ap.gov.in/administrative-setup/village-panchayats/"
                  className="font-medium text-[var(--accent)] hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  parvathipurammanyam.ap.gov.in
                </a>
                . Five mandals total {formatNumber(stats.officialVillages)} revenue villages.
                {electorate ? (
                  <>
                    {" "}
                    Registered voters ({electorate.dataYear}):{" "}
                    {formatNumber(electorate.totalRegisteredVoters)} for the constituency; mandal
                    figures are estimated from census population share (ECI publishes AC-level rolls
                    only).
                  </>
                ) : null}
              </p>
            </CardBody>
          </Card>
        </LandingSection>

        {electorate ? (
          <LandingSection
            id="electorate"
            title={`${electorate.constituencyName} — Electorate`}
            description={`${formatNumber(electorate.totalRegisteredVoters)} registered electors · ${electorate.dataYear} assembly rolls${electorate.turnoutPct != null ? ` · ${electorate.turnoutPct}% turnout` : ""}`}
            accent={BRAND.red}
          >
            <Card accent={BRAND.red}>
              <CardBody>
                <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
                  <SexRatioChart
                    male={electorate.maleVoters}
                    female={electorate.femaleVoters}
                    ratio={electorate.sexRatio}
                    maleLabel="Male voters"
                    femaleLabel="Female voters"
                  />
                  <MiniStatGrid>
                    <MiniStat label="Total registered" value={electorate.totalRegisteredVoters} />
                    <MiniStat label="Male voters" value={electorate.maleVoters} />
                    <MiniStat label="Female voters" value={electorate.femaleVoters} />
                    <MiniStat label="Third gender" value={electorate.thirdGenderVoters} />
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
            description="Geography, administrative boundaries, and electorate landscape across the five revenue mandals"
            accent={BRAND.green}
          >
            <ConstituencyProfilePanel profile={profile} />
          </LandingSection>
        ) : null}

        {elections && elections.elections.length > 0 ? (
          <LandingSection
            id="elections"
            title="Election history"
            description="Assembly election results — registered voters, turnout, and winning margins"
            accent={BRAND.black}
          >
            <ElectionHistoryPanel
              elections={elections.elections}
              constituencyName={elections.constituencyName}
            />
          </LandingSection>
        ) : null}

        <LandingSection
          id="demographics"
          title="Constituency demographics"
          description={`Census ${stats.censusYear} — aggregated from collected village records across all five mandals`}
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
          description="Five revenue mandals — click any card to browse villages, demographics, and maps"
          accent={BRAND.green}
        >
          <div className="grid gap-8 lg:grid-cols-5">
            <div className="grid gap-4 sm:grid-cols-2 lg:col-span-3">
              {mandals.map((mandal, index) => (
                <MandalCard key={mandal.slug} mandal={mandal} index={index} />
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

        <section className="flex flex-wrap items-center justify-between gap-4 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface-muted)] px-6 py-8">
          <div>
            <p className="font-semibold text-[var(--foreground)]">Ready to dig deeper?</p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Search all {formatNumber(stats.collectedVillages)} villages by name, GP, census code, or PIN.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonPrimary href="/villages">
              Open village directory
            </ButtonPrimary>
            <ButtonSecondary href="/maps">Mandal maps</ButtonSecondary>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
