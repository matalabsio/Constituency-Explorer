-- Kurupam data collection schema. Historical observations are append-only.

CREATE TABLE IF NOT EXISTS crawl_runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    started_at TEXT NOT NULL,
    finished_at TEXT,
    status TEXT NOT NULL,
    seed_set TEXT NOT NULL,
    max_pages INTEGER NOT NULL,
    pages_fetched INTEGER NOT NULL DEFAULT 0,
    pages_discovered INTEGER NOT NULL DEFAULT 0,
    records_extracted INTEGER NOT NULL DEFAULT 0,
    documents_downloaded INTEGER NOT NULL DEFAULT 0,
    errors_count INTEGER NOT NULL DEFAULT 0,
    blocked_count INTEGER NOT NULL DEFAULT 0,
    dry_run INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    manifest_path TEXT
);

CREATE TABLE IF NOT EXISTS sources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    canonical_url TEXT NOT NULL UNIQUE,
    url_normalized TEXT NOT NULL,
    content_type TEXT,
    last_http_status INTEGER,
    first_seen_at TEXT NOT NULL,
    last_seen_at TEXT NOT NULL,
    last_content_sha256 TEXT,
    last_snapshot_path TEXT,
    js_rendered_likely INTEGER NOT NULL DEFAULT 0,
    blocked INTEGER NOT NULL DEFAULT 0,
    block_reason TEXT,
    title TEXT
);

CREATE INDEX IF NOT EXISTS idx_sources_normalized ON sources(url_normalized);
CREATE INDEX IF NOT EXISTS idx_sources_status ON sources(last_http_status);

CREATE TABLE IF NOT EXISTS source_observations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_id INTEGER NOT NULL REFERENCES sources(id),
    crawl_run_id INTEGER REFERENCES crawl_runs(id),
    fetched_at TEXT NOT NULL,
    http_status INTEGER,
    content_type TEXT,
    content_sha256 TEXT,
    raw_snapshot_path TEXT,
    bytes INTEGER,
    error TEXT,
    robots_allowed INTEGER,
    js_rendered_likely INTEGER NOT NULL DEFAULT 0,
    request_url TEXT,
    changed_from_previous INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_observations_source ON source_observations(source_id, fetched_at);
CREATE INDEX IF NOT EXISTS idx_observations_run ON source_observations(crawl_run_id);

CREATE TABLE IF NOT EXISTS entities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    kind TEXT NOT NULL,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS entity_aliases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_id INTEGER NOT NULL REFERENCES entities(id),
    alias TEXT NOT NULL,
    UNIQUE(entity_id, alias)
);

CREATE INDEX IF NOT EXISTS idx_aliases_alias ON entity_aliases(alias);

CREATE TABLE IF NOT EXISTS mentions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_id INTEGER NOT NULL REFERENCES entities(id),
    source_id INTEGER NOT NULL REFERENCES sources(id),
    observation_id INTEGER REFERENCES source_observations(id),
    context_snippet TEXT NOT NULL,
    confidence TEXT NOT NULL,
    match_kind TEXT
);

CREATE TABLE IF NOT EXISTS assets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_id INTEGER REFERENCES sources(id),
    parent_source_id INTEGER REFERENCES sources(id),
    crawl_run_id INTEGER REFERENCES crawl_runs(id),
    canonical_url TEXT NOT NULL,
    content_type TEXT,
    kind TEXT,
    sha256 TEXT,
    snapshot_path TEXT,
    bytes INTEGER,
    downloaded_at TEXT,
    associated_entity_id INTEGER REFERENCES entities(id),
    skipped_duplicate INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_assets_sha ON assets(sha256);
CREATE INDEX IF NOT EXISTS idx_assets_url ON assets(canonical_url);

CREATE TABLE IF NOT EXISTS extracted_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_id INTEGER REFERENCES entities(id),
    entity_slug TEXT NOT NULL,
    category TEXT NOT NULL,
    value_json TEXT NOT NULL,
    source_url TEXT NOT NULL,
    source_title TEXT,
    source_published_date TEXT,
    fetched_at TEXT NOT NULL,
    content_sha256 TEXT NOT NULL,
    raw_snapshot_path TEXT,
    review_status TEXT NOT NULL DEFAULT 'pending',
    observation_id INTEGER REFERENCES source_observations(id),
    source_id INTEGER REFERENCES sources(id),
    crawl_run_id INTEGER REFERENCES crawl_runs(id),
    context_snippet TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_records_entity ON extracted_records(entity_slug);
CREATE INDEX IF NOT EXISTS idx_records_status ON extracted_records(review_status);
CREATE INDEX IF NOT EXISTS idx_records_category ON extracted_records(category);

CREATE TABLE IF NOT EXISTS review_status (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    extracted_record_id INTEGER NOT NULL REFERENCES extracted_records(id),
    previous_status TEXT,
    new_status TEXT NOT NULL,
    classification TEXT,
    note TEXT,
    actor TEXT,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS crawl_errors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    crawl_run_id INTEGER REFERENCES crawl_runs(id),
    url TEXT NOT NULL,
    error_type TEXT NOT NULL,
    http_status INTEGER,
    message TEXT,
    created_at TEXT NOT NULL
);
