"use client";

import React from "react";
import styled from "styled-components";
import { Card } from "@/imports/core/components/Card.jsx";
import { Chip } from "@/imports/core/components/Chip.jsx";
import { Icon } from "@/imports/core/components/Icon.jsx";

export function ReconcileSessionLog({ log }) {
  if (log.length === 0) return null;
  return (
    <LogCard>
      <LogHead>
        <Icon name="clock-counter-clockwise" size={15} /> Actions this session
      </LogHead>
      {log.map((e, i) => (
        <LogRow key={i}>
          <Chip size="sm" tone="default">
            {e.role}
          </Chip>
          <span className="k">{e.kind}</span>
          <span className="d">{e.detail}</span>
          <span className="by">
            {e.by} · {e.at.slice(11, 16)}
          </span>
        </LogRow>
      ))}
    </LogCard>
  );
}

const LogCard = styled(Card)`
  margin-top: 16px;
`;

const LogHead = styled.h3`
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--fg-subtle);
  margin-bottom: 12px;
`;

const LogRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid var(--separator);
  font-size: var(--text-sm);

  .k {
    font-weight: var(--weight-medium);
  }
  .d {
    color: var(--fg-secondary);
  }
  .by {
    margin-inline-start: auto;
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
`;
