import { computeDemographics, type MandalDemographics } from "@/lib/demographics";
import { buildGpGroups } from "@/lib/gp";
import {
  TARGET_MANDAL_SLUGS,
  type MandalProfile,
} from "@/lib/mandals";
import {
  getConstituencyElectorate,
  getConstituencyProfile,
  getElectionResults,
  getMandalProfiles,
  getMptcReservation,
  getPollingStations,
  getVillageRows,
  type ConstituencyElectorate,
  type ConstituencyElections,
  type ConstituencyProfile,
  type MptcReservation,
  type PollingStations,
} from "@/lib/queries";
import type { VillageRow } from "@/lib/types";

export type { MandalDemographics } from "@/lib/demographics";
export { computeDemographics, villageDemographics } from "@/lib/demographics";

export type ConstituencyStats = {
  mandals: number;
  /** Revenue villages per district mandal_admin_stats */
  officialVillages: number;
  /** Unique villages in collected directory/detail records */
  collectedVillages: number;
  /** Villages with full census detail pages collected */
  villagesWithDetail: number;
  gramPanchayats: number;
  totalPopulation: number;
  totalHouseholds: number;
  censusYear: string;
};

export type MandalExplore = MandalProfile & {
  villageCount: number;
  totalPopulation: number;
  totalHouseholds: number;
  /** Estimated from census population share × published AC elector total */
  registeredVotersEstimate: number | null;
  demographics: MandalDemographics;
  mptcReservation: MptcReservation | null;
};

function distributeByPopulationShare(
  items: { key: string; weight: number }[],
  total: number
): Map<string, number> {
  const weightSum = items.reduce((sum, item) => sum + item.weight, 0);
  if (weightSum <= 0 || total <= 0) return new Map();

  const shares = items.map((item) => {
    const exact = (item.weight / weightSum) * total;
    const floor = Math.floor(exact);
    return { key: item.key, floor, remainder: exact - floor };
  });

  let allocated = shares.reduce((sum, item) => sum + item.floor, 0);
  const result = new Map(shares.map((item) => [item.key, item.floor]));
  const byRemainder = [...shares].sort((a, b) => b.remainder - a.remainder);

  for (let i = 0; i < total - allocated; i++) {
    const key = byRemainder[i % byRemainder.length].key;
    result.set(key, (result.get(key) ?? 0) + 1);
  }

  return result;
}

export type ExploreData = {
  stats: ConstituencyStats;
  mandals: MandalExplore[];
  villages: VillageRow[];
  electorate: ConstituencyElectorate | null;
  profile: ConstituencyProfile | null;
  elections: ConstituencyElections | null;
  pollingStations: PollingStations | null;
};

export type {
  ConstituencyElectorate,
  ConstituencyElections,
  ConstituencyProfile,
  MptcReservation,
  PollingStations,
};

export function getExploreData(): ExploreData {
  const profiles = getMandalProfiles();
  const villages = getVillageRows();
  const electorate = getConstituencyElectorate();
  const profile = getConstituencyProfile();
  const elections = getElectionResults();
  const pollingStations = getPollingStations();

  const mandalDrafts = profiles.map((profile) => {
    const mandalVillages = villages.filter((v) => v.entity_slug === profile.slug);
    const totalPopulation = mandalVillages.reduce((sum, v) => sum + (v.population ?? 0), 0);
    const totalHouseholds = mandalVillages.reduce((sum, v) => sum + (v.households ?? 0), 0);
    return {
      profile,
      mandalVillages,
      totalPopulation,
      totalHouseholds,
    };
  });

  const voterEstimates =
    electorate && electorate.totalRegisteredVoters > 0
      ? distributeByPopulationShare(
          mandalDrafts.map(({ profile, totalPopulation }) => ({
            key: profile.slug,
            weight: totalPopulation,
          })),
          electorate.totalRegisteredVoters
        )
      : new Map<string, number>();

  const mandals: MandalExplore[] = mandalDrafts.map(
    ({ profile, mandalVillages, totalPopulation, totalHouseholds }) => ({
      ...profile,
      villageCount: profile.villages ?? mandalVillages.length,
      totalPopulation,
      totalHouseholds,
      registeredVotersEstimate: voterEstimates.get(profile.slug) ?? null,
      demographics: computeDemographics(mandalVillages),
      mptcReservation: getMptcReservation(profile.slug),
    })
  );

  const stats: ConstituencyStats = {
    mandals: TARGET_MANDAL_SLUGS.length,
    officialVillages: mandals.reduce((sum, m) => sum + (m.villages ?? 0), 0),
    collectedVillages: villages.length,
    villagesWithDetail: villages.filter((v) => v.has_detail).length,
    gramPanchayats: mandals.reduce((sum, m) => sum + (m.gramPanchayats ?? 0), 0),
    totalPopulation: mandals.reduce((sum, m) => sum + m.totalPopulation, 0),
    totalHouseholds: mandals.reduce((sum, m) => sum + m.totalHouseholds, 0),
    censusYear: "2011",
  };

  return { stats, mandals, villages, electorate, profile, elections, pollingStations };
}

export function getMandalExplore(slug: string): MandalExplore | null {
  return getExploreData().mandals.find((m) => m.slug === slug) ?? null;
}

export function getConstituencyDemographics(): MandalDemographics {
  return computeDemographics(getVillageRows());
}

export function getTopVillages(villages: VillageRow[], limit = 12): VillageRow[] {
  return [...villages]
    .filter((v) => (v.population ?? 0) > 0)
    .sort((a, b) => (b.population ?? 0) - (a.population ?? 0))
    .slice(0, limit);
}

export type GpDemographics = {
  key: string;
  name: string;
  mandal: string;
  population: number;
  villageCount: number;
  demographics: MandalDemographics;
};

export function getGpDemographics(villages: VillageRow[]): GpDemographics[] {
  return buildGpGroups(villages)
    .map((gp) => ({
      key: gp.key,
      name: gp.name,
      mandal: gp.mandal,
      population: gp.population,
      villageCount: gp.villages.length,
      demographics: computeDemographics(gp.villages),
    }))
    .sort((a, b) => b.population - a.population);
}
