"use client";

import Link from "next/link";
import { useId, useState, type ReactNode } from "react";
import { formatNumber } from "@/lib/mandals";

/* ── Layout ─────────────────────────────────────────────── */

export function PageHeader({
  eyebrow,
  title,
  description,
  backHref,
  backLabel = "Back",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <header className="mb-10">
      {backHref ? (
        <Link
          href={backHref}
          className="inline-flex items-center gap-1 text-sm font-medium text-[var(--accent)] hover:underline"
        >
          ← {backLabel}
        </Link>
      ) : null}
      {eyebrow ? (
        <p
          className={`mark-yellow text-xs font-semibold uppercase tracking-[0.18em] ${
            backHref ? "mt-4" : ""
          }`}
        >
          {eyebrow}
        </p>
      ) : null}
      <h1
        className={`text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl ${
          eyebrow || backHref ? "mt-2" : ""
        }`}
      >
        {title}
      </h1>
      {description ? <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">{description}</p> : null}
    </header>
  );
}

export function Card({
  children,
  className = "",
  accent,
}: {
  children: ReactNode;
  className?: string;
  accent?: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-sm)] ${className}`}
    >
      {accent ? <div className="h-1 w-full" style={{ background: accent }} /> : null}
      {children}
    </div>
  );
}

export function CardBody({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}

export function SectionTitle({
  title,
  description,
  className = "mb-5",
}: {
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <h2 className="text-lg font-semibold tracking-tight text-[var(--foreground)]">{title}</h2>
      {description ? <p className="mt-1 text-sm text-[var(--muted)]">{description}</p> : null}
    </div>
  );
}

/* ── Metrics & stats ─────────────────────────────────────── */

export function Metric({
  label,
  value,
  sub,
  accent = "var(--accent)",
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--shadow-sm)]">
      <div className="absolute inset-x-0 top-0 h-0.5" style={{ background: accent }} />
      <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">{label}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-[var(--foreground)] sm:text-3xl">
        {typeof value === "number" ? formatNumber(value) : value}
      </p>
      {sub ? <p className="mt-1.5 text-xs leading-relaxed text-[var(--muted)]">{sub}</p> : null}
    </div>
  );
}

export function MiniStat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3">
      <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--muted)]">{label}</p>
      <p className="mt-1 text-base font-semibold tabular-nums text-[var(--foreground)]">
        {typeof value === "number" ? formatNumber(value) : value}
      </p>
    </div>
  );
}

export function MiniStatGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{children}</div>;
}

/* ── Buttons ─────────────────────────────────────────────── */

const btnBase =
  "inline-flex items-center justify-center rounded-[var(--radius-md)] px-5 py-2.5 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-green)]";

export function ButtonPrimary({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`${btnBase} bg-[var(--accent)] text-white shadow-[var(--shadow-sm)] hover:bg-[var(--accent-hover)] ${className}`}
    >
      {children}
    </Link>
  );
}

export function ButtonSecondary({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`${btnBase} border border-[var(--border)] bg-white text-[var(--foreground)] hover:bg-[var(--surface-muted)] ${className}`}
    >
      {children}
    </Link>
  );
}

/* ── Data display ────────────────────────────────────────── */

export function FieldGrid({
  fields,
}: {
  fields: { label: string; value: string | number | null | undefined }[];
}) {
  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {fields.map(({ label, value }) => (
        <div
          key={label}
          className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3"
        >
          <dt className="text-[11px] font-medium uppercase tracking-wide text-[var(--muted)]">{label}</dt>
          <dd className="mt-1 text-sm font-medium text-[var(--foreground)]">
            {value === null || value === undefined || value === "" ? "—" : value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function DataTableShell({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-white shadow-[var(--shadow-sm)]">
      <div className="scrollbar-thin overflow-x-auto">{children}</div>
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface-muted)] p-10 text-center">
      <h2 className="text-lg font-semibold text-[var(--foreground)]">{title}</h2>
      {description ? <p className="mx-auto mt-2 max-w-md text-sm text-[var(--muted)]">{description}</p> : null}
    </div>
  );
}

/* ── Page sections & navigation ──────────────────────────── */

export function PageSection({
  id,
  children,
  className = "mb-10 scroll-mt-24",
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={className}>
      {children}
    </section>
  );
}

export function JumpNav({ items }: { items: { id: string; label: string }[] }) {
  return (
    <nav aria-label="Page sections" className="mb-8 -mt-2">
      <ul className="scrollbar-thin flex gap-2 overflow-x-auto pb-1">
        {items.map((item) => (
          <li key={item.id} className="shrink-0">
            <a
              href={`#${item.id}`}
              className="inline-flex rounded-full border border-[var(--border)] bg-white px-3.5 py-1.5 text-xs font-medium text-[var(--foreground)] transition hover:border-[var(--brand-green)] hover:bg-[var(--surface-muted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-green)]"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/* ── Accessible chart wrapper ────────────────────────────── */

export type ChartTableRow = { label: string; value: string | number; pct?: string };

export function ChartFigure({
  title,
  summary,
  tableRows,
  children,
}: {
  title: string;
  summary: string;
  tableRows?: ChartTableRow[];
  children: ReactNode;
}) {
  const titleId = useId();
  const summaryId = useId();
  const [showTable, setShowTable] = useState(false);

  return (
    <figure role="figure" aria-labelledby={titleId} aria-describedby={summaryId}>
      <figcaption id={titleId} className="sr-only">
        {title}
      </figcaption>
      <p id={summaryId} className="sr-only">
        {summary}
      </p>
      {children}
      {tableRows && tableRows.length > 0 ? (
        <div className="mt-4 border-t border-[var(--border)] pt-4">
          <button
            type="button"
            onClick={() => setShowTable((v) => !v)}
            className="text-xs font-medium text-[var(--accent)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-green)]"
            aria-expanded={showTable}
          >
            {showTable ? "Hide data table" : "View data table"}
          </button>
          {showTable ? (
            <table className="mt-3 w-full text-sm">
              <thead>
                <tr>
                  <th scope="col" className="pb-2 text-left text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                    Category
                  </th>
                  <th scope="col" className="pb-2 text-right text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                    Value
                  </th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row) => (
                  <tr key={row.label} className="border-t border-[var(--border)]">
                    <td className="py-2 text-[var(--foreground)]">{row.label}</td>
                    <td className="py-2 text-right tabular-nums text-[var(--muted)]">
                      {typeof row.value === "number" ? formatNumber(row.value) : row.value}
                      {row.pct ? <span className="ml-1 text-xs">({row.pct}%)</span> : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
        </div>
      ) : null}
    </figure>
  );
}
