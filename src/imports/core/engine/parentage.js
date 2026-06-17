const DEFAULT_TOLERANCE = 1;
const EPS = 0.005;

function genoMap(profile) {
  const m = {};
  for (const g of profile.genotypes) m[g.locus] = g;
  return m;
}

function locusShares(off, par) {
  return (
    off.alleleA === par.alleleA ||
    off.alleleA === par.alleleB ||
    off.alleleB === par.alleleA ||
    off.alleleB === par.alleleB
  );
}

function verdictFor(mismatchCount, tol) {
  const thresh = Math.max(0, tol) + 1;
  if (mismatchCount === 0) return "consistent";
  if (mismatchCount <= thresh) return "inconclusive";
  return "excluded";
}

export function testSingleParent(offspringProfile, parentProfile, opts = {}) {
  const tol = opts.tolerance ?? DEFAULT_TOLERANCE;
  const off = genoMap(offspringProfile);
  const par = genoMap(parentProfile);
  let lociCompared = 0;
  const mismatchLoci = [];

  for (const locus in off) {
    if (!par[locus]) continue;
    lociCompared++;
    if (!locusShares(off[locus], par[locus])) mismatchLoci.push(locus);
  }

  const mismatchCount = mismatchLoci.length;
  return {
    verdict: verdictFor(mismatchCount, tol),
    lociCompared,
    mismatchCount,
    mismatchLoci,
    tolerance: tol,
  };
}

export function testTrio(offspringProfile, sireProfile, damProfile, opts = {}) {
  const tol = opts.tolerance ?? DEFAULT_TOLERANCE;
  const off = genoMap(offspringProfile);
  const sire = genoMap(sireProfile);
  const dam = genoMap(damProfile);
  let lociCompared = 0;
  const mismatchLoci = [];

  for (const locus in off) {
    if (!sire[locus] || !dam[locus]) continue;
    lociCompared++;
    const o = off[locus];
    const s = sire[locus];
    const d = dam[locus];
    const sHas = (x) => s.alleleA === x || s.alleleB === x;
    const dHas = (x) => d.alleleA === x || d.alleleB === x;
    const ok =
      (sHas(o.alleleA) && dHas(o.alleleB)) ||
      (sHas(o.alleleB) && dHas(o.alleleA));
    if (!ok) mismatchLoci.push(locus);
  }

  const mismatchCount = mismatchLoci.length;
  return {
    verdict: verdictFor(mismatchCount, tol),
    lociCompared,
    mismatchCount,
    mismatchLoci,
    tolerance: tol,
  };
}

export function cpeOverLoci(panel, lociNames) {
  const set = new Set(lociNames);
  const loci = (panel.loci || []).filter((l) => set.has(l.locusName));
  if (!loci.length) return 0;
  const cpe = 1 - loci.reduce((acc, l) => acc * (1 - (l.PE || 0)), 1);
  return +cpe.toFixed(5);
}

function freqOf(lf, allele) {
  if (!lf) return EPS;
  const f = lf[allele] ?? lf[String(allele)];
  return f && f > 0 ? f : EPS;
}

export function parentageIndex(offspringProfile, parentProfile, freqByLocus) {
  const off = genoMap(offspringProfile);
  const par = genoMap(parentProfile);
  let pi = 1;
  let used = 0;
  for (const locus in off) {
    if (!par[locus]) continue;
    const o = off[locus];
    const p = par[locus];
    const lf = freqByLocus[locus];
    const shared = [o.alleleA, o.alleleB].filter(
      (x) => x === p.alleleA || x === p.alleleB,
    );
    if (!shared.length) continue;
    const a = shared[0];
    const pa = freqOf(lf, a);
    const locusPI = o.alleleA === o.alleleB ? 1 / pa : 1 / (2 * pa);
    pi *= locusPI;
    used += 1;
  }
  return used ? { pi, lociUsed: used } : { pi: 0, lociUsed: 0 };
}

export function verifyParentage(
  offspringProfile,
  parentProfile,
  panel,
  freqByLocus,
  opts = {},
) {
  const base = testSingleParent(offspringProfile, parentProfile, opts);
  const off = genoMap(offspringProfile);
  const par = genoMap(parentProfile);
  const comparedLoci = Object.keys(off).filter((l) => par[l]);
  const cpe = cpeOverLoci(panel, comparedLoci);
  const pi =
    base.verdict === "excluded"
      ? { pi: 0, lociUsed: 0 }
      : parentageIndex(offspringProfile, parentProfile, freqByLocus);
  return { ...base, cpe, parentageIndex: pi.pi, piLoci: pi.lociUsed };
}

export function trioDetail(offspringProfile, sireProfile, damProfile) {
  const off = genoMap(offspringProfile);
  const sire = genoMap(sireProfile);
  const dam = genoMap(damProfile);
  const rows = [];
  for (const locus in off) {
    if (!sire[locus] || !dam[locus]) continue;
    const o = off[locus];
    const s = sire[locus];
    const d = dam[locus];
    const sHas = (x) => s.alleleA === x || s.alleleB === x;
    const dHas = (x) => d.alleleA === x || d.alleleB === x;
    const part1 = sHas(o.alleleA) && dHas(o.alleleB);
    const part2 = sHas(o.alleleB) && dHas(o.alleleA);
    let status = "ok";
    let implicated = null;
    if (!part1 && !part2) {
      status = "violation";
      const sireOk = sHas(o.alleleA) || sHas(o.alleleB);
      const damOk = dHas(o.alleleA) || dHas(o.alleleB);
      implicated = !sireOk ? "sire" : !damOk ? "dam" : "both";
    }
    rows.push({
      locus,
      offspring: [o.alleleA, o.alleleB],
      sire: [s.alleleA, s.alleleB],
      dam: [d.alleleA, d.alleleB],
      fromSire: part1 ? o.alleleA : part2 ? o.alleleB : null,
      fromDam: part1 ? o.alleleB : part2 ? o.alleleA : null,
      status,
      implicated,
    });
  }
  return rows;
}
