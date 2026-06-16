const DEFAULT_TOLERANCE = 1;

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
  let verdict;
  if (mismatchCount === 0) verdict = "consistent";
  else if (mismatchCount <= Math.max(tol, 2)) verdict = "inconclusive";
  else verdict = "excluded";

  if (mismatchCount > 2) verdict = "excluded";
  else if (mismatchCount >= 1) verdict = "inconclusive";

  return { verdict, lociCompared, mismatchCount, mismatchLoci };
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
  let verdict;
  if (mismatchCount === 0) verdict = "consistent";
  else if (mismatchCount > 2) verdict = "excluded";
  else verdict = "inconclusive";
  return { verdict, lociCompared, mismatchCount, mismatchLoci, tolerance: tol };
}
