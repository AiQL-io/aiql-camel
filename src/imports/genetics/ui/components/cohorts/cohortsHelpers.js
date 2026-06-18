export const COMPARE_METRICS = [
  { key: "he", label: "He", digits: 3, hint: "Expected heterozygosity" },
  { key: "ho", label: "Ho", digits: 3, hint: "Observed heterozygosity" },
  {
    key: "ar",
    label: "Ar",
    digits: 2,
    rarefied: true,
    hint: "Allelic richness (rarefied)",
  },
  { key: "na", label: "Na", digits: 1, hint: "Mean alleles per locus" },
  { key: "meanF", label: "Mean F", digits: 3, hint: "Mean inbreeding" },
  {
    key: "meanKinship",
    label: "Kinship",
    digits: 4,
    hint: "Mean pairwise kinship",
  },
  { key: "ne", label: "Ne", digits: 0, hint: "Effective population size" },
];

export const FST_BAND_LABEL = {
  negligible: "Negligible",
  moderate: "Moderate",
  great: "Great",
  self: "—",
};

function topMix(animals, key, n, top) {
  const counts = {};
  for (const a of animals) counts[a[key]] = (counts[a[key]] || 0) + 1;
  return Object.entries(counts)
    .map(([v, c]) => ({ v, n: c }))
    .sort((a, b) => b.n - a.n)
    .slice(0, top)
    .map((x) => `${x.v} ${Math.round((x.n / n) * 100)}%`)
    .join(" · ");
}

export function composition(animals, breeds, top = 3) {
  const n = animals.length || 1;
  const counts = {};
  for (const a of animals) counts[a.breed] = (counts[a.breed] || 0) + 1;
  const mix = breeds
    .map((b) => ({ breed: b, n: counts[b] || 0 }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n);
  const profiled = Math.round(
    (animals.filter((a) => a.hasDNA).length / n) * 100,
  );
  return {
    label: topMix(animals, "breed", n, top),
    regionLabel: topMix(animals, "region", n, top),
    mix,
    profiled,
  };
}

export function relativeTime(ts) {
  if (!ts) return "";
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export function buildComparisonExport({ metrics, label }) {
  const rows = metrics;
  return {
    filename: "manhal_cohort_comparison.csv",
    columns: [
      { label: "cohort", get: (m) => m.name },
      { label: "N", get: (m) => m.n },
      { label: "He", get: (m) => m.he },
      { label: "Ho", get: (m) => m.ho },
      { label: "Ar_rarefied", get: (m) => m.ar },
      { label: "Na", get: (m) => m.na },
      { label: "mean_F", get: (m) => m.meanF },
      { label: "mean_kinship", get: (m) => m.meanKinship },
      { label: "Ne", get: (m) => m.ne },
    ],
    rows,
    provenance: {
      title: `Cohort comparison — ${label}`,
      subjects: `${metrics.length} cohorts`,
    },
  };
}

export function buildFstExport({ metrics, fstMatrix }) {
  const columns = [
    { label: "cohort", get: (row) => row.name },
    ...metrics.map((m, j) => ({
      label: m.name,
      get: (row) => fstMatrix[row.i][j].value,
    })),
  ];
  return {
    filename: "manhal_fst_matrix.csv",
    columns,
    rows: metrics.map((m, i) => ({ name: m.name, i })),
    provenance: {
      title: "Pairwise F_ST matrix",
      subjects: `${metrics.length} cohorts`,
    },
  };
}
