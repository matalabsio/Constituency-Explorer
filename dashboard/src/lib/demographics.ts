import type { VillageRow } from "@/lib/types";

export type MandalDemographics = {
  populationMale: number;
  populationFemale: number;
  sexRatio: number | null;
  populationSc: number;
  populationSt: number;
  populationOther: number;
  scPct: string;
  stPct: string;
  otherPct: string;
};

export function computeDemographics(villages: VillageRow[]): MandalDemographics {
  const populationMale = villages.reduce((sum, v) => sum + (v.population_male ?? 0), 0);
  const populationFemale = villages.reduce((sum, v) => sum + (v.population_female ?? 0), 0);
  const populationSc = villages.reduce((sum, v) => sum + (v.population_sc ?? 0), 0);
  const populationSt = villages.reduce((sum, v) => sum + (v.population_st ?? 0), 0);
  const total = populationMale + populationFemale;
  const populationOther = Math.max(0, total - populationSc - populationSt);
  const pct = (n: number) => (total > 0 ? ((n / total) * 100).toFixed(1) : "0.0");

  return {
    populationMale,
    populationFemale,
    sexRatio: populationMale > 0 ? Math.round((1000 * populationFemale) / populationMale) : null,
    populationSc,
    populationSt,
    populationOther,
    scPct: pct(populationSc),
    stPct: pct(populationSt),
    otherPct: pct(populationOther),
  };
}

export function villageDemographics(v: VillageRow): MandalDemographics | null {
  const male = v.population_male;
  const female = v.population_female;
  if (male == null || female == null || (male === 0 && female === 0)) {
    return null;
  }
  return computeDemographics([v]);
}
