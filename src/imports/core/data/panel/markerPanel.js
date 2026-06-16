const LOCI_DEF = [
  ["YWLL08", "C", [130, 190], 23],
  ["YWLL09", "C", [150, 200], 9],
  ["YWLL38", "C", [130, 180], 10],
  ["YWLL44", "C", [90, 140], 13],
  ["VOLP03", "C", [170, 220], 17],
  ["VOLP08", "C", [150, 200], 15],
  ["VOLP10", "C", [230, 270], 10],
  ["VOLP32", "C", [175, 205], 9],
  ["VOLP67", "C", [150, 210], 12],
  ["CMS13", "C", [140, 185], 10],
  ["CMS50", "C", [150, 210], 22],
  ["LCA66", "C", [210, 255], 13],
  ["CVRL05", "C", [150, 200], 14],
  ["CVRL07", "C", [150, 210], 16],

  ["CMS15", "E", [230, 280], 10],
  ["CMS18", "E", [110, 160], 10],
  ["CMS121", "E", [120, 170], 15],
  ["CVRL01", "E", [90, 170], 21],
  ["CVRL02", "E", [90, 140], 11],
  ["CVRL06", "E", [100, 150], 10],
  ["YWLL59", "E", [90, 120], 8],

  ["CMS17", "O", [140, 160], 2],
];

function allelesFor([min, max], n) {
  const all = [];
  for (let v = min; v <= max; v += 2) all.push(v);
  if (all.length <= n) return all;

  const step = (all.length - 1) / (n - 1);
  const out = [];
  for (let i = 0; i < n; i++) out.push(all[Math.round(i * step)]);
  return Array.from(new Set(out));
}

function skewedFreqs(alleles, rng) {
  const weights = alleles.map(() => Math.pow(rng.next(), 3) + 0.01);
  const total = weights.reduce((a, b) => a + b, 0);
  const freqs = {};
  alleles.forEach((a, i) => (freqs[a] = weights[i] / total));
  return freqs;
}

function sumPow(freqs, p) {
  let s = 0;
  for (const k in freqs) s += Math.pow(freqs[k], p);
  return s;
}

function heterozygosity(freqs) {
  return 1 - sumPow(freqs, 2);
}

function pic(freqs) {
  const p2 = sumPow(freqs, 2);
  const keys = Object.keys(freqs);
  let cross = 0;
  for (let i = 0; i < keys.length; i++) {
    for (let j = i + 1; j < keys.length; j++) {
      const pi = freqs[keys[i]];
      const pj = freqs[keys[j]];
      cross += 2 * pi * pi * pj * pj;
    }
  }
  return 1 - p2 - cross;
}

function exclusionPower(freqs) {
  const s2 = sumPow(freqs, 2);
  const s3 = sumPow(freqs, 3);
  const s4 = sumPow(freqs, 4);
  return 1 - 4 * s2 + 2 * s2 * s2 + 4 * s3 - 3 * s4;
}

export function buildPanel(rng, { id = "panel_v1" } = {}) {
  const loci = LOCI_DEF.map(([locusName, tier, range, na]) => {
    const knownAlleles = allelesFor(range, na);
    const populationAlleleFrequencies = skewedFreqs(knownAlleles, rng);
    return {
      locusName,
      tier,
      repeatType: "di",
      alleleRange: range,
      knownAlleles,
      populationAlleleFrequencies,
      na: knownAlleles.length,
      He: heterozygosity(populationAlleleFrequencies),
      PIC: pic(populationAlleleFrequencies),
      PE: exclusionPower(populationAlleleFrequencies),
    };
  });

  const cpe = (subset) => 1 - subset.reduce((acc, l) => acc * (1 - l.PE), 1);

  return {
    id,
    name: "Manhal Camel STR Panel v1",
    species: "Camelus dromedarius",
    loci,
    coreLoci: loci.filter((l) => l.tier === "C").map((l) => l.locusName),
    cpeCore: cpe(loci.filter((l) => l.tier === "C")),
    cpeAll: cpe(loci.filter((l) => l.tier !== "O")),
    isDefault: true,
    version: 1,
  };
}
