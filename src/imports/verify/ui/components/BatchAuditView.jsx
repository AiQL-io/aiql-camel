"use client";

import React from "react";
import styled from "styled-components";
import { Card } from "@/imports/core/components/Card.jsx";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { useRole } from "@/imports/core/providers/RoleProvider.jsx";
import { useBatchAudit } from "@/imports/verify/hooks/useBatchAudit.js";
import { useCases } from "@/imports/verify/state/caseStore.js";
import { AuditControls } from "./AuditControls.jsx";
import { AuditSummary } from "./AuditSummary.jsx";
import { AuditTable } from "./AuditTable.jsx";

export function BatchAuditView({ access }) {
  const ba = useBatchAudit(access);
  const { can } = useRole();
  const { createCase, raiseAlert } = useCases();

  const createExclusionCases = () => {
    const excl = ba.rows.filter((r) => r.verdict === "excluded").slice(0, 40);
    excl.forEach((r) => {
      const c = createCase({
        type: r.role === "dam" ? "maternity" : "paternity",
        subjects: {
          offspring: {
            id: r.offspringId,
            reg: r.offspring,
            name: r.offspringName,
          },
          [r.role]: { id: r.parentId, reg: r.parent },
        },
        verdict: "excluded",
        stats: { mismatchCount: r.mismatchCount, lociCompared: r.lociCompared },
      });
      raiseAlert(c.id);
    });
  };

  if (!can("runAnalysis")) {
    return (
      <Card>
        <RO>
          <Icon name="lock-simple" size={16} /> View-only role — switch to
          Geneticist or Registrar to run the registry audit.
        </RO>
      </Card>
    );
  }

  return (
    <>
      <AuditControls ba={ba} />

      {ba.hasRun && (
        <ResultsCard>
          <AuditSummary ba={ba} />
          <AuditTable
            rows={ba.rows}
            can={can}
            onCreateExclusionCases={createExclusionCases}
            summary={ba.summary}
            total={ba.revealed}
            provenance={{
              subjects: `scope ${ba.scope}`,
              panel: access.panel,
              tolerance: ba.tolerance,
            }}
          />
        </ResultsCard>
      )}

      {!ba.hasRun && (
        <ResultsCard>
          <Intro>
            Verify every declared sire/dam link in the registry against biology
            in one run. Results stream in with a live summary; each row opens in
            the Workbench with full evidence.
          </Intro>
        </ResultsCard>
      )}
    </>
  );
}

const ResultsCard = styled(Card)`
  margin-top: 16px;
`;

const Intro = styled.p`
  font-size: var(--text-sm);
  color: var(--fg-subtle);
`;

const RO = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--text-sm);
  color: var(--fg-secondary);
`;
