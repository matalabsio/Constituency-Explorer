"use client";

import { DataTable } from "@/components/DataTable";
import type { SourceRow } from "@/lib/queries";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";

export function SourceTable({ rows }: { rows: SourceRow[] }) {
  const columns = useMemo<ColumnDef<SourceRow>[]>(
    () => [
      {
        accessorKey: "canonical_url",
        header: "URL",
        cell: ({ getValue }) => (
          <span className="break-all">{String(getValue())}</span>
        ),
      },
      { accessorKey: "content_type", header: "Content type" },
      { accessorKey: "last_http_status", header: "HTTP" },
      { accessorKey: "first_seen_at", header: "First seen" },
      { accessorKey: "last_seen_at", header: "Last seen" },
      {
        accessorKey: "last_content_sha256",
        header: "SHA-256",
        cell: ({ getValue }) => {
          const value = String(getValue() ?? "");
          return <code className="break-all text-xs">{value ? `${value.slice(0, 12)}…` : "—"}</code>;
        },
      },
      {
        accessorKey: "last_snapshot_path",
        header: "Snapshot",
        cell: ({ getValue }) => {
          const path = getValue() as string | null;
          if (!path) return "—";
          return (
            <a className="text-[#1d5c45] underline" href={`/api/snapshots/${path}`}>
              raw
            </a>
          );
        },
      },
      {
        accessorKey: "blocked",
        header: "Blocked",
        cell: ({ row }) =>
          row.original.blocked ? row.original.block_reason ?? "yes" : "no",
      },
    ],
    []
  );
  return <DataTable data={rows} columns={columns} searchPlaceholder="Filter crawled URLs" />;
}
