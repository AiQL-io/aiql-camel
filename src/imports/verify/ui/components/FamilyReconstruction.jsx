"use client";

import React from "react";
import Link from "next/link";
import styled from "styled-components";
import { Card } from "@/imports/core/components/Card.jsx";
import { Chip } from "@/imports/core/components/Chip.jsx";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { Button } from "@/imports/core/components/Button.jsx";
import { Overline } from "@/imports/core/components/Overline.jsx";
import { EgoNetwork } from "@/imports/core/components/EgoNetwork.jsx";
import { declaredRelationship, agrees } from "./relationshipHelpers.js";

export function FamilyReconstruction({ access, rl, onExport }) {
  return (
    <Card style={{ marginTop: 16 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <Overline style={{ marginBottom: 6 }}>
          Family reconstruction · {rl.a.name}
        </Overline>
        {rl.family.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onExport}
            leadingIcon={<Icon name="download-simple" size={13} />}
          >
            Export
          </Button>
        )}
      </div>
      <p
        style={{
          fontSize: "var(--text-sm)",
          color: "var(--fg-subtle)",
          marginBottom: 4,
        }}
      >
        Nearest genetic relatives inferred from DNA, compared against the
        registry-declared relationship.
      </p>
      <Recon>
        <div className="net">
          {rl.family.length ? (
            <EgoNetwork
              focal={rl.a}
              relatives={rl.family}
              onSelect={(rel) => rl.setBId(rel.animal.id)}
            />
          ) : (
            <p className="empty">No close genetic relatives found.</p>
          )}
        </div>
        <div className="tbl">
          <div className="thead">
            <span>Relative</span>
            <span>r</span>
            <span>Inferred</span>
            <span>Declared</span>
            <span />
          </div>
          {rl.family.map((rel) => {
            const declared = declaredRelationship(
              access,
              rl.aId,
              rel.animal.id,
            );
            const ok = agrees(rel.inferred, declared);
            const informative = rel.r >= 0.18;
            return (
              <div className="trow" key={rel.animal.id}>
                <Link href={`/registry/${rel.animal.id}`} className="rl-nm">
                  {rel.animal.name}
                  <i>{rel.animal.registrationId}</i>
                </Link>
                <span className="mono">{rel.r.toFixed(2)}</span>
                <span className="mono">{rel.inferred}</span>
                <span className="declared">{declared}</span>
                <span>
                  {informative && !ok ? (
                    <Chip size="sm" tone="danger">
                      conflict
                    </Chip>
                  ) : informative ? (
                    <Chip size="sm" tone="success">
                      match
                    </Chip>
                  ) : (
                    <span className="muted">—</span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </Recon>
    </Card>
  );
}

const Recon = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 20px;
  margin-top: 14px;
  align-items: start;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }

  .empty {
    font-size: var(--text-sm);
    color: var(--fg-subtle);
  }
  .thead,
  .trow {
    display: grid;
    grid-template-columns: 1.6fr 50px 1.3fr 1.3fr 70px;
    gap: 8px;
    align-items: center;
    padding: 8px 6px;
  }
  .thead {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--fg-subtle);
    border-bottom: 1px solid var(--border);
  }
  .trow {
    border-bottom: 1px solid var(--separator);
    font-size: var(--text-sm);
  }
  .rl-nm {
    display: flex;
    flex-direction: column;
    font-weight: var(--weight-medium);
  }
  .rl-nm i {
    font-style: normal;
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
  .mono {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
  }
  .declared {
    font-size: var(--text-xs);
    color: var(--fg-secondary);
  }
  .muted {
    color: var(--fg-muted);
  }
`;
