from __future__ import annotations

import json
import re
from dataclasses import dataclass
from html import unescape
from urllib.parse import urlparse

from bs4 import BeautifulSoup

from kurupam_collector.extract import _header_index, _parse_int
from kurupam_collector.urls import normalize_url

NOT_REPORTED_RE = re.compile(r"not reported|not available|n/a", re.I)
Villagecodes_MANDAL_PATH_RE = re.compile(
    r"/vizianagaram/([a-z0-9-]+-543048\d+)/?$",
    re.I,
)
Villagecodes_VILLAGE_PATH_RE = re.compile(
    r"/vizianagaram/([a-z0-9-]+-543048\d+)/([a-z0-9().@-]+-048\d+)/?$",
    re.I,
)


@dataclass
class VillageDirectoryRow:
    village_name: str
    census_village_code: str | None
    population: int | None
    households: int | None
    area: str | None
    pin_code: str | None
    nearest_town: str | None
    detail_url: str | None
    row_cells: list[str]


def is_villagecodes_mandal_list_url(url: str) -> bool:
    path = urlparse(url).path
    return bool(Villagecodes_MANDAL_PATH_RE.search(path)) and not Villagecodes_VILLAGE_PATH_RE.search(path)


def is_villagecodes_village_detail_url(url: str) -> bool:
    return bool(Villagecodes_VILLAGE_PATH_RE.search(urlparse(url).path))


def mandal_slug_from_villagecodes_url(url: str) -> str | None:
    path = urlparse(url).path
    match = Villagecodes_VILLAGE_PATH_RE.search(path) or Villagecodes_MANDAL_PATH_RE.search(path)
    if not match:
        return None
    return match.group(1).split("-543048")[0].lower()


def extract_villagecodes_jsonld_villages(html: str, page_url: str) -> list[tuple[str, str]]:
    found: list[tuple[str, str]] = []
    for script in BeautifulSoup(html, "html.parser").find_all("script", type="application/ld+json"):
        raw = script.string or script.get_text()
        if not raw or "ItemList" not in raw:
            continue
        try:
            payload = json.loads(raw)
        except json.JSONDecodeError:
            continue
        if payload.get("@type") != "ItemList":
            continue
        for item in payload.get("itemListElement") or []:
            name = str(item.get("name") or "").strip()
            detail = str(item.get("url") or "").strip()
            if not name or not detail:
                continue
            try:
                found.append((name, normalize_url(detail, base=page_url)))
            except ValueError:
                continue
    return found


def extract_villagecodes_directory_rows(tables: list[list[list[str]]], html: str, page_url: str) -> list[VillageDirectoryRow]:
    jsonld = {name: url for name, url in extract_villagecodes_jsonld_villages(html, page_url)}
    rows: list[VillageDirectoryRow] = []
    for table in tables:
        if len(table) < 2:
            continue
        headers = [cell.strip() for cell in table[0]]
        joined = " ".join(headers).casefold()
        if "village code" not in joined or "population" not in joined:
            continue
        name_idx = _header_index(headers, ("village",))
        code_idx = _header_index(headers, ("village code", "census village code"))
        pop_idx = _header_index(headers, ("population",))
        hh_idx = _header_index(headers, ("households",))
        area_idx = _header_index(headers, ("area",))
        pin_idx = _header_index(headers, ("pin code", "pincode"))
        town_idx = _header_index(headers, ("nearest town",))
        if name_idx is None:
            continue
        for row in table[1:]:
            if len(row) <= name_idx:
                continue
            name = row[name_idx].strip()
            if not name or name.casefold() in {"village", "total"}:
                continue
            code = _cell(row, code_idx)
            rows.append(
                VillageDirectoryRow(
                    village_name=name,
                    census_village_code=code,
                    population=_parse_int(_cell(row, pop_idx) or ""),
                    households=_parse_int(_cell(row, hh_idx) or ""),
                    area=_clean_optional(_cell(row, area_idx)),
                    pin_code=_clean_optional(_cell(row, pin_idx)),
                    nearest_town=_clean_optional(_cell(row, town_idx)),
                    detail_url=jsonld.get(name),
                    row_cells=[cell.strip() for cell in row],
                )
            )
    if rows:
        return rows
    # Fallback to JSON-LD only when table parsing fails.
    return [
        VillageDirectoryRow(
            village_name=name,
            census_village_code=None,
            population=None,
            households=None,
            area=None,
            pin_code=None,
            nearest_town=None,
            detail_url=url,
            row_cells=[name],
        )
        for name, url in jsonld.items()
    ]


def extract_villagecodes_detail_fields(html: str) -> dict[str, str | int | None]:
    soup = BeautifulSoup(html, "html.parser")
    fields: dict[str, str | int | None] = {}
    for table in soup.find_all("table"):
        for tr in table.find_all("tr"):
            cells = [unescape(re.sub(r"\s+", " ", td.get_text(" ", strip=True))) for td in tr.find_all(["th", "td"])]
            if len(cells) != 2:
                continue
            key, value = cells[0].strip(), cells[1].strip()
            if key.lower() in {"field", "land-use field"} or not key:
                continue
            fields[_normalize_field_key(key)] = _coerce_field_value(value)
    return fields


def _normalize_field_key(key: str) -> str:
    normalized = re.sub(r"[^a-z0-9]+", "_", key.casefold()).strip("_")
    mapping = {
        "village_name": "village_name",
        "census_village_code": "census_village_code",
        "mandal_sub_district": "mandal_name_as_published",
        "sub_district_code": "sub_district_code",
        "census_year": "census_year",
        "male_population": "population_male",
        "female_population": "population_female",
        "scheduled_castes_population": "population_sc",
        "scheduled_tribes_population": "population_st",
        "sex_ratio": "sex_ratio",
        "population_density": "population_density",
        "pin_code": "pin_code",
        "gram_panchayat": "gram_panchayat",
        "nearest_statutory_town": "nearest_town",
        "nearest_statutory_town_distance": "nearest_town_distance_km",
        "cd_block": "cd_block",
    }
    return mapping.get(normalized, normalized)


def _coerce_field_value(value: str) -> str | int | None:
    cleaned = _clean_optional(value)
    if cleaned is None:
        return None
    digits = re.sub(r"[^\d]", "", cleaned)
    if digits and cleaned.replace(",", "").isdigit():
        return int(digits)
    if re.fullmatch(r"[\d,]+", cleaned):
        return int(cleaned.replace(",", ""))
    return cleaned


def _cell(row: list[str], index: int | None) -> str | None:
    if index is None or len(row) <= index:
        return None
    return row[index].strip() or None


def _clean_optional(value: str | None) -> str | None:
    if not value:
        return None
    text = value.strip()
    if not text or NOT_REPORTED_RE.search(text):
        return None
    return text
