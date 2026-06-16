"use client";

import React from "react";
import styled from "styled-components";

export function BarList({ data, color = "var(--accent)", renderHref }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <Root $color={color}>
      {data.map((d) => {
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
  gap: 10px;

  .row {
    display: grid;
    grid-template-columns: 120px 1fr 48px;
    align-items: center;
    gap: 12px;
  }
  .label {
    font-size: var(--text-sm);
    color: var(--fg-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .track {
    height: 8px;
    background: var(--bg-muted);
    border-radius: var(--radius-pill);
    overflow: hidden;
  }
  .bar {
    display: block;
    height: 100%;
    background: ${(p) => p.$color};
    border-radius: var(--radius-pill);
  }
  .value {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--fg);
    text-align: end;
  }
`;
