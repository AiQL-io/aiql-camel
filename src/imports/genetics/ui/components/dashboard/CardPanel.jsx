"use client";

import React from "react";
import styled from "styled-components";
import { Card } from "@/imports/core/components/Card.jsx";
import { Overline } from "@/imports/core/components/Overline.jsx";

export function CardPanel({ title, aside, children, className }) {
  return (
    <Card className={className}>
      <PanelHead>
        <Overline>{title}</Overline>
        {aside}
      </PanelHead>
      {children}
    </Card>
  );
}

const PanelHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  gap: 12px;

  .muted {
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
  .link {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: var(--text-xs);
    color: var(--accent);
  }
`;
