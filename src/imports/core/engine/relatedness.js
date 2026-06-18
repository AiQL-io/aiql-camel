const EPS = 0.005;

function freqOf(locusFreqs, allele) {
  if (!locusFreqs) return EPS;
  const f = locusFreqs[allele] ?? locusFreqs[String(allele)];
  return f && f > 0 ? f : EPS;
}

function genoMap(genotypes) {
  const m = {};
  for (const g of genotypes) m[g.locus] = g;
  return m;
}

function ibsState(a, b, c, d) {
  const x = a <= b ? [a, b] : [b, a];
  const y = c <= d ? [c, d] : [d, c];
  if (x[0] === y[0] && x[1] === y[1]) return 2;
  if (a === c || a === d || b === c || b === d) return 1;
  return 0;
}

function lrDirection(a, b, c, d, pa, pb) {
  const Sab = a === b ? 1 : 0;
  const Sac = a === c ? 1 : 0;
  const Sad = a === d ? 1 : 0;
  const Sbc = b === c ? 1 : 0;
  const Sbd = b === d ? 1 : 0;
  const num = pa * (Sbc + Sbd) + pb * (Sac + Sad) - 4 * pa * pb;
  const den = (1 + Sab) * (pa + pb) - 4 * pa * pb;
  return { num, den };
}

function qgDirection(a, b, c, d, pa, pb) {
  const sa = 0.5 * ((a === c ? 1 : 0) + (a === d ? 1 : 0));
  const sb = 0.5 * ((b === c ? 1 : 0) + (b === d ? 1 : 0));
  const h = 0.5 * (1 + (a === b ? 1 : 0));
  const num = sa - pa + (sb - pb);
  const den = h - pa + (h - pb);
  return { num, den };
}

export const ESTIMATOR_LABELS = {
  qg: "Queller & Goodnight (1989)",
  lr: "Lynch & Ritland (1999)",
};

export function relatednessPair(genoA, genoB, freqByLocus, estimator = "lr") {
  const A = genoMap(genoA);
  const B = genoMap(genoB);
  let sumNum = 0;
  let sumDen = 0;
  let lociUsed = 0;
  const ibs = { share0: 0, share1: 0, share2: 0 };

  for (const locus in A) {
    if (!B[locus]) continue;
    const { alleleA: a, alleleB: b } = A[locus];
    const { alleleA: c, alleleB: d } = B[locus];
    const lf = freqByLocus[locus];
    const pa = freqOf(lf, a);
    const pb = freqOf(lf, b);
    const pc = freqOf(lf, c);
    const pd = freqOf(lf, d);

    const dir = estimator === "qg" ? qgDirection : lrDirection;
    const f = dir(a, b, c, d, pa, pb);
    const g = dir(c, d, a, b, pc, pd);
    if (Number.isFinite(f.num / f.den)) {
      sumNum += f.num;
      sumDen += f.den;
    }
    if (Number.isFinite(g.num / g.den)) {
      sumNum += g.num;
      sumDen += g.den;
    }

    const s = ibsState(a, b, c, d);
    if (s === 0) ibs.share0 += 1;
    else if (s === 1) ibs.share1 += 1;
    else ibs.share2 += 1;
    lociUsed += 1;
  }

  let r = sumDen !== 0 ? sumNum / sumDen : 0;
  if (r > 1) r = 1;
  if (r < -0.5) r = -0.5;

  const { category, confidence } = classify(r, ibs, lociUsed);
  return {
    r: +r.toFixed(3),
    kinship: +(r / 2).toFixed(3),
    ibs,
    lociUsed,
    category,
    confidence,
  };
}

function classify(r, ibs, lociUsed) {
  if (lociUsed < 6)
    return { category: "Indeterminate", confidence: "insufficient loci" };
  if (r >= 0.3 && ibs.share0 <= 1)
    return { category: "Parent–offspring", confidence: "high" };
  if (r >= 0.37) return { category: "Full siblings", confidence: "high" };
  if (r >= 0.18) return { category: "Half siblings", confidence: "moderate" };
  if (r >= 0.08)
    return { category: "Cousin / second-degree", confidence: "moderate" };
  return { category: "Unrelated", confidence: "high" };
}

export function freqByLocusFromPanel(panel) {
  const map = {};
  for (const l of panel.loci || []) {
    map[l.locusName] = l.populationAlleleFrequencies || {};
  }
  return map;
}
