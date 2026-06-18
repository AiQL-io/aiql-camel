"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/imports/core/components/Card.jsx";
import { useRole } from "@/imports/core/providers/RoleProvider.jsx";
import { useRelationship } from "@/imports/verify/hooks/useRelationship.js";
import { useCases } from "@/imports/verify/state/caseStore.js";
import { MethodsDrawer } from "./MethodsDrawer.jsx";
import { PairAnalysisCard } from "./PairAnalysisCard.jsx";
import { PairResult } from "./PairResult.jsx";
import { FamilyReconstruction } from "./FamilyReconstruction.jsx";
import { declaredRelationship } from "./relationshipHelpers.js";
import { exportCsv } from "./exporters.js";

export function RelationshipView({ access }) {
  const rl = useRelationship(access);
  const { can } = useRole();
  const { createCase, setActiveCase } = useCases();
  const router = useRouter();
  const [methods, setMethods] = useState(false);
  const estLabel = rl.estimators.find((e) => e.value === rl.estimator)?.label;
  const pair = rl.pair;
  const poConsistent = pair && pair.ibs && pair.ibs.share0 === 0;

  const finalizePO = () => {
    if (!rl.aId || !rl.bId) return;
    const res = access.verify(rl.bId, rl.aId, {});
    const snap = (a, geno) =>
      a
        ? {
            id: a.id,
            name: a.name,
            reg: a.registrationId,
            sex: a.sex,
            genotypes: geno ? geno.map((g) => ({ ...g })) : [],
          }
        : null;
    const c = createCase({
      type: "paternity",
      subjects: {
        offspring: snap(rl.b, rl.bProf?.genotypes),
        sire: snap(rl.a, rl.aProf?.genotypes),
      },
      verdict: res?.verdict || "consistent",
      stats: {
        lociCompared: res?.lociCompared,
        mismatchCount: res?.mismatchCount,
        cpe: res?.cpe,
        parentageIndex: res?.parentageIndex,
      },
      evidence: { mismatchLoci: res?.mismatchLoci || [] },
    });
    setActiveCase(c.id);
    router.push("/verify/cases");
  };

  const exportRelatives = () =>
    exportCsv({
      filename: `relatives-${rl.a?.registrationId || "focal"}.csv`,
      columns: [
        { label: "relative", get: (r) => r.animal.registrationId },
        { label: "name", get: (r) => r.animal.name },
        { label: "relatedness_r", get: (r) => r.r },
        { label: "inferred", get: (r) => r.inferred },
        { label: "loci", get: (r) => r.loci },
        {
          label: "declared",
          get: (r) => declaredRelationship(access, rl.aId, r.animal.id),
        },
      ],
      rows: rl.family,
      provenance: {
        title: "Family reconstruction",
        subjects: `focal ${rl.a?.registrationId}`,
        panel: access.panel,
        estimator: estLabel,
      },
    });

  return (
    <>
      <PairAnalysisCard
        access={access}
        rl={rl}
        onMethods={() => setMethods(true)}
      />

      {pair && rl.a && rl.b && (
        <PairResult
          rl={rl}
          pair={pair}
          estLabel={estLabel}
          poConsistent={poConsistent}
          can={can}
          onFinalizePO={finalizePO}
        />
      )}

      {rl.a && (
        <FamilyReconstruction
          access={access}
          rl={rl}
          onExport={exportRelatives}
        />
      )}

      {!rl.a && (
        <Card style={{ marginTop: 16 }}>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--fg-subtle)" }}>
            Pick Animal A to quantify any-pair relatedness and reconstruct its
            family from DNA.
          </p>
        </Card>
      )}
      <MethodsDrawer open={methods} onClose={() => setMethods(false)} />
    </>
  );
}
