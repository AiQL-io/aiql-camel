"use client";

import React from "react";
import styled from "styled-components";

export function SegmentedControl({ options, value, onChange, size = "sm" }) {
  const h = size === "sm" ? 30 : 34;
  return (
    <Root role="tablist" $h={h}>
      {options.map((opt) => {
        const on = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            className="seg"
            aria-selected={on}
            onClick={() => onChange?.(opt.value)}
          >
            {opt.label}
          </button>
        );
      })}
    </Root>
  );
}

const Root = styled.div`
  display: inline-flex;
  padding: 3px;
  gap: 2px;
  background: var(--bg-muted);
  border: 1px solid var(--border);
  border-radius: var(--radius-pill);

  .seg {
    height: ${(p) => p.$h}px;
    padding: 0 12px;
    border: none;
    cursor: pointer;
    border-radius: var(--radius-pill);
    background: transparent;
    color: var(--fg-subtle);
    font-family: var(--font-sans);
    font-size: var(--text-sm);
    font-weight: var(--weight-regular);
    box-shadow: none;
    transition:
      background 120ms ease,
      color 120ms ease;
  }
  .seg[aria-selected="true"] {
    background: var(--surface);
    color: var(--fg);
    font-weight: var(--weight-medium);
    box-shadow: var(--shadow-card);
  }
`;
