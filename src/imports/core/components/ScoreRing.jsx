"use client";
import React from "react";
import styled from "styled-components";

export function ScoreRing({
  value = 0,
  size = 30,
  tone,
  showValue = true,
  style = {},
  ...rest
}) {
  const resolvedTone =
    tone || (value >= 75 ? "success" : value >= 55 ? "warning" : "danger");
  const color = {
    success: "var(--success)",
    warning: "var(--warning)",
    danger: "var(--danger)",
    accent: "var(--accent)",
    neutral: "var(--fg-muted)",
  }[resolvedTone];

  const stroke = size <= 32 ? 2 : 2.5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (Math.min(Math.max(value, 0), 100) / 100) * c;

  return (
    <Root $size={size} $color={color} style={style} {...rest}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--separator)"
          strokeWidth={stroke}
        />
        <circle
          className="aiql-anim-ring"
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          strokeDashoffset={0}
          style={{
            "--ring-dash": dash,
            animation: "aiql-ring-draw 760ms cubic-bezier(0.2, 0.75, 0.25, 1)",
          }}
        />
      </svg>
      {showValue && <span className="value">{Math.round(value)}</span>}
    </Root>
  );
}

const Root = styled.span`
  position: relative;
  display: inline-flex;
  width: ${(p) => p.$size}px;
  height: ${(p) => p.$size}px;
  flex: none;

  svg {
    transform: rotate(-90deg);
  }
  .value {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-mono);
    font-size: ${(p) => (p.$size <= 32 ? 11 : 13)}px;
    font-weight: var(--weight-medium);
    color: ${(p) => p.$color};
  }
`;
