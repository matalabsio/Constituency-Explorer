"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Card, CardBody, MiniStat, MiniStatGrid } from "@/components/ui";
import { BRAND, mandalColor } from "@/lib/colors";
import type { MandalExplore } from "@/lib/explore";
import { formatNumber } from "@/lib/mandals";

function useEscape(onEscape: () => void, active: boolean) {
  useEffect(() => {
    if (!active) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onEscape();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [active, onEscape]);
}

function MapLightbox({
  mandal,
  onClose,
}: {
  mandal: MandalExplore;
  onClose: () => void;
}) {
  useEscape(onClose, true);

  if (!mandal.mapImageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--overlay)] p-4 backdrop-blur-sm sm:p-8"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="map-lightbox-title"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] px-5 py-4 sm:px-6">
          <div>
            <p className="mark-yellow text-xs font-semibold uppercase tracking-wider">
              Mandal boundary map
            </p>
            <h2 id="map-lightbox-title" className="mt-1 text-xl font-semibold text-[var(--foreground)]">
              {mandal.displayName}
            </h2>
            {mandal.mapPublishDate ? (
              <p className="mt-0.5 text-sm text-[var(--muted)]">Published {mandal.mapPublishDate}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-sm text-[var(--muted)] hover:bg-[var(--surface-muted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-green)]"
            aria-label="Close map viewer"
          >
            ✕
          </button>
        </div>
        <div className="scrollbar-thin flex-1 overflow-auto bg-[var(--surface-muted)] p-4 sm:p-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={mandal.mapImageUrl}
            alt={`${mandal.displayName} official mandal map`}
            className="mx-auto max-h-[70vh] w-full rounded-[var(--radius-lg)] object-contain bg-white shadow-[var(--shadow-sm)]"
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] px-5 py-4 sm:px-6">
          <p className="text-xs text-[var(--muted)]">Parvathipuram Manyam district · official record</p>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/mandals/${mandal.slug}`}
              className="inline-flex items-center rounded-[var(--radius-md)] bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-green)]"
            >
              Mandal details
            </Link>
            {mandal.mapPageUrl ? (
              <a
                href={mandal.mapPageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-[var(--radius-md)] border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--surface-muted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-green)]"
              >
                District source ↗
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function MandalMapCard({
  mandal,
  index,
  onExpand,
}: {
  mandal: MandalExplore;
  index: number;
  onExpand: () => void;
}) {
  const accent = mandalColor(index);
  const hasMap = Boolean(mandal.mapImageUrl);

  return (
    <Card accent={accent} className="group overflow-hidden transition hover:shadow-[var(--shadow-md)]">
      <CardBody className="p-0">
        <button
          type="button"
          onClick={hasMap ? onExpand : undefined}
          disabled={!hasMap}
          className={`relative block w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-green)] ${
            hasMap ? "cursor-zoom-in" : "cursor-default"
          }`}
          aria-label={hasMap ? `Expand ${mandal.displayName} map` : `${mandal.displayName} map not available`}
        >
          {hasMap ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mandal.mapImageUrl!}
                alt={`${mandal.displayName} mandal map preview`}
                className="h-52 w-full bg-[var(--surface-muted)] object-contain p-3 transition duration-300 group-hover:scale-[1.02] sm:h-60"
              />
              <span className="absolute bottom-3 right-3 rounded-full bg-[var(--brand-black)]/75 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-white backdrop-blur-sm">
                Click to expand
              </span>
            </>
          ) : (
            <div className="flex h-52 flex-col items-center justify-center gap-2 bg-[var(--surface-muted)] sm:h-60">
              <span
                className="flex h-14 w-14 items-center justify-center rounded-full text-xl font-bold"
                style={{ background: accent, color: BRAND.white }}
              >
                {mandal.displayName.slice(0, 1)}
              </span>
              <p className="text-sm font-medium text-[var(--muted)]">Map not available</p>
            </div>
          )}
        </button>

        <div className="border-t border-[var(--border)] p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Link
                href={`/mandals/${mandal.slug}`}
                className="text-lg font-semibold text-[var(--foreground)] hover:text-[var(--accent)]"
              >
                {mandal.displayName}
              </Link>
              {mandal.mapPublishDate ? (
                <p className="mt-0.5 text-xs text-[var(--muted)]">Published {mandal.mapPublishDate}</p>
              ) : null}
            </div>
            <span
              className="shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
              style={{
                background: hasMap ? "var(--highlight-soft)" : "var(--surface-muted)",
                color: hasMap ? "var(--foreground)" : "var(--muted)",
                boxShadow: hasMap ? "inset 0 0 0 1px var(--border)" : undefined,
              }}
            >
              {hasMap ? "Available" : "Missing"}
            </span>
          </div>

          <MiniStatGrid>
            <MiniStat label="Villages" value={mandal.villageCount} />
            <MiniStat label="Population" value={formatNumber(mandal.totalPopulation)} />
          </MiniStatGrid>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={`/mandals/${mandal.slug}`}
              className="inline-flex flex-1 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent)] px-3 py-2 text-xs font-semibold text-white hover:bg-[var(--accent-hover)] sm:flex-none sm:px-4 sm:text-sm"
            >
              View mandal
            </Link>
            {hasMap ? (
              <button
                type="button"
                onClick={onExpand}
                className="inline-flex flex-1 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] bg-white px-3 py-2 text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--surface-muted)] sm:flex-none sm:px-4 sm:text-sm"
              >
                Full map
              </button>
            ) : null}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

export function MandalMapsGallery({ mandals }: { mandals: MandalExplore[] }) {
  const [expanded, setExpanded] = useState<MandalExplore | null>(null);
  const close = useCallback(() => setExpanded(null), []);
  const withMaps = mandals.filter((m) => m.mapImageUrl).length;

  return (
    <>
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface-muted)] px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">Mandals</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-[var(--foreground)]">{mandals.length}</p>
        </div>
        <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface-muted)] px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">Maps available</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-[var(--foreground)]">
            {withMaps} <span className="text-base font-normal text-[var(--muted)]">/ {mandals.length}</span>
          </p>
        </div>
        <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white px-5 py-4 sm:col-span-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">Source</p>
          <p className="mt-1 text-sm font-medium leading-snug text-[var(--foreground)]">
            Parvathipuram Manyam district portal
          </p>
          <a
            href="https://parvathipurammanyam.ap.gov.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-block text-xs font-medium text-[var(--accent)] hover:underline"
          >
            parvathipurammanyam.ap.gov.in ↗
          </a>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {mandals.map((mandal, index) => (
          <MandalMapCard
            key={mandal.slug}
            mandal={mandal}
            index={index}
            onExpand={() => setExpanded(mandal)}
          />
        ))}
      </div>

      {expanded ? <MapLightbox mandal={expanded} onClose={close} /> : null}
    </>
  );
}
