from __future__ import annotations

import re
from dataclasses import dataclass
from datetime import datetime
from html import unescape

from bs4 import BeautifulSoup, Tag

from kurupam_collector.urls import normalize_url

ASSET_EXTENSIONS = {
    ".pdf": "pdf",
    ".jpg": "image",
    ".jpeg": "image",
    ".png": "image",
    ".gif": "image",
    ".webp": "image",
    ".tif": "image",
    ".tiff": "image",
    ".svg": "image",
    ".geojson": "geojson",
    ".json": "geojson",
    ".kml": "map",
    ".kmz": "map",
    ".xls": "spreadsheet",
    ".xlsx": "spreadsheet",
    ".csv": "spreadsheet",
    ".zip": "archive",
}

WORDPRESS_SIZE_RE = re.compile(r"-\d+x\d+(?=\.(?:jpe?g|png|gif|webp)$)", re.I)
JS_ROOT_RE = re.compile(r"id=['\"](?:root|app|__next)['\"]")
CAPTCHA_WIDGET_RE = re.compile(
    r"g-recaptcha|hcaptcha\.com|cf-turnstile|data-sitekey|google\.com/recaptcha",
    re.I,
)
LOGIN_RE = re.compile(r"\b(wp-login|sign in|log in|login required)\b", re.I)


@dataclass
class ExtractedLink:
    url: str
    text: str
    kind: str


@dataclass
class PageExtract:
    title: str | None
    headings: list[str]
    paragraphs: list[str]
    tables: list[list[list[str]]]
    links: list[ExtractedLink]
    document_links: list[ExtractedLink]
    image_links: list[ExtractedLink]
    publish_date: str | None
    last_updated_date: str | None
    main_text: str
    js_rendered_likely: bool
    blocked_reason: str | None


def parse_html(html: str, page_url: str) -> PageExtract:
    soup = BeautifulSoup(html, "html.parser")
    for tag in soup(["script", "style", "noscript"]):
        tag.decompose()

    title = _text(soup.title) if soup.title else None
    headings = [_text(tag) for tag in soup.find_all(re.compile(r"^h[1-6]$")) if _text(tag)]
    paragraphs = [_text(tag) for tag in soup.find_all("p") if _text(tag)]
    tables = [_table(tag) for tag in soup.find_all("table")]
    links: list[ExtractedLink] = []
    document_links: list[ExtractedLink] = []
    seen: set[str] = set()

    for anchor in soup.find_all("a", href=True):
        href = str(anchor.get("href") or "").strip()
        if not href or href.startswith(("mailto:", "tel:", "javascript:", "#")):
            continue
        try:
            url = normalize_url(href, base=page_url)
        except ValueError:
            continue
        if url in seen:
            continue
        seen.add(url)
        text = _text(anchor) or _nearby_caption(anchor)
        kind = classify_asset(url)
        item = ExtractedLink(url=url, text=text, kind=kind or "html")
        links.append(item)
        if kind and kind != "html":
            document_links.append(item)

    image_links = _image_links(soup, page_url)
    publish_date = _first_match(
        html,
        [
            r"Publish Date\s*[:\-]\s*([0-9]{1,2}[/-][0-9]{1,2}[/-][0-9]{2,4})",
            r"Posted on\s*[:\-]\s*([^<\n]+)",
        ],
    )
    last_updated = _first_match(
        html,
        [
            r"Last Updated\s*[:\-]\s*<strong>([^<]+)</strong>",
            r"Last Updated\s*[:\-]\s*([^<\n]+)",
        ],
    )
    main_text = " ".join(part for part in [title, *headings, *paragraphs] if part)
    js_likely, blocked = detect_challenges(html, soup, main_text)
    return PageExtract(
        title=title,
        headings=headings,
        paragraphs=paragraphs[:80],
        tables=tables[:20],
        links=links,
        document_links=document_links,
        image_links=image_links,
        publish_date=_clean_date(publish_date),
        last_updated_date=_clean_date(last_updated),
        main_text=main_text,
        js_rendered_likely=js_likely,
        blocked_reason=blocked,
    )


def detect_challenges(html: str, soup: BeautifulSoup, main_text: str) -> tuple[bool, str | None]:
    if _has_captcha_widget(soup, html):
        return False, "captcha"
    if soup.find("input", {"type": "password"}) or LOGIN_RE.search(html[:4000]):
        return False, "login"
    text_len = len(re.sub(r"\s+", " ", main_text))
    script_count = html.lower().count("<script")
    if text_len < 80 and script_count >= 5 and JS_ROOT_RE.search(html):
        return True, None
    if text_len < 40 and script_count >= 8:
        return True, None
    return False, None


def _has_captcha_widget(soup: BeautifulSoup, html: str) -> bool:
    if CAPTCHA_WIDGET_RE.search(html):
        return True
    for iframe in soup.find_all("iframe"):
        src = str(iframe.get("src") or "").lower()
        if any(token in src for token in ("recaptcha", "hcaptcha", "turnstile")):
            return True
    if soup.find(class_=re.compile(r"g-recaptcha|h-captcha", re.I)):
        return True
    return False


def classify_asset(url: str) -> str | None:
    path = url.split("?", 1)[0].lower()
    for ext, kind in ASSET_EXTENSIONS.items():
        if path.endswith(ext):
            if ext == ".json" and "geojson" not in path:
                return None
            return kind
    return None


def full_image_url(url: str) -> str:
    path, sep, query = url.partition("?")
    stripped = WORDPRESS_SIZE_RE.sub("", path)
    return stripped + (sep + query if query else "")


def _image_links(soup: BeautifulSoup, page_url: str) -> list[ExtractedLink]:
    found: list[ExtractedLink] = []
    seen: set[str] = set()
    for img in soup.find_all("img"):
        candidates = [img.get("src"), *(_srcset_urls(img.get("srcset")))]
        parent = img.find_parent("a")
        if parent and parent.get("href"):
            candidates.append(parent.get("href"))
        alt = str(img.get("alt") or "")
        caption = _nearby_caption(img) or alt
        for candidate in candidates:
            if not candidate:
                continue
            try:
                url = normalize_url(str(candidate), base=page_url)
            except ValueError:
                continue
            url = full_image_url(url)
            if url in seen:
                continue
            seen.add(url)
            kind = classify_asset(url) or "image"
            found.append(ExtractedLink(url=url, text=caption, kind=kind))
    return found


def _srcset_urls(srcset: str | None) -> list[str]:
    if not srcset:
        return []
    urls: list[str] = []
    for part in str(srcset).split(","):
        url = part.strip().split(" ")[0]
        if url:
            urls.append(url)
    return urls


def _nearby_caption(tag: Tag) -> str:
    gallery = tag.find_parent("dl", class_=re.compile("gallery-item"))
    if gallery:
        caption = gallery.find("dd", class_=re.compile("gallery-caption|wp-caption-text"))
        if caption:
            return _text(caption)
    figure = tag.find_parent("figure")
    if figure:
        cap = figure.find("figcaption")
        if cap:
            return _text(cap)
    return ""


def _table(tag: Tag) -> list[list[str]]:
    rows: list[list[str]] = []
    for tr in tag.find_all("tr"):
        cells = [_text(cell) for cell in tr.find_all(["th", "td"])]
        if any(cells):
            rows.append(cells)
    return rows


def _text(tag: Tag | None) -> str:
    if tag is None:
        return ""
    return unescape(re.sub(r"\s+", " ", tag.get_text(" ", strip=True))).strip()


def _first_match(html: str, patterns: list[str]) -> str | None:
    for pattern in patterns:
        match = re.search(pattern, html, re.I)
        if match:
            return unescape(re.sub(r"\s+", " ", match.group(1))).strip()
    return None


def _clean_date(value: str | None) -> str | None:
    if not value:
        return None
    text = value.strip()
    for fmt in ("%d/%m/%Y", "%d-%m-%Y", "%b %d, %Y", "%B %d, %Y", "%d %b %Y"):
        try:
            return datetime.strptime(text, fmt).date().isoformat()
        except ValueError:
            continue
    # Keep the original visible string rather than inventing a date.
    return text


@dataclass
class MandalStatsRow:
    mandal_name_as_published: str
    gram_panchayats: int | None
    villages: int | None
    row_cells: list[str]
    table_headers: list[str]


def extract_mandal_stats_tables(tables: list[list[list[str]]]) -> list[MandalStatsRow]:
    found: list[MandalStatsRow] = []
    for table in tables:
        if len(table) < 2:
            continue
        headers = [cell.strip() for cell in table[0]]
        if not _is_mandal_stats_table(headers):
            continue
        name_idx = _header_index(headers, ("mandal name", "mandal"))
        gp_idx = _header_index(headers, ("no.of gram panchayats", "gram panchayats", "no of gram panchayats"))
        village_idx = _header_index(headers, ("no. of villages", "no of villages", "villages"))
        if name_idx is None or gp_idx is None or village_idx is None:
            continue
        for row in table[1:]:
            if len(row) <= max(name_idx, gp_idx, village_idx):
                continue
            name = row[name_idx].strip()
            if not name:
                continue
            found.append(
                MandalStatsRow(
                    mandal_name_as_published=name,
                    gram_panchayats=_parse_int(row[gp_idx]),
                    villages=_parse_int(row[village_idx]),
                    row_cells=[cell.strip() for cell in row],
                    table_headers=headers,
                )
            )
    return found


def _is_mandal_stats_table(headers: list[str]) -> bool:
    joined = " ".join(headers).casefold()
    return "mandal" in joined and "panchayat" in joined and "village" in joined


def _header_index(headers: list[str], candidates: tuple[str, ...]) -> int | None:
    normalized = [header.casefold().strip() for header in headers]
    for candidate in candidates:
        if candidate in normalized:
            return normalized.index(candidate)
    for idx, header in enumerate(normalized):
        if any(candidate in header for candidate in candidates):
            return idx
    return None


def _parse_int(value: str) -> int | None:
    digits = re.sub(r"[^\d]", "", value or "")
    return int(digits) if digits else None


@dataclass
class GalleryItem:
    page_url: str
    caption: str
    thumbnail_url: str | None
    full_image_url: str | None


def extract_mandal_gallery(html: str, page_url: str) -> list[GalleryItem]:
    soup = BeautifulSoup(html, "html.parser")
    items: list[GalleryItem] = []
    for item in soup.select("dl.gallery-item"):
        anchor = item.find("a", href=True)
        img = item.find("img")
        caption_tag = item.find("dd", class_=re.compile("gallery-caption|wp-caption-text"))
        caption = _text(caption_tag)
        if not anchor:
            continue
        try:
            target = normalize_url(str(anchor.get("href")), base=page_url)
        except ValueError:
            continue
        thumb = None
        full = None
        if img and img.get("src"):
            try:
                thumb = normalize_url(str(img.get("src")), base=page_url)
                srcset = _srcset_urls(img.get("srcset"))
                widest = srcset[-1] if srcset else thumb
                full = full_image_url(normalize_url(widest, base=page_url))
            except ValueError:
                thumb = None
        items.append(
            GalleryItem(
                page_url=target,
                caption=caption,
                thumbnail_url=thumb,
                full_image_url=full,
            )
        )
    return items
