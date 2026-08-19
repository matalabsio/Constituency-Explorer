"use client";

import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import type { MandalRow } from "@/lib/queries";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";

export function MandalTable({ rows }: { rows: MandalRow[] }) {
  const columns = useMemo<ColumnDef<MandalRow>[]>(
    () => [
      { accessorKey: "mandal_name", header: "Mandal" },
      { accessorKey: "category", header: "Category" },
      {
        accessorKey: "context_snippet",
        header: "Extracted statement / context",
        cell: ({ getValue }) => (
          <span className="line-clamp-4 text-stone-700">{String(getValue() ?? "")}</span>
        ),
      },
      {
        accessorKey: "source_url",
        header: "Source URL",
        cell: ({ getValue }) => {
          const url = String(getValue());
          return (
            <a className="break-all text-[#1d5c45] underline" href={url} target="_blank" rel="noreferrer">
              {url}
            </a>
          );
        },
      },
      { accessorKey: "source_title", header: "Source title" },
      { accessorKey: "fetched_at", header: "Fetched" },
      {
        accessorKey: "review_status",
        header: "Verification",
        cell: ({ getValue }) => <StatusBadge status={String(getValue())} />,
      },
    ],
    []
  );
  return <DataTable data={rows} columns={columns} searchPlaceholder="Filter mandals, URLs, context" />;
}
