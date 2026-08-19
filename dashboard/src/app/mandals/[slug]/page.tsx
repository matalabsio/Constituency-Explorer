import { AppShell } from "@/components/AppShell";
import { MandalGpSection } from "@/components/MandalGpSection";
import { SocialCategoryChart, SexRatioChart, TopVillagesBarChart } from "@/components/charts";
import {
  Card,
  CardBody,
  ChartFigure,
  DataTableShell,
  JumpNav,
  Metric,
  PageHeader,
  PageSection,
  SectionTitle,
} from "@/components/ui";
import { BRAND } from "@/lib/colors";
import { formatNumber } from "@/lib/mandals";
import { getExploreData, getMandalExplore, getTopVillages } from "@/lib/explore";
import { TARGET_MANDAL_SLUGS } from "@/lib/mandals";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return TARGET_MANDAL_SLUGS.map((slug) => ({ slug }));
}

const JUMP_ITEMS = [
  { id: "overview", label: "Overview" },
  { id: "demographics", label: "Demographics" },
  { id: "top-villages", label: "Top villages" },
  { id: "villages", label: "Villages" },
];

export default async function MandalDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const mandal = getMandalExplore(slug);
  if (!mandal) notFound();

  const { villages: allVillages } = getExploreData();
  const villages = allVillages.filter((v) => v.entity_slug === slug);
  const topVillages = getTopVillages(villages);
  const demo = mandal.demographics;

  return (
    <AppShell>
      <PageHeader
        backHref="/mandals"
        backLabel="All mandals"
        eyebrow="Revenue mandal"
        title={mandal.displayName}
        description={
          mandal.nameAsPublished && mandal.nameAsPublished !== mandal.displayName
            ? `Published as ${mandal.nameAsPublished}`
            : undefined
        }
      />

      <JumpNav items={JUMP_ITEMS} />

      <PageSection id="overview">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Villages" value={mandal.villageCount} accent={BRAND.yellow} />
          <Metric label="Gram Panchayats" value={mandal.gramPanchayats ?? 0} accent={BRAND.red} />
          <Metric label="Population" value={mandal.totalPopulation} sub="Census 2011" accent={BRAND.green} />
          <Metric
            label="Sex ratio"
            value={demo.sexRatio ?? "—"}
            sub="Females per 1,000 males"
            accent={BRAND.yellow}
          />
        </section>
      </PageSection>

      <PageSection id="demographics">
        <section className="grid gap-6 lg:grid-cols-2">
          <Card accent={BRAND.black}>
            <CardBody>
              <SectionTitle
                title="Gender breakdown"
                description="Aggregated from village census records (2011)"
              />
              <ChartFigure
                title={`${mandal.displayName} gender breakdown`}
                summary={`Male ${formatNumber(demo.populationMale)}; Female ${formatNumber(demo.populationFemale)}; ratio ${demo.sexRatio ?? "unknown"}`}
                tableRows={[
                  { label: "Male", value: demo.populationMale },
                  { label: "Female", value: demo.populationFemale },
                  { label: "Sex ratio", value: demo.sexRatio ?? "—" },
                ]}
              >
                <SexRatioChart
                  male={demo.populationMale}
                  female={demo.populationFemale}
                  ratio={demo.sexRatio}
                  maleLabel="Male population"
                  femaleLabel="Female population"
                />
              </ChartFigure>
            </CardBody>
          </Card>

          <Card accent={BRAND.green}>
            <CardBody>
              <SectionTitle
                title="Social category profile"
                description="SC / ST / Other from census village records"
              />
              <ChartFigure
                title={`${mandal.displayName} social category profile`}
                summary={`ST ${demo.stPct}%; SC ${demo.scPct}%; Other ${demo.otherPct}%`}
                tableRows={[
                  { label: "Scheduled Tribes", value: demo.populationSt, pct: demo.stPct },
                  { label: "Scheduled Castes", value: demo.populationSc, pct: demo.scPct },
                  { label: "Other (General / OBC)", value: demo.populationOther, pct: demo.otherPct },
                ]}
              >
                <SocialCategoryChart demographics={demo} />
              </ChartFigure>
            </CardBody>
          </Card>
        </section>
      </PageSection>

      <PageSection id="top-villages">
        <Card accent={BRAND.red}>
          <CardBody>
            <SectionTitle
              title="Top villages by population"
              description={`Largest ${topVillages.length} revenue villages in ${mandal.displayName}`}
            />
            <ChartFigure
              title={`Top villages in ${mandal.displayName}`}
              summary={topVillages.map((v) => `${v.village_name}: ${formatNumber(v.population ?? 0)}`).join("; ")}
              tableRows={topVillages.map((v) => ({
                label: v.village_name,
                value: v.population ?? 0,
              }))}
            >
              <TopVillagesBarChart villages={topVillages} />
            </ChartFigure>
          </CardBody>
        </Card>
      </PageSection>

      {mandal.mptcReservation ? (
        <PageSection id="mptc">
          <Card accent={BRAND.red}>
            <CardBody>
              <SectionTitle
                title="MPTC seat reservations"
                description={`${mandal.mptcReservation.totalSeats} Mandal Parishad Territorial Constituency seats · 50% women's quota`}
              />
              <DataTableShell>
                <table className="data-table w-full text-sm">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Reservation</th>
                      <th>Example ward</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mandal.mptcReservation.reservationGroups.map((group) => (
                      <tr key={group.category}>
                        <td className="font-semibold">{group.category}</td>
                        <td className="text-[var(--muted)]">{group.description}</td>
                        <td>{group.exampleWard}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </DataTableShell>
              <p className="mt-4 text-sm text-[var(--muted)]">
                {mandal.mptcReservation.womenQuotaNote}. Verify ward rosters on the{" "}
                {mandal.mptcReservation.verificationPortal ? (
                  <a
                    href={mandal.mptcReservation.verificationPortal}
                    className="font-medium text-[var(--accent)] hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    district portal
                  </a>
                ) : (
                  "district portal"
                )}
                .
              </p>
            </CardBody>
          </Card>
        </PageSection>
      ) : null}

      {mandal.mapImageUrl ? (
        <PageSection id="map">
          <Card>
            <CardBody className="p-2 sm:p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mandal.mapImageUrl}
                alt={`${mandal.displayName} mandal map`}
                className="mx-auto max-h-96 w-full rounded-[var(--radius-lg)] bg-[var(--surface-muted)] object-contain p-4"
              />
            </CardBody>
          </Card>
        </PageSection>
      ) : null}

      <PageSection id="villages">
        <MandalGpSection villages={villages} mandalSlug={slug} />
      </PageSection>
    </AppShell>
  );
}
