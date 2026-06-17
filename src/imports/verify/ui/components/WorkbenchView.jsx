"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { Card } from "@/imports/core/components/Card.jsx";
import { Button } from "@/imports/core/components/Button.jsx";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { Overline } from "@/imports/core/components/Overline.jsx";
import { SegmentedControl } from "@/imports/core/components/SegmentedControl.jsx";
import { CompareStrip } from "@/imports/core/components/CompareStrip.jsx";
import { useRole } from "@/imports/core/providers/RoleProvider.jsx";
import { useWorkbench } from "@/imports/verify/hooks/useWorkbench.js";
import { useCases } from "@/imports/verify/state/caseStore.js";
import { SubjectPicker } from "./SubjectPicker.jsx";
import { Verdict } from "./Verdict.jsx";
import { ToleranceControl } from "./ToleranceControl.jsx";
import { MethodsDrawer } from "./MethodsDrawer.jsx";
import { TrioStrip } from "./TrioStrip.jsx";
import { exportCsv } from "./exporters.js";

function snapshot(access, animal) {
  if (!animal) return null;
  const prof = access.getProfile(animal.id);
  return {
    id: animal.id,
    name: animal.name,
    reg: animal.registrationId,
    sex: animal.sex,
    genotypes: prof ? prof.genotypes.map((g) => ({ ...g })) : [],
  };
}

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

      <Card>
        <Overline style={{ marginBottom: 14 }}>Subjects</Overline>
        <Subjects>
          <SubjectPicker
            access={access}
            value={wb.offspringId}
            onChange={wb.setOffspringId}
            label="Offspring"
            role="offspring"
          />
          <div className="mode">
            <span className="lbl">Mode</span>
            <SegmentedControl
              value={wb.mode}
              onChange={wb.setMode}
              options={[
                { value: "paternity", label: "Paternity" },
                { value: "maternity", label: "Maternity" },
                { value: "trio", label: "Trio" },
              ]}
            />
          </div>
        </Subjects>
        <Candidates>
          {(wb.mode === "paternity" || wb.mode === "trio") && (
            <SubjectPicker
              access={access}
              value={wb.sireId}
              onChange={wb.setSireId}
              label="Candidate sire"
              role="sire"
              offspring={wb.offspring}
            />
          )}
          {(wb.mode === "maternity" || wb.mode === "trio") && (
            <SubjectPicker
              access={access}
              value={wb.damId}
              onChange={wb.setDamId}
              label="Candidate dam"
              role="dam"
              offspring={wb.offspring}
            />
          )}
        </Candidates>
        <Button
          variant="primary"
          disabled={!wb.canRun}
          onClick={wb.run}
          leadingIcon={<Icon name="play" size={15} />}
          style={{ marginTop: 18 }}
        >
          Run verification
        </Button>
      </Card>

      {r && r.kind === "error" && (
        <Card style={{ marginTop: 16 }}>
          <RO>
            <Icon name="warning" size={16} /> A subject has no usable DNA
            profile — can&apos;t run this test.
          </RO>
        </Card>
      )}

      {r && r.kind !== "error" && (
        <>
          <div style={{ marginTop: 16 }}>
            <Verdict
              verdict={r.verdict}
              lociCompared={r.lociCompared}
              mismatchCount={r.mismatchCount}
              cpe={r.cpe}
              parentageIndex={r.parentageIndex}
              tolerance={wb.tolerance}
              onMethods={() => setMethods(true)}
            />
          </div>

          <Card style={{ marginTop: 16 }}>
            <Overline style={{ marginBottom: 14 }}>
              Per-locus comparison
            </Overline>
            {r.kind === "trio" ? (
              <TrioStrip
                rows={r.detail}
                labels={{
                  sire: r.sire?.name,
                  offspring: wb.offspring?.name,
                  dam: r.dam?.name,
                }}
              />
            ) : (
              <CompareStrip
                rows={[
                  {
                    label: wb.offspring?.name,
                    sub: wb.offspring?.registrationId,
                    geno: r.offspringGeno,
                  },
                  {
                    label: r.candidate?.name,
                    sub: `${r.candidate?.registrationId} · candidate ${r.role}`,
                    geno: r.candidateGeno,
                  },
                ]}
              />
            )}
          </Card>

          <Actions>
            <Button
              variant="primary"
              size="sm"
              onClick={() => finalize()}
              leadingIcon={<Icon name="folder-plus" size={14} />}
            >
              Finalize to Case
            </Button>
            {can("issueCertificate") && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => finalize()}
                leadingIcon={<Icon name="certificate" size={14} />}
              >
                To certificate
              </Button>
            )}
            {declaredExcluded && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => finalize({ withAlert: true })}
                leadingIcon={<Icon name="flag" size={14} />}
              >
                Raise integrity alert
              </Button>
            )}
            <Button
              as={Link}
              href={`/verify/search?offspring=${wb.offspringId}`}
              variant="secondary"
              size="sm"
              leadingIcon={<Icon name="magnifying-glass" size={14} />}
            >
              Open reverse search
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={exportResult}
              leadingIcon={<Icon name="download-simple" size={14} />}
            >
              Export
            </Button>
          </Actions>
        </>
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

const Subjects = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 16px;
  align-items: end;

  .mode .lbl {
    display: block;
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--fg-subtle);
    margin-bottom: 6px;
  }
  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

const Candidates = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 16px;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 16px;
`;
