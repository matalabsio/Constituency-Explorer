"use client";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";

export function DataTable<T extends object>({
  data,
  columns,
  searchPlaceholder = "Filter rows",
}: {
  data: T[];
  columns: ColumnDef<T, unknown>[];
  searchPlaceholder?: string;
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const cols = useMemo(() => columns, [columns]);

  const table = useReactTable({
    data,
    columns: cols,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="space-y-4">
      <input
        value={globalFilter}
        onChange={(event) => setGlobalFilter(event.target.value)}
        placeholder={searchPlaceholder}
        className="w-full max-w-md rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--brand-green)]/40"
      />
      <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[var(--sidebar)] text-white">
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id}>
                {group.headers.map((header) => (
                  <th key={header.id} className="px-3 py-3 font-medium">
                    {header.isPlaceholder ? null : (
                      <button
                        type="button"
                        className="text-left"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{ asc: " ↑", desc: " ↓" }[header.column.getIsSorted() as string] ?? ""}
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td className="px-3 py-8 text-stone-500" colSpan={columns.length}>
                  No rows yet. Run the collector first.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-t border-stone-100 odd:bg-stone-50/60">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="max-w-xs px-3 py-3 align-top">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center gap-3 text-sm text-stone-600">
        <button
          type="button"
          className="rounded border border-stone-300 bg-white px-3 py-1"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </button>
        <button
          type="button"
          className="rounded border border-stone-300 bg-white px-3 py-1"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </button>
        <span>
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount() || 1}
        </span>
      </div>
    </div>
  );
}
