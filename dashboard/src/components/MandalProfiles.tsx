"use client";

import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import type { MandalProfile } from "@/lib/mandals";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";

export function MandalSummaryTable({ profiles }: { profiles: MandalProfile[] }) {
  const columns = useMemo<ColumnDef<MandalProfile>[]>(
    () => [
      {
        accessorKey: "displayName",
        header: "Mandal Name",
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.original.displayName}</p>
            {row.original.nameAsPublished &&
            row.original.nameAsPublished !== row.original.displayName ? (
              <p className="text-xs text-stone-500">
                Published as: {row.original.nameAsPublished}
              </p>
            ) : null}
          </div>
        ),
      },
      {
        accessorKey: "gramPanchayats",
        header: "No. of Gram Panchayats",
        cell: ({ getValue }) => {
          const value = getValue<number | null>();
          return value ?? "—";
        },
      },
      {
        accessorKey: "villages",
        header: "No. of Villages",
        cell: ({ getValue }) => {
          const value = getValue<number | null>();
          return value ?? "—";
        },
      },
      {
        id: "map",
        header: "Mandal map",
        cell: ({ row }) =>
          row.original.mapImageUrl ? (
            <a
              className="text-[#1d5c45] underline"
              href={row.original.mapImageUrl}
              target="_blank"
              rel="noreferrer"
            >
              View map
            </a>
          ) : (
            "—"
          ),
      },
      {
        accessorKey: "completeness",
        header: "Data status",
        cell: ({ row }) => (
          <div className="space-y-1">
            <StatusBadge status={row.original.completeness} />
            {row.original.missingFields.length ? (
              <p className="text-xs text-stone-500">
                Missing: {row.original.missingFields.join(", ")}
              </p>
            ) : null}
          </div>
        ),
      },
      {
        accessorKey: "reviewStatus",
        header: "Verification",
        cell: ({ getValue }) => <StatusBadge status={String(getValue())} />,
      },
    ],
    []
  );

  return (
    <DataTable
      data={profiles}
      columns={columns}
      searchPlaceholder="Filter mandals"
    />
  );
}

export function MandalDetailCards({ profiles }: { profiles: MandalProfile[] }) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {profiles.map((profile) => (
        <article
          key={profile.slug}
          className="rounded-xl border border-[var(--border)] bg-white p-5 shadow-sm"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-serif text-2xl text-[var(--foreground)]">{profile.displayName}</h2>
              {profile.nameAsPublished ? (
                <p className="text-sm text-stone-500">
                  As published: {profile.nameAsPublished}
                </p>
              ) : null}
            </div>
            <StatusBadge status={profile.reviewStatus} />
          </div>

          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-stone-500">Gram Panchayats</dt>
              <dd className="text-lg font-medium">{profile.gramPanchayats ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-stone-500">Villages</dt>
              <dd className="text-lg font-medium">{profile.villages ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-stone-500">Map publish date</dt>
              <dd>{profile.mapPublishDate ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-stone-500">Completeness</dt>
              <dd className="capitalize">{profile.completeness}</dd>
            </div>
          </dl>

          {profile.mapImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.mapImageUrl}
              alt={`${profile.displayName} mandal map`}
              className="mt-4 h-56 w-full rounded-lg border border-stone-100 bg-stone-50 object-contain"
            />
          ) : null}

          <div className="mt-4 space-y-2 text-sm">
            {profile.adminStats ? (
              <SourceLine
                label="Admin stats source"
                url={profile.adminStats.source_url}
                title={profile.adminStats.source_title}
                snippet={profile.adminStats.context_snippet}
              />
            ) : null}
            {profile.mapPageUrl ? (
              <SourceLine
                label="Map page"
                url={profile.mapPageUrl}
                title={profile.mandalMapPage?.source_title ?? "Mandal map page"}
              />
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}

function SourceLine({
  label,
  url,
  title,
  snippet,
}: {
  label: string;
  url: string;
  title: string | null;
  snippet?: string | null;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-stone-500">{label}</p>
      <a className="break-all text-[#1d5c45] underline" href={url} target="_blank" rel="noreferrer">
        {title || url}
      </a>
      {snippet ? <p className="mt-1 text-xs text-stone-600">{snippet}</p> : null}
    </div>
  );
}
