import { getDb, isSqliteReadonly } from "@/lib/db";
import bundledPolling from "@/data/kurupam-polling-stations.json";
import {
  TARGET_MANDAL_LABELS,
  TARGET_MANDAL_SLUGS,
  type MandalProfile,
  type MandalRecordRef,
  type TargetMandalSlug,
  asNumber,
  asString,
  parseValue,
  worstReviewStatus,
} from "@/lib/mandals";

export type CrawlRun = {
  id: number;
  started_at: string;
  finished_at: string | null;
  status: string;
  seed_set: string;
  max_pages: number;
  pages_fetched: number;
  pages_discovered: number;
  records_extracted: number;
  documents_downloaded: number;
  errors_count: number;
  blocked_count: number;
  dry_run: number;
  notes: string | null;
  manifest_path: string | null;
};

export type MandalRow = {
  id: number;
  mandal_name: string;
  entity_slug: string;
  category: string;
  context_snippet: string | null;
  source_url: string;
  source_title: string | null;
  fetched_at: string;
  review_status: string;
  source_published_date: string | null;
  value_json: string;
};

export type SourceRow = {
  id: number;
  canonical_url: string;
  content_type: string | null;
  last_http_status: number | null;
  first_seen_at: string;
  last_seen_at: string;
  last_content_sha256: string | null;
  last_snapshot_path: string | null;
  title: string | null;
  blocked: number;
  block_reason: string | null;
  js_rendered_likely: number;
};

export type AssetRow = {
  id: number;
  canonical_url: string;
  content_type: string | null;
  kind: string | null;
  sha256: string | null;
  snapshot_path: string | null;
  downloaded_at: string | null;
  bytes: number | null;
  skipped_duplicate: number;
  entity_slug: string | null;
  entity_name: string | null;
};

export type ReviewRow = MandalRow & {
  content_sha256: string;
  raw_snapshot_path: string | null;
};

export type Overview = {
  lastRun: CrawlRun | null;
  pagesDiscovered: number;
  recordsExtracted: number;
  documentsDownloaded: number;
  errors: number;
  blocked: number;
  pendingReview: number;
};

function emptyOverview(): Overview {
  return {
    lastRun: null,
    pagesDiscovered: 0,
    recordsExtracted: 0,
    documentsDownloaded: 0,
    errors: 0,
    blocked: 0,
    pendingReview: 0,
  };
}

export function getOverview(): Overview {
  const db = getDb();
  if (!db) return emptyOverview();
  const lastRun = db
    .prepare("SELECT * FROM crawl_runs ORDER BY id DESC LIMIT 1")
    .get() as CrawlRun | undefined;
  const counts = db
    .prepare(
      `SELECT
         (SELECT COUNT(*) FROM sources) AS pages_discovered,
         (SELECT COUNT(*) FROM extracted_records) AS records_extracted,
         (SELECT COUNT(*) FROM assets WHERE skipped_duplicate = 0) AS documents_downloaded,
         (SELECT COUNT(*) FROM crawl_errors WHERE error_type != 'blocked') AS errors,
         (SELECT COUNT(*) FROM sources WHERE blocked = 1) AS blocked,
         (SELECT COUNT(*) FROM extracted_records WHERE review_status = 'pending') AS pending_review`
    )
    .get() as {
      pages_discovered: number;
      records_extracted: number;
      documents_downloaded: number;
      errors: number;
      blocked: number;
      pending_review: number;
    };
  return {
    lastRun: lastRun ?? null,
    pagesDiscovered: counts.pages_discovered,
    recordsExtracted: counts.records_extracted,
    documentsDownloaded: counts.documents_downloaded,
    errors: counts.errors,
    blocked: counts.blocked,
    pendingReview: counts.pending_review,
  };
}

import type { VillageRow } from "@/lib/types";

export type { VillageRow };

function mergeVillageRecords(rows: MandalRow[]): VillageRow[] {
  const grouped = new Map<string, { directory?: MandalRow; detail?: MandalRow }>();
  for (const row of rows) {
    if (!["village_directory", "village_detail"].includes(row.category)) continue;
    const value = parseValue(row.value_json);
    const code = String(value.census_village_code ?? "").trim();
    const name = String(value.village_name ?? row.context_snippet ?? "").trim();
    const key = `${row.entity_slug}:${code || name.toLowerCase()}`;
    const bucket = grouped.get(key) ?? {};
    if (row.category === "village_directory" && !bucket.directory) bucket.directory = row;
    if (row.category === "village_detail" && !bucket.detail) bucket.detail = row;
    grouped.set(key, bucket);
  }

  const merged: VillageRow[] = [];
  for (const [key, bucket] of grouped.entries()) {
    const directory = bucket.directory;
    const detail = bucket.detail;
    const base = detail ?? directory;
    if (!base) continue;
    const dirValue = parseValue(directory?.value_json);
    const detailValue = parseValue(detail?.value_json);
    merged.push({
      id: key,
      entity_slug: base.entity_slug,
      mandal_name: TARGET_MANDAL_LABELS[base.entity_slug as TargetMandalSlug] ?? base.mandal_name,
      village_name: String(detailValue.village_name ?? dirValue.village_name ?? "Unknown"),
      census_village_code: String(
        detailValue.census_village_code ?? dirValue.census_village_code ?? ""
      ) || null,
      gram_panchayat: asString(detailValue.gram_panchayat),
      population: asNumber(detailValue.population ?? dirValue.population),
      households: asNumber(detailValue.households ?? dirValue.households),
      population_male: asNumber(detailValue.population_male),
      population_female: asNumber(detailValue.population_female),
      population_sc: asNumber(detailValue.population_sc),
      population_st: asNumber(detailValue.population_st),
      area: asString(detailValue.area ?? dirValue.area),
      pin_code: asString(detailValue.pin_code ?? dirValue.pin_code),
      nearest_town: asString(detailValue.nearest_town ?? dirValue.nearest_town),
      census_year: asString(detailValue.census_year ?? dirValue.census_year) ?? "2011",
      sex_ratio: asString(detailValue.sex_ratio),
      population_density: asString(detailValue.population_density),
      cd_block: asString(detailValue.cd_block),
      nearest_town_distance_km: asString(detailValue.nearest_town_distance_km),
      sub_district_code: asString(detailValue.sub_district_code),
      district: asString(detailValue.district) ?? "Vizianagaram",
      state: asString(detailValue.state) ?? "Andhra Pradesh",
      has_detail: Boolean(detail),
    });
  }

  return merged.sort((a, b) =>
    a.mandal_name.localeCompare(b.mandal_name) || a.village_name.localeCompare(b.village_name)
  );
}

export function getVillageRows(): VillageRow[] {
  const db = getDb();
  if (!db) return [];
  const rows = db
    .prepare(
      `SELECT
         r.id,
         COALESCE(e.display_name, r.entity_slug) AS mandal_name,
         r.entity_slug,
         r.category,
         r.context_snippet,
         r.source_url,
         r.source_title,
         r.fetched_at,
         r.review_status,
         r.source_published_date,
         r.value_json
       FROM extracted_records r
       LEFT JOIN entities e ON e.id = r.entity_id
       WHERE r.entity_slug IN (${TARGET_MANDAL_SLUGS.map(() => "?").join(", ")})
         AND r.category IN ('village_directory', 'village_detail')
       ORDER BY r.entity_slug, r.category, r.fetched_at DESC`
    )
    .all(...TARGET_MANDAL_SLUGS) as MandalRow[];
  return mergeVillageRecords(rows);
}

export function getVillageSummary() {
  const villages = getVillageRows();
  const byMandal = TARGET_MANDAL_SLUGS.map((slug) => ({
    slug,
    name: TARGET_MANDAL_LABELS[slug],
    collected: villages.filter((v) => v.entity_slug === slug).length,
    withDetail: villages.filter((v) => v.entity_slug === slug && v.has_detail).length,
  }));
  return {
    total: villages.length,
    withDetail: villages.filter((v) => v.has_detail).length,
    byMandal,
  };
}

export function getMandalRows(): MandalRow[] {
  const db = getDb();
  if (!db) return [];
  return db
    .prepare(
      `SELECT
         r.id,
         COALESCE(e.display_name, r.entity_slug) AS mandal_name,
         r.entity_slug,
         r.category,
         r.context_snippet,
         r.source_url,
         r.source_title,
         r.fetched_at,
         r.review_status,
         r.source_published_date,
         r.value_json
       FROM extracted_records r
       LEFT JOIN entities e ON e.id = r.entity_id
       WHERE r.entity_slug IN (${TARGET_MANDAL_SLUGS.map(() => "?").join(", ")})
         AND r.category IN ('mandal_admin_stats', 'mandal_map', 'mandal_map_page')
       ORDER BY r.entity_slug, r.category, r.id`
    )
    .all(...TARGET_MANDAL_SLUGS) as MandalRow[];
}

type RawMandalRecord = MandalRow & { entity_slug: string };

function toRecordRef(row: RawMandalRecord): MandalRecordRef {
  return {
    id: row.id,
    category: row.category,
    review_status: row.review_status,
    source_url: row.source_url,
    source_title: row.source_title,
    fetched_at: row.fetched_at,
    context_snippet: row.context_snippet,
  };
}

export function getMandalProfiles(): MandalProfile[] {
  const rows = getMandalRows();
  const bySlug = new Map<TargetMandalSlug, RawMandalRecord[]>();
  for (const slug of TARGET_MANDAL_SLUGS) {
    bySlug.set(slug, []);
  }
  for (const row of rows) {
    const slug = row.entity_slug as TargetMandalSlug;
    if (bySlug.has(slug)) {
      bySlug.get(slug)!.push(row);
    }
  }

  return TARGET_MANDAL_SLUGS.map((slug) => {
    const records = bySlug.get(slug) ?? [];
    const latest = (category: string) =>
      records
        .filter((row) => row.category === category)
        .sort((a, b) => b.fetched_at.localeCompare(a.fetched_at))[0];

    const admin = latest("mandal_admin_stats");
    const map = latest("mandal_map");
    const mapPage = latest("mandal_map_page");

    const adminValue = parseValue(admin?.value_json);
    const mapValue = parseValue(map?.value_json);
    const mapPageValue = parseValue(mapPage?.value_json);

    const gramPanchayats = asNumber(adminValue.gram_panchayats);
    const villages = asNumber(adminValue.villages);
    const nameAsPublished =
      asString(adminValue.mandal_name_as_published) ??
      asString(mapValue.caption_as_published)?.replace(/\s+Mandal$/i, "") ??
      asString(mapPageValue.mandal_name)?.replace(/\s+Mandal$/i, "") ??
      null;

    const mapPageUrl =
      asString(mapValue.map_page_url) ??
      (mapPage?.source_url ?? null);
    const mapImageUrl =
      asString(mapValue.map_image_url) ??
      (Array.isArray(mapPageValue.map_image_urls) && mapPageValue.map_image_urls[0]
        ? String(mapPageValue.map_image_urls[0])
        : null);
    const mapPublishDate =
      asString(mapPageValue.publish_date_on_page) ??
      asString(admin?.source_published_date);

    const missingFields: string[] = [];
    if (gramPanchayats === null) missingFields.push("Gram Panchayats");
    if (villages === null) missingFields.push("Villages");
    if (!mapPageUrl) missingFields.push("Map page");
    if (!mapImageUrl) missingFields.push("Map image");

    const completeness =
      missingFields.length === 0
        ? "complete"
        : missingFields.length >= 4
          ? "missing"
          : "partial";

    const reviewStatus = worstReviewStatus(
      records.map((row) => row.review_status).filter(Boolean)
    );

    return {
      slug,
      displayName: TARGET_MANDAL_LABELS[slug],
      nameAsPublished,
      gramPanchayats,
      villages,
      mapPageUrl,
      mapImageUrl,
      mapPublishDate,
      adminStats: admin ? toRecordRef(admin) : null,
      mandalMap: map ? toRecordRef(map) : null,
      mandalMapPage: mapPage ? toRecordRef(mapPage) : null,
      reviewStatus: records.length ? reviewStatus : "missing",
      completeness,
      missingFields,
    };
  });
}

export function getSources(): SourceRow[] {
  const db = getDb();
  if (!db) return [];
  return db
    .prepare(
      `SELECT id, canonical_url, content_type, last_http_status, first_seen_at, last_seen_at,
              last_content_sha256, last_snapshot_path, title, blocked, block_reason, js_rendered_likely
       FROM sources
       ORDER BY last_seen_at DESC, id DESC`
    )
    .all() as SourceRow[];
}

export function getAssets(): AssetRow[] {
  const db = getDb();
  if (!db) return [];
  return db
    .prepare(
      `SELECT a.id, a.canonical_url, a.content_type, a.kind, a.sha256, a.snapshot_path,
              a.downloaded_at, a.bytes, a.skipped_duplicate, e.slug AS entity_slug,
              e.display_name AS entity_name
       FROM assets a
       LEFT JOIN entities e ON e.id = a.associated_entity_id
       ORDER BY a.id DESC`
    )
    .all() as AssetRow[];
}

export function getReviewQueue(): ReviewRow[] {
  const db = getDb();
  if (!db) return [];
  return db
    .prepare(
      `SELECT
         r.id,
         COALESCE(e.display_name, r.entity_slug) AS mandal_name,
         r.entity_slug,
         r.category,
         r.context_snippet,
         r.source_url,
         r.source_title,
         r.fetched_at,
         r.review_status,
         r.source_published_date,
         r.value_json,
         r.content_sha256,
         r.raw_snapshot_path
       FROM extracted_records r
       LEFT JOIN entities e ON e.id = r.entity_id
       ORDER BY CASE r.review_status WHEN 'pending' THEN 0 ELSE 1 END, r.id DESC`
    )
    .all() as ReviewRow[];
}

export type ExportRow = {
  entity: string;
  category: string;
  value_json: string;
  source_url: string;
  source_title: string | null;
  source_published_date: string | null;
  fetched_at: string;
  content_sha256: string;
  raw_snapshot_path: string | null;
  review_status: string;
};

export function getApprovedExportRows(): ExportRow[] {
  const db = getDb();
  if (!db) return [];
  return db
    .prepare(
      `SELECT entity_slug AS entity, category, value_json, source_url, source_title,
              source_published_date, fetched_at, content_sha256, raw_snapshot_path, review_status
       FROM extracted_records
       WHERE review_status = 'approved'
       ORDER BY id`
    )
    .all() as ExportRow[];
}

export function getAllExportRows(): ExportRow[] {
  const db = getDb();
  if (!db) return [];
  return db
    .prepare(
      `SELECT entity_slug AS entity, category, value_json, source_url, source_title,
              source_published_date, fetched_at, content_sha256, raw_snapshot_path, review_status
       FROM extracted_records
       ORDER BY id`
    )
    .all() as ExportRow[];
}

export type ConstituencyElectorate = {
  constituencyName: string;
  reservation: string;
  lokSabhaSegment: string | null;
  district: string | null;
  totalRegisteredVoters: number;
  maleVoters: number;
  femaleVoters: number;
  thirdGenderVoters: number;
  sexRatio: number;
  sexRatioLabel: string;
  turnoutPct: number | null;
  votesPolled: number | null;
  dataYear: string;
  sourceUrl: string;
  reviewStatus: string;
};

export type ConstituencyProfile = {
  constituencyName: string;
  district: string;
  lokSabhaSegment: string;
  reservation: string;
  includedMandals: string[];
  ruralElectorPct: number | null;
  stElectorConcentrationPct: number | null;
  borderNotes: string | null;
  rivers: string[];
  postalCode: string | null;
  nearestTown: string | null;
  nearestTownKm: number | null;
  heritage: string | null;
  sourceUrl: string;
};

export type ElectionCandidate = {
  name: string;
  party: string;
  votes: number;
};

export type ElectionResult = {
  year: number;
  totalRegisteredVoters: number;
  turnoutPct: number;
  votesPolled: number;
  winner: ElectionCandidate;
  runnerUp: ElectionCandidate;
  victoryMargin: number;
};

export type ConstituencyElections = {
  constituencyName: string;
  elections: ElectionResult[];
  sourceUrl: string;
};

export type MptcReservationGroup = {
  category: string;
  description: string;
  exampleWard: string;
};

export type MptcReservation = {
  mandalName: string;
  totalSeats: number;
  reservationGroups: MptcReservationGroup[];
  womenQuotaPct: number;
  womenQuotaNote: string;
  verificationPortal: string | null;
  sourceUrl: string;
  reviewStatus: string;
};

export type PollingStationPart = {
  partNo: number;
  name: string;
};

export type PollingStations = {
  assemblyNo: number;
  assemblyName: string;
  assemblyNameTe: string | null;
  reservation: string;
  state: string;
  stateCode: string | null;
  district: string;
  districtCode: string | null;
  parliamentName: string;
  parliamentNameTe: string | null;
  totalParts: number;
  uniqueNames: number;
  availableRolls: string[];
  parts: PollingStationPart[];
  sourceUrl: string;
  reviewStatus: string;
};

function latestRecord(category: string, entitySlug?: string): MandalRow | null {
  const db = getDb();
  if (!db) return null;
  const params: string[] = [category];
  let sql = `
    SELECT
      r.id,
      COALESCE(e.display_name, r.entity_slug) AS mandal_name,
      r.entity_slug,
      r.category,
      r.context_snippet,
      r.source_url,
      r.source_title,
      r.fetched_at,
      r.review_status,
      r.source_published_date,
      r.value_json
    FROM extracted_records r
    LEFT JOIN entities e ON e.id = r.entity_id
    WHERE r.category = ?
  `;
  if (entitySlug) {
    sql += " AND r.entity_slug = ?";
    params.push(entitySlug);
  }
  sql += " ORDER BY r.fetched_at DESC LIMIT 1";
  return (db.prepare(sql).get(...params) as MandalRow | undefined) ?? null;
}

export function getConstituencyElectorate(): ConstituencyElectorate | null {
  const row = latestRecord("constituency_electorate", "kurupam-constituency");
  if (!row) return null;
  const value = parseValue(row.value_json);
  const male = asNumber(value.male_voters) ?? 0;
  const female = asNumber(value.female_voters) ?? 0;
  const third = asNumber(value.third_gender_voters) ?? 0;
  const totalFromFields = male + female + third;
  return {
    constituencyName: asString(value.constituency_name) ?? "Kurupam (ST)",
    reservation: asString(value.reservation) ?? "Scheduled Tribe (ST)",
    lokSabhaSegment: asString(value.lok_sabha_segment),
    district: asString(value.district),
    totalRegisteredVoters: asNumber(value.total_registered_voters) ?? totalFromFields,
    maleVoters: male,
    femaleVoters: female,
    thirdGenderVoters: third,
    sexRatio: asNumber(value.electorate_sex_ratio) ?? 0,
    sexRatioLabel:
      asString(value.electorate_sex_ratio_label) ??
      `${asNumber(value.electorate_sex_ratio) ?? "—"} female voters per 1,000 male voters`,
    turnoutPct: asNumber(value.turnout_pct),
    votesPolled: asNumber(value.votes_polled),
    dataYear: asString(value.data_year) ?? "2024",
    sourceUrl: row.source_url,
    reviewStatus: row.review_status,
  };
}

export function getConstituencyProfile(): ConstituencyProfile | null {
  const row = latestRecord("constituency_profile", "kurupam-constituency");
  if (!row) return null;
  const value = parseValue(row.value_json);
  const mandals = Array.isArray(value.included_mandals)
    ? value.included_mandals.map((m: unknown) => String(m))
    : [];
  const rivers = Array.isArray(value.rivers) ? value.rivers.map((r: unknown) => String(r)) : [];
  return {
    constituencyName: asString(value.constituency_name) ?? "Kurupam (ST)",
    district: asString(value.district) ?? "Parvathipuram Manyam",
    lokSabhaSegment: asString(value.lok_sabha_segment) ?? "Araku",
    reservation: asString(value.reservation) ?? "Scheduled Tribe (ST)",
    includedMandals: mandals,
    ruralElectorPct: asNumber(value.rural_elector_pct),
    stElectorConcentrationPct: asNumber(value.st_elector_concentration_pct),
    borderNotes: asString(value.border_notes),
    rivers,
    postalCode: asString(value.postal_code),
    nearestTown: asString(value.nearest_town),
    nearestTownKm: asNumber(value.nearest_town_km),
    heritage: asString(value.heritage),
    sourceUrl: row.source_url,
  };
}

export function getElectionResults(): ConstituencyElections | null {
  const row = latestRecord("election_results", "kurupam-constituency");
  if (!row) return null;
  const value = parseValue(row.value_json);
  const elections = Array.isArray(value.elections)
    ? value.elections.map((e: Record<string, unknown>) => {
        const winner = (e.winner ?? {}) as Record<string, unknown>;
        const runnerUp = (e.runner_up ?? {}) as Record<string, unknown>;
        return {
          year: asNumber(e.year) ?? 0,
          totalRegisteredVoters: asNumber(e.total_registered_voters) ?? 0,
          turnoutPct: asNumber(e.turnout_pct) ?? 0,
          votesPolled: asNumber(e.votes_polled) ?? 0,
          winner: {
            name: asString(winner.name) ?? "",
            party: asString(winner.party) ?? "",
            votes: asNumber(winner.votes) ?? 0,
          },
          runnerUp: {
            name: asString(runnerUp.name) ?? "",
            party: asString(runnerUp.party) ?? "",
            votes: asNumber(runnerUp.votes) ?? 0,
          },
          victoryMargin: asNumber(e.victory_margin) ?? 0,
        };
      })
    : [];
  return {
    constituencyName: asString(value.constituency_name) ?? "Kurupam (ST)",
    elections: elections.sort((a, b) => b.year - a.year),
    sourceUrl: row.source_url,
  };
}

export function getPollingStations(): PollingStations | null {
  const row = latestRecord("polling_stations", "kurupam-constituency");
  if (row) return mapPollingStations(parseValue(row.value_json), row.source_url, row.review_status);
  return mapPollingStations(
    bundledPolling.value as Record<string, unknown>,
    bundledPolling.source_url,
    bundledPolling.review_status
  );
}

function mapPollingStations(
  value: Record<string, unknown>,
  sourceUrl: string,
  reviewStatus: string
): PollingStations | null {
  const parts: PollingStationPart[] = Array.isArray(value.parts)
    ? value.parts
        .map((p: Record<string, unknown>) => ({
          partNo: asNumber(p.part_no) ?? 0,
          name: asString(p.name) ?? "",
        }))
        .filter((p: PollingStationPart) => p.partNo > 0 && p.name)
        .sort((a: PollingStationPart, b: PollingStationPart) => a.partNo - b.partNo)
    : [];
  const uniqueNames = new Set(parts.map((p) => p.name.trim().toLowerCase())).size;
  const rolls = Array.isArray(value.available_rolls)
    ? value.available_rolls.map((r: unknown) => String(r))
    : [];
  return {
    assemblyNo: asNumber(value.assembly_no) ?? 11,
    assemblyName: asString(value.assembly_name) ?? "Kurupam",
    assemblyNameTe: asString(value.assembly_name_te),
    reservation: asString(value.reservation) ?? "ST",
    state: asString(value.state) ?? "Andhra Pradesh",
    stateCode: asString(value.state_code),
    district: asString(value.district) ?? "Parvathipuram Manyam",
    districtCode: asString(value.district_code),
    parliamentName: asString(value.parliament_name) ?? "Araku",
    parliamentNameTe: asString(value.parliament_name_te),
    totalParts: asNumber(value.total_parts) ?? parts.length,
    uniqueNames,
    availableRolls: rolls,
    parts,
    sourceUrl,
    reviewStatus,
  };
}

export function getMptcReservation(entitySlug: string): MptcReservation | null {
  const row = latestRecord("mptc_reservation", entitySlug);
  if (!row) return null;
  const value = parseValue(row.value_json);
  const groups = Array.isArray(value.reservation_groups)
    ? value.reservation_groups.map((g: Record<string, unknown>) => ({
        category: asString(g.category) ?? "",
        description: asString(g.description) ?? "",
        exampleWard: asString(g.example_ward) ?? "",
      }))
    : [];
  return {
    mandalName: asString(value.mandal_name) ?? row.mandal_name,
    totalSeats: asNumber(value.total_mptc_seats) ?? 0,
    reservationGroups: groups,
    womenQuotaPct: asNumber(value.women_quota_pct) ?? 50,
    womenQuotaNote: asString(value.women_quota_note) ?? "",
    verificationPortal: asString(value.verification_portal),
    sourceUrl: row.source_url,
    reviewStatus: row.review_status,
  };
}

export function updateReviewStatus(
  id: number,
  status: string,
  classification: string | null,
  note: string | null
) {
  const db = getDb();
  if (!db) throw new Error("database not initialized");
  if (isSqliteReadonly()) {
    throw new Error("Review writes are disabled on this deployment (read-only database).");
  }
  const allowed = new Set(["pending", "approved", "rejected", "outdated"]);
  if (!allowed.has(status)) throw new Error("invalid status");
  const current = db
    .prepare("SELECT review_status FROM extracted_records WHERE id = ?")
    .get(id) as { review_status: string } | undefined;
  if (!current) throw new Error("record not found");
  const now = new Date().toISOString();
  db.prepare(
    `UPDATE extracted_records
     SET review_status = ?, updated_at = ?, category = COALESCE(?, category)
     WHERE id = ?`
  ).run(status, now, classification, id);
  db.prepare(
    `INSERT INTO review_status (
       extracted_record_id, previous_status, new_status, classification, note, actor, created_at
     ) VALUES (?, ?, ?, ?, ?, 'admin', ?)`
  ).run(id, current.review_status, status, classification, note, now);
}
