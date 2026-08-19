from __future__ import annotations

import csv
import io
import json
import sqlite3
from pathlib import Path

PUBLIC_API_STATUSES = {"approved"}


def records_query(approved_only: bool = False) -> str:
    sql = """
        SELECT
            r.id,
            r.entity_slug AS entity,
            e.display_name AS entity_name,
            e.kind AS entity_kind,
            r.category,
            r.value_json,
            r.source_url,
            r.source_title,
            r.source_published_date,
            r.fetched_at,
            r.content_sha256,
            r.raw_snapshot_path,
            r.review_status,
            r.context_snippet
        FROM extracted_records r
        LEFT JOIN entities e ON e.id = r.entity_id
    """
    if approved_only:
        sql += " WHERE r.review_status = 'approved'"
    sql += " ORDER BY r.fetched_at DESC, r.id DESC"
    return sql


def record_to_export(row: sqlite3.Row) -> dict:
    try:
        value = json.loads(row["value_json"] or "{}")
    except json.JSONDecodeError:
        value = {"unparsed": row["value_json"]}
    return {
        "entity": row["entity"],
        "category": row["category"],
        "value": value,
        "source_url": row["source_url"],
        "source_title": row["source_title"],
        "source_published_date": row["source_published_date"],
        "fetched_at": row["fetched_at"],
        "content_sha256": row["content_sha256"],
        "raw_snapshot_path": row["raw_snapshot_path"],
        "review_status": row["review_status"],
    }


def export_json(conn: sqlite3.Connection, *, approved_only: bool = False) -> str:
    rows = conn.execute(records_query(approved_only)).fetchall()
    payload = [record_to_export(row) for row in rows]
    return json.dumps(payload, indent=2, ensure_ascii=False)


def export_csv(conn: sqlite3.Connection, *, approved_only: bool = False) -> str:
    rows = [record_to_export(row) for row in conn.execute(records_query(approved_only)).fetchall()]
    buffer = io.StringIO()
    fieldnames = [
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
    ]
    writer = csv.DictWriter(buffer, fieldnames=fieldnames)
    writer.writeheader()
    for row in rows:
        flat = dict(row)
        flat["value"] = json.dumps(row["value"], ensure_ascii=False)
        writer.writerow(flat)
    return buffer.getvalue()


def write_exports(conn: sqlite3.Connection, data_dir: Path) -> dict[str, str]:
    export_dir = data_dir / "exports"
    export_dir.mkdir(parents=True, exist_ok=True)
    json_path = export_dir / "extracted_records.json"
    csv_path = export_dir / "extracted_records.csv"
    public_json_path = export_dir / "public_approved.json"
    json_path.write_text(export_json(conn, approved_only=False), encoding="utf-8")
    csv_path.write_text(export_csv(conn, approved_only=False), encoding="utf-8")
    public_json_path.write_text(export_json(conn, approved_only=True), encoding="utf-8")
    return {
        "json": str(json_path.relative_to(data_dir.parent) if data_dir.parent in json_path.parents else json_path),
        "csv": str(csv_path),
        "public_json": str(public_json_path),
    }
