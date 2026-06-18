"use client";

import React from "react";
import Link from "next/link";
import styled from "styled-components";
import { Drawer } from "@/imports/core/components/Drawer.jsx";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { Button } from "@/imports/core/components/Button.jsx";
import { Overline } from "@/imports/core/components/Overline.jsx";

export function InbreedingDrawer({ animal, est, relatives, onClose }) {
  return (
    <Drawer
      open={Boolean(animal)}
      onClose={onClose}
      title={animal ? animal.registrationId : ""}
      width={420}
    >
      {animal && (
        <DrawerBody>
          <h3>{animal.name}</h3>
          <span className="sub">
            {animal.breed} · {animal.region} · {animal.ownerName}
          </span>

          <Overline style={{ marginTop: 18 }}>
            Inbreeding F by estimator
          </Overline>
          <dl className="est">
            <div>
              <dt>HL (Aparicio)</dt>
              <dd>{est.hl.toFixed(3)}</dd>
            </div>
            <div>
              <dt>IR (Amos)</dt>
              <dd>{est.ir.toFixed(3)}</dd>
            </div>
            <div>
              <dt>Molecular-F</dt>
              <dd>{est.molecular.toFixed(3)}</dd>
            </div>
            <div>
              <dt>Percentile</dt>
              <dd>p{animal.inbreedingPercentile}</dd>
            </div>
          </dl>

          <Overline style={{ marginTop: 18 }}>Closest relatives</Overline>
          <div className="rel">
            {relatives.length === 0 && (
              <span className="muted">No profiled relatives in scope.</span>
            )}
            {relatives.map((x) => (
              <Link key={x.id} href={`/registry/${x.id}`} className="relrow">
                <span className="rreg">{x.registrationId}</span>
                <span className="rname">{x.name}</span>
              </Link>
            ))}
          </div>

          <div className="actions">
            <Button
              size="sm"
              variant="primary"
              as={Link}
              href={`/registry/${animal.id}`}
              leadingIcon={<Icon name="identification-card" size={14} />}
            >
              Open profile
            </Button>
            <Button
              size="sm"
              variant="secondary"
              as={Link}
              href={`/verify/relationship?focal=${animal.id}`}
              leadingIcon={<Icon name="graph" size={14} />}
            >
              Relatives
            </Button>
          </div>
        </DrawerBody>
      )}
    </Drawer>
  );
}

const DrawerBody = styled.div`
  h3 {
    font-size: var(--text-lg);
    font-weight: var(--weight-medium);
  }
  .sub {
    font-size: var(--text-sm);
    color: var(--fg-subtle);
  }
  .est {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px 16px;
    margin-top: 10px;
  }
  .est dt {
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
  .est dd {
    font-family: var(--font-mono);
    font-size: var(--text-base);
    margin-top: 2px;
  }
  .rel {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-top: 8px;
  }
  .relrow {
    display: flex;
    gap: 10px;
    padding: 6px 8px;
    border: 1px solid var(--separator);
    border-radius: var(--radius-md);
  }
  .relrow:hover {
    background: var(--surface-2);
  }
  .rreg {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--accent);
  }
  .rname {
    font-size: var(--text-sm);
  }
  .muted {
    font-size: var(--text-sm);
    color: var(--fg-subtle);
  }
  .actions {
    display: flex;
    gap: 8px;
    margin-top: 20px;
  }
`;
