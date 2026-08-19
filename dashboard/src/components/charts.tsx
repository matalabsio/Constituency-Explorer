"use client";

import { ChartHoverTip, useChartHover } from "@/components/ChartTooltip";
import { CHART, MANDAL_COLORS, mandalColor } from "@/lib/colors";
import { formatNumber } from "@/lib/mandals";
import type { MandalDemographics } from "@/lib/demographics";
import type { GpDemographics } from "@/lib/explore";
import type { LandingMandal } from "@/lib/landing";
import type { VillageRow } from "@/lib/types";

/* ── Shared legend ───────────────────────────────────────── */

export type LegendItem = {
  label: string;
  value: number;
  color: string;
  pct?: string;
};

export function ChartLegend({ items }: { items: LegendItem[] }) {
  return (
    <ul className="space-y-2.5" role="list">
      {items.map((item) => (
        <li key={item.label} className="flex items-center justify-between gap-4 text-sm">
          <div className="flex min-w-0 items-center gap-2.5">
            <span
              className="h-3 w-3 shrink-0 rounded-sm ring-1 ring-[var(--border)]"
              style={{ background: item.color }}
              aria-hidden
            />
            <span className="truncate text-[var(--foreground)]">{item.label}</span>
          </div>
          <span className="shrink-0 tabular-nums text-[var(--muted)]">
            {formatNumber(item.value)}
            {item.pct ? <span className="ml-1 text-xs">({item.pct}%)</span> : null}
          </span>
        </li>
      ))}
    </ul>
  );
}

/* ── Stacked segment bar ─────────────────────────────────── */

function SegmentBar({
  segments,
  height = 12,
  className = "",
}: {
  segments: { value: number; color: string; label: string }[];
  height?: number;
  className?: string;
}) {
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  const { tip, show, move, hide } = useChartHover();
  return (
    <div
      className={`flex overflow-hidden rounded-full bg-[var(--surface-muted)] ${className}`}
      style={{ height }}
      role="img"
      aria-label={segments.map((s) => `${s.label}: ${formatNumber(s.value)}`).join(", ")}
    >
      {segments.map((seg) =>
        seg.value > 0 ? (
          <div
            key={seg.label}
            className="h-full cursor-pointer chart-bar-animate transition-all duration-500"
            style={{
              width: `${(seg.value / total) * 100}%`,
              background: seg.color,
            }}
            onMouseEnter={(e) =>
              show(e, `${seg.label}: ${formatNumber(seg.value)} (${((seg.value / total) * 100).toFixed(1)}%)`)
            }
            onMouseMove={move}
            onMouseLeave={hide}
          />
        ) : null
      )}
      <ChartHoverTip tip={tip} />
    </div>
  );
}

/* ── Sex ratio ───────────────────────────────────────────── */

export function SexRatioChart({
  male,
  female,
  ratio,
  label,
  maleLabel = "Male",
  femaleLabel = "Female",
}: {
  male: number;
  female: number;
  ratio: number | null;
  label?: string;
  maleLabel?: string;
  femaleLabel?: string;
}) {
  const items: LegendItem[] = [
    { label: maleLabel, value: male, color: CHART.male },
    { label: femaleLabel, value: female, color: CHART.female },
  ];

  return (
    <div className="space-y-4">
      {label ? <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">{label}</p> : null}
      <SegmentBar
        segments={[
          { value: male, color: CHART.male, label: maleLabel },
          { value: female, color: CHART.female, label: femaleLabel },
        ]}
        height={14}
      />
      {ratio !== null ? (
        <p className="text-center text-sm font-semibold tabular-nums text-[var(--foreground)]">
          {formatNumber(ratio)}{" "}
          <span className="font-normal text-[var(--muted)]">females per 1,000 males</span>
        </p>
      ) : null}
      <ChartLegend items={items} />
    </div>
  );
}

/* ── Social category donut ─────────────────────────────────── */

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

export function SocialCategoryChart({ demographics }: { demographics: MandalDemographics }) {
  const total = demographics.populationMale + demographics.populationFemale;
  const slices = [
    { label: "Scheduled Tribes", value: demographics.populationSt, color: CHART.st, pct: demographics.stPct },
    { label: "Scheduled Castes", value: demographics.populationSc, color: CHART.sc, pct: demographics.scPct },
    { label: "Other (General / OBC)", value: demographics.populationOther, color: CHART.other, pct: demographics.otherPct },
  ].filter((s) => s.value > 0);

  let angle = 0;
  const arcs = slices.map((slice) => {
    const sweep = total > 0 ? (slice.value / total) * 360 : 0;
    const start = angle;
    angle += sweep;
    return { ...slice, start, end: angle };
  });

  const size = 160;
  const cx = size / 2;
  const cy = size / 2;
  const r = 58;
  const stroke = 22;

  const donutLabel = slices
    .map((s) => `${s.label}: ${formatNumber(s.value)} (${s.pct}%)`)
    .join("; ");
  const { tip, show, move, hide } = useChartHover();

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
      <div
        className="relative shrink-0"
        style={{ width: size, height: size }}
        role="img"
        aria-label={donutLabel || "No social category data"}
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={CHART.track} strokeWidth={stroke} />
          {arcs.map((arc) =>
            arc.end - arc.start > 0.5 ? (
              <path
                key={arc.label}
                d={describeArc(cx, cy, r, arc.start, arc.end - 0.4)}
                fill="none"
                stroke={arc.color}
                strokeWidth={stroke}
                strokeLinecap="butt"
                className="cursor-pointer transition-[stroke-width] duration-200 hover:stroke-[26]"
                onMouseEnter={(e) =>
                  show(e, `${arc.label}: ${formatNumber(arc.value)} (${arc.pct}%)`)
                }
                onMouseMove={move}
                onMouseLeave={hide}
              />
            ) : null
          )}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[10px] font-medium uppercase tracking-wide text-[var(--muted)]">Total</span>
          <span className="text-lg font-semibold tabular-nums text-[var(--foreground)]">
            {formatNumber(total)}
          </span>
        </div>
        <ChartHoverTip tip={tip} />
      </div>
      <div className="w-full min-w-0 flex-1">
        <SegmentBar
          segments={slices.map((s) => ({ value: s.value, color: s.color, label: s.label }))}
          height={10}
          className="mb-4"
        />
        <ChartLegend
          items={slices.map((s) => ({
            label: s.label,
            value: s.value,
            color: s.color,
            pct: s.pct,
          }))}
        />
      </div>
    </div>
  );
}

/* ── Horizontal bar chart (population by mandal) ───────────── */

export function PopulationBarChart({ mandals }: { mandals: LandingMandal[] }) {
  const max = Math.max(...mandals.map((m) => m.totalPopulation), 1);
  const grandTotal = mandals.reduce((s, m) => s + m.totalPopulation, 0);
  const { tip, show, move, hide } = useChartHover();

  return (
    <div className="space-y-5" role="list" aria-label="Population by mandal">
      {mandals.map((mandal, index) => {
        const color = mandalColor(index);
        const pctOfMax = (mandal.totalPopulation / max) * 100;
        const share = grandTotal > 0 ? ((mandal.totalPopulation / grandTotal) * 100).toFixed(1) : "0";
        const label = `${mandal.displayName}: ${formatNumber(mandal.totalPopulation)} (${share}% of constituency)`;
        return (
          <div key={mandal.slug} role="listitem" aria-label={label}>
            <div className="mb-1.5 flex items-baseline justify-between gap-2 text-sm">
              <span className="min-w-0 truncate font-medium text-[var(--foreground)]">
                {mandal.displayName}
              </span>
              <span className="shrink-0 tabular-nums text-[var(--muted)]">
                {formatNumber(mandal.totalPopulation)}
                <span className="ml-1.5 text-xs">({share}%)</span>
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-[var(--surface-muted)]">
              <div
                className="chart-bar-animate h-full cursor-pointer rounded-full transition-all duration-700 ease-out"
                style={{ width: `${pctOfMax}%`, background: color }}
                onMouseEnter={(e) => show(e, label)}
                onMouseMove={move}
                onMouseLeave={hide}
              />
            </div>
          </div>
        );
      })}
      <ChartHoverTip tip={tip} />
      <ChartLegend
        items={mandals.map((m, i) => ({
          label: m.displayName,
          value: m.totalPopulation,
          color: mandalColor(i),
          pct: grandTotal > 0 ? ((m.totalPopulation / grandTotal) * 100).toFixed(1) : "0",
        }))}
      />
    </div>
  );
}

/* ── Constituency comparison mini bars ───────────────────── */

export function MandalCompareChart({
  mandals,
  getValue,
  formatValue,
}: {
  mandals: LandingMandal[];
  getValue: (m: LandingMandal) => number;
  formatValue?: (n: number) => string;
}) {
  const max = Math.max(...mandals.map(getValue), 1);
  const fmt = formatValue ?? formatNumber;
  const { tip, show, move, hide } = useChartHover();

  return (
    <div className="space-y-3" role="list">
      {mandals.map((mandal, index) => {
        const value = getValue(mandal);
        const pct = (value / max) * 100;
        const label = `${mandal.displayName}: ${fmt(value)}`;
        return (
          <div
            key={mandal.slug}
            role="listitem"
            aria-label={label}
            className="grid grid-cols-[minmax(0,7rem)_1fr_auto] items-center gap-3 text-sm"
          >
            <span className="truncate font-medium text-[var(--foreground)]">{mandal.displayName}</span>
            <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-muted)]">
              <div
                className="chart-bar-animate h-full cursor-pointer rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, background: MANDAL_COLORS[index % MANDAL_COLORS.length] }}
                onMouseEnter={(e) => show(e, label)}
                onMouseMove={move}
                onMouseLeave={hide}
              />
            </div>
            <span className="w-14 text-right tabular-nums text-[var(--muted)]">{fmt(value)}</span>
          </div>
        );
      })}
      <ChartHoverTip tip={tip} />
    </div>
  );
}

/* ── Top villages vertical bar chart ─────────────────────── */

export function TopVillagesBarChart({ villages }: { villages: VillageRow[] }) {
  const data = villages.filter((v) => (v.population ?? 0) > 0);

  if (data.length === 0) {
    return <p className="text-sm text-[var(--muted)]">No population data available.</p>;
  }

  const max = Math.max(...data.map((v) => v.population ?? 0), 1);
  const chartHeight = 240;
  const yTicks = [0, Math.round(max / 2), max];
  const { tip, show, move, hide } = useChartHover();

  return (
    <div
      role="img"
      aria-label={data.map((v) => `${v.village_name}: ${formatNumber(v.population ?? 0)}`).join(", ")}
    >
      <div className="flex gap-4">
        {/* Y-axis */}
        <div
          className="flex shrink-0 flex-col justify-between py-0 text-[10px] tabular-nums text-[var(--muted)]"
          style={{ height: chartHeight }}
          aria-hidden
        >
          {[...yTicks].reverse().map((tick) => (
            <span key={tick} className="leading-none">
              {formatNumber(tick)}
            </span>
          ))}
        </div>

        {/* Bars */}
        <div className="min-w-0 flex-1 overflow-x-auto">
          <div className="min-w-[20rem] sm:min-w-0">
            <div
              className="relative flex items-end justify-start gap-2 border-b border-l border-[var(--border)] px-2 pb-0"
              style={{ height: chartHeight }}
              role="list"
              aria-label="Top villages by population"
            >
            {/* Horizontal grid lines */}
            {yTicks.slice(1).map((tick) => {
              const pct = (tick / max) * 100;
              return (
                <div
                  key={tick}
                  className="pointer-events-none absolute left-0 right-0 border-t border-dashed border-[var(--border)]"
                  style={{ bottom: `${pct}%` }}
                  aria-hidden
                />
              );
            })}

            {data.map((village, index) => {
              const pop = village.population ?? 0;
              const heightPct = (pop / max) * 100;
              const color = MANDAL_COLORS[index % MANDAL_COLORS.length];
              const barHeight = Math.max(heightPct, pop > 0 ? 2 : 0);

              return (
                <div
                  key={village.id}
                  className="group flex min-w-[2.75rem] flex-1 flex-col items-center justify-end"
                  style={{ height: "100%" }}
                  role="listitem"
                  aria-label={`${village.village_name}: ${formatNumber(pop)}`}
                >
                  <span className="mb-1 text-[10px] font-semibold tabular-nums text-[var(--foreground)] opacity-0 transition-opacity group-hover:opacity-100 sm:opacity-100">
                    {formatNumber(pop)}
                  </span>
                  <div
                    className="chart-bar-animate w-full max-w-[2.5rem] cursor-pointer rounded-t-[var(--radius-sm)] transition-all duration-500 group-hover:brightness-110"
                    style={{
                      height: `${barHeight}%`,
                      background: color,
                      minHeight: pop > 0 ? 6 : 0,
                    }}
                    onMouseEnter={(e) => show(e, `${village.village_name}: ${formatNumber(pop)}`)}
                    onMouseMove={move}
                    onMouseLeave={hide}
                  />
                </div>
              );
            })}
            </div>

            {/* X-axis labels */}
            <div className="mt-3 flex justify-start gap-2 px-2">
              {data.map((village) => (
                <div
                  key={`label-${village.id}`}
                  className="flex min-w-[2.75rem] flex-1 flex-col items-center"
                  title={village.village_name}
                >
                  <span className="max-w-full truncate text-center text-[10px] font-medium leading-tight text-[var(--foreground)] sm:text-xs">
                    {village.village_name.length > 12
                      ? `${village.village_name.slice(0, 11)}…`
                      : village.village_name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ChartHoverTip tip={tip} />

      <ChartLegend
        items={data.map((v, i) => ({
          label: v.village_name,
          value: v.population ?? 0,
          color: MANDAL_COLORS[i % MANDAL_COLORS.length],
          pct: max > 0 ? (((v.population ?? 0) / max) * 100).toFixed(0) : "0",
        }))}
      />
    </div>
  );
}

/* ── Gram panchayat population chart ─────────────────────── */

export function GpPopulationChart({
  groups,
  onSelectGp,
  selectedKey,
}: {
  groups: GpDemographics[];
  onSelectGp?: (key: string | null) => void;
  selectedKey?: string | null;
}) {
  const max = Math.max(...groups.map((g) => g.population), 1);

  if (groups.length === 0) {
    return <p className="text-sm text-[var(--muted)]">No gram panchayat data available.</p>;
  }

  return (
    <div className="space-y-3" role="list" aria-label="Population by gram panchayat">
      {groups.map((gp, index) => {
        const pct = (gp.population / max) * 100;
        const color = MANDAL_COLORS[index % MANDAL_COLORS.length];
        const isSelected = selectedKey === gp.key;
        const label = `${gp.name}: ${formatNumber(gp.population)} (${gp.villageCount} villages)`;

        return (
          <div key={gp.key} role="listitem" aria-label={label}>
            {onSelectGp ? (
              <button
                type="button"
                onClick={() => onSelectGp(isSelected ? null : gp.key)}
                className={`w-full rounded-[var(--radius-md)] px-2 py-1.5 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-yellow)] ${
                  isSelected ? "bg-[var(--highlight-soft)] ring-1 ring-[var(--brand-yellow)]/50" : "hover:bg-[var(--surface-muted)]"
                }`}
                aria-pressed={isSelected}
              >
                <GpBarRow name={gp.name} population={gp.population} villageCount={gp.villageCount} pct={pct} color={color} />
              </button>
            ) : (
              <GpBarRow name={gp.name} population={gp.population} villageCount={gp.villageCount} pct={pct} color={color} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function GpBarRow({
  name,
  population,
  villageCount,
  pct,
  color,
}: {
  name: string;
  population: number;
  villageCount: number;
  pct: number;
  color: string;
}) {
  const { tip, show, move, hide } = useChartHover();
  const label = `${name}: ${formatNumber(population)} (${villageCount} villages)`;
  return (
    <>
      <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
        <span className="min-w-0 truncate font-medium text-[var(--foreground)]">{name}</span>
        <span className="shrink-0 tabular-nums text-[var(--muted)]">
          {formatNumber(population)}
          <span className="ml-1.5 text-xs">({villageCount} villages)</span>
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-muted)]">
        <div
          className="chart-bar-animate h-full cursor-pointer rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
          onMouseEnter={(e) => show(e, label)}
          onMouseMove={move}
          onMouseLeave={hide}
        />
      </div>
      <ChartHoverTip tip={tip} />
    </>
  );
}

/* Re-export for backward compat */
export { SexRatioChart as SexRatioBar, SocialCategoryChart as DemographicsChart };
