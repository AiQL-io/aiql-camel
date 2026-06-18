"use client";

import React from "react";
import styled from "styled-components";
import { Card } from "@/imports/core/components/Card.jsx";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { Select } from "@/imports/core/components/Select.jsx";
import { Overline } from "@/imports/core/components/Overline.jsx";
import { SubjectPicker } from "./SubjectPicker.jsx";

export function PairAnalysisCard({ access, rl, onMethods }) {
  return (
    <Card>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Overline style={{ marginBottom: 12 }}>Pair analysis</Overline>
        <button
          type="button"
          onClick={onMethods}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            height: 28,
            padding: "0 10px",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-pill)",
            background: "transparent",
            color: "var(--fg-secondary)",
            fontSize: "var(--text-xs)",
            cursor: "pointer",
          }}
        >
          <Icon name="info" size={14} /> Methods
        </button>
      </div>
      <PairRow>
        <SubjectPicker
          access={access}
          value={rl.aId}
          onChange={rl.setAId}
          label="Animal A"
        />
        <SubjectPicker
          access={access}
          value={rl.bId}
          onChange={rl.setBId}
          label="Animal B"
        />
        <div className="est">
          <span className="lbl">Estimator</span>
          <Select
            block
            size="sm"
            value={rl.estimator}
            onChange={rl.setEstimator}
            options={rl.estimators}
          />
        </div>
      </PairRow>
    </Card>
  );
}

const PairRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 220px;
  gap: 16px;
  align-items: end;

  .est .lbl {
    display: block;
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--fg-subtle);
    margin-bottom: 6px;
  }
  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;
