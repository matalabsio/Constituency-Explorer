import Link from "next/link";
import type { ReactNode } from "react";
import { BRAND } from "@/lib/colors";
import type { ConstituencyLandingModel } from "@/lib/landing";
import { formatNumber } from "@/lib/mandals";

export function LandingHero({ data }: { data: ConstituencyLandingModel }) {
  const { stats, electorate, hero, villagesHref, mandalsHref, mapsHref } = data;

  const heroStats = [
    ...(electorate
      ? [
          {
            label: "Registered electors",
            value: electorate.totalRegisteredVoters,
            accent: BRAND.yellow,
            sub: `${electorate.dataYear} rolls`,
          },
          ...(electorate.turnoutPct != null
            ? [
                {
                  label: "2024 turnout",
                  value: `${electorate.turnoutPct}%`,
                  accent: BRAND.red,
                  sub: electorate.votesPolled
                    ? `${formatNumber(electorate.votesPolled)} votes polled`
                    : undefined,
                },
              ]
            : []),
        ]
      : []),
    { label: "Mandals", value: stats.mandals, accent: BRAND.green },
    { label: "Revenue villages", value: stats.officialVillages, accent: BRAND.red },
    {
      label: "Population",
      value: stats.totalPopulation,
      accent: BRAND.yellow,
      sub: `Census ${stats.censusYear}`,
    },
  ].slice(0, 4);

  return (
    <section className="landing-hero relative -mx-4 -mt-8 mb-12 overflow-hidden sm:-mx-6 lg:-mx-8 lg:-mt-10 lg:mb-14">
      <div className="flex h-1.5 w-full">
        <div className="h-full flex-[2] bg-[var(--brand-yellow)]" />
        <div className="h-full flex-1 bg-[var(--brand-red)]" />
        <div className="h-full flex-[2] bg-[var(--brand-green)]" />
      </div>

      <div className="relative bg-[var(--brand-black)] px-4 py-10 sm:px-8 sm:py-12 lg:px-10 lg:py-14">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(var(--brand-yellow) 1px, transparent 1px), linear-gradient(90deg, var(--brand-yellow) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[var(--brand-red)] opacity-20 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-16 left-1/3 h-48 w-48 rounded-full bg-[var(--brand-green)] opacity-15 blur-3xl"
          aria-hidden
        />

        <div className="relative grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-12">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center bg-[var(--brand-yellow)] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--brand-black)]">
                {hero.reservationLabel}
              </span>
              {hero.electorBadge ? (
                <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-medium text-white/70">
                  {hero.electorBadge}
                </span>
              ) : null}
            </div>

            <p className="mark-yellow mt-5 text-xs font-semibold uppercase tracking-[0.22em]">
              {hero.districtLine}
            </p>
            <h1 className="mt-3 max-w-xl text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-[3.25rem]">
              {hero.title}
              <span className="mt-2 block">
                <span className="mark-yellow">{hero.mark}</span>
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/65 sm:text-lg">
              {hero.description}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={villagesHref}
                className="inline-flex items-center justify-center rounded-[var(--radius-md)] bg-[var(--brand-red)] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[var(--brand-red)]/25 transition hover:bg-[var(--accent-hover)] active:scale-[0.98]"
              >
                Browse {formatNumber(stats.collectedVillages)} villages
              </Link>
              <Link
                href={mandalsHref}
                className="inline-flex items-center justify-center rounded-[var(--radius-md)] border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10 active:scale-[0.98]"
              >
                Explore mandals
              </Link>
              <Link
                href={mapsHref}
                className="inline-flex items-center justify-center rounded-[var(--radius-md)] px-4 py-3 text-sm font-medium text-white/60 transition hover:bg-[var(--brand-yellow)] hover:text-[var(--brand-black)]"
              >
                View maps
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {heroStats.map((item) => (
              <div
                key={item.label}
                className="relative overflow-hidden rounded-[var(--radius-lg)] border border-white/10 bg-white/[0.04] p-4 sm:p-5"
              >
                <div
                  className="absolute inset-x-0 top-0 h-0.5"
                  style={{ background: item.accent }}
                  aria-hidden
                />
                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/45">
                  {item.label}
                </p>
                <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-white sm:text-3xl">
                  {typeof item.value === "number" ? formatNumber(item.value) : item.value}
                </p>
                {"sub" in item && item.sub ? (
                  <p className="mt-1 text-xs text-white/40">{item.sub}</p>
                ) : (
                  <p className="mt-1 text-xs text-white/40">
                    {item.label === "Revenue villages"
                      ? `${stats.collectedVillages} collected`
                      : item.label === "Mandals"
                        ? "Revenue subdivisions"
                        : item.label === "Registered electors"
                          ? electorate?.reservation ?? "Reserved"
                          : "District records"}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-[var(--brand-yellow)]/40 to-transparent" />
    </section>
  );
}

export function LandingSection({
  id,
  title,
  description,
  children,
  accent,
}: {
  id?: string;
  title: string;
  description?: string;
  children: ReactNode;
  accent?: string;
}) {
  return (
    <section id={id} className="scroll-mt-8">
      <div className="mb-5 flex items-start gap-3">
        {accent ? (
          <span
            className="mt-1.5 h-8 w-1 shrink-0 rounded-full"
            style={{ background: accent }}
            aria-hidden
          />
        ) : null}
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-[var(--foreground)] sm:text-2xl">
            {title}
          </h2>
          {description ? (
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">{description}</p>
          ) : null}
        </div>
      </div>
      {children}
    </section>
  );
}
