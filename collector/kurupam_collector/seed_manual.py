from __future__ import annotations

import hashlib
import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path

from kurupam_collector.db import connect, entity_id, insert_extracted_record, upsert_source
from kurupam_collector.paths import default_data_dir


def utcnow() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def load_manual_records(config_dir: Path) -> list[dict]:
    path = config_dir / "manual_records.json"
    return json.loads(path.read_text(encoding="utf-8"))


def seed_manual_records(conn: sqlite3.Connection, config_dir: Path) -> int:
    records = load_manual_records(config_dir)
    inserted = 0
    now = utcnow()

    for record in records:
        slug = record["entity_slug"]
        category = record["category"]
        source_url = record["source_url"]

        existing = conn.execute(
            """
            SELECT id FROM extracted_records
            WHERE entity_slug = ? AND category = ?
            """,
            (slug, category),
        ).fetchone()
        if existing:
            value_json = json.dumps(record["value"], ensure_ascii=False, separators=(",", ":"))
            content_sha256 = hashlib.sha256(value_json.encode("utf-8")).hexdigest()
            conn.execute(
                """
                UPDATE extracted_records
                SET value_json = ?,
                    source_url = ?,
                    source_title = ?,
                    context_snippet = ?,
                    review_status = ?,
                    content_sha256 = ?,
                    fetched_at = ?,
                    updated_at = ?
                WHERE id = ?
                """,
                (
                    value_json,
                    source_url,
                    record.get("source_title"),
                    record.get("context_snippet"),
                    record.get("review_status", "pending"),
                    content_sha256,
                    now,
                    now,
                    existing["id"],
                ),
            )
            continue

        value_json = json.dumps(record["value"], ensure_ascii=False, separators=(",", ":"))
        content_sha256 = hashlib.sha256(value_json.encode("utf-8")).hexdigest()
        eid = entity_id(conn, slug)

        source_id = upsert_source(
            conn,
            canonical_url=source_url,
            url_normalized=source_url.lower().rstrip("/"),
            content_type="application/json",
            http_status=200,
            sha256=content_sha256,
            snapshot_path=None,
            title=record.get("source_title"),
            js_rendered_likely=False,
            blocked=False,
            block_reason=None,
        )

        insert_extracted_record(
            conn,
            entity_id=eid,
            entity_slug=slug,
            category=category,
            value_json=value_json,
            source_url=source_url,
            source_title=record.get("source_title"),
            source_published_date=None,
            fetched_at=now,
            content_sha256=content_sha256,
            raw_snapshot_path=None,
            review_status=record.get("review_status", "pending"),
            observation_id=None,
            source_id=source_id,
            crawl_run_id=None,
            context_snippet=record.get("context_snippet"),
        )
        inserted += 1

    return inserted


def main() -> None:
    data_dir = default_data_dir()
    config_dir = Path(__file__).resolve().parent.parent / "config"
    conn = connect(data_dir / "kurupam.db")
    count = seed_manual_records(conn, config_dir)
    print(f"inserted {count} manual record(s)")


if __name__ == "__main__":
    main()
