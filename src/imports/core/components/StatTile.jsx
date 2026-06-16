"use client";

import React from "react";
import styled from "styled-components";
import { Overline } from "@/imports/core/components/Overline.jsx";
import { Sparkline } from "./Sparkline.jsx";

const TONE = {
  up: "var(--status-success)",
  down: "var(--status-danger)",
  neutral: "var(--fg-subtle)",
};

export function StatTile({
  label,
  value,
  unit,
  delta,
  deltaTone = "neutral",
  spark,
  sparkColor = "var(--accent)",
}) {
  return (
    <Root $deltaColor={TONE[deltaTone]}>
      <div className="head">
        <Overline>{label}</Overline>
        {delta && (
          <span className="delta">
            {/^[+\-−]/.test(delta) &&
              (deltaTone === "up" ? "↑ " : deltaTone === "down" ? "↓ " : "")}
            {delta}
          </span>
        )}
      </div>
      <div className="figure">
        <span className="value">{value}</span>
        {unit && <span className="unit">{unit}</span>}
      </div>
      {spark && (
        <div className="spark">
          <Sparkline data={spark} color={sparkColor} width={120} height={28} />
        </div>
      )}
    </Root>
  );
}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;

  .head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;
  }
  .delta {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: ${(p) => p.$deltaColor};
    white-space: nowrap;
  }
  .figure {
    display: flex;
    align-items: baseline;
    gap: 4px;
  }
  .value {
    font-size: 28px;
    font-weight: var(--weight-medium);
    letter-spacing: -0.01em;
    color: var(--fg);
  }
  .unit {
    font-size: var(--text-sm);
    color: var(--fg-subtle);
  }
  .spark {
    margin-top: 2px;
  }
`;
