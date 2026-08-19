from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path

from kurupam_collector.paths import SEEDS_PATH


@dataclass(frozen=True)
class EntityConfig:
    slug: str
    display_name: str
    kind: str
    aliases: tuple[str, ...]


@dataclass(frozen=True)
class CollectorConfig:
    user_agent: str
    min_request_interval_seconds: float
    default_max_pages: int
    request_timeout_seconds: float
    allowed_hosts: tuple[str, ...]
    allowed_cdn_path_prefixes: tuple[str, ...]
    asset_only_hosts: tuple[str, ...]
    enforce_robots_on_asset_hosts: bool
    seed_urls: tuple[str, ...]
    phase2_seed_urls: tuple[str, ...]
    villagecodes_seed_urls: tuple[str, ...]
    villagecodes_default_max_pages: int
    skip_url_patterns: tuple[str, ...]
    entities: tuple[EntityConfig, ...]


def load_config(path: Path | None = None) -> CollectorConfig:
    config_path = path or SEEDS_PATH
    raw = json.loads(config_path.read_text(encoding="utf-8"))
    entities = tuple(
        EntityConfig(
            slug=item["slug"],
            display_name=item["display_name"],
            kind=item["kind"],
            aliases=tuple(item.get("aliases") or []),
        )
        for item in raw["entities"]
    )
    return CollectorConfig(
        user_agent=raw["user_agent"],
        min_request_interval_seconds=float(raw["min_request_interval_seconds"]),
        default_max_pages=int(raw["default_max_pages"]),
        request_timeout_seconds=float(raw["request_timeout_seconds"]),
        allowed_hosts=tuple(raw["allowed_hosts"]),
        allowed_cdn_path_prefixes=tuple(raw["allowed_cdn_path_prefixes"]),
        asset_only_hosts=tuple(raw.get("asset_only_hosts") or []),
        enforce_robots_on_asset_hosts=bool(raw.get("enforce_robots_on_asset_hosts", True)),
        seed_urls=tuple(raw["seed_urls"]),
        phase2_seed_urls=tuple(raw["phase2_seed_urls"]),
        villagecodes_seed_urls=tuple(raw.get("villagecodes_seed_urls") or []),
        villagecodes_default_max_pages=int(raw.get("villagecodes_default_max_pages", 450)),
        skip_url_patterns=tuple(raw["skip_url_patterns"]),
        entities=entities,
    )
