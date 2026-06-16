"use client";
import React from "react";
import styled from "styled-components";

export function Tabs({ items = [], value, onChange, size = "md", style = {} }) {
  const h = size === "sm" ? 30 : 36;
  return (
    <Root role="tablist" $h={h} style={style}>
      {items.map((it) => {
        const active = it.value === value;
        return (
          <button
            key={it.value}
            type="button"
            role="tab"
            className="tab"
            aria-selected={active}
            onClick={() => onChange && onChange(it.value)}
          >
            {it.icon}
            {it.label}
          </button>
        );
      })}
    </Root>
  );
}

const Root = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 3px;
  height: ${(p) => p.$h}px;
  border-radius: var(--radius-full);
  background: var(--surface-2);
  border: 1px solid var(--border);

  .tab {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1-5);
    height: ${(p) => p.$h - 8}px;
    padding: 0 12px;
    border: none;
    border-radius: var(--radius-full);
    cursor: pointer;
    background: transparent;
    color: var(--fg-muted);
    box-shadow: none;
    font-family: var(--font-sans);
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
    transition:
      background 120ms ease,
      color 120ms ease;
  }
  .tab[aria-selected="true"] {
    background: var(--surface);
    color: var(--fg);
    box-shadow: var(--shadow-sm);
  }
`;
