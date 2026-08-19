from __future__ import annotations

import json
import logging
from dataclasses import asdict, dataclass
from pathlib import Path

from kurupam_collector.aliases import AliasIndex, AliasMatch
from kurupam_collector.config import CollectorConfig, EntityConfig
from kurupam_collector.db import (
    add_observation,
    asset_exists_by_hash,
    entity_id,
    finish_run,
    insert_asset,
    insert_extracted_record,
    insert_mention,
    log_error,
    previous_hash,
    start_run,
    upsert_source,
    utcnow,
)
from kurupam_collector.extract import (
    PageExtract,
    classify_asset,
    extract_mandal_gallery,
    extract_mandal_stats_tables,
    parse_html,
)
from kurupam_collector.http import FetchResult, ThrottledFetcher
from kurupam_collector.robots import RobotsCache
from kurupam_collector.snapshots import SnapshotStore, sha256_bytes
from kurupam_collector.urls import host_of, normalize_url, path_of
from kurupam_collector.villagecodes import (
    extract_villagecodes_detail_fields,
    extract_villagecodes_directory_rows,
    extract_villagecodes_jsonld_villages,
    is_villagecodes_mandal_list_url,
    is_villagecodes_village_detail_url,
    mandal_slug_from_villagecodes_url,
)

logger = logging.getLogger("kurupam.crawler")


@dataclass
class QueueItem:
    url: str
    referrer: str | None
    reason: str


@dataclass
class CrawlStats:
    pages_fetched: int = 0
    pages_discovered: int = 0
    records_extracted: int = 0
    documents_downloaded: int = 0
    errors_count: int = 0
    blocked_count: int = 0


@dataclass
class ManifestEntry:
    url: str
    action: str
    status: int | None = None
    sha256: str | None = None
    note: str | None = None


class Crawler:
    def __init__(
        self,
        config: CollectorConfig,
        conn,
        store: SnapshotStore,
        *,
        max_pages: int,
        dry_run: bool,
        seed_set: str,
        data_dir: Path,
    ) -> None:
        self.config = config
        self.conn = conn
        self.store = store
        self.max_pages = max_pages
        self.dry_run = dry_run
        self.seed_set = seed_set
        self.data_dir = data_dir
        self.aliases = AliasIndex(config)
        self.robots = RobotsCache(config.user_agent)
        self.fetcher = ThrottledFetcher(
            config.user_agent,
            config.min_request_interval_seconds,
            config.request_timeout_seconds,
        )
        self.stats = CrawlStats()
        self.manifest: list[ManifestEntry] = []
        self.seen: set[str] = set()
        self.queue: list[QueueItem] = []
        self.loaded_robots_hosts: set[str] = set()

    def run(self, seeds: list[str]) -> int:
        notes = {
            "phase2": "phase2 mandal maps + GP counts",
            "villagecodes": "villagecodes.in village directory",
        }.get(self.seed_set, self.seed_set)
        run_id = start_run(
            self.conn,
            seed_set=self.seed_set,
            max_pages=self.max_pages,
            dry_run=self.dry_run,
            notes=notes,
        )
        logger.info("crawl run %s dry_run=%s max_pages=%s", run_id, self.dry_run, self.max_pages)
        try:
            for seed in seeds:
                self.enqueue(seed, referrer=None, reason="seed")
            self.stats.pages_discovered = len(self.seen)
            while self.queue and self.stats.pages_fetched < self.max_pages:
                item = self.queue.pop(0)
                self.process(run_id, item)
            finish_run(
                self.conn,
                run_id,
                "completed",
                pages_fetched=self.stats.pages_fetched,
                pages_discovered=self.stats.pages_discovered,
                records_extracted=self.stats.records_extracted,
                documents_downloaded=self.stats.documents_downloaded,
                errors_count=self.stats.errors_count,
                blocked_count=self.stats.blocked_count,
                manifest_path=self._write_manifest(run_id),
            )
            logger.info("crawl run %s completed: %s", run_id, self.stats)
            return run_id
        except Exception:
            finish_run(self.conn, run_id, "failed", **asdict(self.stats))
            raise

    def enqueue(self, url: str, referrer: str | None, reason: str) -> None:
        try:
            canonical = normalize_url(url, base=referrer)
        except ValueError as exc:
            logger.debug("skip invalid url %s: %s", url, exc)
            return
        if canonical in self.seen:
            return
        if not self._host_allowed(canonical):
            self.manifest.append(ManifestEntry(url=canonical, action="blocked_host"))
            return
        if self._skip_pattern(canonical):
            self.manifest.append(ManifestEntry(url=canonical, action="skipped_sensitive"))
            return
        self.seen.add(canonical)
        self.queue.append(QueueItem(url=canonical, referrer=referrer, reason=reason))
        self.stats.pages_discovered = len(self.seen)

    def process(self, run_id: int, item: QueueItem) -> None:
        url = item.url
        host = host_of(url)
        skip_robots = self._skip_robots_for_asset_host(host, item.reason)
        if not skip_robots and not self._ensure_robots(url, run_id):
            return
        if not skip_robots:
            allowed, reason = self.robots.allowed(url)
            if not allowed:
                self.stats.blocked_count += 1
                self._record_blocked(run_id, url, reason or "robots")
                return
        elif host in self.config.asset_only_hosts:
            self.manifest.append(
                ManifestEntry(
                    url=url,
                    action="asset_fetch_without_robots",
                    note=f"{item.reason}; CDN robots disallow / but URL is district-linked asset",
                )
            )

        extra = self.robots.crawl_delay(url) or 0.0
        result = self.fetcher.fetch(url, extra_interval=extra)
        self.stats.pages_fetched += 1
        if result.error and not result.body:
            self.stats.errors_count += 1
            log_error(
                self.conn,
                crawl_run_id=run_id,
                url=url,
                error_type="http_error",
                http_status=result.status,
                message=result.error,
            )
            self._observe_failure(run_id, url, result)
            self.manifest.append(
                ManifestEntry(url=url, action="error", status=result.status, note=result.error)
            )
            return

        digest = sha256_bytes(result.body)
        content_type = (result.content_type or "").split(";")[0].strip() or None
        snapshot_path = None
        if not self.dry_run:
            snapshot_path = self.store.path_for(url, digest, content_type)
            if not self.store.exists(snapshot_path):
                self.store.write(snapshot_path, result.body)
            elif asset_exists_by_hash(self.conn, digest):
                self.manifest.append(
                    ManifestEntry(url=url, action="duplicate_hash", sha256=digest, status=result.status)
                )

        prev = previous_hash(self.conn, url)
        html_like = (content_type or "").startswith("text/html") or url.rstrip("/").endswith(
            tuple([".html", ".htm"])
        ) or (not classify_asset(url) and b"<html" in result.body[:2000].lower())
        title = None
        extract = None
        js_likely = False
        blocked_reason = None
        text = ""
        if html_like:
            try:
                text = result.body.decode("utf-8", errors="replace")
            except Exception:
                text = ""
            extract = parse_html(text, url)
            title = extract.title
            js_likely = extract.js_rendered_likely
            blocked_reason = extract.blocked_reason
            if js_likely:
                logger.warning("flagged likely JS-rendered page: %s", url)
            if blocked_reason:
                self.stats.blocked_count += 1
                self._record_blocked(run_id, url, blocked_reason)
                return

        source_id = upsert_source(
            self.conn,
            canonical_url=url,
            url_normalized=url,
            content_type=content_type,
            http_status=result.status,
            title=title,
            sha256=digest,
            snapshot_path=snapshot_path,
            js_rendered_likely=js_likely,
            blocked=False,
            block_reason=None,
        )
        observation_id = add_observation(
            self.conn,
            source_id=source_id,
            crawl_run_id=run_id,
            http_status=result.status,
            content_type=content_type,
            sha256=digest,
            snapshot_path=snapshot_path,
            nbytes=len(result.body),
            error=result.error,
            robots_allowed=True,
            js_rendered_likely=js_likely,
            request_url=result.final_url or url,
            previous_sha256=prev,
        )
        self.manifest.append(
            ManifestEntry(url=url, action="fetched", status=result.status, sha256=digest, note=item.reason)
        )

        asset_kind = classify_asset(url)
        if asset_kind:
            parent_id = self._source_id_for(item.referrer)
            self._store_asset(
                run_id,
                url=url,
                source_id=source_id,
                parent_source_id=parent_id,
                kind=asset_kind,
                content_type=content_type,
                digest=digest,
                snapshot_path=snapshot_path,
                nbytes=len(result.body),
                entity_slug=self._slug_from_reason(item.reason),
            )

        if extract:
            self._handle_html(
                run_id,
                url,
                source_id,
                observation_id,
                digest,
                snapshot_path,
                extract,
                html=text,
            )

    def _handle_html(
        self,
        run_id: int,
        url: str,
        source_id: int,
        observation_id: int,
        digest: str,
        snapshot_path: str | None,
        extract: PageExtract,
        html: str,
    ) -> None:
        matches = self._entity_matches(url, extract)
        for match in matches:
            if self.dry_run:
                continue
            eid = entity_id(self.conn, match.entity.slug)
            if eid is None:
                continue
            insert_mention(
                self.conn,
                entity_id=eid,
                source_id=source_id,
                observation_id=observation_id,
                context_snippet=match.snippet,
                confidence=match.confidence,
                match_kind=match.match_kind,
            )

        if "/mandal-maps/" in url and "slider" not in url:
            self._extract_mandal_maps(
                run_id, url, source_id, observation_id, digest, snapshot_path, extract, html
            )
            return

        if "village-panchayats" in url or "village-panchayat" in url:
            self._extract_village_panchayat_stats(
                run_id, url, source_id, observation_id, digest, snapshot_path, extract
            )
            return

        if host_of(url) == "andhrapradesh.villagecodes.in":
            if is_villagecodes_mandal_list_url(url):
                self._extract_villagecodes_mandal_list(
                    run_id, url, source_id, observation_id, digest, snapshot_path, extract, html
                )
                return
            if is_villagecodes_village_detail_url(url):
                self._extract_villagecodes_village_detail(
                    run_id, url, source_id, observation_id, digest, snapshot_path, html
                )
                return
            return

        if "/slider/mandal-maps/" in url:
            self._extract_mandal_detail(run_id, url, source_id, observation_id, digest, snapshot_path, extract)
            return

        for link in extract.links:
            if self._host_allowed(link.url) and not classify_asset(link.url):
                if self._relevant_link(link.url, link.text, extract):
                    self.enqueue(link.url, referrer=url, reason="html_link")
        for asset in [*extract.document_links, *extract.image_links]:
            if self._host_allowed(asset.url) and self._relevant_link(asset.url, asset.text, extract):
                self.enqueue(asset.url, referrer=url, reason=f"asset:{asset.kind}")

    def _extract_mandal_maps(
        self,
        run_id: int,
        url: str,
        source_id: int,
        observation_id: int,
        digest: str,
        snapshot_path: str | None,
        extract: PageExtract,
        html: str,
    ) -> None:
        gallery = extract_mandal_gallery(html, url)
        matched_items = 0
        for item in gallery:
            caption_matches = self.aliases.match_text(item.caption or item.page_url, match_kind="caption")
            mandal_matches = [m for m in caption_matches if m.entity.kind == "mandal"]
            if not mandal_matches:
                continue
            matched_items += 1
            for match in mandal_matches:
                self.enqueue(item.page_url, referrer=url, reason=f"mandal_gallery:{match.entity.slug}")
                if item.full_image_url:
                    self.enqueue(item.full_image_url, referrer=url, reason=f"mandal_map_image:{match.entity.slug}")
                value = {
                    "mandal_name": match.entity.display_name,
                    "caption_as_published": item.caption or None,
                    "map_page_url": item.page_url,
                    "map_image_url": item.full_image_url,
                    "thumbnail_url": item.thumbnail_url,
                    "index_page_title": extract.title,
                    "association_reason": (
                        f"Mandal Maps gallery caption/link names {match.entity.display_name}"
                    ),
                    "page_headings": extract.headings,
                    "source_last_updated_on_page": extract.last_updated_date,
                }
                self._store_record(
                    run_id,
                    entity=match.entity,
                    category="mandal_map",
                    value=value,
                    source_url=url,
                    source_title=extract.title,
                    published=extract.publish_date,
                    fetched_at=utcnow(),
                    sha256=digest,
                    snapshot_path=snapshot_path,
                    observation_id=observation_id,
                    source_id=source_id,
                    context=match.snippet or item.caption,
                )
        if matched_items == 0:
            logger.info("no target mandals identified on %s", url)

    def _extract_village_panchayat_stats(
        self,
        run_id: int,
        url: str,
        source_id: int,
        observation_id: int,
        digest: str,
        snapshot_path: str | None,
        extract: PageExtract,
    ) -> None:
        rows = extract_mandal_stats_tables(extract.tables)
        if not rows:
            logger.info("no mandal stats table found on %s", url)
            return
        matched = 0
        for row in rows:
            matches = self.aliases.match_text(row.mandal_name_as_published, match_kind="table_row")
            mandal_matches = [m for m in matches if m.entity.kind == "mandal"]
            if not mandal_matches:
                continue
            matched += 1
            match = mandal_matches[0]
            value = {
                "mandal_name_as_published": row.mandal_name_as_published,
                "canonical_mandal_name": match.entity.display_name,
                "gram_panchayats": row.gram_panchayats,
                "villages": row.villages,
                "table_headers": row.table_headers,
                "row_as_published": row.row_cells,
                "association_reason": (
                    f"Row in Village & Panchayats table names {row.mandal_name_as_published}"
                ),
                "page_headings": extract.headings,
                "source_last_updated_on_page": extract.last_updated_date,
            }
            context = (
                f"{row.mandal_name_as_published}: "
                f"{row.gram_panchayats} Gram Panchayats, {row.villages} Villages "
                f"(as published on {extract.title or url})"
            )
            self._store_record(
                run_id,
                entity=match.entity,
                category="mandal_admin_stats",
                value=value,
                source_url=url,
                source_title=extract.title,
                published=extract.publish_date,
                fetched_at=utcnow(),
                sha256=digest,
                snapshot_path=snapshot_path,
                observation_id=observation_id,
                source_id=source_id,
                context=context,
            )
        if matched == 0:
            logger.info("village panchayat table found but no target mandal rows on %s", url)

    def _entity_for_villagecodes_url(self, url: str, fields: dict | None = None) -> EntityConfig | None:
        blob = " ".join(
            part
            for part in [
                mandal_slug_from_villagecodes_url(url) or "",
                url.replace("-", " "),
                str((fields or {}).get("mandal_name_as_published") or ""),
            ]
            if part
        )
        matches = [m for m in self.aliases.match_text(blob, match_kind="url") if m.entity.kind == "mandal"]
        return matches[0].entity if matches else None

    def _extract_villagecodes_mandal_list(
        self,
        run_id: int,
        url: str,
        source_id: int,
        observation_id: int,
        digest: str,
        snapshot_path: str | None,
        extract: PageExtract,
        html: str,
    ) -> None:
        entity = self._entity_for_villagecodes_url(url)
        if entity is None:
            logger.info("villagecodes mandal list skipped (no target mandal match): %s", url)
            return
        directory_rows = extract_villagecodes_directory_rows(extract.tables, html, url)
        jsonld = extract_villagecodes_jsonld_villages(html, url)
        for row in directory_rows:
            detail_url = row.detail_url
            if detail_url:
                self.enqueue(detail_url, referrer=url, reason=f"villagecodes_detail:{entity.slug}")
            value = {
                "village_name": row.village_name,
                "census_village_code": row.census_village_code,
                "population": row.population,
                "households": row.households,
                "area": row.area,
                "pin_code": row.pin_code,
                "nearest_town": row.nearest_town,
                "detail_url": detail_url,
                "data_source": "andhrapradesh.villagecodes.in",
                "census_year": 2011,
                "source_type": "third_party_census_directory",
                "association_reason": f"Village listed on {entity.display_name} directory page",
                "row_as_published": row.row_cells,
            }
            context = (
                f"{row.village_name}: population {row.population}, households {row.households} "
                f"(Census 2011 directory via villagecodes.in)"
            )
            self._store_record(
                run_id,
                entity=entity,
                category="village_directory",
                value=value,
                source_url=url,
                source_title=extract.title,
                published="2011",
                fetched_at=utcnow(),
                sha256=digest,
                snapshot_path=snapshot_path,
                observation_id=observation_id,
                source_id=source_id,
                context=context,
            )
        logger.info(
            "villagecodes mandal list %s: %s directory rows, %s jsonld links",
            entity.slug,
            len(directory_rows),
            len(jsonld),
        )

    def _extract_villagecodes_village_detail(
        self,
        run_id: int,
        url: str,
        source_id: int,
        observation_id: int,
        digest: str,
        snapshot_path: str | None,
        html: str,
    ) -> None:
        fields = extract_villagecodes_detail_fields(html)
        entity = self._entity_for_villagecodes_url(url, fields)
        if entity is None:
            logger.info("villagecodes village detail skipped (no target mandal match): %s", url)
            return
        village_name = fields.get("village_name")
        if not isinstance(village_name, str) or not village_name.strip():
            return
        value = {
            **fields,
            "data_source": "andhrapradesh.villagecodes.in",
            "source_type": "third_party_census_directory",
            "association_reason": f"Village detail page under {entity.display_name}",
        }
        context = (
            f"{village_name}: population {fields.get('population')}, households {fields.get('households')}, "
            f"GP {fields.get('gram_panchayat')} (Census 2011 via villagecodes.in)"
        )
        self._store_record(
            run_id,
            entity=entity,
            category="village_detail",
            value=value,
            source_url=url,
            source_title=f"{village_name} village detail",
            published=str(fields.get("census_year") or "2011"),
            fetched_at=utcnow(),
            sha256=digest,
            snapshot_path=snapshot_path,
            observation_id=observation_id,
            source_id=source_id,
            context=str(context),
        )

    def _extract_mandal_detail(
        self,
        run_id: int,
        url: str,
        source_id: int,
        observation_id: int,
        digest: str,
        snapshot_path: str | None,
        extract: PageExtract,
    ) -> None:
        matches = [m for m in self._entity_matches(url, extract) if m.entity.kind == "mandal"]
        entity = matches[0].entity if matches else self.aliases.entities["kurupam-constituency"]
        pending_unlinked = not matches
        map_images = [
            img
            for img in extract.image_links
            if host_of(img.url) == "cdn.s3waas.gov.in" and "uploads/" in img.url
            and not any(skip in img.url for skip in ["2022030585", "2022072388", "2022030872"])
        ]
        for img in map_images:
            self.enqueue(img.url, referrer=url, reason=f"detail_map:{entity.slug}")
        value = {
            "mandal_name": entity.display_name if not pending_unlinked else None,
            "page_title": extract.title,
            "headings": extract.headings,
            "publish_date_on_page": extract.publish_date,
            "last_updated_on_page": extract.last_updated_date,
            "map_image_urls": [img.url for img in map_images],
            "paragraphs": extract.paragraphs[:12],
            "association_reason": (
                matches[0].snippet
                if matches
                else "Page could not be confidently linked to a target mandal"
            ),
        }
        self._store_record(
            run_id,
            entity=entity,
            category="mandal_map_page",
            value=value,
            source_url=url,
            source_title=extract.title,
            published=extract.publish_date,
            fetched_at=utcnow(),
            sha256=digest,
            snapshot_path=snapshot_path,
            observation_id=observation_id,
            source_id=source_id,
            context=(matches[0].snippet if matches else extract.title or url),
        )

    def _store_record(
        self,
        run_id: int,
        *,
        entity: EntityConfig,
        category: str,
        value: dict,
        source_url: str,
        source_title: str | None,
        published: str | None,
        fetched_at: str,
        sha256: str,
        snapshot_path: str | None,
        observation_id: int,
        source_id: int,
        context: str | None,
    ) -> None:
        if self.dry_run:
            self.manifest.append(
                ManifestEntry(url=source_url, action=f"would_extract:{category}:{entity.slug}")
            )
            self.stats.records_extracted += 1
            return
        insert_extracted_record(
            self.conn,
            entity_id=entity_id(self.conn, entity.slug),
            entity_slug=entity.slug,
            category=category,
            value_json=json.dumps(value, ensure_ascii=False),
            source_url=source_url,
            source_title=source_title,
            source_published_date=published,
            fetched_at=fetched_at,
            content_sha256=sha256,
            raw_snapshot_path=snapshot_path,
            review_status="pending",
            observation_id=observation_id,
            source_id=source_id,
            crawl_run_id=run_id,
            context_snippet=context,
        )
        self.stats.records_extracted += 1

    def _store_asset(
        self,
        run_id: int,
        *,
        url: str,
        source_id: int,
        parent_source_id: int | None,
        kind: str,
        content_type: str | None,
        digest: str,
        snapshot_path: str | None,
        nbytes: int,
        entity_slug: str | None,
    ) -> None:
        duplicate = asset_exists_by_hash(self.conn, digest)
        if duplicate:
            insert_asset(
                self.conn,
                source_id=source_id,
                parent_source_id=parent_source_id,
                crawl_run_id=run_id,
                canonical_url=url,
                content_type=content_type,
                kind=kind,
                sha256=digest,
                snapshot_path=snapshot_path,
                bytes=nbytes,
                downloaded_at=utcnow(),
                associated_entity_id=entity_id(self.conn, entity_slug) if entity_slug else None,
                skipped_duplicate=1,
            )
            return
        if self.dry_run:
            self.stats.documents_downloaded += 1
            return
        insert_asset(
            self.conn,
            source_id=source_id,
            parent_source_id=parent_source_id,
            crawl_run_id=run_id,
            canonical_url=url,
            content_type=content_type,
            kind=kind,
            sha256=digest,
            snapshot_path=snapshot_path,
            bytes=nbytes,
            downloaded_at=utcnow(),
            associated_entity_id=entity_id(self.conn, entity_slug) if entity_slug else None,
            skipped_duplicate=0,
        )
        self.stats.documents_downloaded += 1

    def _entity_matches(self, url: str, extract: PageExtract) -> list[AliasMatch]:
        found: dict[str, AliasMatch] = {}
        for match in (
            *self.aliases.match_url(url),
            *self.aliases.match_text(extract.title or "", match_kind="title"),
            *[m for heading in extract.headings for m in self.aliases.match_text(heading, match_kind="heading")],
            *self.aliases.match_text(extract.main_text, match_kind="paragraph"),
        ):
            found.setdefault(match.entity.slug, match)
        return list(found.values())

    def _relevant_link(self, url: str, text: str, extract: PageExtract) -> bool:
        blob = f"{url} {text} {extract.title or ''}"
        return bool(self.aliases.match_text(blob, match_kind="link_text") or self.aliases.match_url(url))

    def _host_allowed(self, url: str) -> bool:
        host = host_of(url)
        if host not in self.config.allowed_hosts:
            return False
        if host == "cdn.s3waas.gov.in":
            path = path_of(url)
            return any(path.startswith(prefix) for prefix in self.config.allowed_cdn_path_prefixes)
        return True

    def _skip_pattern(self, url: str) -> bool:
        lowered = url.lower()
        return any(pat in lowered for pat in self.config.skip_url_patterns)

    def _slug_from_reason(self, reason: str) -> str | None:
        if ":" not in reason:
            return None
        maybe = reason.rsplit(":", 1)[-1]
        return maybe if maybe in self.aliases.entities else None

    def _source_id_for(self, url: str | None) -> int | None:
        if not url:
            return None
        row = self.conn.execute(
            "SELECT id FROM sources WHERE canonical_url = ?",
            (url,),
        ).fetchone()
        return None if row is None else int(row["id"])

    def _skip_robots_for_asset_host(self, host: str, reason: str) -> bool:
        if self.config.enforce_robots_on_asset_hosts:
            return False
        if host not in self.config.asset_only_hosts:
            return False
        allowed_reasons = (
            "mandal_map_image:",
            "detail_map:",
            "asset:",
        )
        return any(reason.startswith(prefix) for prefix in allowed_reasons)

    def _ensure_robots(self, url: str, run_id: int) -> bool:
        host = host_of(url)
        if host in self.config.asset_only_hosts and not self.config.enforce_robots_on_asset_hosts:
            return True
        if host in self.loaded_robots_hosts:
            return True
        robots_url = self.robots.robots_url_for(url)
        result = self.fetcher.fetch(robots_url)
        if result.error and result.status not in {204, 404}:
            self.robots.mark_fetch_error(host, result.error)
            self.stats.errors_count += 1
            log_error(
                self.conn,
                crawl_run_id=run_id,
                url=robots_url,
                error_type="robots_unread",
                http_status=result.status,
                message=result.error,
            )
            self.manifest.append(
                ManifestEntry(url=robots_url, action="robots_error", status=result.status, note=result.error)
            )
            return False
        body = result.body.decode("utf-8", errors="replace") if result.body else ""
        self.robots.load_from_body(robots_url, body, status=result.status)
        self.loaded_robots_hosts.add(host)
        self.manifest.append(
            ManifestEntry(url=robots_url, action="robots_loaded", status=result.status or 204)
        )
        logger.info("loaded robots.txt for %s status=%s", host, result.status)
        return True

    def _record_blocked(self, run_id: int, url: str, reason: str) -> None:
        upsert_source(
            self.conn,
            canonical_url=url,
            url_normalized=url,
            content_type=None,
            http_status=None,
            title=None,
            sha256=None,
            snapshot_path=None,
            js_rendered_likely=False,
            blocked=True,
            block_reason=reason,
        )
        log_error(
            self.conn,
            crawl_run_id=run_id,
            url=url,
            error_type="blocked",
            http_status=None,
            message=reason,
        )
        self.manifest.append(ManifestEntry(url=url, action="blocked", note=reason))

    def _observe_failure(self, run_id: int, url: str, result: FetchResult) -> None:
        source_id = upsert_source(
            self.conn,
            canonical_url=url,
            url_normalized=url,
            content_type=result.content_type,
            http_status=result.status,
            title=None,
            sha256=None,
            snapshot_path=None,
            js_rendered_likely=False,
            blocked=False,
            block_reason=None,
        )
        add_observation(
            self.conn,
            source_id=source_id,
            crawl_run_id=run_id,
            http_status=result.status,
            content_type=result.content_type,
            sha256=None,
            snapshot_path=None,
            nbytes=len(result.body) if result.body else 0,
            error=result.error,
            robots_allowed=True,
            js_rendered_likely=False,
            request_url=result.final_url or url,
            previous_sha256=previous_hash(self.conn, url),
        )

    def _write_manifest(self, run_id: int) -> str:
        relative = f"manifests/crawl-{run_id}.json"
        path = self.data_dir / relative
        path.parent.mkdir(parents=True, exist_ok=True)
        payload = {
            "run_id": run_id,
            "seed_set": self.seed_set,
            "dry_run": self.dry_run,
            "max_pages": self.max_pages,
            "finished_at": utcnow(),
            "stats": asdict(self.stats),
            "entries": [asdict(item) for item in self.manifest],
        }
        path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
        return relative
