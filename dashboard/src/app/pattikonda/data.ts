import { PATTIKONDA_VILLAGES } from "./villages";
import { kurnoolHybridMap, type MandalMapRef } from "@/lib/maps";

export const ASSEMBLY_DETAILS = {
  assemblyNo: 142,
  assemblyName: "Pattikonda",
  assemblyNameTelugu: "పత్తికొండ",
  category: "GEN",
  state: "Andhra Pradesh",
  stateCode: "S01",
  district: "Kurnool",
  districtTelugu: "కర్నూలు",
  districtCode: "S0119",
  parliamentName: "కర్నూలు (Kurnool)",
  parliamentCategory: "General",
  pinCode: "518380",
} as const;

export const PROFILE = {
  pinCode: "518380",
  nearestTown: "Kurnool",
  rivers: "Handri / seasonal streams of western Kurnool",
  heritage: "Western Kurnool uplands on the Rayalaseema plateau; five revenue mandals in AC 142",
} as const;

export type MandalData = {
  name: string;
  slug: string;
  villages: number;
  gramPanchayats: number;
  population: number;
  male: number;
  female: number;
  households: number;
  sexRatio: number;
  scPopulation: number;
  stPopulation: number;
  scPercent: number;
  stPercent: number;
  literacy: number;
  area: number;
  density: number;
};

export const MANDALS: MandalData[] = [
  {
    name: "Pattikonda",
    slug: "pattikonda",
    villages: 11,
    gramPanchayats: 11,
    population: 68962,
    male: 34579,
    female: 34383,
    households: 14410,
    sexRatio: 994,
    scPopulation: 8815,
    stPopulation: 2968,
    scPercent: 12.78,
    stPercent: 4.3,
    literacy: 48.37,
    area: 289,
    density: 238,
  },
  {
    name: "Maddikera",
    slug: "maddikera",
    villages: 8,
    gramPanchayats: 6,
    population: 36834,
    male: 18653,
    female: 18181,
    households: 8089,
    sexRatio: 975,
    scPopulation: 4402,
    stPopulation: 674,
    scPercent: 11.95,
    stPercent: 1.83,
    literacy: 53.43,
    area: 241,
    density: 153,
  },
  {
    name: "Tuggali",
    slug: "tuggali",
    villages: 12,
    gramPanchayats: 12,
    population: 59462,
    male: 30466,
    female: 28996,
    households: 12577,
    sexRatio: 952,
    scPopulation: 9188,
    stPopulation: 5468,
    scPercent: 15.45,
    stPercent: 9.2,
    literacy: 44.88,
    area: 380,
    density: 157,
  },
  {
    name: "Krishnagiri",
    slug: "krishnagiri",
    villages: 15,
    gramPanchayats: 14,
    population: 47103,
    male: 23733,
    female: 23370,
    households: 9780,
    sexRatio: 985,
    scPopulation: 8333,
    stPopulation: 720,
    scPercent: 17.69,
    stPercent: 1.53,
    literacy: 43.0,
    area: 376,
    density: 125,
  },
  {
    name: "Veldurthy",
    slug: "veldurthy",
    villages: 16,
    gramPanchayats: 16,
    population: 63120,
    male: 31929,
    female: 31191,
    households: 13895,
    sexRatio: 977,
    scPopulation: 13304,
    stPopulation: 599,
    scPercent: 21.08,
    stPercent: 0.95,
    literacy: 47.75,
    area: 324,
    density: 195,
  },
];

export const MANDAL_MAPS: MandalMapRef[] = [
  {
    slug: "pattikonda",
    listedName: "Pattikonda",
    villagemapUrl: "https://villagemap.in/andhra-pradesh/kurnool/pattikonda.html",
    ...kurnoolHybridMap("Pattikonda"),
  },
  {
    slug: "maddikera",
    listedName: "Maddikera (east)",
    villagemapUrl: "https://villagemap.in/andhra-pradesh/kurnool/maddikera+(east).html",
    ...kurnoolHybridMap("Maddikera (east)"),
  },
  {
    slug: "tuggali",
    listedName: "Tuggali",
    villagemapUrl: "https://villagemap.in/andhra-pradesh/kurnool/tuggali.html",
    ...kurnoolHybridMap("Tuggali"),
  },
  {
    slug: "krishnagiri",
    listedName: "Krishnagiri",
    villagemapUrl: "https://villagemap.in/andhra-pradesh/kurnool/krishnagiri.html",
    ...kurnoolHybridMap("Krishnagiri"),
  },
  {
    slug: "veldurthy",
    listedName: "Veldurthi",
    villagemapUrl: "https://villagemap.in/andhra-pradesh/kurnool/veldurthi.html",
    ...kurnoolHybridMap("Veldurthi"),
  },
];

export function getMandalMap(slug: string): MandalMapRef | undefined {
  return MANDAL_MAPS.find((m) => m.slug === slug);
}

export const CONSTITUENCY_TOTALS = {
  mandals: MANDALS.length,
  totalVillages: MANDALS.reduce((s, m) => s + m.villages, 0),
  totalGPs: MANDALS.reduce((s, m) => s + m.gramPanchayats, 0),
  totalPopulation: MANDALS.reduce((s, m) => s + m.population, 0),
  totalMale: MANDALS.reduce((s, m) => s + m.male, 0),
  totalFemale: MANDALS.reduce((s, m) => s + m.female, 0),
  totalHouseholds: MANDALS.reduce((s, m) => s + m.households, 0),
  totalSC: MANDALS.reduce((s, m) => s + m.scPopulation, 0),
  totalST: MANDALS.reduce((s, m) => s + m.stPopulation, 0),
  scPercent: Number(
    (
      (MANDALS.reduce((s, m) => s + m.scPopulation, 0) /
        MANDALS.reduce((s, m) => s + m.population, 0)) *
      100
    ).toFixed(2)
  ),
  stPercent: Number(
    (
      (MANDALS.reduce((s, m) => s + m.stPopulation, 0) /
        MANDALS.reduce((s, m) => s + m.population, 0)) *
      100
    ).toFixed(2)
  ),
};

/** Electors and turnout from IndiaVotes for 2024. Gender-split rolls are not mixed in from other hosts. */
export const VOTER_DEMOGRAPHICS = {
  totalVoters: 224049,
  urbanPercent: 0,
  ruralPercent: 100,
  turnout2024: 85.5,
  votesPolled2024: 191631,
  source: "IndiaVotes / ECI 2024",
};

export type ElectionResult = {
  year: number;
  winner: string;
  winnerParty: string;
  winnerVotes?: number;
  runnerUp?: string;
  runnerUpParty?: string;
  runnerUpVotes?: number;
  margin: number;
  registeredVoters?: number;
  turnout?: number;
  votesPolled?: number;
};

export const ELECTION_2024: ElectionResult = {
  year: 2024,
  winner: "K. E. Shyam Kumar",
  winnerParty: "TDP",
  winnerVotes: 98849,
  runnerUp: "Kangati Sreedevi",
  runnerUpParty: "YSRCP",
  runnerUpVotes: 84638,
  margin: 14211,
  registeredVoters: 224049,
  turnout: 85.5,
  votesPolled: 191631,
};

export const ELECTION_HISTORY: ElectionResult[] = [
  ELECTION_2024,
  {
    year: 2019,
    winner: "Kangati Sreedevi",
    winnerParty: "YSRCP",
    winnerVotes: 100981,
    runnerUp: "K. E. Shyam Kumar",
    runnerUpParty: "TDP",
    runnerUpVotes: 58916,
    margin: 42065,
    registeredVoters: 206538,
    turnout: 81.57,
    votesPolled: 168788,
  },
  {
    year: 2014,
    winner: "K. E. Krishna Murthy",
    winnerParty: "TDP",
    winnerVotes: 62706,
    runnerUp: "Kotla Hari Chakrapani Reddy",
    runnerUpParty: "YSRCP",
    runnerUpVotes: 54807,
    margin: 7899,
    turnout: 79.46,
    votesPolled: 157595,
  },
  {
    year: 2009,
    winner: "K. E. Prabhakar",
    winnerParty: "TDP",
    winnerVotes: 67640,
    runnerUp: "S. V. Chandra Mohan Reddy",
    runnerUpParty: "INC",
    runnerUpVotes: 57668,
    margin: 9972,
    turnout: 77.65,
    votesPolled: 137210,
  },
];

export type PollingStation = { part: number; name: string };

export const POLLING_STATIONS: PollingStation[] = [
  [1, "Atikelagundu"], [2, "Atikelagundu"], [3, "NALAKADODDI"], [4, "Nalakadoddi"],
  [5, "DEVANABANDA"], [6, "Devanabanda"], [7, "CHINNAHULTHI"], [8, "CHINNAHULTHI"],
  [9, "Peddahulthi"], [10, "Pedda Hulthi"], [11, "HOSUR"], [12, "HOSUR"],
  [13, "HOSUR"], [14, "HOSUR"], [15, "HOSUR"], [16, "HOSUR"], [17, "HOSUR"],
  [18, "BURUJULA"], [19, "BURUJULA"], [20, "M. AGRAHARAM"], [21, "M. AGRAHARAM"],
  [22, "M. AGRAHARAM"], [23, "M. AGRAHARAM"], [24, "M. Agraharam"], [25, "M. Agraharam"],
  [26, "Maddikera"], [27, "MADDIKERA"], [28, "MADDIKERA"], [29, "MADDIKERA"],
  [30, "Maddikera"], [31, "Maddikera"], [32, "Maddikera"], [33, "maddikera"],
  [34, "maddikera"], [35, "Maddikera"], [36, "maddikera"], [37, "Maddikera"],
  [38, "YADAVALI"], [39, "bommanapalli"], [40, "Kothapalli"], [41, "Basinepalli"],
  [42, "Madanantapuram"], [43, "Hampa"], [44, "hampa"], [45, "Peravali"],
  [46, "Peravali"], [47, "Peravali"], [48, "Peravali"], [49, "Peravali"],
  [50, "Peravali"], [51, "Peravali"], [52, "puchakayalamada"], [53, "puchakayalamada"],
  [54, "RAMACHANDRAPURAM"], [55, "PATTIKONDA"], [56, "Pattikonda"], [57, "PATTIKONDA"],
  [58, "Pattikonda"], [59, "PATTIKONDA"], [60, "PATTIKONDA"], [61, "PATTIKONDA"],
  [62, "PATTIKONDA"], [63, "Pattikonda"], [64, "PATTIKONDA"], [65, "Pattikonda"],
  [66, "PATTIKONDA"], [67, "PATTIKONDA"], [68, "PATTIKONDA"], [69, "PATTIKONDA"],
  [70, "PATTIKONDA"], [71, "PATTIKONDA"], [72, "PATTIKONDA"], [73, "PATTIKONDA"],
  [74, "Pattikonda"], [75, "PATTIKONDA"], [76, "PATTIKONDA"], [77, "PATTIKONDA"],
  [78, "Bugga tanda"], [79, "R Mandagiri"], [80, "J .AGRAHARAM"], [81, "JUTUR"],
  [82, "Jutur"], [83, "KANAKADINNE"], [84, "Kothiralla"], [85, "KOTHIRALLA"],
  [86, "Dudekonda"], [87, "Dudekonda"], [88, "DUDEKONDA"], [89, "J M Thanda"],
  [90, "PULIKONDA"], [91, "Pulikonda"], [92, "KOTHAPALLI"], [93, "PANDIKONA"],
  [94, "PANDIKONA"], [95, "PANDIKONA"], [96, "Pandikona"], [97, "PENDLI MAN TANDA"],
  [98, "CHANDOLI"], [99, "CHANDOLI"], [100, "Chekkaralla"], [101, "Chekkaralla"],
  [102, "M.M. THANDA"], [103, "Ratana"], [104, "Ratana"], [105, "RATANA"],
  [106, "Ratana"], [107, "R KOTHURU"], [108, "TUGGALI"], [109, "TUGGALI"],
  [110, "TUGGALI"], [111, "TUGGALI"], [112, "MAMILLAKUNTA"], [113, "GIRIGETLA"],
  [114, "Aminabad"], [115, "jonnagiri"], [116, "jonnagiri"], [117, "jonnagiri"],
  [118, "Jonnagiri Village"], [119, "jonnagiri"], [120, "Jonnagiri Village"],
  [121, "Rampuram"], [122, "Rampuram"], [123, "MIDDE TAANDA"], [124, "G.YERRAGUDI"],
  [125, "Gooty Erragudi"], [126, "Bata Taanda"], [127, "UPPARLA PALLI"], [128, "Rollapadu tanda"],
  [129, "KADAMAKUNTLA"], [130, "KADAMAKUNTLA"], [131, "Bollavani palle"], [132, "pagidirayi"],
  [133, "Pagidirayi"], [134, "P. KOTHUR"], [135, "Ramalingayapalle"], [136, "Ramalingayapalle"],
  [137, "Gudisegupparalla"], [138, "Sabhash puram"], [139, "DIGUVA CHINTHALAKONDA"], [140, "CHENNAMPALLI"],
  [141, "Kothikonda"], [142, "YEDDULADODDI"], [143, "Yedduladoddi"], [144, "PENDEKAL"],
  [145, "Pendekal"], [146, "PENDEKAL R.S"], [147, "rampalli"], [148, "rampalli"],
  [149, "RAMPALLI"], [150, "RAMKONDA"], [151, "Marella"], [152, "Marella"],
  [153, "Mukkella"], [154, "Mukkella"], [155, "Linganeni doddi"], [156, "Bondimadugula"],
  [157, "Bondimadugula"], [158, "Kataru Konda"], [159, "KATARUKONDA"], [160, "KATARU KONDA"],
  [161, "Tapala kotturu"], [162, "Koyilakonda"], [163, "Koyilakonda"], [164, "Alamkonda"],
  [165, "Peddoddi 2, BONTIRALLA"], [166, "Pandirla Palli"], [167, "LakkA Saga ram"], [168, "Lalmanpalli"],
  [169, "Tegadoddi"], [170, "Chityala"], [171, "Chityala"], [172, "CHUNCHU ERRAGUDI"],
  [173, "CHUNCHU ERRAGUDI"], [174, "Sangala"], [175, "Erukala Cheruvu"], [176, "ERUKULA CHARUVU"],
  [177, "AGAVELLI"], [178, "G Mallapuram"], [179, "Potugallu"], [180, "B YERRABADU"],
  [181, "Mannekunta"], [182, "Shotriyam Erragudi"], [183, "Shotriyam Erragudi"], [184, "Ramakrishnapuram"],
  [185, "Krishnagiri"], [186, "KRISHNAGIRI"], [187, "KAMBALAPADU"], [188, "Kambalapadu"],
  [189, "KAMBALAPADU"], [190, "Kambalapadu"], [191, "Karlakunta"], [192, "Amakataadu"],
  [193, "Amakataadu"], [194, "Putluru"], [195, "CHERUKULAPADU"], [196, "Cherukulapadu"],
  [197, "CHERUKULAPADU"], [198, "Kosanapalli"], [199, "Togharchedu"], [200, "TOGARCHEDU"],
  [201, "T.Gokulapadu"], [202, "T GOKULAPADU"], [203, "MALLEPALLE"], [204, "Allugundu"],
  [205, "BOMMIREDDY PALLE"], [206, "N.VENKATAPURAM"], [207, "VELDURTI"], [208, "VELDURTHI"],
  [209, "VELDURTHI"], [210, "VELDURTHI"], [211, "Veldurthy"], [212, "VELDURTHI"],
  [213, "VELDURTHI"], [214, "VELDURTHI"], [215, "VELDURTHI"], [216, "VELDURTHI"],
  [217, "VELDURTHI"], [218, "VELDURTHI"], [219, "VELDURTHY"], [220, "RATNAPALLI"],
  [221, "R.RATNAPALLI"], [222, "S. BOYANAPALLI"], [223, "S. Boyenapalli"], [224, "RAMALLAKOTA"],
  [225, "RAMALLAKOTA"], [226, "Ramallakota"], [227, "Ramallakota"], [228, "PULLAGUMMI"],
  [229, "PULLAGUMMI"], [230, "KALUGOTLA"], [231, "KALUGOTLA"], [232, "KOLUGOTLA"],
  [233, "KRISHNAPURAM"], [234, "KRISHNAPURAM"], [235, "SIDDANAGATTU"], [236, "BUKKAPURAM"],
  [237, "BUKKAPURAM"], [238, "SARPARAJAPURAM"], [239, "NARASAPURAM"], [240, "NARASAPURAM"],
  [241, "BINGIDODDI"], [242, "SUDE PALLI"], [243, "SUDEPALLI"], [244, "Guntupalle"],
  [245, "BHOGOLU"], [246, "S. PEREMULA"], [247, "LAKSHMI NAGARAM"], [248, "Pikkilivani palli"],
  [249, "Lakshmi Nagaram"], [250, "LAKSHMI NAGARAM"], [251, "L.Kottala"], [252, "SRIRANGAPURAM"],
  [253, "SRIRANGAPURAM"], [254, "GOVARDHANAGIRI"], [255, "GOVARDHANAGIRI"], [256, "GOVARDHANAGIRI"],
  [257, "CHERLAKOTTURU"],
].map(([part, name]) => ({ part: part as number, name: name as string }));

export const AVAILABLE_ROLLS = [
  { year: 2026, rolls: ["SIR Draft Roll"] },
  { year: 2025, rolls: ["Final Roll", "Draft Roll", "Supplement-4"] },
  { year: 2024, rolls: ["General Election Roll"] },
];

export const GRAM_PANCHAYATS: Record<string, string[]> = {
  pattikonda: [...new Set(PATTIKONDA_VILLAGES.filter((v) => v.mandal_slug === "pattikonda").map((v) => v.gram_panchayat!).filter(Boolean))],
  maddikera: [...new Set(PATTIKONDA_VILLAGES.filter((v) => v.mandal_slug === "maddikera").map((v) => v.gram_panchayat!).filter(Boolean))],
  tuggali: [...new Set(PATTIKONDA_VILLAGES.filter((v) => v.mandal_slug === "tuggali").map((v) => v.gram_panchayat!).filter(Boolean))],
  krishnagiri: [...new Set(PATTIKONDA_VILLAGES.filter((v) => v.mandal_slug === "krishnagiri").map((v) => v.gram_panchayat!).filter(Boolean))],
  veldurthy: [...new Set(PATTIKONDA_VILLAGES.filter((v) => v.mandal_slug === "veldurthy").map((v) => v.gram_panchayat!).filter(Boolean))],
};

function norm(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

const BOOTH_ALIASES: Record<string, string> = {
  atikelagundu: "Nalakadoddi",
  yadavali: "Yedavali",
  magraharam: "Maddikera Agraharam",
  maddikera: "Maddikera (East)",
  bommanapalli: "Hampa",
  chinnahulthi: "Chinna Hulthi",
  peddahulthi: "Pedda Hulthi",
  puchakayalamada: "Putchakayalamada",
  chekkaralla: "Chakkaralla",
  buggatanda: "Pattikonda",
  rmandagiri: "Jutur",
  jagraharam: "Jutur",
  kothiralla: "Dudekonda",
  pendlimantanda: "Pandikona",
  yedduladoddi: "Edduladoddi",
  pendekal: "Pendikallu",
  pendekalrs: "Pendikallu",
  rampalli: "Pendikallu",
  kadamakuntla: "Kandamakuntla",
  pagidirayi: "Pagidiroy",
  chennampalli: "Chennampalle",
  sabhashpuram: "Chennampalle",
  linganenidoddi: "Linganenidoddi",
  katarukonda: "Katarikonda",
  koyilakonda: "Chityala",
  lakkasagaram: "Lakkasagaram",
  chunchuerragudi: "Chunchu Yerragudi",
  erukalacheruvu: "Yerukalacheruvu",
  erukulacharuvu: "Yerukalacheruvu",
  agavelli: "Agaveli",
  potugallu: "Pothugal",
  shotriyamerragudi: "Shotrium Yerragudi",
  amakataadu: "Amakathadu",
  togharchedu: "Thogarchedu",
  togarchedu: "Thogarchedu",
  tgokulapadu: "Tallagokulapadu",
  mallepalle: "Mallepalle",
  veldurti: "Veldurthi",
  veldurthi: "Veldurthi",
  veldurthy: "Veldurthi",
  sboyanapalli: "Sho.Boyanapalle",
  sboyenapalli: "Sho.Boyanapalle",
  speremula: "Sho.Peremula",
  sudepalli: "Sudepalle",
  sudepalli2: "Sudepalle",
  bhogolu: "Bhogolu",
  lakshminagaram: "Laxminagaram",
  srirangapuram: "Govardhanagiri",
  gootyerragudi: "Gooty Erragudi",
  gyerragudi: "Gooty Erragudi",
  jonnagirivillage: "Jonnagiri",
  kalugotla: "Kalugotla",
  kolugotla: "Kalugotla",
};

export function villageForBooth(boothName: string): string | null {
  const key = norm(boothName);
  if (BOOTH_ALIASES[key]) return BOOTH_ALIASES[key];
  const villages = PATTIKONDA_VILLAGES;
  const exact = villages.find((v) => norm(v.village_name) === key);
  if (exact) return exact.village_name;
  const partial = villages.find((v) => {
    const vn = norm(v.village_name);
    return vn.length >= 5 && (key.includes(vn) || vn.includes(key));
  });
  return partial?.village_name ?? null;
}

export const BOOTH_VILLAGE_MAP: Record<string, string> = Object.fromEntries(
  POLLING_STATIONS.map((s) => [s.name.toLowerCase(), villageForBooth(s.name) ?? "—"])
);

export function getBoothsForVillage(villageName: string): { part: number; name: string }[] {
  return POLLING_STATIONS.filter((s) => villageForBooth(s.name) === villageName);
}

export function getBoothCountByVillage(): Map<string, number> {
  const counts = new Map<string, number>();
  for (const s of POLLING_STATIONS) {
    const village = villageForBooth(s.name);
    if (village) counts.set(village, (counts.get(village) ?? 0) + 1);
  }
  return counts;
}

export function mandalForBooth(boothName: string): string {
  const village = villageForBooth(boothName);
  if (village) {
    const row = PATTIKONDA_VILLAGES.find((v) => v.village_name === village);
    if (row) return row.mandal_name;
  }
  const n = boothName.toLowerCase();
  if (n.includes("maddikera") || n.includes("peravali") || n.includes("hampa") || n.includes("burujula") || n.includes("agraharam") || n.includes("yadavali")) return "Maddikera";
  if (n.includes("tuggali") || n.includes("jonnagiri") || n.includes("ratana") || n.includes("mukkella") || n.includes("bondimadugula")) return "Tuggali";
  if (n.includes("krishnagiri") || n.includes("kambalapadu") || n.includes("chityala") || n.includes("alamkonda")) return "Krishnagiri";
  if (n.includes("veldur") || n.includes("ramallakota") || n.includes("bukkapuram") || n.includes("narasapuram") || n.includes("govardhanagiri")) return "Veldurthy";
  return "Pattikonda";
}
