from __future__ import annotations

import argparse
import logging
import sys
from pathlib import Path

from kurupam_collector.config import load_config
from kurupam_collector.crawler import Crawler
from kurupam_collector.db import connect, init_db
from kurupam_collector.export import write_exports
from kurupam_collector.paths import default_data_dir, default_db_path
from kurupam_collector.snapshots import SnapshotStore


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Kurupam public-source collector. Respects robots.txt and does not invent facts."
    )
    parser.add_argument("--data-dir", type=Path, default=default_data_dir())
    parser.add_argument("--db", type=Path, default=None)
    sub = parser.add_subparsers(dest="command", required=True)

    crawl = sub.add_parser("crawl", help="Run a robots-aware crawl")
    crawl.add_argument("--max-pages", type=int, default=None)
    crawl.add_argument("--dry-run", action="store_true")
    crawl.add_argument(
        "--phase",
        choices=["phase2", "villagecodes", "all"],
        default="phase2",
        help="phase2 = district mandal maps + GP counts; villagecodes = village directory from villagecodes.in",
    )

    sub.add_parser("init-db", help="Create SQLite schema and seed entities")
    sub.add_parser("seed-manual", help="Insert approved manual records from config/manual_records.json")
    export = sub.add_parser("export", help="Write JSON and CSV exports")
    export.add_argument("--approved-only", action="store_true")
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    )
    data_dir: Path = args.data_dir
    data_dir.mkdir(parents=True, exist_ok=True)
    db_path = args.db or (data_dir / "kurupam.db")
    config = load_config()
    conn = connect(db_path)
    init_db(conn, config)

    if args.command == "init-db":
        print(f"initialized {db_path}")
        return 0

    if args.command == "seed-manual":
        from kurupam_collector.seed_manual import seed_manual_records

        config_dir = Path(__file__).resolve().parent.parent / "config"
        count = seed_manual_records(conn, config_dir)
        print(f"inserted {count} manual record(s)")
        return 0

    if args.command == "export":
        paths = write_exports(conn, data_dir)
        for label, path in paths.items():
            print(f"{label}: {path}")
        return 0

    if args.command == "crawl":
        if args.phase == "phase2":
            seeds = list(config.phase2_seed_urls)
            max_pages = args.max_pages or config.default_max_pages
        elif args.phase == "villagecodes":
            seeds = list(config.villagecodes_seed_urls)
            max_pages = args.max_pages or config.villagecodes_default_max_pages
        else:
            seeds = list(config.seed_urls) + list(config.villagecodes_seed_urls)
            max_pages = args.max_pages or config.villagecodes_default_max_pages
        crawler = Crawler(
            config,
            conn,
            SnapshotStore(data_dir),
            max_pages=max_pages,
            dry_run=args.dry_run,
            seed_set=args.phase,
            data_dir=data_dir,
        )
        run_id = crawler.run(seeds)
        write_exports(conn, data_dir)
        print(f"completed crawl run {run_id}")
        print(f"stats: {crawler.stats}")
        return 0

    return 1


if __name__ == "__main__":
    sys.exit(main())
