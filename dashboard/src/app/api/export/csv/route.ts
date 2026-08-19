import { getAllExportRows } from "@/lib/queries";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const rows = getAllExportRows();
  const header = [
    "entity",
    "category",
    "value",
    "source_url",
    "source_title",
    "source_published_date",
    "fetched_at",
    "content_sha256",
    "raw_snapshot_path",
    "review_status",
  ];
  const lines = [header.join(",")];
  for (const row of rows) {
    lines.push(
      [
        row.entity,
        row.category,
        row.value_json,
        row.source_url,
        row.source_title ?? "",
        row.source_published_date ?? "",
        row.fetched_at,
        row.content_sha256,
        row.raw_snapshot_path ?? "",
        row.review_status,
      ]
        .map(csvEscape)
        .join(",")
    );
  }
  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="kurupam-records.csv"',
    },
  });
}

function csvEscape(value: string) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}
