"use client";

import React from "react";
import styled from "styled-components";
import { MetricTile } from "../MetricTile.jsx";

export function InbreedingKpis({ div, threshold, pctAbove }) {
  return (
    <KpiBand>
      <MetricTile label="Mean inbreeding F" value={div.meanF} methodKey="f" />
      <MetricTile
        label="Mean kinship"
        value={div.meanKinship}
        methodKey="kinship"
      />
      <MetricTile
        label="Ne (coancestry)"
        value={div.ne}
        ci={Math.max(1, Math.round(div.ne * 0.15))}
        methodKey="ne"
      />
      <MetricTile
        label={`% F ≥ ${threshold.toFixed(2)}`}
        value={pctAbove}
        unit="%"
      />
    </KpiBand>
  );
}

const KpiBand = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
`;
