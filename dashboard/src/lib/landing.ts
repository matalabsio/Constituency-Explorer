import {
  CONSTITUENCY_TOTALS as DHONE_TOTALS,
  ELECTION_HISTORY as DHONE_ELECTIONS,
  MANDALS as DHONE_MANDALS,
  MANDAL_MAPS as DHONE_MAPS,
  PROFILE as DHONE_PROFILE,
  VOTER_DEMOGRAPHICS as DHONE_VOTERS,
  type MandalData,
} from "@/app/dhone/data";
import {
  CONSTITUENCY_TOTALS as PATTI_TOTALS,
  ELECTION_HISTORY as PATTI_ELECTIONS,
  MANDALS as PATTI_MANDALS,
  MANDAL_MAPS as PATTI_MAPS,
  PROFILE as PATTI_PROFILE,
  VOTER_DEMOGRAPHICS as PATTI_VOTERS,
} from "@/app/pattikonda/data";
import type { MandalDemographics } from "@/lib/demographics";
import { getConstituencyDemographics, getExploreData } from "@/lib/explore";
import type { ConstituencyElectorate, ConstituencyProfile } from "@/lib/queries";
import {
  getConstituencyMeta,
  sectionHref,
  type ConstituencyId,
  type ConstituencyMeta,
} from "@/lib/constituencies";

export type LandingMandal = {
  slug: string;
  displayName: string;
  villages: number;
  villageCount: number;
  gramPanchayats: number;
  totalPopulation: number;
  totalHouseholds: number;
  registeredVotersEstimate: number | null;
  collectedCount: number;
  detailedCount: number;
  mapImageUrl: string | null;
  mapEmbedUrl: string | null;
  demographics: MandalDemographics;
};

export type LandingElection = {
  year: number;
  totalRegisteredVoters: number | null;
  turnoutPct: number | null;
  votesPolled: number | null;
  winner: { name: string; party: string; votes: number | null };
  runnerUp: { name: string; party: string; votes: number | null } | null;
  victoryMargin: number | null;
};

export type LandingHeroCopy = {
  reservationLabel: string;
  districtLine: string;
  title: string;
  mark: string;
  description: string;
  electorBadge: string | null;
};

export type LandingSource = {
  label: string;
  href: string;
  note: string;
  voterNote: string | null;
};

export type ConstituencyLandingModel = {
  meta: ConstituencyMeta;
  hero: LandingHeroCopy;
  stats: {
    mandals: number;
    officialVillages: number;
    collectedVillages: number;
    gramPanchayats: number;
    totalPopulation: number;
    censusYear: string;
  };
  mandals: LandingMandal[];
  electorate: ConstituencyElectorate | null;
  hasVoterGender: boolean;
  profile: ConstituencyProfile | null;
  elections: LandingElection[];
  constituencyDemo: MandalDemographics;
  source: LandingSource;
  villagesHref: string;
  mandalsHref: string;
  mapsHref: string;
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

  const allocated = shares.reduce((sum, item) => sum + item.floor, 0);
  const result = new Map(shares.map((item) => [item.key, item.floor]));
  const byRemainder = [...shares].sort((a, b) => b.remainder - a.remainder);

  for (let i = 0; i < total - allocated; i++) {
    const key = byRemainder[i % byRemainder.length].key;
    result.set(key, (result.get(key) ?? 0) + 1);
  }

  return result;
}

function pct(part: number, total: number): string {
  return total > 0 ? ((part / total) * 100).toFixed(1) : "0.0";
}

function mandalFromStatic(
  m: MandalData,
  voterEstimate: number | null,
  mapEmbedUrl: string | null = null
): LandingMandal {
  const populationOther = Math.max(0, m.population - m.scPopulation - m.stPopulation);
  return {
    slug: m.slug,
    displayName: m.name,
    villages: m.villages,
    villageCount: m.villages,
    gramPanchayats: m.gramPanchayats,
    totalPopulation: m.population,
    totalHouseholds: m.households,
    registeredVotersEstimate: voterEstimate,
    collectedCount: m.villages,
    detailedCount: m.villages,
    mapImageUrl: null,
    mapEmbedUrl,
    demographics: {
      populationMale: m.male,
      populationFemale: m.female,
      sexRatio: m.sexRatio,
      populationSc: m.scPopulation,
      populationSt: m.stPopulation,
      populationOther,
      scPct: pct(m.scPopulation, m.population),
      stPct: pct(m.stPopulation, m.population),
      otherPct: pct(populationOther, m.population),
    },
  };
}

function aggregateDemo(mandals: LandingMandal[]): MandalDemographics {
  const populationMale = mandals.reduce((s, m) => s + m.demographics.populationMale, 0);
  const populationFemale = mandals.reduce((s, m) => s + m.demographics.populationFemale, 0);
  const populationSc = mandals.reduce((s, m) => s + m.demographics.populationSc, 0);
  const populationSt = mandals.reduce((s, m) => s + m.demographics.populationSt, 0);
  const total = populationMale + populationFemale;
  const populationOther = Math.max(0, total - populationSc - populationSt);
  return {
    populationMale,
    populationFemale,
    sexRatio: populationMale > 0 ? Math.round((1000 * populationFemale) / populationMale) : null,
    populationSc,
    populationSt,
    populationOther,
    scPct: pct(populationSc, total),
    stPct: pct(populationSt, total),
    otherPct: pct(populationOther, total),
  };
}

function kurupamLanding(): ConstituencyLandingModel {
  const meta = getConstituencyMeta("kurupam");
  const data = getExploreData();
  const electorate = data.electorate;
  const mandals: LandingMandal[] = data.mandals.map((m) => {
    const collected = data.villages.filter((v) => v.entity_slug === m.slug);
    return {
      slug: m.slug,
      displayName: m.displayName,
      villages: m.villages ?? collected.length,
      villageCount: m.villageCount,
      gramPanchayats: m.gramPanchayats ?? 0,
      totalPopulation: m.totalPopulation,
      totalHouseholds: m.totalHouseholds,
      registeredVotersEstimate: m.registeredVotersEstimate,
      collectedCount: collected.length,
      detailedCount: collected.filter((v) => v.has_detail).length,
      mapImageUrl: m.mapImageUrl,
      mapEmbedUrl: null,
      demographics: m.demographics,
    };
  });

  return {
    meta,
    hero: {
      reservationLabel: "AC 11 ST · Parvathipuram Manyam",
      districtLine: `${meta.district} · ${meta.state}`,
      title: "Kurupam Assembly",
      mark: "Constituency Explorer",
      description: `Local directory for five revenue mandals: ${data.stats.officialVillages} villages, panchayats, census, electorate, and maps.`,
      electorBadge: electorate
        ? `${electorate.totalRegisteredVoters.toLocaleString("en-IN")} electors · ${electorate.lokSabhaSegment ?? meta.lokSabha} LS`
        : null,
    },
    stats: {
      mandals: data.stats.mandals,
      officialVillages: data.stats.officialVillages,
      collectedVillages: data.stats.collectedVillages,
      gramPanchayats: data.stats.gramPanchayats,
      totalPopulation: data.stats.totalPopulation,
      censusYear: data.stats.censusYear,
    },
    mandals,
    electorate,
    hasVoterGender: Boolean(electorate && electorate.maleVoters + electorate.femaleVoters > 0),
    profile: data.profile,
    elections: (data.elections?.elections ?? []).map((e) => ({
      year: e.year,
      totalRegisteredVoters: e.totalRegisteredVoters,
      turnoutPct: e.turnoutPct,
      votesPolled: e.votesPolled,
      winner: { name: e.winner.name, party: e.winner.party, votes: e.winner.votes },
      runnerUp: { name: e.runnerUp.name, party: e.runnerUp.party, votes: e.runnerUp.votes },
      victoryMargin: e.victoryMargin,
    })),
    constituencyDemo: getConstituencyDemographics(),
    source: {
      label: "parvathipurammanyam.ap.gov.in",
      href: "https://parvathipurammanyam.ap.gov.in/administrative-setup/village-panchayats/",
      note: `Five mandals total ${data.stats.officialVillages.toLocaleString("en-IN")} revenue villages.`,
      voterNote: electorate
        ? `Registered voters (${electorate.dataYear}): ${electorate.totalRegisteredVoters.toLocaleString("en-IN")} for the constituency; mandal figures are estimated from census population share (ECI publishes AC-level rolls only).`
        : null,
    },
    villagesHref: sectionHref(meta.basePath, "villages"),
    mandalsHref: sectionHref(meta.basePath, "mandals"),
    mapsHref: sectionHref(meta.basePath, "maps"),
  };
}

function staticLanding(args: {
  id: ConstituencyId;
  totals: {
    mandals: number;
    totalVillages: number;
    totalGPs: number;
    totalPopulation: number;
    totalMale: number;
    totalFemale: number;
    totalHouseholds: number;
    totalSC: number;
    totalST: number;
  };
  mandalRows: MandalData[];
  voters: {
    totalVoters: number;
    maleVoters?: number;
    femaleVoters?: number;
    thirdGender?: number;
    turnout2024: number;
    votesPolled2024: number;
    urbanPercent?: number;
    ruralPercent?: number;
    scPercent?: number;
    stPercent?: number;
  };
  profileExtra: {
    rivers: string;
    nearestTown: string;
    heritage: string;
    postalCode: string;
    borderNotes: string | null;
    ruralElectorPct: number | null;
    stElectorConcentrationPct: number | null;
  };
  elections: {
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
  }[];
  source: LandingSource;
  description: string;
  mapEmbeds?: Record<string, string>;
}): ConstituencyLandingModel {
  const meta = getConstituencyMeta(args.id);
  const voterEstimates = distributeByPopulationShare(
    args.mandalRows.map((m) => ({ key: m.slug, weight: m.population })),
    args.voters.totalVoters
  );
  const mandals = args.mandalRows.map((m) =>
    mandalFromStatic(m, voterEstimates.get(m.slug) ?? null, args.mapEmbeds?.[m.slug] ?? null)
  );
  const male = args.voters.maleVoters ?? 0;
  const female = args.voters.femaleVoters ?? 0;
  const hasVoterGender = male + female > 0;
  const sexRatio = male > 0 ? Math.round((1000 * female) / male) : 0;

  const electorate: ConstituencyElectorate = {
    constituencyName: meta.name,
    reservation: meta.reservation,
    lokSabhaSegment: meta.lokSabha,
    district: meta.district,
    totalRegisteredVoters: args.voters.totalVoters,
    maleVoters: male,
    femaleVoters: female,
    thirdGenderVoters: args.voters.thirdGender ?? 0,
    sexRatio,
    sexRatioLabel: hasVoterGender
      ? `${sexRatio} female electors per 1,000 male electors`
      : "Gender-split rolls not published in this dataset",
    turnoutPct: args.voters.turnout2024,
    votesPolled: args.voters.votesPolled2024,
    dataYear: "2024",
    sourceUrl: args.source.href,
    reviewStatus: "approved",
  };

  const profile: ConstituencyProfile = {
    constituencyName: meta.name,
    district: meta.district,
    lokSabhaSegment: meta.lokSabha,
    reservation: meta.reservation,
    includedMandals: args.mandalRows.map((m) => m.name),
    ruralElectorPct: args.profileExtra.ruralElectorPct,
    stElectorConcentrationPct: args.profileExtra.stElectorConcentrationPct,
    borderNotes: args.profileExtra.borderNotes,
    rivers: args.profileExtra.rivers ? args.profileExtra.rivers.split(",").map((s) => s.trim()) : [],
    postalCode: args.profileExtra.postalCode,
    nearestTown: args.profileExtra.nearestTown,
    nearestTownKm: null,
    heritage: args.profileExtra.heritage,
    sourceUrl: args.source.href,
  };

  return {
    meta,
    hero: {
      reservationLabel: `AC ${meta.assemblyNo} ${meta.reservation} · ${meta.district}`,
      districtLine: `${meta.state}`,
      title: `${meta.name} Assembly`,
      mark: "Constituency Explorer",
      description: args.description,
      electorBadge: `${args.voters.totalVoters.toLocaleString("en-IN")} electors · ${meta.lokSabha} LS`,
    },
    stats: {
      mandals: args.totals.mandals,
      officialVillages: args.totals.totalVillages,
      collectedVillages: args.totals.totalVillages,
      gramPanchayats: args.totals.totalGPs,
      totalPopulation: args.totals.totalPopulation,
      censusYear: "2011",
    },
    mandals,
    electorate,
    hasVoterGender,
    profile,
    elections: args.elections.map((e) => ({
      year: e.year,
      totalRegisteredVoters: e.registeredVoters ?? null,
      turnoutPct: e.turnout ?? null,
      votesPolled: e.votesPolled ?? null,
      winner: { name: e.winner, party: e.winnerParty, votes: e.winnerVotes ?? null },
      runnerUp:
        e.runnerUp && e.runnerUpParty
          ? { name: e.runnerUp, party: e.runnerUpParty, votes: e.runnerUpVotes ?? null }
          : null,
      victoryMargin: e.margin > 0 ? e.margin : e.winnerVotes ? e.margin : null,
    })),
    constituencyDemo: aggregateDemo(mandals),
    source: args.source,
    villagesHref: sectionHref(meta.basePath, "villages"),
    mandalsHref: sectionHref(meta.basePath, "mandals"),
    mapsHref: sectionHref(meta.basePath, "maps"),
  };
}

function dhoneLanding(): ConstituencyLandingModel {
  return staticLanding({
    id: "dhone",
    totals: DHONE_TOTALS,
    mandalRows: DHONE_MANDALS,
    voters: DHONE_VOTERS,
    profileExtra: {
      rivers: DHONE_PROFILE.rivers,
      nearestTown: DHONE_PROFILE.nearestTown,
      heritage: DHONE_PROFILE.heritage,
      postalCode: DHONE_PROFILE.pinCode,
      borderNotes: `${DHONE_PROFILE.economy} ${DHONE_PROFILE.connectivity} ${DHONE_PROFILE.administration}`,
      ruralElectorPct: DHONE_VOTERS.ruralPercent,
      stElectorConcentrationPct: DHONE_VOTERS.stPercent,
    },
    elections: DHONE_ELECTIONS,
    source: {
      label: "nandyal.ap.gov.in",
      href: "https://nandyal.ap.gov.in/",
      note: `Three mandals total ${DHONE_TOTALS.totalVillages.toLocaleString("en-IN")} revenue villages. Census 2011.`,
      voterNote:
        "Registered voters (2024): constituency total from ECI / IndiaVotes. Mandal figures are estimated from census population share.",
    },
    description: `Local directory for three revenue mandals: ${DHONE_TOTALS.totalVillages} villages, panchayats, census, electorate, and booths. Historically Dronachalam.`,
    mapEmbeds: Object.fromEntries(DHONE_MAPS.map((m) => [m.slug, m.embedUrl])),
  });
}

function pattikondaLanding(): ConstituencyLandingModel {
  return staticLanding({
    id: "pattikonda",
    totals: PATTI_TOTALS,
    mandalRows: PATTI_MANDALS,
    voters: PATTI_VOTERS,
    profileExtra: {
      rivers: PATTI_PROFILE.rivers,
      nearestTown: PATTI_PROFILE.nearestTown,
      heritage: PATTI_PROFILE.heritage,
      postalCode: PATTI_PROFILE.pinCode,
      borderNotes: "Five revenue mandals on the western Kurnool uplands of the Rayalaseema plateau.",
      ruralElectorPct: PATTI_VOTERS.ruralPercent,
      stElectorConcentrationPct: null,
    },
    elections: PATTI_ELECTIONS,
    source: {
      label: "kurnool.ap.gov.in",
      href: "https://kurnool.ap.gov.in/",
      note: `Five mandals total ${PATTI_TOTALS.totalVillages.toLocaleString("en-IN")} revenue villages. Census 2011.`,
      voterNote:
        "Registered voters (2024): constituency total from IndiaVotes / ECI. Gender-split rolls are not in this dataset. Mandal figures are estimated from census population share.",
    },
    description: `Local directory for five revenue mandals: ${PATTI_TOTALS.totalVillages} villages, panchayats, census, electorate, and booths.`,
    mapEmbeds: Object.fromEntries(PATTI_MAPS.map((m) => [m.slug, m.embedUrl])),
  });
}

export function getLandingData(id: ConstituencyId): ConstituencyLandingModel {
  if (id === "dhone") return dhoneLanding();
  if (id === "pattikonda") return pattikondaLanding();
  return kurupamLanding();
}
