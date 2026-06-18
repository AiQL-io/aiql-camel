"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { Card } from "@/imports/core/components/Card.jsx";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { useRole } from "@/imports/core/providers/RoleProvider.jsx";
import { useWorkbench } from "@/imports/verify/hooks/useWorkbench.js";
import { useCases } from "@/imports/verify/state/caseStore.js";
import { ToleranceControl } from "./ToleranceControl.jsx";
import { MethodsDrawer } from "./MethodsDrawer.jsx";
import { WorkbenchSetup } from "./WorkbenchSetup.jsx";
import { WorkbenchResult } from "./WorkbenchResult.jsx";
import { snapshot } from "./workbenchHelpers.js";
import { exportCsv } from "./exporters.js";

export function WorkbenchView({ access }) {
  const wb = useWorkbench(access);
  const { can } = useRole();
  const { createCase, setActiveCase, raiseAlert } = useCases();
  const router = useRouter();
  const [methods, setMethods] = useState(false);

  const r = wb.result;
  const declaredExcluded =
    r?.kind === "single" &&
    r.verdict === "excluded" &&
    ((r.role === "sire" && r.candidate?.id === wb.declaredSireId) ||
      (r.role === "dam" && r.candidate?.id === wb.declaredDamId));

  const finalize = ({ withAlert = false } = {}) => {
    if (!r || r.kind === "error") return;
    const subjects = { offspring: snapshot(access, wb.offspring) };
    if (r.kind === "trio") {
      subjects.sire = snapshot(access, r.sire);
      subjects.dam = snapshot(access, r.dam);
    } else if (r.role === "sire") subjects.sire = snapshot(access, r.candidate);
    else subjects.dam = snapshot(access, r.candidate);

    const c = createCase({
      type: wb.mode,
      subjects,
      verdict: r.verdict,
      stats: {
        lociCompared: r.lociCompared,
        mismatchCount: r.mismatchCount,
        cpe: r.cpe,
        parentageIndex: r.parentageIndex,
        tolerance: wb.tolerance,
      },
      evidence:
        r.kind === "trio"
          ? { detail: r.detail }
          : { mismatchLoci: r.mismatchLoci },
    });
    if (withAlert) raiseAlert(c.id);
    setActiveCase(c.id);
    router.push("/verify/cases");
  };

  const exportResult = () => {
    if (!r || r.kind === "error") return;
    const subj = [
      wb.offspring?.registrationId,
      r.kind === "trio"
        ? `${r.sire?.registrationId}/${r.dam?.registrationId}`
        : r.candidate?.registrationId,
    ]
      .filter(Boolean)
      .join(" vs ");
    exportCsv({
      filename: `verification-${wb.offspring?.registrationId || "result"}.csv`,
      columns: [
        { label: "offspring", get: () => wb.offspring?.registrationId },
        { label: "mode", get: () => wb.mode },
        { label: "verdict", get: () => r.verdict },
        { label: "loci_compared", get: () => r.lociCompared },
        { label: "mismatches", get: () => r.mismatchCount },
        { label: "cpe", get: () => r.cpe },
        {
          label: "parentage_index",
          get: () =>
            r.parentageIndex ? r.parentageIndex.toExponential(3) : "",
        },
      ],
      rows: [r],
      provenance: {
        title: "Verification result",
        subjects: subj,
        panel: access.panel,
        tolerance: wb.tolerance,
      },
    });
  };

  if (!can("runAnalysis")) {
    return (
      <Card>
        <RO>
          <Icon name="lock-simple" size={16} /> Your role has view-only access —
          switch to Geneticist, Technician, or Registrar to run verifications.
        </RO>
      </Card>
    );
  }

  return (
    <>
      <Bar>
        <ToleranceControl value={wb.tolerance} onChange={wb.setTolerance} />
        <button
          type="button"
          className="methods"
          onClick={() => setMethods(true)}
        >
          <Icon name="info" size={14} /> Methods
        </button>
      </Bar>

      <WorkbenchSetup access={access} wb={wb} />

      {r && r.kind === "error" && (
        <Card style={{ marginTop: 16 }}>
          <RO>
            <Icon name="warning" size={16} /> A subject has no usable DNA
            profile — can&apos;t run this test.
          </RO>
        </Card>
      )}

      {r && r.kind !== "error" && (
        <WorkbenchResult
          r={r}
          wb={wb}
          can={can}
          declaredExcluded={declaredExcluded}
          onFinalize={finalize}
          onExport={exportResult}
          onMethods={() => setMethods(true)}
        />
      )}

      <MethodsDrawer open={methods} onClose={() => setMethods(false)} />
    </>
  );
}

const RO = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--text-sm);
  color: var(--fg-secondary);
`;

const Bar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;

  .methods {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 30px;
    padding: 0 12px;
    border: 1px solid var(--border);
    border-radius: var(--radius-pill);
    background: transparent;
    color: var(--fg-secondary);
    font-size: var(--text-xs);
    cursor: pointer;
  }
`;
