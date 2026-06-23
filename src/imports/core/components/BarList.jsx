"use client";

import React from "react";
import styled from "styled-components";

export function BarList({ data, color = "var(--accent)", renderHref }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <Root $color={color}>
      {data.map((d, i) => {
        const Row = renderHref ? "a" : "div";
        return (
          <Row
            key={d.label}
            className="row"
            href={renderHref ? renderHref(d) : undefined}
          >
            <span className="label">{d.label}</span>
            <span className="track">
              <span
                className="bar"
                style={{ width: `${(d.value / max) * 100}%` }}
              />
            </span>
            <span className="value">{d.value.toLocaleString()}</span>
          </Row>
        );
      })}
    </Root>
  );
}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  .row {
    display: grid;
    grid-template-columns: 120px 1fr 48px;
    align-items: center;
    gap: 12px;
    padding: 4px 8px;
    margin: 0 -8px;
    border-radius: var(--radius-md);
  }
  a.row:hover {
    background: var(--surface-2);
  }
  .label {
    font-size: var(--text-sm);
    color: var(--fg-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .track {
    height: 10px;
    background: color-mix(in srgb, var(--accent) 10%, var(--bg-muted));
    border-radius: var(--radius-pill);
    overflow: hidden;
  }
  /* Explicit pixel height so the bar never collapses to 0 (a percentage
     height fails to resolve when the track sits inside a flex/grid item). */
  .bar {
    position: relative;
    display: block;
    height: 10px;
    min-width: 2px;
    background: var(--aiql-bar-gradient);
    border-radius: var(--radius-pill);
    overflow: hidden;
    transform-origin: left center;
    animation: aiql-grow-x 760ms cubic-bezier(0.2, 0.75, 0.25, 1);
  }
  .bar::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      100deg,
      transparent 0%,
      rgba(255, 255, 255, 0.5) 50%,
      transparent 100%
    );
    transform: translateX(-130%);
    animation: aiql-bar-shine 1500ms ease-out 220ms;
  }
  @media (prefers-reduced-motion: reduce) {
    .bar {
      animation: none;
    }
    .bar::after {
      display: none;
    }
  }
  .value {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--fg);
    text-align: end;
  }
`;
