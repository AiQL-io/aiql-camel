"use client";

import React from "react";
import styled from "styled-components";

export function Gauge({
  value = 0,
  max = 100,
  label,
  color = "var(--accent)",
  size = 120,
}) {
  const r = size / 2 - 8;
  const cx = size / 2;
  const cy = size / 2;
  const circ = Math.PI * r;
  const pct = Math.min(Math.max(value / max, 0), 1);
  return (
    <Root>
      <svg
        width={size}
        height={size / 2 + 6}
        viewBox={`0 0 ${size} ${size / 2 + 6}`}
      >
        <path
          d={`M8 ${cy} A ${r} ${r} 0 0 1 ${size - 8} ${cy}`}
          fill="none"
          stroke="var(--bg-muted)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d={`M8 ${cy} A ${r} ${r} 0 0 1 ${size - 8} ${cy}`}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${pct * circ} ${circ}`}
        />
        <text x={cx} y={cy - 4} textAnchor="middle">
          {value}
        </text>
      </svg>
      {label && <span className="label">{label}</span>}
    </Root>
  );
}

const Root = styled.div`
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;

  .label {
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
  text {
    font-family: var(--font-mono);
    font-size: 18px;
    font-weight: 500;
    fill: var(--fg);
  }
`;
