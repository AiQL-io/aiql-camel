"use client";

import React from "react";
import styled from "styled-components";
import { Card } from "@/imports/core/components/Card.jsx";

export function SectionCard({ title, action, children, style }) {
  return (
    <Card padding={0} style={style}>
      <Head>
        <h3>{title}</h3>
        {action}
      </Head>
      <Body>{children}</Body>
    </Card>
  );
}

const Head = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);

  h3 {
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
  }
  a {
    font-size: var(--text-xs);
    color: var(--accent);
  }
`;

const Body = styled.div`
  padding: 20px;
`;
