from __future__ import annotations

from urllib.parse import urlparse
from urllib.robotparser import RobotFileParser

from kurupam_collector.urls import host_of, normalize_url


class RobotsCache:
    """Fetch and cache robots.txt per host. Fail closed if robots cannot be read."""

    def __init__(self, user_agent: str) -> None:
        self.user_agent = user_agent
        self._parsers: dict[str, RobotFileParser] = {}
        self._fetch_errors: dict[str, str] = {}

    def load_from_body(self, robots_url: str, body: str, status: int | None = None) -> None:
        host = host_of(robots_url)
        parser = RobotFileParser()
        parser.set_url(robots_url)
        if status in {401, 403}:
            # RFC 9309: 401/403 means disallow all.
            parser.parse(["User-agent: *", "Disallow: /"])
        elif not body.strip():
            parser.parse([])
        else:
            parser.parse(body.splitlines())
        self._parsers[host] = parser

    def mark_fetch_error(self, host: str, message: str) -> None:
        self._fetch_errors[host] = message

    def robots_url_for(self, page_url: str) -> str:
        parsed = urlparse(normalize_url(page_url))
        return f"{parsed.scheme}://{parsed.netloc}/robots.txt"

    def allowed(self, url: str) -> tuple[bool, str | None]:
        host = host_of(url)
        if host in self._fetch_errors:
            return False, f"robots.txt unread for {host}: {self._fetch_errors[host]}"
        parser = self._parsers.get(host)
        if parser is None:
            return False, f"robots.txt not loaded for {host}"
        if parser.can_fetch(self.user_agent, url):
            return True, None
        return False, "disallowed by robots.txt"

    def crawl_delay(self, url: str) -> float | None:
        parser = self._parsers.get(host_of(url))
        if parser is None:
            return None
        delay = parser.crawl_delay(self.user_agent)
        if delay is None:
            delay = parser.crawl_delay("*")
        return float(delay) if delay is not None else None
