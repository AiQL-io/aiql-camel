"use client";

import React, { useId } from "react";
import styled from "styled-components";

export function Gauge({
  value = 0,
  max = 100,
  label,
  color = "var(--accent)",
  size = 120,
}) {
  const id = useId().replace(/:/g, "");
  const r = size / 2 - 8;
  const cx = size / 2;
  const cy = size / 2;
  const circ = Math.PI * r;
  const pct = Math.min(Math.max(value / max, 0), 1);
  return (
    <Root>
      <svg
        width={size}
        height={size / 2 + 8}
        viewBox={`0 0 ${size} ${size / 2 + 8}`}
      >
        <defs>
          <linearGradient id={`gauge_${id}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={color} />
            <stop offset="1" stopColor="#18bbfd" />
          </linearGradient>
        </defs>
        <path
          d={`M8 ${cy} A ${r} ${r} 0 0 1 ${size - 8} ${cy}`}
          fill="none"
          stroke="var(--bg-muted)"
          strokeWidth="9"
          strokeLinecap="round"
        />
        <path
          className="arc"
          d={`M8 ${cy} A ${r} ${r} 0 0 1 ${size - 8} ${cy}`}
          fill="none"
          stroke={`url(#gauge_${id})`}
          strokeWidth="9"
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
  .arc {
    transition: stroke-dasharray 900ms cubic-bezier(0.22, 1, 0.36, 1);
  }
`;
