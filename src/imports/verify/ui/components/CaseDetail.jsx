"use client";

import React from "react";
import styled from "styled-components";
import { Card } from "@/imports/core/components/Card.jsx";
import { Chip } from "@/imports/core/components/Chip.jsx";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { Overline } from "@/imports/core/components/Overline.jsx";
import { useDataset } from "@/imports/core/data/useDataset.js";
import { CaseSubjects } from "./CaseSubjects.jsx";
import { CaseEvidence } from "./CaseEvidence.jsx";
import { CaseWorkflow } from "./CaseWorkflow.jsx";
import { CaseNotes } from "./CaseNotes.jsx";
import { STATUS_TONE, VERDICT_TONE } from "./caseHelpers.js";

function genosDiffer(snap, live) {
  if (!snap || !live) return false;
  if (snap.length !== live.length) return true;
  const m = new Map(live.map((g) => [g.locus, g]));
  return snap.some((g) => {
    const l = m.get(g.locus);
    return !l || l.alleleA !== g.alleleA || l.alleleB !== g.alleleB;
  });
}

function isSnapshotStale(access, sel) {
  if (!access) return false;
  return ["offspring", "sire", "dam"].some((role) => {
    const s = sel.subjects[role];
    if (!s || !s.genotypes || !s.id) return false;
    const live = access.getProfile(s.id)?.genotypes;
    return genosDiffer(s.genotypes, live);
  });
}

export function CaseDetail({
  sel,
  user,
  can,
  canApprove,
  transitionCase,
  issueCertificate,
  revokeCertificate,
  addNote,
}) {
  const { access } = useDataset();
  const stale = isSnapshotStale(access, sel);
  return (
    <Card>
      <Header>
        <div>
          <Overline>
            {sel.type} · {sel.number}
          </Overline>
          <h2>
            {sel.subjects.offspring?.name}
            <VerdictChip tone={VERDICT_TONE[sel.verdict] || "default"}>
              {sel.verdict}
            </VerdictChip>
          </h2>
        </div>
        <CapChip tone={STATUS_TONE[sel.status]}>{sel.status}</CapChip>
      </Header>

      {stale && (
        <Stale>
          <Icon name="warning" size={15} /> A subject&apos;s live DNA profile
          has changed since this case was snapshotted — the evidence below
          reflects the profile at test time.
        </Stale>
      )}

      <CaseSubjects subjects={sel.subjects} stats={sel.stats} />
      <CaseEvidence sel={sel} />
      <CaseWorkflow
        sel={sel}
        user={user}
        can={can}
        canApprove={canApprove}
        transitionCase={transitionCase}
        issueCertificate={issueCertificate}
        revokeCertificate={revokeCertificate}
      />
      <CaseNotes sel={sel} user={user} addNote={addNote} />
    </Card>
  );
}

const CapChip = styled(Chip)`
  text-transform: capitalize;
`;

const Stale = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 14px;
  padding: 10px 14px;
  border: 1px solid var(--warning);
  border-radius: var(--radius-md);
  background: color-mix(in srgb, var(--warning) 8%, var(--surface));
  color: var(--warning);
  font-size: var(--text-xs);
`;

const VerdictChip = styled(CapChip)`
  margin-inline-start: 10px;
`;

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;

  h2 {
    font-size: var(--text-xl);
    font-weight: var(--weight-medium);
    display: flex;
    align-items: center;
    margin-top: 4px;
  }
`;
