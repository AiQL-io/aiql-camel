"use client";

import React from "react";
import Link from "next/link";
import styled from "styled-components";
import { Card } from "@/imports/core/components/Card.jsx";
import { Chip } from "@/imports/core/components/Chip.jsx";
import { Overline } from "@/imports/core/components/Overline.jsx";
import { EgoNetwork } from "@/imports/core/components/EgoNetwork.jsx";

export function RelativesTab({ animal, rankedRelatives }) {
  return (
    <RelGrid>
      <Card padding={0}>
        <div className="rl-head">
          <Overline>Closest genetic relatives</Overline>
        </div>
        <div className="rl-body">
          {rankedRelatives.length === 0 && (
            <span className="empty-note">
              No DNA-derived relatives in the dataset.
            </span>
          )}
          {rankedRelatives.map((r) => (
            <Link
              key={r.animal.id}
              href={`/verify/relationship?a=${animal.id}&b=${r.animal.id}`}
              className="rl-row"
            >
              <div>
                <div className="nm">{r.animal.name}</div>
                <div className="id">{r.animal.registrationId}</div>
              </div>
              <div className="rl-right">
                <Chip size="sm" tone={r.r >= 0.45 ? "accent" : "default"}>
                  {r.inferred}
                </Chip>
                <div className="rmeta">
                  r {r.r.toFixed(2)} · {r.loci} loci
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Card>
      <Card>
        <Overline style={{ marginBottom: 8 }}>Ego-network</Overline>
        {rankedRelatives.length ? (
          <EgoNetwork focal={animal} relatives={rankedRelatives} />
        ) : (
          <p className="empty-note">Nothing to graph.</p>
        )}
      </Card>
    </RelGrid>
  );
}

const RelGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 16px;
  align-items: start;
  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }

  .empty-note {
    font-size: var(--text-sm);
    color: var(--fg-subtle);
  }
  .rl-head {
    padding: 16px 20px;
    border-bottom: 1px solid var(--border);
  }
  .rl-body {
    padding: 8px;
  }
  .rl-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 12px;
    border-radius: var(--radius-md);
  }
  .rl-row:hover {
    background: var(--surface-2);
  }
  .rl-row .nm {
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
  }
  .rl-row .id {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
  .rl-right {
    text-align: end;
  }
  .rl-right .rmeta {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--fg-subtle);
    margin-top: 4px;
  }
`;
