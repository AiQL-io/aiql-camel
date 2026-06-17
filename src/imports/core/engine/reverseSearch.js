import { testSingleParent, testTrio, parentageIndex } from "./parentage.js";
import { relatednessPair } from "./relatedness.js";

export function rankCandidates({
  offspringGenotypes,
  candidates,
  freqByLocus,
  tolerance = 1,
  otherParentGenotypes = null,
}) {
  const offProfile = { genotypes: offspringGenotypes };
  const survivors = [];
  let excluded = 0;

  for (const c of candidates) {
    const res = testSingleParent(
      offProfile,
      { genotypes: c.genotypes },
      { tolerance },
    );
    if (res.verdict === "excluded") {
      excluded += 1;
      continue;
    }
    const pi = parentageIndex(
      offProfile,
      { genotypes: c.genotypes },
      freqByLocus,
    );
    const rel = relatednessPair(offspringGenotypes, c.genotypes, freqByLocus);

    let trioConsistent = null;
    if (otherParentGenotypes) {
      const t = testTrio(
        offProfile,
        { genotypes: c.genotypes },
        { genotypes: otherParentGenotypes },
        { tolerance },
      );
      trioConsistent = t.verdict !== "excluded";
    }

    survivors.push({
      animal: c.animal,
      verdict: res.verdict,
      mismatchCount: res.mismatchCount,
      lociCompared: res.lociCompared,
      parentageIndex: pi.pi,
      r: rel.r,
      inferred: rel.category,
      trioConsistent,
    });
  }

  survivors.sort((a, b) => {
    if (a.trioConsistent !== b.trioConsistent) {
      return (b.trioConsistent ? 1 : 0) - (a.trioConsistent ? 1 : 0);
    }
    return (
      a.mismatchCount - b.mismatchCount ||
      b.parentageIndex - a.parentageIndex ||
      b.r - a.r
    );
  });

  if (survivors[0]) survivors[0].bestFit = true;
  return { poolSize: candidates.length, excluded, survivors };
}
