import { download } from "@/imports/verify/ui/components/exporters.js";

export const LOCUS_COLUMNS = [
  { key: "locus", label: "Locus", mono: true, method: null },
  { key: "na", label: "Na", digits: 0, method: "na" },
  { key: "ne", label: "Ne", digits: 2, method: "ne_alleles" },
  { key: "ho", label: "Ho", digits: 3, method: "ho" },
  { key: "he", label: "He", digits: 3, method: "he" },
  { key: "pic", label: "PIC", digits: 3, method: "pic" },
  { key: "pe", label: "PE", digits: 3, method: "cpe" },
  { key: "hweP", label: "HWE p", digits: 3, method: "hwe" },
  { key: "nullEst", label: "Null est", digits: 3, method: "f" },
  { key: "missingPct", label: "% miss", digits: 1, method: null },
];

export function flagReasons(l) {
  const out = [];
  if (l.hweP < 0.05) out.push("HWE deviation");
  if (l.missingPct > 15) out.push("high missingness");
  if (l.pic < 0.4) out.push("low PIC");
  if (l.nullEst > 0.15) out.push("possible null allele");
  return out;
}

export function buildPerLocusExport({ perLocus, panel, label }) {
  return {
    filename: "manhal_per_locus_stats.csv",
    columns: [
      { label: "locus", get: (l) => l.locus },
      { label: "tier", get: (l) => l.tier },
      { label: "Na", get: (l) => l.na },
      { label: "Ne", get: (l) => l.ne },
      { label: "Ho", get: (l) => l.ho },
      { label: "He", get: (l) => l.he },
      { label: "PIC", get: (l) => l.pic },
      { label: "PE", get: (l) => l.pe },
      { label: "HWE_p", get: (l) => l.hweP },
      { label: "null_allele_est", get: (l) => l.nullEst },
      { label: "pct_missing", get: (l) => l.missingPct },
      { label: "flagged", get: (l) => (l.flagged ? "yes" : "") },
    ],
    rows: perLocus,
    provenance: {
      title: `Per-locus panel statistics — ${label}`,
      subjects: `${perLocus.length} loci`,
      panel,
    },
  };
}

export function exportGenAlEx(access) {
  const loci = access.panel.loci || [];
  const alleles = [...new Set(loci.flatMap((l) => l.knownAlleles || []))].sort(
    (a, b) => a - b,
  );
  const header = ["Allele", ...loci.map((l) => l.locusName)].join(",");
  const body = alleles
    .map((al) =>
      [
        al,
        ...loci.map((l) => {
          const f = (l.populationAlleleFrequencies || {})[al];
          return f != null ? f.toFixed(4) : "0";
        }),
      ].join(","),
    )
    .join("\n");
  const meta = [
    `# GenAlEx allele-frequency sheet — ${access.panel.name}`,
    `# ${loci.length} loci, ${alleles.length} alleles · panel ${access.panel.id} v${access.panel.version}`,
    `# Generated: ${new Date().toISOString()}`,
  ].join("\n");
  download(
    [meta, header, body].join("\n"),
    "manhal_allele_frequencies_genalex.csv",
    "text/csv",
  );
}

export function exportGenepop(access) {
  const loci = access.panel.loci || [];
  const lines = [
    `Manhal Camel STR panel ${access.panel.id} v${access.panel.version} — allele frequencies (Genepop-style)`,
    ...loci.map((l) => l.locusName),
    "Pop",
  ];
  for (const l of loci) {
    lines.push(`Locus ${l.locusName} (Na=${l.na}, He=${l.He.toFixed(3)})`);
    const entries = Object.entries(l.populationAlleleFrequencies || {}).sort(
      (a, b) => Number(a[0]) - Number(b[0]),
    );
    for (const [allele, f] of entries)
      lines.push(`  ${String(allele).padStart(3, "0")}  ${f.toFixed(4)}`);
  }
  download(
    lines.join("\n"),
    "manhal_allele_frequencies_genepop.txt",
    "text/plain",
  );
}
