export type PattikondaVillageRow = {
  village_name: string;
  mandal_slug: string;
  mandal_name: string;
  gram_panchayat: string | null;
  population: number | null;
  population_male: number | null;
  population_female: number | null;
  population_sc: number | null;
  population_st: number | null;
  households: number | null;
  sex_ratio: number | null;
  literacy: number | null;
  pin_code: string | null;
  area: string | null;
  nearest_town: string | null;
  category: "Rural" | "Urban" | "Unmapped";
};

type Seed = {
  village_name: string;
  mandal_slug: string;
  mandal_name: string;
  gram_panchayat: string;
  pin_code: string | null;
};

const SEEDS: Seed[] = [
  // Pattikonda mandal
  { village_name: "Chakkaralla", mandal_slug: "pattikonda", mandal_name: "Pattikonda", gram_panchayat: "Chakkaralla", pin_code: "518380" },
  { village_name: "Chinna Hulthi", mandal_slug: "pattikonda", mandal_name: "Pattikonda", gram_panchayat: "Chinnahulthi", pin_code: "518380" },
  { village_name: "Devanabanda", mandal_slug: "pattikonda", mandal_name: "Pattikonda", gram_panchayat: "Devanabanda", pin_code: "518380" },
  { village_name: "Dudekonda", mandal_slug: "pattikonda", mandal_name: "Pattikonda", gram_panchayat: "Kothiralla", pin_code: "518380" },
  { village_name: "Hosur", mandal_slug: "pattikonda", mandal_name: "Pattikonda", gram_panchayat: "Hosur", pin_code: "518380" },
  { village_name: "Jutur", mandal_slug: "pattikonda", mandal_name: "Pattikonda", gram_panchayat: "Mandagiri", pin_code: "518380" },
  { village_name: "Nalakadoddi", mandal_slug: "pattikonda", mandal_name: "Pattikonda", gram_panchayat: "Nalakadoddi", pin_code: "518380" },
  { village_name: "Pandikona", mandal_slug: "pattikonda", mandal_name: "Pattikonda", gram_panchayat: "Pendiliman Thanda", pin_code: "518380" },
  { village_name: "Pattikonda", mandal_slug: "pattikonda", mandal_name: "Pattikonda", gram_panchayat: "Bugga Thanda", pin_code: "518380" },
  { village_name: "Pedda Hulthi", mandal_slug: "pattikonda", mandal_name: "Pattikonda", gram_panchayat: "Pedda Hulthi", pin_code: "518380" },
  { village_name: "Putchakayalamada", mandal_slug: "pattikonda", mandal_name: "Pattikonda", gram_panchayat: "Putchakayalamada", pin_code: "518380" },
  // Maddikera
  { village_name: "Burujula", mandal_slug: "maddikera", mandal_name: "Maddikera", gram_panchayat: "Burujula", pin_code: "518385" },
  { village_name: "Hampa", mandal_slug: "maddikera", mandal_name: "Maddikera", gram_panchayat: "Bommanapalli", pin_code: "518385" },
  { village_name: "Maddikera (East)", mandal_slug: "maddikera", mandal_name: "Maddikera", gram_panchayat: "Maddikera", pin_code: "518385" },
  { village_name: "Maddikera (North)", mandal_slug: "maddikera", mandal_name: "Maddikera", gram_panchayat: "Maddikera", pin_code: "518385" },
  { village_name: "Maddikera (West)", mandal_slug: "maddikera", mandal_name: "Maddikera", gram_panchayat: "Maddikera", pin_code: "518385" },
  { village_name: "Maddikera Agraharam", mandal_slug: "maddikera", mandal_name: "Maddikera", gram_panchayat: "Maddikera Agraharam", pin_code: "518385" },
  { village_name: "Peravali", mandal_slug: "maddikera", mandal_name: "Maddikera", gram_panchayat: "Peravali", pin_code: "518385" },
  { village_name: "Yedavali", mandal_slug: "maddikera", mandal_name: "Maddikera", gram_panchayat: "Yedavali", pin_code: "518385" },
  // Tuggali
  { village_name: "Bondimadugula", mandal_slug: "tuggali", mandal_name: "Tuggali", gram_panchayat: "Nunusuralla", pin_code: null },
  { village_name: "Chennampalle", mandal_slug: "tuggali", mandal_name: "Tuggali", gram_panchayat: "Sabhashpuram", pin_code: null },
  { village_name: "Edduladoddi", mandal_slug: "tuggali", mandal_name: "Tuggali", gram_panchayat: "Edduladoddi", pin_code: null },
  { village_name: "Gooty Erragudi", mandal_slug: "tuggali", mandal_name: "Tuggali", gram_panchayat: "Surya Thanda", pin_code: null },
  { village_name: "Jonnagiri", mandal_slug: "tuggali", mandal_name: "Tuggali", gram_panchayat: "Ramapuram", pin_code: null },
  { village_name: "Kandamakuntla", mandal_slug: "tuggali", mandal_name: "Tuggali", gram_panchayat: "Yellammagutta Thanda", pin_code: null },
  { village_name: "Linganenidoddi", mandal_slug: "tuggali", mandal_name: "Tuggali", gram_panchayat: "Bondimadugula", pin_code: null },
  { village_name: "Mukkella", mandal_slug: "tuggali", mandal_name: "Tuggali", gram_panchayat: "Mukkella", pin_code: null },
  { village_name: "Pagidiroy", mandal_slug: "tuggali", mandal_name: "Tuggali", gram_panchayat: "Pagidiroy", pin_code: null },
  { village_name: "Pendikallu", mandal_slug: "tuggali", mandal_name: "Tuggali", gram_panchayat: "Rampalli", pin_code: null },
  { village_name: "Ratana", mandal_slug: "tuggali", mandal_name: "Tuggali", gram_panchayat: "Ratana", pin_code: null },
  { village_name: "Tuggali", mandal_slug: "tuggali", mandal_name: "Tuggali", gram_panchayat: "Tuggali", pin_code: null },
  // Krishnagiri
  { village_name: "Agaveli", mandal_slug: "krishnagiri", mandal_name: "Krishnagiri", gram_panchayat: "Agaveli", pin_code: null },
  { village_name: "Alamkonda", mandal_slug: "krishnagiri", mandal_name: "Krishnagiri", gram_panchayat: "Boya Bonthiralla", pin_code: null },
  { village_name: "Amakathadu", mandal_slug: "krishnagiri", mandal_name: "Krishnagiri", gram_panchayat: "Amakathadu", pin_code: null },
  { village_name: "Chityala", mandal_slug: "krishnagiri", mandal_name: "Krishnagiri", gram_panchayat: "Koilkonda", pin_code: null },
  { village_name: "Chunchu Yerragudi", mandal_slug: "krishnagiri", mandal_name: "Krishnagiri", gram_panchayat: "Chunchu Yerragudi", pin_code: null },
  { village_name: "Kambalapadu", mandal_slug: "krishnagiri", mandal_name: "Krishnagiri", gram_panchayat: "Kambalapadu", pin_code: null },
  { village_name: "Katarikonda", mandal_slug: "krishnagiri", mandal_name: "Krishnagiri", gram_panchayat: "Katarikonda", pin_code: null },
  { village_name: "Krishnagiri", mandal_slug: "krishnagiri", mandal_name: "Krishnagiri", gram_panchayat: "Krishnagiri", pin_code: null },
  { village_name: "Lakkasagaram", mandal_slug: "krishnagiri", mandal_name: "Krishnagiri", gram_panchayat: "Lakkasagaram", pin_code: null },
  { village_name: "Mannegunta", mandal_slug: "krishnagiri", mandal_name: "Krishnagiri", gram_panchayat: "Sho. Yerragudi", pin_code: null },
  { village_name: "Pothugal", mandal_slug: "krishnagiri", mandal_name: "Krishnagiri", gram_panchayat: "Pothugal", pin_code: null },
  { village_name: "Shotrium Yerragudi", mandal_slug: "krishnagiri", mandal_name: "Krishnagiri", gram_panchayat: "Sho. Yerragudi", pin_code: null },
  { village_name: "Tallagokulapadu", mandal_slug: "krishnagiri", mandal_name: "Krishnagiri", gram_panchayat: "Tallagokulapadu", pin_code: null },
  { village_name: "Thogarchedu", mandal_slug: "krishnagiri", mandal_name: "Krishnagiri", gram_panchayat: "Thogarchedu", pin_code: null },
  { village_name: "Yerukalacheruvu", mandal_slug: "krishnagiri", mandal_name: "Krishnagiri", gram_panchayat: "Yerukalacheruvu", pin_code: null },
  // Veldurthy
  { village_name: "Bhogolu", mandal_slug: "veldurthy", mandal_name: "Veldurthy", gram_panchayat: "Bhogolu", pin_code: null },
  { village_name: "Bukkapuram", mandal_slug: "veldurthy", mandal_name: "Veldurthy", gram_panchayat: "Bukkapuram", pin_code: null },
  { village_name: "Cherukulapadu", mandal_slug: "veldurthy", mandal_name: "Veldurthy", gram_panchayat: "Cherukulapadu", pin_code: null },
  { village_name: "Govardhanagiri", mandal_slug: "veldurthy", mandal_name: "Veldurthy", gram_panchayat: "Srirangapuram", pin_code: null },
  { village_name: "Kalugotla", mandal_slug: "veldurthy", mandal_name: "Veldurthy", gram_panchayat: "Krishnapuram", pin_code: null },
  { village_name: "Laxminagaram", mandal_slug: "veldurthy", mandal_name: "Veldurthy", gram_panchayat: "Laxmipuram", pin_code: null },
  { village_name: "Mallepalle", mandal_slug: "veldurthy", mandal_name: "Veldurthy", gram_panchayat: "Mallepalle", pin_code: null },
  { village_name: "Narasapuram", mandal_slug: "veldurthy", mandal_name: "Veldurthy", gram_panchayat: "Narasapuram", pin_code: null },
  { village_name: "Narlapuram", mandal_slug: "veldurthy", mandal_name: "Veldurthy", gram_panchayat: "Narlapuram", pin_code: null },
  { village_name: "Pullagummi", mandal_slug: "veldurthy", mandal_name: "Veldurthy", gram_panchayat: "Pullagummi", pin_code: null },
  { village_name: "Ramallakota", mandal_slug: "veldurthy", mandal_name: "Veldurthy", gram_panchayat: "Ramallakota", pin_code: null },
  { village_name: "Sarparajapuram", mandal_slug: "veldurthy", mandal_name: "Veldurthy", gram_panchayat: "Sarparajapuram", pin_code: null },
  { village_name: "Sho.Boyanapalle", mandal_slug: "veldurthy", mandal_name: "Veldurthy", gram_panchayat: "Sho.Boyanapalle", pin_code: null },
  { village_name: "Sho.Peremula", mandal_slug: "veldurthy", mandal_name: "Veldurthy", gram_panchayat: "Peremula", pin_code: null },
  { village_name: "Sudepalle", mandal_slug: "veldurthy", mandal_name: "Veldurthy", gram_panchayat: "Sudepalle", pin_code: null },
  { village_name: "Veldurthi", mandal_slug: "veldurthy", mandal_name: "Veldurthy", gram_panchayat: "Veldurthi", pin_code: null },
];

export const PATTIKONDA_VILLAGES: PattikondaVillageRow[] = SEEDS.map((s) => ({
  ...s,
  population: null,
  population_male: null,
  population_female: null,
  population_sc: null,
  population_st: null,
  households: null,
  sex_ratio: null,
  literacy: null,
  area: null,
  nearest_town: "Pattikonda",
  category: "Rural",
}));

export function getVillagesByMandal(slug: string): PattikondaVillageRow[] {
  return PATTIKONDA_VILLAGES.filter((v) => v.mandal_slug === slug);
}
