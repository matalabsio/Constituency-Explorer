from __future__ import annotations

import sqlite3
from datetime import datetime, timezone
from pathlib import Path

from kurupam_collector.config import CollectorConfig
from kurupam_collector.paths import SCHEMA_PATH


def utcnow() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def connect(db_path: Path) -> sqlite3.Connection:
    db_path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    conn.execute("PRAGMA journal_mode = WAL")
    return conn


def init_db(conn: sqlite3.Connection, config: CollectorConfig) -> None:
    conn.executescript(SCHEMA_PATH.read_text(encoding="utf-8"))
    for entity in config.entities:
        conn.execute(
            """
            INSERT INTO entities (slug, display_name, kind)
            VALUES (?, ?, ?)
            ON CONFLICT(slug) DO UPDATE SET
                display_name = excluded.display_name,
                kind = excluded.kind
            """,
            (entity.slug, entity.display_name, entity.kind),
        )
        row = conn.execute("SELECT id FROM entities WHERE slug = ?", (entity.slug,)).fetchone()
        entity_id = int(row["id"])
        conn.execute("DELETE FROM entity_aliases WHERE entity_id = ?", (entity_id,))
        names = {entity.display_name, entity.slug, *entity.aliases}
        for alias in names:
            conn.execute(
                "INSERT OR IGNORE INTO entity_aliases (entity_id, alias) VALUES (?, ?)",
                (entity_id, alias),
            )
    conn.commit()


def start_run(
    conn: sqlite3.Connection,
    *,
    seed_set: str,
    max_pages: int,
    dry_run: bool,
    notes: str | None = None,
) -> int:
    cur = conn.execute(
        """
        INSERT INTO crawl_runs (
            started_at, status, seed_set, max_pages, dry_run, notes
        ) VALUES (?, 'running', ?, ?, ?, ?)
        """,
        (utcnow(), seed_set, max_pages, 1 if dry_run else 0, notes),
    )
    conn.commit()
    return int(cur.lastrowid)


def finish_run(conn: sqlite3.Connection, run_id: int, status: str, **counts: object) -> None:
    fields = ", ".join(f"{key} = ?" for key in counts)
    values = list(counts.values())
    sql = f"UPDATE crawl_runs SET finished_at = ?, status = ?{', ' + fields if fields else ''} WHERE id = ?"
    conn.execute(sql, [utcnow(), status, *values, run_id])
    conn.commit()


def upsert_source(
    conn: sqlite3.Connection,
    *,
    canonical_url: str,
    url_normalized: str,
    content_type: str | None,
    http_status: int | None,
    title: str | None,
    sha256: str | None,
    snapshot_path: str | None,
    js_rendered_likely: bool,
    blocked: bool,
    block_reason: str | None,
) -> int:
    now = utcnow()
    existing = conn.execute(
        "SELECT id, last_content_sha256 FROM sources WHERE canonical_url = ?",
        (canonical_url,),
    ).fetchone()
    if existing is None:
        cur = conn.execute(
            """
            INSERT INTO sources (
                canonical_url, url_normalized, content_type, last_http_status,
                first_seen_at, last_seen_at, last_content_sha256, last_snapshot_path,
                js_rendered_likely, blocked, block_reason, title
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                canonical_url,
                url_normalized,
                content_type,
                http_status,
                now,
                now,
                sha256,
                snapshot_path,
                1 if js_rendered_likely else 0,
                1 if blocked else 0,
                block_reason,
                title,
            ),
        )
        conn.commit()
        return int(cur.lastrowid)

    conn.execute(
        """
        UPDATE sources SET
            url_normalized = ?,
            content_type = COALESCE(?, content_type),
            last_http_status = ?,
            last_seen_at = ?,
            last_content_sha256 = COALESCE(?, last_content_sha256),
            last_snapshot_path = COALESCE(?, last_snapshot_path),
            js_rendered_likely = ?,
            blocked = ?,
            block_reason = ?,
            title = COALESCE(?, title)
        WHERE id = ?
        """,
        (
            url_normalized,
            content_type,
            http_status,
            now,
            sha256,
            snapshot_path,
            1 if js_rendered_likely else 0,
            1 if blocked else 0,
            block_reason,
            title,
            int(existing["id"]),
        ),
    )
    conn.commit()
    return int(existing["id"])


def add_observation(
    conn: sqlite3.Connection,
    *,
    source_id: int,
    crawl_run_id: int,
    http_status: int | None,
    content_type: str | None,
    sha256: str | None,
    snapshot_path: str | None,
    nbytes: int | None,
    error: str | None,
    robots_allowed: bool | None,
    js_rendered_likely: bool,
    request_url: str,
    previous_sha256: str | None,
) -> int:
    changed = 0
    if sha256 and previous_sha256 and sha256 != previous_sha256:
        changed = 1
    cur = conn.execute(
        """
        INSERT INTO source_observations (
            source_id, crawl_run_id, fetched_at, http_status, content_type,
            content_sha256, raw_snapshot_path, bytes, error, robots_allowed,
            js_rendered_likely, request_url, changed_from_previous
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            source_id,
            crawl_run_id,
            utcnow(),
            http_status,
            content_type,
            sha256,
            snapshot_path,
            nbytes,
            error,
            None if robots_allowed is None else (1 if robots_allowed else 0),
            1 if js_rendered_likely else 0,
            request_url,
            changed,
        ),
    )
    conn.commit()
    return int(cur.lastrowid)


def previous_hash(conn: sqlite3.Connection, canonical_url: str) -> str | None:
    row = conn.execute(
        "SELECT last_content_sha256 FROM sources WHERE canonical_url = ?",
        (canonical_url,),
    ).fetchone()
    return None if row is None else row["last_content_sha256"]


def asset_exists_by_hash(conn: sqlite3.Connection, digest: str) -> bool:
    row = conn.execute(
        "SELECT 1 FROM assets WHERE sha256 = ? AND skipped_duplicate = 0 LIMIT 1",
        (digest,),
    ).fetchone()
    return row is not None


def insert_asset(conn: sqlite3.Connection, **fields: object) -> int:
    columns = ", ".join(fields)
    placeholders = ", ".join("?" for _ in fields)
    cur = conn.execute(
        f"INSERT INTO assets ({columns}) VALUES ({placeholders})",
        list(fields.values()),
    )
    conn.commit()
    return int(cur.lastrowid)


def insert_extracted_record(conn: sqlite3.Connection, **fields: object) -> int:
    now = utcnow()
    fields.setdefault("created_at", now)
    fields.setdefault("updated_at", now)
    fields.setdefault("review_status", "pending")
    columns = ", ".join(fields)
    placeholders = ", ".join("?" for _ in fields)
    cur = conn.execute(
        f"INSERT INTO extracted_records ({columns}) VALUES ({placeholders})",
        list(fields.values()),
    )
    conn.commit()
    return int(cur.lastrowid)


def insert_mention(conn: sqlite3.Connection, **fields: object) -> int:
    cur = conn.execute(
        """
        INSERT INTO mentions (
            entity_id, source_id, observation_id, context_snippet, confidence, match_kind
        ) VALUES (?, ?, ?, ?, ?, ?)
        """,
        (
            fields["entity_id"],
            fields["source_id"],
            fields.get("observation_id"),
            fields["context_snippet"],
            fields["confidence"],
            fields.get("match_kind"),
        ),
    )
    conn.commit()
    return int(cur.lastrowid)


def entity_id(conn: sqlite3.Connection, slug: str) -> int | None:
    row = conn.execute("SELECT id FROM entities WHERE slug = ?", (slug,)).fetchone()
    return None if row is None else int(row["id"])


def log_error(
    conn: sqlite3.Connection,
    *,
    crawl_run_id: int,
    url: str,
    error_type: str,
    http_status: int | None,
    message: str,
) -> None:
    conn.execute(
        """
        INSERT INTO crawl_errors (crawl_run_id, url, error_type, http_status, message, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (crawl_run_id, url, error_type, http_status, message, utcnow()),
    )
    conn.commit()
