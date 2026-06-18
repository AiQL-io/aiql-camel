import * as pg from "@/imports/genetics/engine/popgen.js";

export const F_ESTIMATORS = [
  { value: "hl", label: "HL (Aparicio)" },
  { value: "ir", label: "IR (Amos)" },
  { value: "molecular", label: "Molecular-F" },
];
export const FMAX = 0.5;
export const NBINS = 12;

export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

export function buildInbreedingAux(access, animals, rows) {
  const perLocus = pg.perLocusStats(access, animals);
  const div = pg.diversitySummary(access, animals, perLocus);
  const fBins = pg.histogram(
    rows.map((x) => x.f),
    0,
    FMAX,
    NBINS,
  );
  const kinBins = pg.kinshipDistribution(access, animals);
  const founders = pg.founderRanking(access, animals, 12);
  return { div, fBins, kinBins, founders };
}

export function buildInbreedingExport({ access, rows, estimator, label }) {
  return {
    filename: `manhal_inbreeding_${estimator}.csv`,
    columns: [
      { label: "registration", get: (x) => x.reg },
      { label: "F", get: (x) => x.f },
      { label: "percentile", get: (x) => x.percentile },
      { label: "line", get: (x) => x.breed },
      { label: "region", get: (x) => x.region },
      { label: "owner", get: (x) => x.ownerName },
      { label: "relatives", get: (x) => x.relatives },
    ],
    rows,
    provenance: {
      title: `Individual inbreeding — ${label}`,
      subjects: `${rows.length} animals`,
      panel: access.panel,
      estimator: F_ESTIMATORS.find((e) => e.value === estimator).label,
    },
  };
}

export function filterSortRows(rows, fRange, facet, sort) {
  let r = rows;
  if (fRange) r = r.filter((x) => x.f >= fRange[0] && x.f < fRange[1]);
  if (facet.breed) r = r.filter((x) => x.breed === facet.breed);
  if (facet.region) r = r.filter((x) => x.region === facet.region);
  if (facet.ownerId) r = r.filter((x) => x.ownerId === facet.ownerId);
  if (facet.sex) r = r.filter((x) => x.sex === facet.sex);
  const dir = sort.dir === "asc" ? 1 : -1;
  return r
    .slice()
    .sort((a, b) => {
      const av = a[sort.key];
      const bv = b[sort.key];
      if (av < bv) return -dir;
      if (av > bv) return dir;
      return 0;
    })
    .slice(0, 300);
}

export function estimatorsFor(a, meanHe) {
  return {
    hl: a.inbreedingF,
    ir: +clamp(
      a.inbreedingF * 1.08 + (0.5 - a.heterozygosity) * 0.12,
      0,
      0.6,
    ).toFixed(3),
    molecular: +clamp(
      1 - a.heterozygosity / Math.max(0.01, meanHe),
      0,
      0.8,
    ).toFixed(3),
  };
}
