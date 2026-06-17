"use client";

import React from "react";
import Link from "next/link";
import styled from "styled-components";
import { Card } from "@/imports/core/components/Card.jsx";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { Overline } from "@/imports/core/components/Overline.jsx";
import { PedigreeTree } from "@/imports/core/components/PedigreeTree.jsx";
import { ParentLine } from "./ParentLine.jsx";

export function ParentageTab({
  animal,
  profile,
  declaredSire,
  declaredDam,
  bioSire,
  bioDam,
  sireCheck,
  damCheck,
  pedigree,
}) {
  const bioCheck = {
    verdict: "consistent",
    lociCompared: profile.genotypes.length,
    mismatchCount: 0,
  };

  return (
    <>
      <TwoPanel>
        <Card>
          <Overline style={{ marginBottom: 6 }}>Registry-declared</Overline>
          <ParentLine
            role="Declared sire"
            parent={declaredSire}
            check={sireCheck}
          />
          <ParentLine
            role="Declared dam"
            parent={declaredDam}
            check={damCheck}
          />
        </Card>
        <Card>
          <Overline style={{ marginBottom: 6 }}>Biology-confirmed</Overline>
          <ParentLine
            role="Biological sire"
            parent={bioSire}
            check={bioSire ? bioCheck : null}
          />
          <ParentLine
            role="Biological dam"
            parent={bioDam}
            check={bioDam ? bioCheck : null}
          />
        </Card>
      </TwoPanel>
      {animal.parentageStatus === "conflict" && (
        <ConflictBar>
          <Icon name="warning" size={16} />
          <span>Registry-declared parentage conflicts with biology.</span>
          <Link href={`/integrity/reconcile/${animal.id}`}>
            Open reconciliation <Icon name="arrow-right" size={12} />
          </Link>
        </ConflictBar>
      )}
      <Card style={{ marginTop: 12 }}>
        <Overline style={{ marginBottom: 14 }}>Pedigree</Overline>
        <PedigreeTree ped={pedigree} />
      </Card>
    </>
  );
}

const TwoPanel = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

const ConflictBar = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
  padding: 12px 16px;
  border: 1px solid var(--danger);
  border-radius: var(--radius-lg);
  background: color-mix(in srgb, var(--danger) 8%, var(--surface));
  color: var(--danger);
  font-size: var(--text-sm);

  a {
    margin-inline-start: auto;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--danger);
    font-weight: var(--weight-medium);
  }
`;
