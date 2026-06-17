"use client";

import React from "react";
import styled from "styled-components";
import { Overline } from "@/imports/core/components/Overline.jsx";
import { CompareStrip } from "@/imports/core/components/CompareStrip.jsx";
import { TrioStrip } from "./TrioStrip.jsx";

export function CaseEvidence({ sel }) {
  if (sel.evidence?.detail) {
    return (
      <Section>
        <Title>Snapshot evidence</Title>
        <TrioStrip
          rows={sel.evidence.detail}
          labels={{
            sire: sel.subjects.sire?.name,
            offspring: sel.subjects.offspring?.name,
            dam: sel.subjects.dam?.name,
          }}
        />
      </Section>
    );
  }
  if (sel.subjects.offspring?.genotypes?.length) {
    return (
      <Section>
        <Title>Snapshot evidence</Title>
        <CompareStrip
          rows={[
            {
              label: sel.subjects.offspring.name,
              sub: sel.subjects.offspring.reg,
              geno: sel.subjects.offspring.genotypes,
            },
            ...(sel.subjects.sire
              ? [
                  {
                    label: sel.subjects.sire.name,
                    sub: "sire",
                    geno: sel.subjects.sire.genotypes || [],
                  },
                ]
              : []),
            ...(sel.subjects.dam
              ? [
                  {
                    label: sel.subjects.dam.name,
                    sub: "dam",
                    geno: sel.subjects.dam.genotypes || [],
                  },
                ]
              : []),
          ]}
        />
      </Section>
    );
  }
  return null;
}

const Section = styled.div`
  margin-top: 14px;
`;

const Title = styled(Overline)`
  display: block;
  margin-bottom: 10px;
`;
