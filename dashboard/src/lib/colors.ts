/** Telugu Desam Party (TDP) flag palette */
export const BRAND = {
  yellow: "#FFFF00", // Digital Yellow
  red: "#DA3925", // Red Beauty
  green: "#2F5C2F", // Spruce
  white: "#FFFFFF", // Full White
  black: "#2B2626", // American Black
} as const;

export const CHART = {
  st: BRAND.yellow,
  sc: BRAND.red,
  other: BRAND.green,
  male: BRAND.black,
  female: BRAND.red,
  track: "#eef0ee",
} as const;

/** Cycle all five TDP flag colors for mandal charts and cards. */
export const MANDAL_COLORS = [
  BRAND.yellow,
  BRAND.red,
  BRAND.green,
  BRAND.black,
  BRAND.yellow,
];

/** Same mapping as Kurupam charts. Safe to import from Server Components. */
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

/** Text color when placed on a mandal color swatch. */
export function mandalLabelColor(hex: string): string {
  if (hex === BRAND.yellow || hex === BRAND.white) return BRAND.black;
  return BRAND.white;
}

/** Yellow fills need a dark edge on white cards or they disappear. */
export function chartStroke(fill?: string | null): string {
  if (!fill) return "#ffffff";
  const hex = fill.toLowerCase();
  if (hex === BRAND.yellow.toLowerCase() || hex === "#ffff00" || hex === "#ff0") {
    return BRAND.black;
  }
  return "#ffffff";
}
