from __future__ import annotations

import logging
import time
import urllib.error
import urllib.request
from dataclasses import dataclass

logger = logging.getLogger("kurupam.http")


@dataclass
class FetchResult:
    url: str
    status: int | None
    content_type: str | None
    body: bytes
    error: str | None = None
    final_url: str | None = None


class ThrottledFetcher:
    def __init__(self, user_agent: str, min_interval: float, timeout: float) -> None:
        self.user_agent = user_agent
        self.min_interval = min_interval
        self.timeout = timeout
        self._last_request_at = 0.0

    def fetch(self, url: str, *, extra_interval: float = 0.0) -> FetchResult:
        self._wait(extra_interval)
        request = urllib.request.Request(
            url,
            headers={
                "User-Agent": self.user_agent,
                "Accept": "text/html,application/xhtml+xml,application/pdf,image/*,*/*;q=0.8",
                "Accept-Language": "en-IN,en;q=0.9",
            },
            method="GET",
        )
        try:
            with urllib.request.urlopen(request, timeout=self.timeout) as response:
                body = response.read()
                status = getattr(response, "status", None) or response.getcode()
                content_type = response.headers.get("Content-Type")
                final_url = response.geturl()
                logger.info("GET %s -> %s (%s bytes)", url, status, len(body))
                return FetchResult(
                    url=url,
                    status=int(status) if status else None,
                    content_type=content_type,
                    body=body,
                    final_url=final_url,
                )
        except urllib.error.HTTPError as exc:
            body = b""
            try:
                body = exc.read() or b""
            except Exception:
                body = b""
            logger.warning("GET %s -> HTTP %s %s", url, exc.code, exc.reason)
            return FetchResult(
                url=url,
                status=int(exc.code),
                content_type=exc.headers.get("Content-Type") if exc.headers else None,
                body=body,
                error=f"HTTP {exc.code} {exc.reason}",
                final_url=exc.geturl() if hasattr(exc, "geturl") else url,
            )
        except Exception as exc:  # noqa: BLE001 - record network failures
            logger.error("GET %s failed: %s", url, exc)
            return FetchResult(url=url, status=None, content_type=None, body=b"", error=str(exc))

    def _wait(self, extra_interval: float) -> None:
        interval = max(self.min_interval, extra_interval)
        elapsed = time.monotonic() - self._last_request_at
        if self._last_request_at and elapsed < interval:
            time.sleep(interval - elapsed)
        self._last_request_at = time.monotonic()
