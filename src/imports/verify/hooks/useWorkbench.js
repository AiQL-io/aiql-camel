"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

export function useWorkbench(access) {
  const params = useSearchParams();
  const [offspringId, setOffspringId] = useState(
    () => params.get("offspring") || "",
  );
  const [mode, setMode] = useState(() => params.get("mode") || "paternity");
  const [sireId, setSireId] = useState(() => params.get("sire") || "");
  const [damId, setDamId] = useState(() => params.get("dam") || "");
  const [tolerance, setTolerance] = useState(1);
  const [result, setResult] = useState(null);

  const offspring = offspringId ? access.getAnimal(offspringId) : null;

  const canRun =
    Boolean(offspringId && access.getProfile(offspringId)) &&
    ((mode === "paternity" && sireId) ||
      (mode === "maternity" && damId) ||
      (mode === "trio" && sireId && damId));

  const run = useCallback(() => {
    if (!offspringId) return;
    const offProf = access.getProfile(offspringId);
    if (!offProf) {
      setResult({ kind: "error", reason: "offspring-unprofiled" });
      return;
    }
    if (mode === "trio") {
      const r = access.verifyTrio(offspringId, sireId, damId, { tolerance });
      if (!r) return setResult({ kind: "error", reason: "unprofiled" });
      const verdict = r.lociCompared < 6 ? "insufficient-loci" : r.verdict;
      setResult({
        kind: "trio",
        verdict,
        lociCompared: r.lociCompared,
        mismatchCount: r.mismatchCount,
        cpe: r.cpe,
        detail: r.detail,
        sire: access.getAnimal(sireId),
        dam: access.getAnimal(damId),
      });
      return;
    }
    const role = mode === "maternity" ? "dam" : "sire";
    const candId = role === "dam" ? damId : sireId;
    const r = access.verify(offspringId, candId, { tolerance });
    if (!r) return setResult({ kind: "error", reason: "unprofiled" });
    const verdict = r.lociCompared < 6 ? "insufficient-loci" : r.verdict;
    setResult({
      kind: "single",
      role,
      verdict,
      lociCompared: r.lociCompared,
      mismatchCount: r.mismatchCount,
      cpe: r.cpe,
      parentageIndex: r.parentageIndex,
      mismatchLoci: r.mismatchLoci,
      candidate: access.getAnimal(candId),
      offspringGeno: offProf.genotypes,
      candidateGeno: access.getProfile(candId)?.genotypes || [],
    });
  }, [access, offspringId, mode, sireId, damId, tolerance]);

  const autoRan = useRef(false);
  useEffect(() => {
    if (autoRan.current) return;
    autoRan.current = true;
    if (canRun) queueMicrotask(run);
  }, [canRun, run]);

  const setField = (setter) => (v) => {
    setter(v);
    setResult(null);
  };

  const declaredSireId = offspring?.registeredParentSireId || "";
  const declaredDamId = offspring?.registeredParentDamId || "";

  return {
    offspringId,
    setOffspringId: setField(setOffspringId),
    offspring,
    mode,
    setMode: setField(setMode),
    sireId,
    setSireId: setField(setSireId),
    damId,
    setDamId: setField(setDamId),
    tolerance,
    setTolerance: (t) => {
      setTolerance(t);
      setResult(null);
    },
    canRun,
    run,
    result,
    declaredSireId,
    declaredDamId,
  };
}
