"use client";

import React from "react";
import styled from "styled-components";
import { Overline } from "@/imports/core/components/Overline.jsx";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { Sparkline } from "./Sparkline.jsx";
import { useContainerWidth } from "@/imports/core/components/charts/useChartSize.js";

const TONE = {
  up: { fg: "var(--status-success)", bg: "var(--success-soft)" },
  down: { fg: "var(--status-danger)", bg: "var(--danger-soft)" },
  neutral: { fg: "var(--fg-subtle)", bg: "var(--surface-2)" },
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
  const [ref, width] = useContainerWidth();
  const tone = TONE[deltaTone] || TONE.neutral;

  return (
    <Root $fg={tone.fg} $bg={tone.bg}>
      <Overline>{label}</Overline>
      <div className="figure">
        <span className="value">{value}</span>
        {unit && <span className="unit">{unit}</span>}
      </div>
      {delta && (
        <span className="delta">
          {deltaTone === "up" && <Icon name="trend-up" size={11} />}
          {deltaTone === "down" && <Icon name="trend-down" size={11} />}
          {delta}
        </span>
      )}
      {spark && (
        <div className="spark" ref={ref}>
          {width > 0 && (
            <Sparkline
              data={spark}
              color={sparkColor}
              width={width}
              height={44}
            />
          )}
        </div>
      )}
    </Root>
  );
}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;

  .figure {
    display: flex;
    align-items: baseline;
    gap: 8px;
  }
  .value {
    font-size: 30px;
    line-height: 1.1;
    font-weight: var(--weight-semibold);
    letter-spacing: -0.02em;
    color: var(--fg);
    font-variant-numeric: tabular-nums;
  }
  .unit {
    font-size: var(--text-sm);
    color: var(--fg-subtle);
  }
  .delta {
    align-self: flex-start;
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: ${(p) => p.$fg};
    background: ${(p) => p.$bg};
    padding: 2px 8px;
    border-radius: var(--radius-pill);
    white-space: nowrap;
  }
  .spark {
    width: 100%;
    height: 44px;
    margin-top: 4px;
  }
`;
