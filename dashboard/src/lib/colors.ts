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

export function mandalColor(index: number): string {
  return MANDAL_COLORS[index % MANDAL_COLORS.length];
}

/** Text color when placed on a mandal color swatch. */
export function mandalLabelColor(hex: string): string {
  if (hex === BRAND.yellow || hex === BRAND.white) return BRAND.black;
  return BRAND.white;
}
