# Constituency Explorer

Private admin system for collecting, reviewing, and exporting public assembly constituency information from official district sources. Started with Kurupam, and now includes additional constituencies in the dashboard.

Private admin system for collecting, reviewing, and exporting public Kurupam Assembly Constituency information from official district sources.

## Project structure

```text
Scrap/
├── collector/                 # Python crawler (separate from dashboard)
│   ├── config/seeds.json      # Seed URLs, aliases, throttling, allowed hosts
│   ├── kurupam_collector/     # Crawler package
│   └── tests/                 # URL, alias, robots, dedup, extract tests
├── dashboard/                 # Next.js admin UI + export/public API routes
└── data/                      # SQLite DB, snapshots, manifests, exports (gitignored)
    ├── kurupam.db
    ├── storage/snapshots/
    ├── manifests/
    └── exports/
```

## Database schema

Tables:

- `crawl_runs` — crawl metadata and counters
- `sources` — canonical URL registry with latest hash/status
- `source_observations` — append-only fetch history (never silent overwrite)
- `entities` / `entity_aliases` — Kurupam mandals + constituency aliases
- `mentions` — entity mentions with context snippets
- `assets` — downloaded PDFs/images/maps with SHA-256 dedup
- `extracted_records` — structured extracts with provenance + `review_status`
- `review_status` — review audit trail
- `crawl_errors` — failed/blocked URLs

See `collector/kurupam_collector/schema.sql`.

## Phase 1 + 2 scope implemented

- Robots-aware crawler with descriptive user agent
- One request at a time, ≥2s between requests
- Configurable max pages + dry-run mode
- Domain allowlist + official CDN path prefix
- Raw HTML/file snapshots with SHA-256 hashes
- Duplicate file skip
- Mandal Maps index → target mandals → map links → dashboard tables
- JSON/CSV export + approved-only public API

## Setup

### Collector

```bash
cd collector
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m kurupam_collector init-db
python -m kurupam_collector crawl --phase phase2 --max-pages 30
python -m kurupam_collector crawl --phase villagecodes --max-pages 450
python -m kurupam_collector export
python -m unittest discover -s tests -v
```

Dry run:

```bash
python -m kurupam_collector crawl --phase phase2 --max-pages 10 --dry-run
```

### Dashboard

```bash
cd dashboard
npm install
npm run dev
```

Environment overrides:

- `KURUPAM_DATA_DIR` — defaults to `../data`
- `KURUPAM_DB_PATH` — defaults to `$KURUPAM_DATA_DIR/kurupam.db`

## Safety notes

- Does not collect voter rolls, personal phone numbers, or addresses
- Does not bypass CAPTCHA/login/rate limits/robots
- Does not publish unreviewed records via `/api/public/records`
- Stores context snippets, not invented facts

## Primary source

https://parvathipurammanyam.ap.gov.in/
