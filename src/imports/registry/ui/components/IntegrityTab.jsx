"use client";

import React from "react";
import styled from "styled-components";
import { Card } from "@/imports/core/components/Card.jsx";
import { Chip } from "@/imports/core/components/Chip.jsx";
import { Icon } from "@/imports/core/components/Icon.jsx";

export function IntegrityTab({ flags }) {
  return (
    <Card>
      {flags.length === 0 ? (
        <OkRow>
          <Icon name="check-circle" size={18} />
          <span>No integrity issues detected.</span>
        </OkRow>
      ) : (
        <FlagList>
          {flags.map((f, i) => (
            <div key={i} className="flag">
              <SevChip
                size="sm"
                tone={
                  f.sev === "critical"
                    ? "danger"
                    : f.sev === "high"
                      ? "warning"
                      : "default"
                }
              >
                {f.sev}
              </SevChip>
              <span>
                <b>{f.type}</b>
                <i>{f.detail}</i>
              </span>
            </div>
          ))}
        </FlagList>
      )}
    </Card>
  );
}

const SevChip = styled(Chip)`
  text-transform: capitalize;
  flex: none;
`;

const OkRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--status-success);
  font-size: var(--text-sm);
`;

const FlagList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  .flag {
    display: flex;
    align-items: flex-start;
    gap: 10px;
  }
  .flag b {
    display: block;
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
  }
  .flag i {
    display: block;
    font-style: normal;
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
`;
