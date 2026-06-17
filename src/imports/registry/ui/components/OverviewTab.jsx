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
        <Overline style={{ marginBottom: 12 }}>Genetic snapshot</Overline>
        <Snapshot>
          <div className="big">
            F {animal.inbreedingF}
            <span>inbreeding coefficient</span>
          </div>
          <div className="pct">
            <div className="bar">
              <span style={{ width: `${animal.inbreedingPercentile}%` }} />
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
        <Overline style={{ marginBottom: 8 }}>Relationship preview</Overline>
        {rankedRelatives.length ? (
          <EgoNetwork focal={animal} relatives={rankedRelatives} />
        ) : (
          <p className="empty-note">No DNA-derived relatives on file.</p>
        )}
      </Card>
    </OverviewGrid>
  );
}

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
  .pct .bar span {
    display: block;
    height: 100%;
    background: var(--accent);
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
