/** Quiet editorial palette. Spruce is the only accent. */
export const BRAND = {
  yellow: "#6E775C", // olive, used where yellow used to live
  red: "#A24B3D",
  green: "#3D5340",
  white: "#FFFEFC",
  black: "#1C1B19",
} as const;

export const CHART = {
  st: "#6E775C",
  sc: BRAND.red,
  other: BRAND.green,
  male: BRAND.black,
  female: BRAND.red,
  track: "#EFEDEA",
} as const;

export const MANDAL_COLORS = [
  BRAND.green,
  BRAND.red,
  BRAND.black,
  CHART.st,
  "#6B6762",
];

export const BAR = {
  green: CHART.other,
  red: CHART.sc,
  black: CHART.male,
  gold: CHART.st,
  yellow: CHART.st,
  st: CHART.st,
  sc: CHART.sc,
  other: CHART.other,
  male: CHART.male,
  female: CHART.female,
} as const;

export const CHART_COLORS = MANDAL_COLORS;

export const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-green)]";

export function mandalColor(index: number): string {
  return MANDAL_COLORS[index % MANDAL_COLORS.length];
}

export function mandalLabelColor(hex: string): string {
  if (hex === BRAND.white) return BRAND.black;
  return BRAND.white;
}

export function chartStroke(fill?: string | null): string {
  if (!fill) return "#ffffff";
  return "#ffffff";
}
