export const TARGET_MANDAL_SLUGS = [
  "komarada",
  "gummalakshmipuram",
  "kurupam",
  "jiyammavalasa",
  "garugubilli",
] as const;

export type TargetMandalSlug = (typeof TARGET_MANDAL_SLUGS)[number];

export const TARGET_MANDAL_LABELS: Record<TargetMandalSlug, string> = {
  komarada: "Komarada",
  gummalakshmipuram: "Gummalakshmipuram",
  kurupam: "Kurupam",
  jiyammavalasa: "Jiyammavalasa",
  garugubilli: "Garugubilli",
};

export type RecordValue = Record<string, unknown>;

export type MandalRecordRef = {
  id: number;
  category: string;
  review_status: string;
  source_url: string;
  source_title: string | null;
  fetched_at: string;
  context_snippet: string | null;
};

export type MandalProfile = {
  slug: TargetMandalSlug;
  displayName: string;
  nameAsPublished: string | null;
  gramPanchayats: number | null;
  villages: number | null;
  mapPageUrl: string | null;
  mapImageUrl: string | null;
  mapPublishDate: string | null;
  adminStats: MandalRecordRef | null;
  mandalMap: MandalRecordRef | null;
  mandalMapPage: MandalRecordRef | null;
  reviewStatus: string;
  completeness: "complete" | "partial" | "missing";
  missingFields: string[];
};

export function parseValue(json: string | null | undefined): RecordValue {
  if (!json) return {};
  try {
    return JSON.parse(json) as RecordValue;
  } catch {
    return {};
  }
}

export function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.replace(/[^\d.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

export function worstReviewStatus(statuses: string[]): string {
  const order = ["rejected", "pending", "outdated", "approved"];
  for (const status of order) {
    if (statuses.includes(status)) return status;
  }
  return statuses[0] ?? "missing";
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return value.toLocaleString("en-IN");
}

export function mandalLabel(slug: string): string {
  return TARGET_MANDAL_LABELS[slug as TargetMandalSlug] ?? slug;
}
