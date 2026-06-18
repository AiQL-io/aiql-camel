"use client";

import React from "react";
import styled from "styled-components";
import { Card } from "@/imports/core/components/Card.jsx";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { Button } from "@/imports/core/components/Button.jsx";

export function InbreedingEmptyState({ onReset }) {
  return (
    <Card>
      <Empty>
        <Icon name="funnel-x" size={22} />
        <b>No animals in this scope</b>
        <span>The current filters return zero profiled animals.</span>
        <Button size="sm" variant="secondary" onClick={onReset}>
          Reset scope
        </Button>
      </Empty>
    </Card>
  );
}

const Empty = styled.div`
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
