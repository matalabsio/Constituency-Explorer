"use client";

import { ChartHoverTip, useChartHover } from "@/components/ChartTooltip";
import { BAR, CHART_COLORS, chartStroke, focusRing } from "@/lib/colors";

export function fmt(n: number): string {
  return n.toLocaleString("en-IN");
}

export { BAR, CHART_COLORS, focusRing };

export function Section({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28" aria-labelledby={`${id}-heading`}>
      <div className="mb-5 max-w-prose">
        <h2 id={`${id}-heading`} className="text-lg font-semibold tracking-tight text-[var(--foreground)]">
          {title}
        </h2>
        {description ? <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--card)] p-4 sm:p-5">
      <p className="text-xs font-medium text-[var(--muted)]">{label}</p>
      <p className="mt-1.5 text-2xl font-semibold tabular-nums tracking-tight text-[var(--foreground)]">
        {typeof value === "number" ? fmt(value) : value}
      </p>
      {sub ? <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">{sub}</p> : null}
    </div>
  );
}

export type ChartSlice = { label: string; value: number; color: string };

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function piePath(cx: number, cy: number, r: number, start: number, end: number) {
  const a = polar(cx, cy, r, start);
  const b = polar(cx, cy, r, end);
  const large = end - start > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${a.x} ${a.y} A ${r} ${r} 0 ${large} 1 ${b.x} ${b.y} Z`;
}

function ChartLegend({ slices, total }: { slices: ChartSlice[]; total: number }) {
  return (
    <ul className="space-y-2" role="list">
      {slices.map((s) => {
        const pct = total > 0 ? ((s.value / total) * 100).toFixed(1) : "0.0";
        return (
          <li key={s.label} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2">
              <span className="h-2.5 w-2.5 shrink-0 rounded-sm ring-1 ring-[var(--border)]" style={{ background: s.color }} aria-hidden />
              <span className="truncate">{s.label}</span>
            </span>
            <span className="shrink-0 tabular-nums text-[var(--muted)]">
              {fmt(s.value)} <span className="text-xs">({pct}%)</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export function PieChart({ slices, caption }: { slices: ChartSlice[]; caption: string }) {
  const data = slices.filter((s) => s.value > 0);
  const total = data.reduce((sum, s) => sum + s.value, 0);
  const size = 168;
  const cx = size / 2;
  const cy = size / 2;
  const r = 74;
  let angle = 0;
  const arcs = data.map((s) => {
    const sweep = total > 0 ? (s.value / total) * 360 : 0;
    const start = angle;
    angle += sweep;
    return { ...s, start, end: angle };
  });
  const { tip, show, move, hide } = useChartHover();

  return (
    <figure className="relative flex flex-col items-center gap-5 sm:flex-row sm:items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={caption} className="shrink-0">
        {total === 0 ? (
          <circle cx={cx} cy={cy} r={r} fill="var(--surface-muted)" />
        ) : data.length === 1 ? (
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill={data[0].color}
            stroke={chartStroke(data[0].color)}
            strokeWidth={1.5}
            className="cursor-pointer"
            onMouseEnter={(e) => show(e, `${data[0].label}: ${fmt(data[0].value)} (100%)`)}
            onMouseMove={move}
            onMouseLeave={hide}
          />
        ) : (
          arcs.map((arc) => {
            const pct = total > 0 ? ((arc.value / total) * 100).toFixed(1) : "0.0";
            return (
              <path
                key={arc.label}
                d={piePath(cx, cy, r, arc.start, arc.end)}
                fill={arc.color}
                stroke={chartStroke(arc.color)}
                strokeWidth={1.5}
                className="cursor-pointer transition-opacity duration-150 hover:opacity-90"
                onMouseEnter={(e) => show(e, `${arc.label}: ${fmt(arc.value)} (${pct}%)`)}
                onMouseMove={move}
                onMouseLeave={hide}
              />
            );
          })
        )}
      </svg>
      <figcaption className="w-full min-w-0 flex-1">
        <ChartLegend slices={data} total={total} />
      </figcaption>
      <ChartHoverTip tip={tip} />
    </figure>
  );
}

export function BarChart({
  slices,
  caption,
  formatValue,
  maxValue,
}: {
  slices: ChartSlice[];
  caption: string;
  formatValue?: (n: number) => string;
  maxValue?: number;
}) {
  const data = slices.filter((s) => s.value >= 0);
  const max = maxValue ?? Math.max(...data.map((s) => s.value), 1);
  const show = formatValue ?? fmt;
  const { tip, show: showTip, move, hide } = useChartHover();

  return (
    <figure role="img" aria-label={caption}>
      <ul className="space-y-3.5" role="list">
        {data.map((s) => {
          const pct = max > 0 ? (s.value / max) * 100 : 0;
          const label = `${s.label}: ${show(s.value)}`;
          return (
            <li key={s.label} className="grid grid-cols-[minmax(0,7.5rem)_1fr_auto] items-center gap-3">
              <span className="truncate text-sm">{s.label}</span>
              <div className="h-7 overflow-hidden rounded-sm bg-[var(--surface-muted)]">
                <div
                  className="chart-bar-animate h-full min-w-0 cursor-pointer"
                  style={{
                    width: `${Math.max(pct, s.value > 0 ? 2 : 0)}%`,
                    background: s.color,
                  }}
                  onMouseEnter={(e) => showTip(e, label)}
                  onMouseMove={move}
                  onMouseLeave={hide}
                />
              </div>
              <span className="w-16 text-right text-sm font-semibold tabular-nums">{show(s.value)}</span>
            </li>
          );
        })}
      </ul>
      <ChartHoverTip tip={tip} />
    </figure>
  );
}

export function ColumnChart({ slices, caption }: { slices: ChartSlice[]; caption: string }) {
  const data = slices.filter((s) => s.value >= 0);
  const max = Math.max(...data.map((s) => s.value), 1);
  const height = 180;
  const { tip, show, move, hide } = useChartHover();

  return (
    <figure role="img" aria-label={caption}>
      <div className="flex items-end gap-3 border-b border-[var(--border)] pb-0" style={{ height }}>
        {data.map((s) => {
          const pct = max > 0 ? (s.value / max) * 100 : 0;
          return (
            <div key={s.label} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5">
              <span className="text-[11px] font-semibold tabular-nums">{fmt(s.value)}</span>
              <div
                className="chart-bar-animate w-full max-w-[3.5rem] cursor-pointer rounded-t-sm"
                style={{
                  height: `${Math.max(pct, s.value > 0 ? 4 : 0)}%`,
                  background: s.color,
                }}
                onMouseEnter={(e) => show(e, `${s.label}: ${fmt(s.value)}`)}
                onMouseMove={move}
                onMouseLeave={hide}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-3">
        {data.map((s) => (
          <p key={s.label} className="min-w-0 flex-1 truncate text-center text-xs text-[var(--muted)]">
            {s.label}
          </p>
        ))}
      </div>
      <ChartHoverTip tip={tip} />
    </figure>
  );
}

export function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--card)] p-5">
      <h3 className="mb-4 text-sm font-semibold">{title}</h3>
      {children}
    </div>
  );
}

export function TableWrap({ children, caption }: { children: React.ReactNode; caption: string }) {
  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-white">
      <div className="scrollbar-thin overflow-x-auto">
        <table className="data-table w-full min-w-[36rem] text-sm">
          <caption className="sr-only">{caption}</caption>
          {children}
        </table>
      </div>
    </div>
  );
}
