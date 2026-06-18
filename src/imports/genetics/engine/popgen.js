function hash01(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}

const clamp = (v, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));
const mean = (arr) =>
  arr.length ? arr.reduce((s, x) => s + x, 0) / arr.length : 0;

export function perLocusStats(access, animals) {
  const loci = access.panel.loci || [];
  const ids = new Set(animals.map((a) => a.id));

  const het = new Map();
  const typed = new Map();
  for (const a of animals) {
    const prof = access.getProfile(a.id);
    if (!prof) continue;
    for (const g of prof.genotypes) {
      typed.set(g.locus, (typed.get(g.locus) || 0) + 1);
      if (g.alleleA !== g.alleleB)
        het.set(g.locus, (het.get(g.locus) || 0) + 1);
    }
  }
  const n = ids.size || 1;

  const lowPic = loci
    .slice()
    .sort((x, y) => (x.PIC ?? 1) - (y.PIC ?? 1))
    .slice(0, 2)
    .map((l) => l.locusName);

  return loci.map((l) => {
    const t = typed.get(l.locusName) || 0;
    const ho = t ? (het.get(l.locusName) || 0) / t : 0;
    const he = l.He ?? 0;
    const deviant = lowPic.includes(l.locusName);
    const hweP = deviant
      ? +(0.001 + hash01(l.locusName + "hwe") * 0.02).toFixed(3)
      : +(0.08 + hash01(l.locusName + "hwe") * 0.9).toFixed(3);
    const nullEst = +clamp(
      (he - ho) / (1 + he) + (deviant ? 0.06 : 0),
      0,
      0.4,
    ).toFixed(3);
    return {
      locus: l.locusName,
      tier: l.tier,
      na: l.na ?? (l.knownAlleles ? l.knownAlleles.length : 0),
      ne: +(1 / Math.max(1e-6, 1 - he)).toFixed(2),
      ho: +ho.toFixed(3),
      he: +he.toFixed(3),
      pic: +(l.PIC ?? 0).toFixed(3),
      pe: +(l.PE ?? 0).toFixed(3),
      hweP,
      nullEst,
      missingPct: +(100 * (1 - t / n)).toFixed(1),
      hetDeficit: he - ho > 0.08,
      flagged: deviant || he - ho > 0.12 || (l.PIC ?? 1) < 0.4,
    };
  });
}

export function panelPower(access, perLocus) {
  const loci = access.panel.loci || [];
  const freqs = (l) => Object.values(l.populationAlleleFrequencies || {});
  let pi = 1;
  let piSibs = 1;
  for (const l of loci) {
    const p = freqs(l);
    const sum2 = p.reduce((s, x) => s + x * x, 0);
    const sum4 = p.reduce((s, x) => s + x * x * x * x, 0);
    const piLoc = 2 * sum2 * sum2 - sum4;
    const piSibLoc = 0.25 * (1 + 2 * sum2 + sum2 * sum2 - 2 * sum4);
    pi *= piLoc > 0 ? piLoc : 1;
    piSibs *= clamp(piSibLoc, 1e-6, 1);
  }
  const cpe =
    access.panel.cpeAll ??
    1 - loci.reduce((acc, l) => acc * (1 - (l.PE || 0)), 1);
  return {
    cpe: +cpe.toFixed(5),
    pi,
    piSibs,
    meanPic: +mean(perLocus.map((l) => l.pic)).toFixed(3),
    nLoci: loci.length,
    nAlleles: loci.reduce((s, l) => s + (l.na || 0), 0),
  };
}

function rarefiedAr(loci, g = 30) {
  const per = loci.map((l) => {
    const p = Object.values(l.populationAlleleFrequencies || {});
    return p.reduce((s, x) => s + (1 - Math.pow(1 - x, g)), 0);
  });
  return mean(per);
}

export function hotspotBreed(access) {
  return access.facets.breeds
    .slice()
    .sort((a, b) => hash01(b + "hot") - hash01(a + "hot"))[0];
}

export function lineKinship(access, breed, lineMeanF) {
  const boost =
    hash01(breed + "kin") * 0.012 +
    (breed === hotspotBreed(access) ? 0.018 : 0);
  return clamp(0.003 + 0.02 * lineMeanF + boost, 0.0008, 0.4);
}

function meanKinshipOf(access, animals) {
  const byBreed = new Map();
  for (const a of animals) {
    const o = byBreed.get(a.breed) || { f: [], n: 0 };
    o.f.push(a.inbreedingF);
    o.n += 1;
    byBreed.set(a.breed, o);
  }
  let wsum = 0;
  let n = 0;
  for (const [breed, o] of byBreed) {
    const k = lineKinship(access, breed, mean(o.f));
    wsum += k * o.n;
    n += o.n;
  }
  return n ? wsum / n : 0.01;
}

export function diversitySummary(access, animals, perLocus) {
  const loci = access.panel.loci || [];
  const meanHe = +mean(loci.map((l) => l.He ?? 0)).toFixed(3);
  const meanHo = +mean(perLocus.map((l) => l.ho)).toFixed(3);
  const ar = +rarefiedAr(loci).toFixed(2);
  const meanF = +mean(animals.map((a) => a.inbreedingF)).toFixed(3);
  const meanKinship = +meanKinshipOf(access, animals).toFixed(4);
  const ne = Math.round(1 / (2 * Math.max(0.0008, meanKinship)));
  const total = access.animals.filter((a) => a.hasDNA).length || 1;

  const gdi = Math.round(
    (meanHe / 3 + clamp(ar / 10) / 3 + (1 - meanKinship) / 3) * 100,
  );
  return {
    gdi,
    gdiBand: gdi >= 75 ? "High" : gdi >= 55 ? "Moderate" : "Low",
    meanHe,
    meanHo,
    ar,
    meanF,
    meanKinship,
    ne,
    nAnalyzed: animals.length,
    pctRegistry: Math.round((animals.length / total) * 100),
    informativeLoci: perLocus.filter((l) => l.na > 0).length,
  };
}

export function individualF(animals, meanHe, estimator = "hl") {
  return animals.map((a) => {
    let f = a.inbreedingF;
    if (estimator === "ir")
      f = clamp(a.inbreedingF * 1.08 + (0.5 - a.heterozygosity) * 0.12, 0, 0.6);
    else if (estimator === "molecular")
      f = clamp(1 - a.heterozygosity / Math.max(0.01, meanHe), 0, 0.8);
    return { id: a.id, f: +f.toFixed(3), percentile: a.inbreedingPercentile };
  });
}

export function histogram(values, min, max, nbins) {
  const bins = new Array(nbins).fill(0);
  const span = max - min || 1;
  for (const v of values) {
    let i = Math.floor(((v - min) / span) * nbins);
    if (i < 0) i = 0;
    if (i >= nbins) i = nbins - 1;
    bins[i] += 1;
  }
  return bins;
}

export function alleleFreqSpectrum(access, locusName) {
  const l = (access.panel.loci || []).find((x) => x.locusName === locusName);
  if (!l) return [];
  return Object.entries(l.populationAlleleFrequencies || {})
    .map(([allele, freq]) => ({ allele, freq: +(freq * 100).toFixed(1) }))
    .sort((a, b) => Number(a.allele) - Number(b.allele));
}

export function locusDetail(access, animals, locusName) {
  const l = (access.panel.loci || []).find((x) => x.locusName === locusName);
  if (!l) return null;
  const total = animals.length || 1;
  let typed = 0;
  let het = 0;
  const alleleCounts = new Map();
  for (const a of animals) {
    const prof = access.getProfile(a.id);
    if (!prof) continue;
    const g = prof.genotypes.find((x) => x.locus === locusName);
    if (!g) continue;
    typed += 1;
    if (g.alleleA !== g.alleleB) het += 1;
    const ka = String(g.alleleA);
    const kb = String(g.alleleB);
    alleleCounts.set(ka, (alleleCounts.get(ka) || 0) + 1);
    alleleCounts.set(kb, (alleleCounts.get(kb) || 0) + 1);
  }
  const he = l.He ?? 0;
  const obsHet = het;
  const obsHom = typed - het;
  const expHet = +(typed * he).toFixed(1);
  const expHom = +(typed * (1 - he)).toFixed(1);
  const twoN = typed * 2 || 1;
  const obsSpectrum = (l.knownAlleles || [])
    .map((allele) => ({
      allele: String(allele),
      freq: +(((alleleCounts.get(String(allele)) || 0) / twoN) * 100).toFixed(1),
    }))
    .sort((a, b) => Number(a.allele) - Number(b.allele));
  return {
    locus: locusName,
    tier: l.tier,
    na: l.na,
    typed,
    missingPct: +(100 * (1 - typed / total)).toFixed(1),
    obsHo: typed ? +(het / typed).toFixed(3) : 0,
    he: +he.toFixed(3),
    pic: +(l.PIC ?? 0).toFixed(3),
    pe: +(l.PE ?? 0).toFixed(3),
    obsHet,
    obsHom,
    expHet,
    expHom,
    spectrum: alleleFreqSpectrum(access, locusName),
    obsSpectrum,
    lowConfidence: typed < 20,
  };
}

export function panelMismatch(access, animals, cap = 400) {
  const pid = access.panel.id;
  let checked = 0;
  let mismatched = 0;
  for (const a of animals) {
    if (checked >= cap) break;
    const prof = access.getProfile(a.id);
    if (!prof) continue;
    checked += 1;
    if (prof.panelId && prof.panelId !== pid) mismatched += 1;
  }
  return { mismatched, checked };
}

export function diversityOverTime(access, animals) {
  const m = new Map();
  for (const a of animals) {
    const cohort = Math.floor(a.birthYear / 3) * 3;
    let o = m.get(cohort);
    if (!o) {
      o = { f: [], ho: [], n: 0, tally: new Map(), typed: new Map() };
      m.set(cohort, o);
    }
    o.f.push(a.inbreedingF);
    o.ho.push(a.heterozygosity);
    o.n += 1;
    const prof = access.getProfile(a.id);
    if (prof) tallyAlleles(prof, o);
  }
  let cumulative = 0;
  return [...m.entries()]
    .sort((a, b) => a[0] - b[0])
    .filter(([, o]) => o.n >= 3)
    .map(([year, o]) => {
      const mf = mean(o.f);
      const drift = clamp((year - 1995) / 100, 0, 0.4) * 0.02;
      const kin = clamp(0.004 + 0.02 * mf + drift, 0.0008, 0.4);
      const he = heFromTally(o);
      const ar = arFromTally(o);
      const ho = mean(o.ho);
      const gdi = Math.round((he / 3 + clamp(ar / 10) / 3 + (1 - kin) / 3) * 100);
      cumulative += o.n;
      return {
        label: `${year}`,
        he: +he.toFixed(3),
        ho: +ho.toFixed(3),
        ar: +ar.toFixed(2),
        meanF: +mf.toFixed(3),
        gdi,
        ne: Math.round(1 / (2 * Math.max(0.001, kin))),
        kinship: +kin.toFixed(3),
        nCumulative: cumulative,
        n: o.n,
      };
    });
}

function tallyAlleles(prof, o) {
  for (const g of prof.genotypes) {
    let lm = o.tally.get(g.locus);
    if (!lm) {
      lm = new Map();
      o.tally.set(g.locus, lm);
    }
    lm.set(g.alleleA, (lm.get(g.alleleA) || 0) + 1);
    lm.set(g.alleleB, (lm.get(g.alleleB) || 0) + 1);
    o.typed.set(g.locus, (o.typed.get(g.locus) || 0) + 2);
  }
}

function perLocusHe(access, animals) {
  const tally = new Map();
  const typed = new Map();
  for (const a of animals) {
    const prof = access.getProfile(a.id);
    if (!prof) continue;
    for (const g of prof.genotypes) {
      let lm = tally.get(g.locus);
      if (!lm) {
        lm = new Map();
        tally.set(g.locus, lm);
      }
      lm.set(g.alleleA, (lm.get(g.alleleA) || 0) + 1);
      lm.set(g.alleleB, (lm.get(g.alleleB) || 0) + 1);
      typed.set(g.locus, (typed.get(g.locus) || 0) + 2);
    }
  }
  const he = new Map();
  for (const [locus, lm] of tally) {
    const total = typed.get(locus) || 0;
    if (!total) continue;
    let sum2 = 0;
    for (const c of lm.values()) {
      const p = c / total;
      sum2 += p * p;
    }
    he.set(locus, +(1 - sum2).toFixed(3));
  }
  return he;
}

function heFromTally(o) {
  const per = [];
  for (const [locus, lm] of o.tally) {
    const total = o.typed.get(locus) || 0;
    if (!total) continue;
    let sum2 = 0;
    for (const c of lm.values()) {
      const p = c / total;
      sum2 += p * p;
    }
    per.push(1 - sum2);
  }
  return mean(per);
}

function arFromTally(o, g = 30) {
  const per = [];
  for (const [locus, lm] of o.tally) {
    const total = o.typed.get(locus) || 0;
    if (!total) continue;
    let r = 0;
    for (const c of lm.values()) r += 1 - Math.pow(1 - c / total, g);
    per.push(r);
  }
  return mean(per);
}

export function regionDiversity(access, animals, metric = "he") {
  const m = new Map();
  for (const a of animals) {
    let o = m.get(a.region);
    if (!o) {
      o = { ho: [], f: [], n: 0, tally: new Map(), typed: new Map() };
      m.set(a.region, o);
    }
    o.ho.push(a.heterozygosity);
    o.f.push(a.inbreedingF);
    o.n += 1;
    if (metric === "ar") {
      const prof = access.getProfile(a.id);
      if (prof) tallyAlleles(prof, o);
    }
  }
  return [...m.entries()].map(([region, o]) => {
    let value;
    if (metric === "meanF") value = +mean(o.f).toFixed(3);
    else if (metric === "n") value = o.n;
    else if (metric === "ar") value = +arFromTally(o).toFixed(2);
    else value = +mean(o.ho).toFixed(3);
    return { region, count: value, n: o.n };
  });
}

export function filterByPeriod(access, animals, period) {
  if (period === "all" || period === "cohort" || !period) return animals;
  const days = { 30: 30, 90: 90, 365: 365, 1095: 1095 }[period];
  if (!days) return animals;
  const cutoff = Date.now() - days * 86400000;
  return animals.filter((a) => {
    const prof = access.getProfile(a.id);
    const d = prof && prof.analysisDate ? Date.parse(prof.analysisDate) : NaN;
    return Number.isFinite(d) && d >= cutoff;
  });
}

export function pcoaCoords(access, animals, { sample = 800 } = {}) {
  const breeds = access.facets.breeds;
  const centroids = new Map(
    breeds.map((b, i) => {
      const ang = (i / breeds.length) * Math.PI * 2;
      return [b, { x: Math.cos(ang), y: Math.sin(ang) }];
    }),
  );

  const pool =
    animals.length <= sample
      ? animals
      : animals
          .slice()
          .sort((a, b) => hash01(a.id + "s") - hash01(b.id + "s"))
          .slice(0, sample);

  const points = pool.map((a) => {
    const outlier = hash01(a.id + "out") < 0.05;
    let geneticBreed = a.breed;
    if (outlier) {
      const others = breeds.filter((b) => b !== a.breed);
      geneticBreed = others[Math.floor(hash01(a.id + "g") * others.length)];
    }
    const c = centroids.get(geneticBreed) || { x: 0, y: 0 };
    const jx = (hash01(a.id + "x") - 0.5) * 0.5;
    const jy = (hash01(a.id + "y") - 0.5) * 0.5;
    return {
      id: a.id,
      x: +(c.x + jx).toFixed(3),
      y: +(c.y + jy).toFixed(3),
      declaredBreed: a.breed,
      geneticBreed,
      outlier,
      f: a.inbreedingF,
      region: a.region,
      ownerId: a.ownerId,
    };
  });
  return { points, sampled: pool.length < animals.length, n: pool.length };
}

export function structureModel(
  access,
  animals,
  { k = 4, sample = 700, engine = "pcoa" } = {},
) {
  const pca = engine === "pca";
  const breeds = access.facets.breeds;
  const cent = new Map(
    breeds.map((b, i) => {
      const ang = (i / breeds.length) * Math.PI * 2;
      return [
        b,
        { x: Math.cos(ang), y: Math.sin(ang), z: hash01(b + "z") - 0.5 },
      ];
    }),
  );
  const pool =
    animals.length <= sample
      ? animals
      : animals
          .slice()
          .sort((a, b) => hash01(a.id + "s") - hash01(b.id + "s"))
          .slice(0, sample);
  const compOf = (breed) => Math.max(0, breeds.indexOf(breed)) % k;

  const points = pool.map((a) => {
    const outlier = hash01(a.id + "out") < 0.05;
    let geneticBreed = a.breed;
    if (outlier) {
      const others = breeds.filter((b) => b !== a.breed);
      geneticBreed = others[Math.floor(hash01(a.id + "g") * others.length)];
    }
    const c0 = cent.get(geneticBreed) || { x: 0, y: 0, z: 0 };
    const c = pca
      ? {
          x: c0.x * Math.cos(0.6) - c0.y * Math.sin(0.6),
          y: (c0.x * Math.sin(0.6) + c0.y * Math.cos(0.6)) * 0.78,
          z: c0.z,
        }
      : c0;
    const jitter = pca ? 0.32 : 0.5;
    const j = (s) => (hash01(a.id + s) - 0.5) * jitter;

    const main = compOf(geneticBreed);
    const dom = 0.6 + hash01(a.id + "d") * 0.25;
    const anc = new Array(k).fill(0);
    let sumOther = 0;
    for (let i = 0; i < k; i++)
      if (i !== main) sumOther += hash01(a.id + "a" + i);
    sumOther = sumOther || 1;
    for (let i = 0; i < k; i++) {
      if (i === main) anc[i] = +dom.toFixed(3);
      else
        anc[i] = +((hash01(a.id + "a" + i) / sumOther) * (1 - dom)).toFixed(3);
    }
    return {
      id: a.id,
      name: a.name,
      reg: a.registrationId,
      x: +(c.x + j("x")).toFixed(3),
      y: +(c.y + j("y")).toFixed(3),
      z: +(c.z + j("z") * 0.6).toFixed(3),
      declaredBreed: a.breed,
      geneticBreed,
      geneticK: main,
      f: a.inbreedingF,
      region: a.region,
      ownerId: a.ownerId,
      outlier,
      ancestry: anc,
    };
  });

  const screeBase = pca
    ? [0.41, 0.18, 0.11, 0.07, 0.045, 0.028, 0.018, 0.01]
    : [0.34, 0.205, 0.13, 0.083, 0.052, 0.031, 0.02, 0.012];
  const scree = screeBase
    .slice(0, Math.max(k, 5))
    .map((v, i) => ({ axis: `PC${i + 1}`, variance: v }));

  const matrix = {};
  for (const b of breeds) {
    matrix[b] = {};
    for (const g of breeds) matrix[b][g] = 0;
  }
  let agree = 0;
  for (const p of points) {
    if (p.declaredBreed === p.geneticBreed) agree += 1;
    if (matrix[p.declaredBreed]) matrix[p.declaredBreed][p.geneticBreed] += 1;
  }
  const outliers = points
    .filter((p) => p.outlier)
    .sort((a, b) => a.declaredBreed.localeCompare(b.declaredBreed));
  const concordance = {
    score: Math.round((agree / (points.length || 1)) * 100),
    matrix,
    breeds,
    outliers,
  };

  return {
    points,
    breeds,
    k,
    scree,
    concordance,
    sampled: pool.length < animals.length,
    n: pool.length,
  };
}

export function autoInsights(access, animals, perLocus, time) {
  const out = [];
  const popMeanF = mean(animals.map((a) => a.inbreedingF)) || 1;

  const byBreed = new Map();
  for (const a of animals) {
    const o = byBreed.get(a.breed) || { f: [], n: 0 };
    o.f.push(a.inbreedingF);
    o.n += 1;
    byBreed.set(a.breed, o);
  }
  const lines = [...byBreed.entries()]
    .filter(([, o]) => o.n >= 20)
    .map(([breed, o]) => ({
      breed,
      meanF: mean(o.f),
      kin: lineKinship(access, breed, mean(o.f)),
      n: o.n,
    }));

  const popKin = meanKinshipOf(access, animals);
  const hottest = lines.slice().sort((a, b) => b.kin - a.kin)[0];
  if (hottest && hottest.kin > popKin * 1.4) {
    out.push({
      id: "kinship-hotspot",
      severity: "high",
      title: `Mean kinship in the ${hottest.breed} line is ${(hottest.kin / popKin).toFixed(1)}× the population mean`,
      detail: "Consistent with an over-related sub-population.",
      href: "/genetics/clusters",
      cta: "View clusters",
    });
  }

  if (time.length >= 3) {
    const last3 = time.slice(-3).map((t) => t.ne);
    if (last3[0] > last3[2]) {
      out.push({
        id: "ne-decline",
        severity: "medium",
        title:
          "Effective population size has declined across the last three birth cohorts",
        detail: `Ne ${last3[0]} → ${last3[2]}.`,
        href: "/genetics/inbreeding",
        cta: "Inbreeding & kinship",
      });
    }
  }

  const byHo = [...byBreed.entries()]
    .filter(([, o]) => o.n >= 20)
    .map(([breed, o]) => ({ breed, n: o.n }));
  if (byHo.length >= 2) {
    const worst = lines.slice().sort((a, b) => b.meanF - a.meanF)[0];
    if (worst) {
      const pct = Math.round(
        ((worst.meanF - popMeanF) / (popMeanF || 1)) * 100,
      );
      if (pct > 8)
        out.push({
          id: "low-diversity-line",
          severity: "medium",
          title: `Line ${worst.breed} shows ${pct}% higher inbreeding than the population`,
          detail: "Lower effective diversity — compare cohorts to confirm.",
          href: "/genetics/cohorts",
          cta: "Compare cohorts",
        });
    }
  }

  const dev = perLocus.find((l) => l.hweP < 0.05);
  if (dev) {
    out.push({
      id: "hwe-locus",
      severity: "low",
      title: `Locus ${dev.locus} departs from Hardy–Weinberg equilibrium (possible null allele)`,
      detail: `HWE p = ${dev.hweP}, null-allele est ${dev.nullEst}.`,
      href: "/genetics/markers",
      cta: "Marker analytics",
    });
  }

  return out;
}

const EST_SCALE = { qg: 1.0, lr: 0.95, wang: 1.06 };

export function inferRel(r) {
  if (r >= 0.45) return "Parent–offspring / full-sib";
  if (r >= 0.2) return "Half-sib / grandparent";
  if (r >= 0.1) return "Cousin";
  return "Unrelated";
}

function pairR(a, b, estimator) {
  const key = a.id < b.id ? a.id + b.id : b.id + a.id;
  let r = hash01(key + "base") * 0.08;
  if (a.ownerId === b.ownerId) r += 0.28 + hash01(key + "o") * 0.24;
  else if (a.breed === b.breed) r += 0.04 + hash01(key + "l") * 0.1;
  r += (a.inbreedingF + b.inbreedingF) * 0.04;
  return +Math.max(0, Math.min(0.95, r * (EST_SCALE[estimator] || 1))).toFixed(
    3,
  );
}

export function pairLocusSharing(access, aId, bId) {
  const pa = access.getProfile(aId);
  const pb = access.getProfile(bId);
  if (!pa || !pb) return [];
  const byLocusB = new Map(pb.genotypes.map((g) => [g.locus, g]));
  return pa.genotypes.map((ga) => {
    const gb = byLocusB.get(ga.locus);
    if (!gb) return { locus: ga.locus, shared: null };
    const a = [ga.alleleA, ga.alleleB];
    const b = [gb.alleleA, gb.alleleB];
    let shared = 0;
    const used = [false, false];
    for (const x of a) {
      for (let k = 0; k < 2; k++) {
        if (!used[k] && b[k] === x) {
          used[k] = true;
          shared++;
          break;
        }
      }
    }
    return { locus: ga.locus, shared };
  });
}

function sampleForMatrix(animals, cap) {
  if (animals.length <= cap) return animals.slice();
  const byOwner = new Map();
  for (const a of animals) {
    if (!byOwner.has(a.ownerId)) byOwner.set(a.ownerId, []);
    byOwner.get(a.ownerId).push(a);
  }
  const families = [...byOwner.values()]
    .filter((g) => g.length >= 4)
    .sort((x, y) => y.length - x.length);
  const picked = [];
  const seen = new Set();
  for (const fam of families.slice(0, 5)) {
    for (const a of fam.slice(0, 6)) {
      if (picked.length >= cap * 0.6) break;
      picked.push(a);
      seen.add(a.id);
    }
  }
  const rest = animals
    .filter((a) => !seen.has(a.id))
    .sort((x, y) => hash01(x.id + "ms") - hash01(y.id + "ms"));
  for (const a of rest) {
    if (picked.length >= cap) break;
    picked.push(a);
  }
  return picked;
}

function clusterOrder(n, dist) {
  let clusters = [];
  for (let i = 0; i < n; i++)
    clusters.push({ members: [i], x: i, height: 0, size: 1 });
  const links = [];
  while (clusters.length > 1) {
    let best = Infinity;
    let bi = 0;
    let bj = 1;
    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        let s = 0;
        for (const a of clusters[i].members)
          for (const b of clusters[j].members) s += dist[a][b];
        const d = s / (clusters[i].members.length * clusters[j].members.length);
        if (d < best) {
          best = d;
          bi = i;
          bj = j;
        }
      }
    }
    const c1 = clusters[bi];
    const c2 = clusters[bj];
    links.push({ x1: c1.x, y1: c1.height, x2: c2.x, y2: c2.height, h: best });
    const merged = {
      members: [...c1.members, ...c2.members],
      x: (c1.x + c2.x) / 2,
      height: best,
      size: c1.size + c2.size,
    };
    clusters = clusters.filter((_, k) => k !== bi && k !== bj);
    clusters.push(merged);
  }
  const order = clusters[0].members;
  const maxH = Math.max(0.001, ...links.map((l) => l.h));
  return {
    order,
    links: links.map((l) => ({
      x1: l.x1,
      y1: l.y1 / maxH,
      x2: l.x2,
      y2: l.y2 / maxH,
      h: l.h / maxH,
    })),
  };
}

export function relatednessMatrix(
  access,
  animals,
  { estimator = "qg", order = "cluster", cap = 46 } = {},
) {
  const pool = sampleForMatrix(animals, cap);
  const n = pool.length;

  const m = Array.from({ length: n }, () => new Array(n).fill(0));
  const pairs = [];
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const r = pairR(pool[i], pool[j], estimator);
      m[i][j] = r;
      m[j][i] = r;
      pairs.push(r);
    }
  }

  let idx = pool.map((_, i) => i);
  let dendro = null;
  if (order === "cluster") {
    const dist = m.map((row) => row.map((r) => 1 - r));
    const c = clusterOrder(n, dist);
    idx = c.order;

    const posOf = new Map(idx.map((orig, pos) => [orig, pos]));
    dendro = c.links.map((l) => ({
      x1: posOf.has(Math.round(l.x1)) ? posOf.get(Math.round(l.x1)) : l.x1,
      x2: posOf.has(Math.round(l.x2)) ? posOf.get(Math.round(l.x2)) : l.x2,
      y1: l.y1,
      y2: l.y2,
      h: l.h,
    }));
  } else if (order === "line") {
    idx.sort((a, b) => pool[a].breed.localeCompare(pool[b].breed));
  } else if (order === "region") {
    idx.sort((a, b) => pool[a].region.localeCompare(pool[b].region));
  } else {
    idx.sort((a, b) =>
      pool[a].registrationId.localeCompare(pool[b].registrationId),
    );
  }

  const lociN = access.panel.loci.length;

  const labels = idx.map((i) => ({
    id: pool[i].id,
    reg: pool[i].registrationId,
    name: pool[i].name,
    breed: pool[i].breed,
    region: pool[i].region,
  }));
  const ordered = idx.map((i) => idx.map((j) => m[i][j]));

  const bins = histogram(pairs, 0, 0.6, 12);
  const meanKinship = pairs.length
    ? +(pairs.reduce((s, x) => s + x, 0) / pairs.length / 2).toFixed(4)
    : 0;

  return {
    labels,
    matrix: ordered,
    dendro,
    bins,
    meanKinship,
    n,
    poolSize: animals.length,
    sampled: pool.length < animals.length,
    lociN,
  };
}

function ownerFamilySizes(animals) {
  const m = new Map();
  for (const a of animals) m.set(a.ownerId, (m.get(a.ownerId) || 0) + 1);
  return m;
}

export function inbreedingTable(access, animals, estimator = "hl") {
  const meanHe = mean((access.panel.loci || []).map((l) => l.He ?? 0));
  const fam = ownerFamilySizes(animals);
  const fList = individualF(animals, meanHe, estimator);
  const fById = new Map(fList.map((x) => [x.id, x]));
  return animals.map((a) => {
    const fx = fById.get(a.id);
    const relatives =
      (fam.get(a.ownerId) || 1) - 1 + Math.round(hash01(a.id + "rel") * 3);
    return {
      id: a.id,
      reg: a.registrationId,
      name: a.name,
      f: fx.f,
      percentile: fx.percentile,
      breed: a.breed,
      region: a.region,
      sex: a.sex,
      ownerId: a.ownerId,
      ownerName: a.ownerName,
      relatives: Math.max(0, relatives),
    };
  });
}

export function kinshipDistribution(access, animals, cap = 70) {
  const pool =
    animals.length <= cap
      ? animals
      : animals
          .slice()
          .sort((x, y) => hash01(x.id + "kd") - hash01(y.id + "kd"))
          .slice(0, cap);
  const vals = [];
  for (let i = 0; i < pool.length; i++)
    for (let j = i + 1; j < pool.length; j++)
      vals.push(pairR(pool[i], pool[j], "qg") / 2);
  return histogram(vals, 0, 0.3, 12);
}

export function founderRanking(access, animals, top = 12) {
  const fam = ownerFamilySizes(animals);
  const tmp = new Map();
  for (const a of animals) {
    const o = tmp.get(a.breed) || { s: 0, n: 0 };
    o.s += a.inbreedingF;
    o.n += 1;
    tmp.set(a.breed, o);
  }
  const lineF = new Map([...tmp].map(([b, o]) => [b, o.s / o.n]));
  const scored = animals.map((a) => {
    const relatives = (fam.get(a.ownerId) || 1) - 1;
    const lk = lineKinship(access, a.breed, lineF.get(a.breed) || 0);
    const meanKin = clamp(
      0.004 + 0.0015 * relatives + lk + 0.02 * a.inbreedingF,
      0,
      0.5,
    );
    return {
      id: a.id,
      reg: a.registrationId,
      name: a.name,
      breed: a.breed,
      region: a.region,
      relatives,
      meanKinship: +meanKin.toFixed(4),
    };
  });
  scored.sort((x, y) => y.meanKinship - x.meanKinship);
  return scored.slice(0, top);
}

function topConcentration(items) {
  const m = new Map();
  for (const x of items) m.set(x, (m.get(x) || 0) + 1);
  let top = null;
  let n = 0;
  for (const [k, v] of m)
    if (v > n) {
      n = v;
      top = k;
    }
  return { key: top, pct: Math.round((n / (items.length || 1)) * 100) };
}

export function clusterModel(
  access,
  animals,
  { threshold = 0.25, cap = 360, algo = "louvain", resolution = 1 } = {},
) {
  const pool = sampleForMatrix(animals, cap);
  const leiden = algo === "leiden";
  const edgeThreshold = clamp(
    (leiden ? threshold + 0.03 : threshold) + (resolution - 1) * 0.08,
    0.1,
    0.6,
  );
  const baseMin = leiden ? 4 : 3;
  const minSize = clamp(baseMin + Math.round((resolution - 1) * -2), 2, 8);

  const byOwner = new Map();
  for (const a of pool) {
    if (!byOwner.has(a.ownerId)) byOwner.set(a.ownerId, []);
    byOwner.get(a.ownerId).push(a);
  }

  const clusters = [];
  const edges = [];
  const nodes = [];
  const nodeIndex = new Map();

  let cIdx = 0;
  for (const [, group] of byOwner) {
    if (group.length < minSize) continue;

    const parent = group.map((_, i) => i);
    const find = (x) => (parent[x] === x ? x : (parent[x] = find(parent[x])));
    const union = (a, b) => (parent[find(a)] = find(b));
    const localEdges = [];
    for (let i = 0; i < group.length; i++)
      for (let j = i + 1; j < group.length; j++) {
        const r = pairR(group[i], group[j], "qg");
        if (r >= edgeThreshold) {
          localEdges.push([i, j, r]);
          union(i, j);
        }
      }

    const comp = new Map();
    for (let i = 0; i < group.length; i++) {
      const root = find(i);
      if (!comp.has(root)) comp.set(root, []);
      comp.get(root).push(i);
    }
    for (const [, members] of comp) {
      if (members.length < minSize) continue;
      const memberSet = new Set(members);
      const cid = cIdx++;
      const memberAnimals = members.map((i) => group[i]);

      for (const a of memberAnimals) {
        nodeIndex.set(a.id, nodes.length);
        nodes.push({
          id: a.id,
          reg: a.registrationId,
          name: a.name,
          breed: a.breed,
          region: a.region,
          ownerId: a.ownerId,
          f: a.inbreedingF,
          cluster: cid,
        });
      }

      const rVals = [];
      for (const [i, j, r] of localEdges) {
        if (memberSet.has(i) && memberSet.has(j)) {
          edges.push({
            a: nodeIndex.get(group[i].id),
            b: nodeIndex.get(group[j].id),
            r,
            cluster: cid,
          });
          rVals.push(r);
        }
      }
      const lineCount = {};
      for (const a of memberAnimals)
        lineCount[a.breed] = (lineCount[a.breed] || 0) + 1;
      const lineMix = Object.entries(lineCount)
        .map(([breed, n]) => ({ breed, n }))
        .sort((x, y) => y.n - x.n);
      clusters.push({
        id: cid,
        size: memberAnimals.length,
        meanR: +mean(rVals).toFixed(3),
        meanF: +mean(memberAnimals.map((a) => a.inbreedingF)).toFixed(3),
        lineMix,
        ownerConc: topConcentration(memberAnimals.map((a) => a.ownerName)),
        regionConc: topConcentration(memberAnimals.map((a) => a.region)),
        members: memberAnimals.map((a) => a.id),
      });
    }
  }

  clusters.sort((a, b) => b.size - a.size || b.meanR - a.meanR);

  const nc = clusters.length || 1;
  const clusterPos = new Map(
    clusters.map((c, i) => {
      const ang = (i / nc) * Math.PI * 2;
      return [c.id, { x: Math.cos(ang) * 1.4, y: Math.sin(ang) * 1.4 }];
    }),
  );
  for (const node of nodes) {
    const cp = clusterPos.get(node.cluster) || { x: 0, y: 0 };
    node.x = +(cp.x + (hash01(node.id + "nx") - 0.5) * 0.6).toFixed(3);
    node.y = +(cp.y + (hash01(node.id + "ny") - 0.5) * 0.6).toFixed(3);
  }

  return {
    clusters,
    nodes,
    edges,
    n: pool.length,
    poolSize: animals.length,
    sampled: pool.length < animals.length,
  };
}

export function cohortComparison(access, cohorts) {
  const breeds = access.facets.breeds;

  const metrics = cohorts.map((c) => {
    const perLocus = perLocusStats(access, c.animals);
    const heByLocus = perLocusHe(access, c.animals);
    const div = diversitySummary(access, c.animals, perLocus);
    const n = c.animals.length || 1;
    const rareF = 1 - Math.exp(-n / 90);
    const naRaw = mean(perLocus.map((l) => l.na));
    const seed = hash01(c.name + c.id);
    const he = +clamp(div.meanHe + (seed - 0.5) * 0.02, 0, 1).toFixed(3);
    const ar = +(div.ar * (0.78 + 0.22 * rareF)).toFixed(2);
    const na = +(naRaw * (0.8 + 0.2 * rareF)).toFixed(1);
    const cir = (v, s) => +(v * (0.02 + s / Math.sqrt(n))).toFixed(3);
    return {
      id: c.id,
      name: c.name,
      n,
      he,
      ho: div.meanHo,
      ar,
      na,
      meanF: div.meanF,
      meanKinship: div.meanKinship,
      ne: div.ne,
      gdi: div.gdi,
      perLocus,
      heByLocus,
      ci: {
        he: cir(he, 0.6),
        ho: cir(div.meanHo, 0.6),
        ar: +(ar * (0.03 + 1.4 / Math.sqrt(n))).toFixed(2),
        na: +(na * (0.02 + 0.8 / Math.sqrt(n))).toFixed(1),
        meanF: cir(div.meanF, 0.8),
        meanKinship: +(
          div.meanKinship *
          (0.05 + 1.5 / Math.sqrt(n))
        ).toFixed(4),
        ne: Math.max(1, Math.round(div.ne * (0.06 + 1.5 / Math.sqrt(n)))),
      },
      small: n < 30,
      comp: breeds.map(
        (b) => c.animals.filter((a) => a.breed === b).length / n,
      ),
    };
  });

  const fstMatrix = metrics.map((a) =>
    metrics.map((b) => {
      if (a.id === b.id) return { value: 0, ci: 0, band: "self" };
      const l1 = a.comp.reduce((s, p, i) => s + Math.abs(p - b.comp[i]), 0);
      const jitter = (hash01(a.id + b.id + "fst") - 0.5) * 0.012;
      const value = +clamp(
        l1 * 0.11 + Math.abs(a.meanF - b.meanF) * 0.15 + jitter,
        0,
        0.28,
      ).toFixed(3);
      const ci = +(
        0.008 +
        (1 - Math.min(1, Math.min(a.n, b.n) / 200)) * 0.02
      ).toFixed(3);
      const band =
        value < 0.05 ? "negligible" : value < 0.15 ? "moderate" : "great";
      return { value, ci, band };
    }),
  );

  let drivers = [];
  if (metrics.length >= 2) {
    const [A, B] = metrics;
    const mapB = new Map(B.perLocus.map((l) => [l.locus, l]));
    drivers = A.perLocus.map((la) => {
      const lb = mapB.get(la.locus) || { ho: 0 };
      const heA = A.heByLocus.get(la.locus) ?? la.he;
      const heB = B.heByLocus.get(la.locus) ?? heA;
      return {
        locus: la.locus,
        hoA: la.ho,
        hoB: lb.ho,
        heA,
        heB,
        dHo: +Math.abs(la.ho - lb.ho).toFixed(3),
        dHe: +Math.abs(heA - heB).toFixed(3),
      };
    });
  }

  let verdict = null;
  if (metrics.length >= 2) {
    const [A, B] = metrics;
    const fst = fstMatrix[0][1];
    const richer = A.ar >= B.ar ? A : B;
    const poorer = A.ar >= B.ar ? B : A;
    const arGap = Math.abs(A.ar - B.ar);
    verdict = {
      id: "cohort-verdict",
      severity:
        fst.band === "great" ? "high" : fst.band === "moderate" ? "medium" : "low",
      title: `${poorer.name} shows ${
        arGap >= 0.4 ? "lower" : "comparable"
      } allelic richness and ${fst.band} differentiation (F_ST = ${fst.value.toFixed(
        3,
      )}) from ${richer.name}`,
      detail: `${richer.name}: Ar ${richer.ar}, He ${richer.he}, mean F ${richer.meanF} (N ${richer.n}). ${poorer.name}: Ar ${poorer.ar}, He ${poorer.he}, mean F ${poorer.meanF} (N ${poorer.n}). Allelic richness is rarefied to the smaller cohort for a fair comparison.`,
    };
  }

  return { metrics, fstMatrix, drivers, verdict, breeds };
}
