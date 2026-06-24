const BASES = ["A", "C", "G", "T"];
const COMPLEMENT = { A: "T", T: "A", C: "G", G: "C" };

export const ORGANISMS = [
  "Human",
  "E. coli",
  "Mouse",
  "Yeast",
  "Haloferax volcanii",
  "Arabidopsis",
];

export const EXAMPLES = [
  { label: "E. coli gyrA", organism: "E. coli", prompt: "ATGAGCGACCTT" },
  { label: "Human gapdh", organism: "Human", prompt: "ATGGGGAAGGTG" },
  {
    label: "Haloferax volcanii secY",
    organism: "Haloferax volcanii",
    prompt: "ATGGCATTCCAG",
  },
];

const CODON_TABLE = {
  TTT: "F",
  TTC: "F",
  TTA: "L",
  TTG: "L",
  CTT: "L",
  CTC: "L",
  CTA: "L",
  CTG: "L",
  ATT: "I",
  ATC: "I",
  ATA: "I",
  ATG: "M",
  GTT: "V",
  GTC: "V",
  GTA: "V",
  GTG: "V",
  TCT: "S",
  TCC: "S",
  TCA: "S",
  TCG: "S",
  CCT: "P",
  CCC: "P",
  CCA: "P",
  CCG: "P",
  ACT: "T",
  ACC: "T",
  ACA: "T",
  ACG: "T",
  GCT: "A",
  GCC: "A",
  GCA: "A",
  GCG: "A",
  TAT: "Y",
  TAC: "Y",
  TAA: "*",
  TAG: "*",
  CAT: "H",
  CAC: "H",
  CAA: "Q",
  CAG: "Q",
  AAT: "N",
  AAC: "N",
  AAA: "K",
  AAG: "K",
  GAT: "D",
  GAC: "D",
  GAA: "E",
  GAG: "E",
  TGT: "C",
  TGC: "C",
  TGA: "*",
  TGG: "W",
  CGT: "R",
  CGC: "R",
  CGA: "R",
  CGG: "R",
  AGT: "S",
  AGC: "S",
  AGA: "R",
  AGG: "R",
  GGT: "G",
  GGC: "G",
  GGA: "G",
  GGG: "G",
};

export const AA_COLORS = {
  A: "#80b1d3",
  V: "#80b1d3",
  L: "#80b1d3",
  I: "#80b1d3",
  M: "#80b1d3",
  F: "#bc80bd",
  W: "#bc80bd",
  Y: "#bc80bd",
  S: "#8dd3c7",
  T: "#8dd3c7",
  N: "#8dd3c7",
  Q: "#8dd3c7",
  D: "#fb8072",
  E: "#fb8072",
  K: "#fdb462",
  R: "#fdb462",
  H: "#fdb462",
  G: "#ffffb3",
  P: "#ffed6f",
  C: "#b3de69",
  "*": "#d9d9d9",
};

export const BASE_COLORS = {
  A: "#f5c542",
  C: "#56b4e9",
  T: "#b07fd4",
  G: "#71c285",
};

function makeRng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function hashStr(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function sanitizePrompt(text) {
  return (text || "").toUpperCase().replace(/[^ACGT]/g, "");
}

export function exampleSequence(seed, prefix = "", len = 500) {
  const rng = makeRng(hashStr(seed));
  let s = sanitizePrompt(prefix);
  while (s.length < len) s += BASES[(rng() * 4) | 0];
  return s.slice(0, len);
}

export function complement(seq) {
  return seq
    .split("")
    .map((b) => COMPLEMENT[b] || "N")
    .join("");
}

export function translate(dna) {
  let aa = "";
  for (let i = 0; i + 3 <= dna.length; i += 3) {
    aa += CODON_TABLE[dna.slice(i, i + 3)] || "X";
  }
  return aa;
}

function findOrfs(seq, minCodons = 18) {
  const orfs = [];
  for (let frame = 0; frame < 3; frame++) {
    let i = frame;
    while (i + 3 <= seq.length) {
      if (seq.slice(i, i + 3) === "ATG") {
        let j = i + 3;
        while (j + 3 <= seq.length) {
          const c = seq.slice(j, j + 3);
          if (c === "TAA" || c === "TAG" || c === "TGA") break;
          j += 3;
        }
        const end = Math.min(j + 3, seq.length);
        if ((end - i) / 3 >= minCodons) {
          orfs.push({ start: i, end, frame, aa: translate(seq.slice(i, end)) });
          i = end;
          continue;
        }
      }
      i += 3;
    }
  }
  return orfs.sort((a, b) => a.start - b.start).slice(0, 4);
}

function randomCodonNonStop(rng) {
  let c;
  do {
    c =
      BASES[(rng() * 4) | 0] + BASES[(rng() * 4) | 0] + BASES[(rng() * 4) | 0];
  } while (c === "TAA" || c === "TAG" || c === "TGA");
  return c;
}

export function generateSequence({
  prompt = "",
  organism = "Human",
  length = 500,
}) {
  const clean = sanitizePrompt(prompt);
  const rng = makeRng(hashStr(`${organism}:${clean}:${length}`));
  const total = Math.max(120, Math.min(900, length + 200));

  const out = clean.split("");
  const orfPlan = [
    { at: Math.max(clean.length, 24), codons: 30 + ((rng() * 40) | 0) },
    { at: 360, codons: 28 + ((rng() * 50) | 0) },
  ];
  let planIdx = 0;
  while (out.length < total) {
    const plan = orfPlan[planIdx];
    if (plan && out.length >= plan.at) {
      out.push(..."ATG".split(""));
      for (let k = 0; k < plan.codons; k++) {
        out.push(...randomCodonNonStop(rng).split(""));
      }
      out.push(...["TAA", "TAG", "TGA"][(rng() * 3) | 0].split(""));
      planIdx += 1;
    } else {
      out.push(BASES[(rng() * 4) | 0]);
    }
  }
  const bases = out.slice(0, total).join("");

  const orfs = findOrfs(bases);
  const inOrf = new Array(bases.length).fill(false);
  orfs.forEach((o) => {
    for (let i = o.start; i < o.end; i++) inOrf[i] = true;
  });
  const entropy = [];
  for (let i = 0; i < bases.length; i++) {
    const base = inOrf[i] ? 0.18 : 0.62;
    entropy.push(
      +Math.min(1, Math.max(0.02, base + (rng() - 0.5) * 0.5)).toFixed(3),
    );
  }

  const nll = +(
    0.18 +
    (entropy.reduce((a, b) => a + b, 0) / entropy.length) * 0.4
  ).toFixed(3);

  return {
    bases,
    promptLen: clean.length,
    organism,
    orfs,
    entropy,
    nll,
    lowEntropyThreshold: 0.25,
  };
}

export const GENOMES = [
  {
    id: "GCF_000005845.2",
    label: "Escherichia coli — GCF_000005845.2",
    kb: 4641,
  },
  {
    id: "GCF_000009045.1",
    label: "Bacillus subtilis — GCF_000009045.1",
    kb: 4215,
  },
  {
    id: "GCF_000195955.2",
    label: "M. tuberculosis — GCF_000195955.2",
    kb: 4411,
  },
];

export const CONCEPTS = [
  { key: "cds", label: "CDS", feature: "f/13606", color: "#7b6cf0", f1: 0.97 },
  {
    key: "alpha",
    label: "Alpha Helix",
    feature: "f/28741",
    color: "#4f6ad8",
    f1: 0.91,
  },
  {
    key: "beta",
    label: "Beta Sheet",
    feature: "f/22326",
    color: "#d6a93a",
    f1: 0.88,
  },
  {
    key: "trna",
    label: "tRNA",
    feature: "f/30262",
    color: "#5bb56a",
    f1: 0.99,
  },
  { key: "rrna", label: "rRNA", feature: "f/2812", color: "#cf7a3a", f1: 0.96 },
  {
    key: "prophage",
    label: "Prophage",
    feature: "f/19746",
    color: "#b86bd0",
    f1: 0.84,
  },
  {
    key: "crispr",
    label: "CRISPR",
    feature: "f/41028",
    color: "#d65a7a",
    f1: 0.93,
  },
];

export function conceptTracks(genomeId, concept, bins = 240) {
  const rng = makeRng(hashStr(`${genomeId}:${concept.feature}`));
  const signal = [];
  let v = rng();
  for (let i = 0; i < bins; i++) {
    v = Math.max(0, Math.min(1, v * 0.78 + rng() * 0.34 - 0.05));
    if (["trna", "rrna", "crispr"].includes(concept.key)) {
      signal.push(rng() > 0.94 ? 0.6 + rng() * 0.4 : rng() * 0.12);
    } else {
      signal.push(+v.toFixed(3));
    }
  }
  const peak = +Math.max(...signal, 0.1).toFixed(2);

  const hits = [];
  const density = {
    cds: 0.55,
    alpha: 0.4,
    beta: 0.45,
    trna: 0.05,
    rrna: 0.02,
    prophage: 0.06,
    crispr: 0.03,
  }[concept.key];
  for (let i = 0; i < bins; i++) {
    if (rng() < density) hits.push(i);
  }
  const labels = {
    trna: [
      "tRNA-Gln(ctg)",
      "tRNA-Ser(gga)",
      "tRNA-Tyr(gta)",
      "tRNA-Val(gac)",
      "tRNA-Leu(taa)",
      "tRNA-Pro(ggg)",
      "tRNA-Arg(cct)",
    ],
    rrna: ["5S ribosomal RNA", "16S ribosomal RNA", "23S ribosomal RNA"],
    crispr: ["CRISPR array 1", "CRISPR array 2"],
  }[concept.key];

  return { signal, peak, hits, labels };
}

export function bpAt(genome, bin, bins = 240) {
  return Math.round((bin / bins) * genome.kb * 1000);
}

const PRODUCTS = {
  cds: [
    ["inositol-1-monophosphatase", "suhB"],
    ["DNA gyrase subunit A", "gyrA"],
    ["ATP synthase subunit beta", "atpD"],
    ["transketolase 1", "tktA"],
    ["outer membrane protein A", "ompA"],
    ["Uncharacterized protein YfhR", "yfhR"],
  ],
  alpha: [
    ["chaperone protein DnaK", "dnaK"],
    ["sigma-54 factor", "rpoN"],
    ["transcriptional regulator", "lrp"],
  ],
  beta: [
    ["porin OmpC", "ompC"],
    ["beta-barrel assembly protein BamA", "bamA"],
    ["maltoporin LamB", "lamB"],
  ],
  trna: [
    ["tRNA-Ala(ggc)", "alaT"],
    ["tRNA-Gln(ctg)", "glnW"],
  ],
  rrna: [
    ["16S ribosomal RNA", "rrsA"],
    ["5S ribosomal RNA", "rrfA"],
  ],
  prophage: [
    ["prophage integrase IntA", "intA"],
    ["phage tail protein", "-"],
  ],
  crispr: [
    ["CRISPR-associated endonuclease Cas3", "cas3"],
    ["CRISPR repeat region", "-"],
  ],
};

const SOURCE = {
  cds: "Pyrodigal",
  alpha: "Pyrodigal",
  beta: "Pyrodigal",
  trna: "tRNAscan-SE",
  rrna: "barrnap",
  prophage: "PHASTER",
  crispr: "CRISPRCasFinder",
};

export function featureDetails(genome, concept, bin, bins = 240) {
  const rng = makeRng(hashStr(`${genome.id}:${concept.feature}:${bin}`));
  const pool = PRODUCTS[concept.key] || PRODUCTS.cds;
  const [product, gene] = pool[(rng() * pool.length) | 0];
  const start = bpAt(genome, bin, bins);
  const end = start + 600 + ((rng() * 1200) | 0);
  const locus = `KOIAIB_${String(2700 + Math.round(bin * 11)).padStart(5, "0")}`;
  const dbxref = [
    `COG:COG0${480 + ((rng() * 99) | 0)}`,
    `EC:3.1.${1 + ((rng() * 6) | 0)}.${(rng() * 30) | 0}`,
    `GO:000${1000 + ((rng() * 8000) | 0)}`,
  ].join(",");
  return {
    name: product,
    type: concept.label,
    source: SOURCE[concept.key] || "Pyrodigal",
    phase: 0,
    locusTag: locus,
    product,
    dbxref,
    gene,
    location: `NC_000913.3:${start.toLocaleString()}-${end.toLocaleString()}`,
    color: concept.color,
  };
}

export function buildProteinPdb(aaSeq, seedStr) {
  const rng = makeRng(hashStr(seedStr || "x"));
  const clean = (aaSeq || "").replace(/\*+$/, "");
  const n = Math.max(28, Math.min(72, clean.length || 44));

  const HR = 2.3;
  const RISE = 1.5;
  const TURN = (100 * Math.PI) / 180;

  const cas = [];
  const helixRanges = [];
  const nHelix = n >= 50 ? 4 : 3;
  const perHelix = Math.max(8, Math.floor((n - nHelix * 3) / nHelix));

  let idx = 0;
  for (let k = 0; k < nHelix && idx < n; k++) {
    const ang = k * (Math.PI / 2) + rng() * 0.3;
    const ox = Math.cos(ang) * 6;
    const oy = Math.sin(ang) * 6;
    const dir = k % 2 === 0 ? 1 : -1;
    const z0 = dir > 0 ? 0 : perHelix * RISE;
    const start = idx;
    for (let i = 0; i < perHelix && idx < n; i++) {
      const phase = i * TURN + k * 1.3;
      cas.push([
        ox + HR * Math.cos(phase),
        oy + HR * Math.sin(phase),
        z0 + dir * i * RISE,
      ]);
      idx++;
    }
    helixRanges.push([start, idx - 1]);
    const loopN = 2 + ((rng() * 2) | 0);
    for (let i = 0; i < loopN && idx < n; i++) {
      cas.push(null);
      idx++;
    }
  }

  for (let i = 0; i < cas.length; i++) {
    if (cas[i]) continue;
    let p = i - 1;
    while (p >= 0 && !cas[p]) p--;
    let q = i + 1;
    while (q < cas.length && !cas[q]) q++;
    const A = cas[p] || [0, 0, 0];
    const B = cas[q] || [A[0], A[1], A[2] + 3];
    const f = (i - p) / (q - p);
    cas[i] = [
      A[0] + (B[0] - A[0]) * f + (rng() - 0.5),
      A[1] + (B[1] - A[1]) * f + (rng() - 0.5),
      A[2] + (B[2] - A[2]) * f + (rng() - 0.5),
    ];
  }

  const x8 = (v) => v.toFixed(3).padStart(8);
  const lines = [];
  helixRanges.forEach((r, hi) => {
    const s = String(r[0] + 1).padStart(4);
    const e = String(r[1] + 1).padStart(4);
    lines.push(
      `HELIX  ${String(hi + 1).padStart(3)} ${String(hi + 1).padStart(3)} ALA A ${s}  ALA A ${e}  1 ${String(r[1] - r[0] + 1).padStart(5)}`,
    );
  });
  let serial = 1;
  cas.forEach((c, i) => {
    if (!c) return;
    lines.push(
      `ATOM  ${String(serial).padStart(5)}  CA  ALA A${String(i + 1).padStart(4)}    ${x8(c[0])}${x8(c[1])}${x8(c[2])}  1.00  0.00           C`,
    );
    serial++;
  });
  lines.push("TER");
  return lines.join("\n");
}
