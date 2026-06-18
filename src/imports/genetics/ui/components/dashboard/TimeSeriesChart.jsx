"use client";

import React from "react";
import styled from "styled-components";

const SERIES = [
  { key: "ne", label: "Ne", color: "var(--accent)" },
  { key: "kinship", label: "Mean kinship", color: "var(--danger)" },
  { key: "he", label: "He", color: "var(--status-success)" },
];

export function TimeSeriesChart({ data, height = 200 }) {
  if (!data || data.length < 2)
    return <Empty>Not enough birth-cohort history in this scope.</Empty>;
  const W = 460;
  const H = height;
  const pad = 12;
  const n = data.length;
  const x = (i) => pad + (i / (n - 1)) * (W - 2 * pad);

  const line = (key) => {
    const vals = data.map((d) => d[key]);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    return data
      .map((d, i) => {
        const y = H - pad - ((d[key] - min) / (max - min || 1)) * (H - 2 * pad);
        return `${i === 0 ? "M" : "L"}${x(i).toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ");
  };

  return (
    <Root>
      <div className="legend">
        {SERIES.map((s) => (
          <span key={s.key}>
            <i style={{ background: s.color }} /> {s.label}
          </span>
        ))}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        {SERIES.map((s) => (
          <path
            key={s.key}
            d={line(s.key)}
            fill="none"
            stroke={s.color}
            strokeWidth={2}
            strokeLinejoin="round"
          />
        ))}
      </svg>
      <div className="scale">
        <span>{data[0].label}</span>
        <span>{data[data.length - 1].label}</span>
      </div>
    </Root>
  );
}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;

  svg {
    width: 100%;
    flex: 1;
    min-height: 160px;
    display: block;
  }
  .legend {
    display: flex;
    gap: 14px;
    margin-bottom: 8px;
  }
  .legend span {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
  .legend i {
    width: 10px;
    height: 3px;
    border-radius: 2px;
  }
  .scale {
    display: flex;
    justify-content: space-between;
    margin-top: 6px;
    font-size: var(--text-xs);
    font-family: var(--font-mono);
    color: var(--fg-subtle);
  }
`;

const Empty = styled.p`
  font-size: var(--text-sm);
  color: var(--fg-subtle);
`;
