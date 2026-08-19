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
            sub: `${electorate.dataYear} rolls`,
          },
          ...(electorate.turnoutPct != null
            ? [
                {
                  label: "2024 turnout",
                  value: `${electorate.turnoutPct}%`,
                  sub: electorate.votesPolled
                    ? `${formatNumber(electorate.votesPolled)} votes polled`
                    : undefined,
                },
              ]
            : []),
        ]
      : []),
    { label: "Mandals", value: stats.mandals, sub: "Revenue subdivisions" },
    { label: "Revenue villages", value: stats.officialVillages, sub: `${stats.collectedVillages} in directory` },
  ];

  return (
    <section className="landing-hero relative mb-10 sm:mb-12 lg:mb-14">
      <div className="relative overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--card)] px-4 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
        <div
          className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[var(--accent-soft)] opacity-80 blur-3xl"
          aria-hidden
        />

        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-start lg:gap-12">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--foreground)]">
                {hero.reservationLabel}
              </span>
              {hero.electorBadge ? (
                <span className="inline-flex max-w-full items-center rounded-full border border-[var(--border)] px-3 py-1 text-[11px] font-medium text-[var(--muted)]">
                  {hero.electorBadge}
                </span>
              ) : null}
            </div>

            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              {hero.districtLine}
            </p>
            <h1 className="mt-3 max-w-xl text-3xl font-semibold leading-[1.12] tracking-tight text-[var(--foreground)] sm:text-4xl lg:text-5xl">
              {hero.title}
              <span className="mt-2 block text-lg font-medium tracking-normal text-[var(--muted)] sm:text-xl">
                {hero.mark}
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-[var(--muted)] sm:text-base">
              {hero.description}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href={villagesHref}
                className="inline-flex items-center justify-center rounded-[var(--radius-md)] bg-[var(--brand-black)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2e2c29] active:scale-[0.98]"
              >
                Browse {formatNumber(stats.collectedVillages)} villages
              </Link>
              <Link
                href={mandalsHref}
                className="inline-flex items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface-muted)] active:scale-[0.98]"
              >
                Explore mandals
              </Link>
              <Link
                href={mapsHref}
                className="inline-flex items-center justify-center rounded-[var(--radius-md)] px-5 py-3 text-sm font-medium text-[var(--muted)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
              >
                View maps
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {heroStats.map((item) => (
              <div
                key={item.label}
                className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)] p-4 sm:p-5"
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                  {item.label}
                </p>
                <p className="mt-2 text-xl font-semibold tabular-nums tracking-tight text-[var(--foreground)] sm:text-2xl">
                  {typeof item.value === "number" ? formatNumber(item.value) : item.value}
                </p>
                {"sub" in item && item.sub ? (
                  <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">{item.sub}</p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
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
            className="mt-1.5 h-8 w-px shrink-0 bg-[var(--border)]"
            style={{ background: accent === BRAND.black ? undefined : accent }}
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
