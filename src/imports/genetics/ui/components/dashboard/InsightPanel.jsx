"use client";

import React from "react";
import styled from "styled-components";
import { InsightCard } from "../InsightCard.jsx";
import { CardPanel } from "./CardPanel.jsx";

export function InsightPanel({ insights }) {
  return (
    <CardPanel
      title="Auto-insights"
      aside={<span className="muted">{insights.length} findings</span>}
    >
      <Insights>
        {insights.length === 0 && (
          <p className="empty">No notable findings in this scope.</p>
        )}
        {insights.map((i) => (
          <InsightCard key={i.id} insight={i} />
        ))}
      </Insights>
    </CardPanel>
  );
}

const Insights = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  .empty {
    font-size: var(--text-sm);
    color: var(--fg-subtle);
  }
`;
