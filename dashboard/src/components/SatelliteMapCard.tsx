import Link from "next/link";
import type { MandalMapRef } from "@/lib/maps";

export function SatelliteMapCard({
  map,
  displayName,
  detailsHref,
}: {
  map: MandalMapRef;
  displayName: string;
  detailsHref?: string;
}) {
  const aka = map.listedName !== displayName ? `Listed as ${map.listedName}` : null;

  return (
    <article className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-sm)]">
      <div className="border-b border-[var(--border)] px-5 py-4">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">{displayName}</h2>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Satellite view{aka ? ` · ${aka}` : ""} · VillageMap.in (Google Maps hybrid)
        </p>
      </div>
      <div className="aspect-[4/3] bg-[var(--surface-muted)]">
        <iframe
          title={`${displayName} satellite map`}
          src={map.embedUrl}
          className="h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
      <div className="flex flex-wrap gap-3 border-t border-[var(--border)] px-5 py-3 text-xs">
        <a
          href={map.villagemapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-[var(--accent)] hover:underline"
        >
          VillageMap page
        </a>
        <a
          href={map.largerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-[var(--accent)] hover:underline"
        >
          Larger Google Map
        </a>
        {detailsHref ? (
          <Link href={detailsHref} className="font-medium text-[var(--accent)] hover:underline">
            Mandal details
          </Link>
        ) : null}
      </div>
    </article>
  );
}
