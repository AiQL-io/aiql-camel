import * as pg from "@/imports/genetics/engine/popgen.js";

export const REGION_METRICS = [
  { value: "he", label: "Observed heterozygosity" },
  { value: "ar", label: "Allelic richness (rarefied)" },
  { value: "meanF", label: "Mean inbreeding F" },
  { value: "n", label: "Animals profiled" },
];

export const PERIODS = [
  { value: "all", label: "All time" },
  { value: "1095", label: "Last 3 years" },
  { value: "365", label: "Last 365 days" },
  { value: "90", label: "Last 90 days" },
  { value: "30", label: "Last 30 days" },
  { value: "cohort", label: "By birth-cohort" },
];

export function buildDiversityModel(access, animals) {
  const perLocus = pg.perLocusStats(access, animals);
  const div = pg.diversitySummary(access, animals, perLocus);
  const time = pg.diversityOverTime(access, animals);
  const insights = pg.autoInsights(access, animals, perLocus, time);
  const pcoa = pg.pcoaCoords(access, animals, { sample: 700 });
  const fBins = pg.histogram(
    animals.map((a) => a.inbreedingF),
    0,
    0.35,
    9,
  );
  return { perLocus, div, time, insights, pcoa, fBins };
}

export function buildDiversityExport({ access, perLocus, div, label, period }) {
  return {
    filename: `manhal_diversity_${period}.csv`,
    columns: [
      { label: "locus", get: (l) => l.locus },
      { label: "Na", get: (l) => l.na },
      { label: "Ne", get: (l) => l.ne },
      { label: "Ho", get: (l) => l.ho },
      { label: "He", get: (l) => l.he },
      { label: "PIC", get: (l) => l.pic },
      { label: "HWE_p", get: (l) => l.hweP },
    ],
    rows: perLocus,
    provenance: {
      title: `Population diversity — ${label}`,
      subjects: `${div.nAnalyzed} animals (${div.pctRegistry}% of registry)`,
      panel: access.panel,
    },
  };
}
