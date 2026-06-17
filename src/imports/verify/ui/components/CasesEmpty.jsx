"use client";

import React from "react";
import Link from "next/link";
import styled from "styled-components";
import { Card } from "@/imports/core/components/Card.jsx";
import { Button } from "@/imports/core/components/Button.jsx";
import { Icon } from "@/imports/core/components/Icon.jsx";

export function CasesEmpty() {
  return (
    <Card>
      <Empty>
        <Icon name="folder-open" size={28} color="var(--fg-muted)" />
        <p>No cases yet.</p>
        <span>
          Finalize a verification from the Workbench, Reverse Search, or Batch
          Audit to open a case.
        </span>
        <GoButton as={Link} href="/verify" variant="secondary" size="sm">
          Go to Workbench
        </GoButton>
      </Empty>
    </Card>
  );
}

const GoButton = styled(Button)`
  margin-top: 10px;
`;

const Empty = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 32px 0;

  p {
    font-size: var(--text-base);
    font-weight: var(--weight-medium);
    margin-top: 10px;
  }
  span {
    font-size: var(--text-sm);
    color: var(--fg-subtle);
    max-width: 360px;
    margin-top: 4px;
  }
`;
