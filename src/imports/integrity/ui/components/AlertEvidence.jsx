"use client";

import React from "react";
import styled from "styled-components";
import { Card } from "@/imports/core/components/Card.jsx";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { EV_LABEL, evValue } from "./alertConstants.js";

export function AlertEvidence({ alert }) {
  const evidenceRows = Object.entries(alert.evidence || {}).filter(
    ([k]) => k !== "rule",
  );

  return (
    <Card>
      <SectionTitle>
        <Icon name="scales" size={15} /> Structured evidence
      </SectionTitle>
      <Rule>{alert.evidence?.rule}</Rule>
      {evidenceRows.length > 0 && (
        <Ev>
          {evidenceRows.map(([k, v]) => (
            <div key={k}>
              <dt>{EV_LABEL[k] || k}</dt>
              <dd>{evValue(k, v)}</dd>
            </div>
          ))}
        </Ev>
      )}
    </Card>
  );
}

const SectionTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--fg-subtle);
  margin-bottom: 12px;
`;

const Rule = styled.p`
  font-size: var(--text-sm);
  color: var(--fg);
  line-height: var(--leading-normal);
`;

const Ev = styled.dl`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 16px;
  margin-top: 14px;

  dt {
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
  dd {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    margin-top: 2px;
  }
`;
