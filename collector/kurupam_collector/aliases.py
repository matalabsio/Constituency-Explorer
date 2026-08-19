from __future__ import annotations

import re
from dataclasses import dataclass

from kurupam_collector.config import CollectorConfig, EntityConfig

_PUNCT_RE = re.compile(r"[^a-z0-9\s]+")
_SPACE_RE = re.compile(r"\s+")


def normalize_text(value: str) -> str:
    lowered = (value or "").casefold()
    cleaned = _PUNCT_RE.sub(" ", lowered)
    return _SPACE_RE.sub(" ", cleaned).strip()


@dataclass(frozen=True)
class AliasMatch:
    entity: EntityConfig
    alias: str
    match_kind: str
    snippet: str
    confidence: str


class AliasIndex:
    def __init__(self, config: CollectorConfig) -> None:
        self.entities = {item.slug: item for item in config.entities}
        self._alias_map: list[tuple[str, EntityConfig, str]] = []
        for entity in config.entities:
            names = {entity.display_name, entity.slug, *entity.aliases}
            for name in names:
                key = normalize_text(name)
                if key:
                    self._alias_map.append((key, entity, name))
        self._alias_map.sort(key=lambda item: len(item[0]), reverse=True)

    def match_text(
        self,
        text: str,
        *,
        match_kind: str,
        exclude_slugs: set[str] | None = None,
    ) -> list[AliasMatch]:
        haystack = normalize_text(text)
        if not haystack:
            return []
        found: dict[str, AliasMatch] = {}
        for alias_key, entity, alias in self._alias_map:
            if exclude_slugs and entity.slug in exclude_slugs:
                continue
            if entity.slug in found:
                continue
            if _contains_term(haystack, alias_key):
                snippet = _snippet(text, alias)
                confidence = "high" if match_kind in {"title", "heading", "url", "caption"} else "medium"
                found[entity.slug] = AliasMatch(
                    entity=entity,
                    alias=alias,
                    match_kind=match_kind,
                    snippet=snippet,
                    confidence=confidence,
                )
        return list(found.values())

    def match_url(self, url: str) -> list[AliasMatch]:
        return self.match_text(url.replace("/", " ").replace("-", " "), match_kind="url")

    def mandal_entities(self) -> list[EntityConfig]:
        return [item for item in self.entities.values() if item.kind == "mandal"]


def _contains_term(haystack: str, term: str) -> bool:
    if not term:
        return False
    if " " in term:
        return term in haystack
    pattern = rf"(?<![a-z0-9]){re.escape(term)}(?![a-z0-9])"
    return re.search(pattern, haystack) is not None


def _snippet(text: str, alias: str, radius: int = 90) -> str:
    compact = re.sub(r"\s+", " ", text).strip()
    if not compact:
        return ""
    lowered = compact.casefold()
    needle = alias.casefold()
    idx = lowered.find(needle)
    if idx < 0:
        return compact[: min(len(compact), radius * 2)]
    start = max(0, idx - radius)
    end = min(len(compact), idx + len(alias) + radius)
    prefix = "…" if start > 0 else ""
    suffix = "…" if end < len(compact) else ""
    return f"{prefix}{compact[start:end]}{suffix}"
