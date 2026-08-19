import { getApprovedExportRows } from "@/lib/queries";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const rows = getApprovedExportRows();
  const payload = rows.map((row) => ({
    entity: row.entity,
    category: row.category,
    value: safeJson(row.value_json),
    source_url: row.source_url,
    source_title: row.source_title,
    source_published_date: row.source_published_date,
    fetched_at: row.fetched_at,
    content_sha256: row.content_sha256,
    raw_snapshot_path: row.raw_snapshot_path,
    review_status: row.review_status,
  }));
  return NextResponse.json({
    generated_at: new Date().toISOString(),
    count: payload.length,
    records: payload,
  });
}

function safeJson(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return { unparsed: value };
  }
}
