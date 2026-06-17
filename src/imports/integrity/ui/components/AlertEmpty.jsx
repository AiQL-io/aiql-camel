"use client";

import React from "react";
import Link from "next/link";
import styled from "styled-components";
import { Card } from "@/imports/core/components/Card.jsx";
import { Icon } from "@/imports/core/components/Icon.jsx";

export function AlertEmpty() {
  return (
    <Card>
      <Empty>
        <Icon name="warning-circle" size={20} />
        <div>
          <b>Alert not found</b>
          <span>This alert ID isn’t in the current queue.</span>
        </div>
        <Link href="/integrity">Back to queue</Link>
      </Empty>
    </Card>
  );
}

const Empty = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 32px;
  text-align: center;
  color: var(--fg-subtle);

  b {
    display: block;
    color: var(--fg);
  }
  span {
    font-size: var(--text-sm);
  }
  a {
    margin-top: 8px;
    color: var(--accent);
    font-size: var(--text-sm);
  }
`;
