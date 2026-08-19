from __future__ import annotations

from pathlib import Path

COLLECTOR_ROOT = Path(__file__).resolve().parent.parent
PROJECT_ROOT = COLLECTOR_ROOT.parent
SCHEMA_PATH = Path(__file__).resolve().parent / "schema.sql"
SEEDS_PATH = COLLECTOR_ROOT / "config" / "seeds.json"


def default_data_dir() -> Path:
    return PROJECT_ROOT / "data"


def default_db_path() -> Path:
    return default_data_dir() / "kurupam.db"
