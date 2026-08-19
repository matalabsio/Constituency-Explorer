import { TARGET_MANDAL_LABELS, TARGET_MANDAL_SLUGS, mandalLabel, type TargetMandalSlug } from "@/lib/mandals";
import type { PollingStationPart } from "@/lib/queries";
import type { VillageRow } from "@/lib/types";

export type BoothRow = PollingStationPart & {
  mandalSlug: TargetMandalSlug;
  mandalName: string;
};

/** ECI Kurupam AC roll order on voterslist.in */
const ROLL_MANDAL_ORDER: TargetMandalSlug[] = [
  "kurupam",
  "gummalakshmipuram",
  "jiyammavalasa",
  "komarada",
  "garugubilli",
];

const HQ_NAMES: Record<TargetMandalSlug, string[]> = {
  kurupam: ["kurupam", "kurupum"],
  gummalakshmipuram: ["gummalakshmipuram", "gummalaxmipuram"],
  jiyammavalasa: ["jiyyammavalasa", "jiyammavalasa", "jiyyamma valasa", "jiyamma valasa"],
  komarada: ["komarada"],
  garugubilli: ["garugubilli", "garugu billi"],
};

const NAME_ALIASES: Record<string, string> = {
  kurupum: "kurupam",
  gotiwada: "gotivada",
  mondekhallu: "mondemkhallu",
  mondenkhallu: "mondemkhallu",
  pedagothili: "pedagottili",
  gujjuvayi: "gujjuvai",
  gujjuvayisivada: "gujjuvaisivada",
  "garugu billi": "garugubilli",
  "jiyyamma valasa": "jiyyammavalasa",
  "jiyamma valasa": "jiyyammavalasa",
  gottivalas: "gottivalasa",
  peddur: "pedduru",
  vullibadra: "ullibhadra",
  chorupallli: "chorupalli",
  kaakitada: "kakithada",
  dharmalakshmipuram: "dharmalalaxmipuram",
  neelakanthapuram: "neelakantapuram",
  dandusur: "dandusura",
  "p levidi": "levidi",
  maripalli: "maripalle",
  parashurampuram: "parasurampuram",
  parusurampuram: "parasurampuram",
  gunanapuram: "gunanupuram",
  madhalingi: "madalingi",
  vannnamu: "vannamu",
};

function compact(value: string): string {
  return value.replace(/[^a-z0-9]/g, "");
}

export function normalizePlaceName(raw: string | null | undefined): string {
  if (!raw) return "";
  let value = raw.toLowerCase();
  value = value.replace(/new building\s+/g, "");
  value = value.replace(/r\s*&\s*r colony at\s+/g, "");
  value = value.replace(/\([^)]*\)/g, " ");
  value = value.replace(/@.*/g, " ");
  value = value.replace(/near\s+/g, " ");
  value = value.replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
  return NAME_ALIASES[value] ?? NAME_ALIASES[compact(value)] ?? value;
}

function uniqueSlug(slugs: Set<string>): string | null {
  return slugs.size === 1 ? [...slugs][0] : null;
}

function lookupName(
  name: string,
  villageIndex: Map<string, Set<string>>,
  gpIndex: Map<string, Set<string>>,
  compactIndex: Map<string, Set<string>>
): string | null {
  const normalized = normalizePlaceName(name);
  if (!normalized) return null;
  for (const index of [villageIndex, gpIndex]) {
    const hit = uniqueSlug(index.get(normalized) ?? new Set());
    if (hit) return hit;
  }
  return uniqueSlug(compactIndex.get(compact(normalized)) ?? new Set());
}

function isHqName(name: string, mandal: TargetMandalSlug): boolean {
  const normalized = normalizePlaceName(name);
  const compacted = compact(normalized);
  return HQ_NAMES[mandal].some((key) => normalized === key || compacted === compact(key));
}

function findHqIndex(parts: PollingStationPart[], mandal: TargetMandalSlug): number {
  return parts.findIndex((part) => isHqName(part.name, mandal));
}

/**
 * Assign every Kurupam AC booth to one of the five constituency mandals.
 * voterslist.in lists parts in ECI block order; HQ booth names mark each block.
 */
export function assignBoothMandals(
  parts: PollingStationPart[],
  villages: VillageRow[]
): BoothRow[] {
  const villageIndex = new Map<string, Set<string>>();
  const gpIndex = new Map<string, Set<string>>();
  const compactIndex = new Map<string, Set<string>>();

  const add = (index: Map<string, Set<string>>, key: string, slug: string) => {
    if (!key) return;
    const set = index.get(key) ?? new Set<string>();
    set.add(slug);
    index.set(key, set);
  };

  for (const village of villages) {
    const villageKey = normalizePlaceName(village.village_name);
    const gpKey = normalizePlaceName(village.gram_panchayat);
    add(villageIndex, villageKey, village.entity_slug);
    add(compactIndex, compact(villageKey), village.entity_slug);
    add(gpIndex, gpKey, village.entity_slug);
    add(compactIndex, compact(gpKey), village.entity_slug);
  }

  const hits = parts.map((part) => lookupName(part.name, villageIndex, gpIndex, compactIndex));
  const hqs = ROLL_MANDAL_ORDER.map((mandal) => findHqIndex(parts, mandal));
  if (hqs.some((index) => index < 0)) {
    return fallbackSequential(parts, hits);
  }

  const starts: number[] = [0];
  for (let i = 1; i < ROLL_MANDAL_ORDER.length; i++) {
    const prev = ROLL_MANDAL_ORDER[i - 1];
    const floor = hqs[i - 1];
    const hq = hqs[i];
    let lastPrev = floor;
    for (let j = floor; j < hq; j++) {
      if (hits[j] === prev) lastPrev = j;
    }
    starts.push(Math.min(lastPrev + 1, hq));
  }

  const slugs: TargetMandalSlug[] = parts.map(() => "kurupam");
  for (let i = 0; i < ROLL_MANDAL_ORDER.length; i++) {
    const from = starts[i];
    const to = i + 1 < starts.length ? starts[i + 1] : parts.length;
    for (let j = from; j < to; j++) slugs[j] = ROLL_MANDAL_ORDER[i];
  }

  return parts.map((part, index) => ({
    ...part,
    mandalSlug: slugs[index],
    mandalName: mandalLabel(slugs[index]),
  }));
}

function fallbackSequential(parts: PollingStationPart[], hits: Array<string | null>): BoothRow[] {
  const slugs: Array<TargetMandalSlug | null> = hits.map((hit) =>
    hit && (TARGET_MANDAL_SLUGS as readonly string[]).includes(hit) ? (hit as TargetMandalSlug) : null
  );
  let last: TargetMandalSlug = "kurupam";
  for (let i = 0; i < slugs.length; i++) {
    if (slugs[i]) last = slugs[i] as TargetMandalSlug;
    else slugs[i] = last;
  }
  return parts.map((part, index) => {
    const slug = slugs[index] ?? "kurupam";
    return { ...part, mandalSlug: slug, mandalName: mandalLabel(slug) };
  });
}

export function boothCountsByMandal(rows: BoothRow[]): { slug: TargetMandalSlug; name: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const row of rows) {
    counts.set(row.mandalSlug, (counts.get(row.mandalSlug) ?? 0) + 1);
  }
  return TARGET_MANDAL_SLUGS.map((slug) => ({
    slug,
    name: TARGET_MANDAL_LABELS[slug],
    count: counts.get(slug) ?? 0,
  }));
}

export function groupBoothsByMandal(rows: BoothRow[]): { slug: TargetMandalSlug; name: string; booths: BoothRow[] }[] {
  return TARGET_MANDAL_SLUGS.map((slug) => ({
    slug,
    name: TARGET_MANDAL_LABELS[slug],
    booths: rows.filter((row) => row.mandalSlug === slug).sort((a, b) => a.partNo - b.partNo),
  }));
}
