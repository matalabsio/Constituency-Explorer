export const CONSTITUENCY_IDS = ["kurupam", "dhone", "pattikonda"] as const;

export type ConstituencyId = (typeof CONSTITUENCY_IDS)[number];

export type ConstituencyMeta = {
  id: ConstituencyId;
  name: string;
  reservation: "ST" | "GEN";
  assemblyNo: number;
  district: string;
  lokSabha: string;
  state: string;
  /** Empty string for Kurupam (site root). */
  basePath: "" | "/dhone" | "/pattikonda";
  hasMaps: boolean;
};

export const CONSTITUENCIES: ConstituencyMeta[] = [
  {
    id: "kurupam",
    name: "Kurupam",
    reservation: "ST",
    assemblyNo: 11,
    district: "Parvathipuram Manyam",
    lokSabha: "Araku",
    state: "Andhra Pradesh",
    basePath: "",
    hasMaps: true,
  },
  {
    id: "dhone",
    name: "Dhone",
    reservation: "GEN",
    assemblyNo: 141,
    district: "Nandyal",
    lokSabha: "Nandyal",
    state: "Andhra Pradesh",
    basePath: "/dhone",
    hasMaps: true,
  },
  {
    id: "pattikonda",
    name: "Pattikonda",
    reservation: "GEN",
    assemblyNo: 142,
    district: "Kurnool",
    lokSabha: "Kurnool",
    state: "Andhra Pradesh",
    basePath: "/pattikonda",
    hasMaps: true,
  },
];

export function getConstituencyMeta(id: ConstituencyId): ConstituencyMeta {
  return CONSTITUENCIES.find((c) => c.id === id)!;
}

export function constituencyFromPath(pathname: string): ConstituencyId {
  if (pathname === "/dhone" || pathname.startsWith("/dhone/")) return "dhone";
  if (pathname === "/pattikonda" || pathname.startsWith("/pattikonda/")) return "pattikonda";
  return "kurupam";
}

export function overviewHref(basePath: ConstituencyMeta["basePath"]): string {
  return basePath || "/";
}

export function sectionHref(basePath: ConstituencyMeta["basePath"], section: string): string {
  const root = basePath || "";
  return `${root}/${section}`;
}

export type SectionNavItem = { label: string; href: string };

export function sectionNav(meta: ConstituencyMeta): SectionNavItem[] {
  return [
    { label: "Overview", href: overviewHref(meta.basePath) },
    { label: "Mandals", href: sectionHref(meta.basePath, "mandals") },
    { label: "Villages", href: sectionHref(meta.basePath, "villages") },
    { label: "Maps", href: sectionHref(meta.basePath, "maps") },
    { label: "Booths", href: sectionHref(meta.basePath, "booths") },
  ];
}

export function resolveSectionHref(pathname: string, items: SectionNavItem[]): string {
  if (items.some((item) => item.href === pathname)) return pathname;
  const nested = items
    .filter((item) => item.href !== "/" && pathname.startsWith(`${item.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0];
  return nested?.href ?? items[0]?.href ?? pathname;
}
