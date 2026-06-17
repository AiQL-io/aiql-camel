import { testSingleParent } from "./parentage.js";

export function auditEdges(edges, { tolerance = 1 } = {}) {
  const results = [];
  const summary = {
    total: edges.length,
    consistent: 0,
    inconclusive: 0,
    excluded: 0,
    notTestable: 0,
  };

  for (const e of edges) {
    if (!e.offspringGenotypes || !e.parentGenotypes) {
      summary.notTestable += 1;
      results.push({ ...e.meta, verdict: "not-testable", mismatchCount: null });
      continue;
    }
    const res = testSingleParent(
      { genotypes: e.offspringGenotypes },
      { genotypes: e.parentGenotypes },
      { tolerance },
    );
    summary[res.verdict] += 1;
    results.push({
      ...e.meta,
      offspringId: e.offspringId,
      parentId: e.parentId,
      role: e.role,
      verdict: res.verdict,
      mismatchCount: res.mismatchCount,
      lociCompared: res.lociCompared,
    });
  }

  return { results, summary };
}
