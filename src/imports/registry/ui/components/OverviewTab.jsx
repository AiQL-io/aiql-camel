"use client";

import React from "react";
import styled from "styled-components";
import { Card } from "@/imports/core/components/Card.jsx";
import { Overline } from "@/imports/core/components/Overline.jsx";
import { EgoNetwork } from "@/imports/core/components/EgoNetwork.jsx";

export function OverviewTab({
  animal,
  offspring,
  fullSibs,
  rankedRelatives,
  flags,
}) {
  return (
    <OverviewGrid>
      <Card>
        <SnapshotTitle>Genetic snapshot</SnapshotTitle>
        <Snapshot>
          <div className="big">
            F {animal.inbreedingF}
            <span>inbreeding coefficient</span>
          </div>
          <div className="pct">
            <div className="bar">
              <Bar $pct={animal.inbreedingPercentile} />
            </div>
            <div className="cap">
              More inbred than {animal.inbreedingPercentile}% of the population
            </div>
          </div>
        </Snapshot>
        <Counts>
          <div>
            <b>{offspring.length}</b>
            <span>offspring</span>
          </div>
          <div>
            <b>{fullSibs.length}</b>
            <span>full sibs</span>
          </div>
          <div>
            <b>{rankedRelatives.length}</b>
            <span>relatives</span>
          </div>
          <div>
            <b>{flags.length}</b>
            <span>alerts</span>
          </div>
        </Counts>
      </Card>
      <Card>
        <RelTitle>Relationship preview</RelTitle>
        {rankedRelatives.length ? (
          <EgoNetwork focal={animal} relatives={rankedRelatives} />
        ) : (
          <p className="empty-note">No DNA-derived relatives on file.</p>
        )}
      </Card>
    </OverviewGrid>
  );
}

const SnapshotTitle = styled(Overline)`
  display: block;
  margin-bottom: 12px;
`;

const RelTitle = styled(Overline)`
  display: block;
  margin-bottom: 8px;
`;

const Bar = styled.span`
  display: block;
  height: 100%;
  width: ${(p) => p.$pct}%;
  background: var(--aiql-bar-gradient);
  transform-origin: left center;
  animation: aiql-grow-x 720ms cubic-bezier(0.2, 0.75, 0.25, 1);
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const OverviewGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }

  .empty-note {
    font-size: var(--text-sm);
    color: var(--fg-subtle);
  }
`;

const Snapshot = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;

  .big {
    font-size: var(--text-2xl);
    font-weight: var(--weight-medium);
    display: flex;
    flex-direction: column;
  }
  .big span {
    font-size: var(--text-xs);
    color: var(--fg-subtle);
    font-weight: var(--weight-regular);
    margin-top: 2px;
  }
  .pct {
    flex: 1;
  }
  .pct .bar {
    height: 8px;
    border-radius: 4px;
    background: var(--surface-2);
    overflow: hidden;
  }
  .pct .cap {
    font-size: var(--text-xs);
    color: var(--fg-subtle);
    margin-top: 6px;
  }
`;

const Counts = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--separator);

  div {
    text-align: center;
  }
  b {
    display: block;
    font-size: var(--text-lg);
    font-weight: var(--weight-medium);
  }
  span {
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
`;
