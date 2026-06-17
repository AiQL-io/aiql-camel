export const VERDICT_TONE = {
  excluded: "danger",
  consistent: "success",
  inconclusive: "warning",
};

export function num(v, d = 2) {
  return typeof v === "number" && Number.isFinite(v) ? v.toFixed(d) : "—";
}

export function fmtPI(v) {
  return typeof v === "number" && Number.isFinite(v) && v > 0
    ? v.toExponential(1)
    : "—";
}

export function reconcileRole(access, subjectId, role) {
  const ped = access.pedigree(subjectId);
  const side = ped?.[role];
  const declared = side?.registry || null;
  const declaredVerify = declared
    ? access.verify(subjectId, declared.id)
    : null;
  const declaredRel = declared
    ? access.relatednessTo(subjectId, declared.id)
    : null;

  const rs = access.reverseSearch(subjectId, { target: role });
  const candidates = (rs.survivors || [])
    .filter((s) => s.verdict !== "excluded")
    .slice(0, 3)
    .map((s) => ({
      id: s.animal.id,
      reg: s.animal.registrationId,
      name: s.animal.name,
      verdict: s.verdict,
      mismatchCount: s.mismatchCount,
      lociCompared: s.lociCompared,
      parentageIndex: s.parentageIndex,
      r: s.r,
      bestFit: Boolean(s.bestFit),
      isDeclared: declared && s.animal.id === declared.id,
    }));

  const declaredExcluded = declaredVerify?.verdict === "excluded";
  const topCandidate = candidates.find((c) => !c.isDeclared) || null;
  const contradiction = declared
    ? declaredExcluded
      ? `Declared ${role} excluded at ${declaredVerify.mismatchLoci.length} loci${
          topCandidate
            ? `; ${topCandidate.reg} is consistent at all ${topCandidate.lociCompared} compared loci.`
            : "."
        }`
      : null
    : `No ${role} declared in the registry; biology suggests ${
        topCandidate ? topCandidate.reg : "no clear candidate"
      }.`;

  return {
    role,
    declared,
    declaredVerify,
    declaredRel,
    declaredExcluded,
    candidates,
    topCandidate,
    contradiction,
    poolSize: rs.poolSize || 0,
  };
}
