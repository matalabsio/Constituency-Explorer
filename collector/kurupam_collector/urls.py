from __future__ import annotations

from urllib.parse import parse_qsl, urlencode, urljoin, urlparse, urlunparse


DEFAULT_PORTS = {"http": 80, "https": 443}
TRACKING_PARAMS = {
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
    "fbclid",
    "gclid",
}


def normalize_url(url: str, base: str | None = None) -> str:
    raw = (url or "").strip()
    if not raw:
        raise ValueError("empty url")
    if base:
        raw = urljoin(base, raw)
    parsed = urlparse(raw)
    scheme = (parsed.scheme or "https").lower()
    if scheme not in {"http", "https"}:
        raise ValueError(f"unsupported scheme: {scheme}")
    if scheme == "http":
        scheme = "https"
    host = (parsed.hostname or "").lower()
    if not host:
        raise ValueError(f"missing host: {url}")
    port = parsed.port
    netloc = host
    if port and port != DEFAULT_PORTS.get(scheme):
        netloc = f"{host}:{port}"
    path = parsed.path or "/"
    if path != "/":
        path = path.replace("//", "/")
    query_pairs = [
        (k, v)
        for k, v in parse_qsl(parsed.query, keep_blank_values=True)
        if k.lower() not in TRACKING_PARAMS
    ]
    query_pairs.sort()
    query = urlencode(query_pairs, doseq=True)
    if _looks_like_directory(path) and not path.endswith("/"):
        path = f"{path}/"
    return urlunparse((scheme, netloc, path, "", query, ""))


def _looks_like_directory(path: str) -> bool:
    last = path.rsplit("/", 1)[-1]
    if not last:
        return True
    if "." not in last:
        return True
    return False


def host_of(url: str) -> str:
    return (urlparse(url).hostname or "").lower()


def path_of(url: str) -> str:
    return urlparse(url).path or "/"
