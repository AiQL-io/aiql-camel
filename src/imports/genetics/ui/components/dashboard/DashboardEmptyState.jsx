"use client";

import React from "react";
import styled from "styled-components";
import { Card } from "@/imports/core/components/Card.jsx";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { Button } from "@/imports/core/components/Button.jsx";

export function DashboardEmptyState({ onReset }) {
  return (
    <Card>
      <EmptyState>
        <Icon name="funnel-x" size={22} />
        <b>No animals in this scope/period</b>
        <span>
          The current filters and period return zero profiled animals.
        </span>
        <Button size="sm" variant="secondary" onClick={onReset}>
          Reset scope
        </Button>
      </EmptyState>
    </Card>
  );
}

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 40px;
  text-align: center;
  color: var(--fg-subtle);

  b {
    color: var(--fg);
  }
  span {
    font-size: var(--text-sm);
  }
  button {
    margin-top: 8px;
  }
`;
