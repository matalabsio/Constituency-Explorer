"use client";

import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import type { VillageRow } from "@/lib/queries";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";

export function VillageTable({ rows }: { rows: VillageRow[] }) {
  const columns = useMemo<ColumnDef<VillageRow>[]>(
    () => [
      { accessorKey: "mandal_name", header: "Mandal" },
      { accessorKey: "village_name", header: "Village" },
      { accessorKey: "census_village_code", header: "Census code" },
      { accessorKey: "gram_panchayat", header: "Gram Panchayat" },
      { accessorKey: "population", header: "Population" },
      { accessorKey: "households", header: "Households" },
      {
        accessorKey: "population_male",
        header: "Male",
        cell: ({ getValue }) => getValue() ?? "—",
      },
      {
        accessorKey: "population_female",
        header: "Female",
        cell: ({ getValue }) => getValue() ?? "—",
      },
      { accessorKey: "pin_code", header: "PIN" },
      {
        accessorKey: "has_detail",
        header: "Detail",
        cell: ({ getValue }) => (
          <StatusBadge status={getValue() ? "complete" : "partial"} />
        ),
      },
    ],
    []
  );

  return (
    <DataTable
      data={rows}
      columns={columns}
      searchPlaceholder="Filter villages, mandals, GP, census code"
    />
  );
}
