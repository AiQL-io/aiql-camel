"use client";

import React from "react";
import styled from "styled-components";

export function Histogram({ bins, color = "var(--accent)", height = 60 }) {
  const max = Math.max(...bins, 1);
  return (
    <Root $color={color} $height={height}>
      {bins.map((v, i) => (
        <span
          key={i}
          className="bar"
          title={String(v)}
          style={{ height: `${Math.max((v / max) * 100, 3)}%` }}
        />
      ))}
    </Root>
  );
}

const Root = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: ${(p) => p.$height}px;

  .bar {
    flex: 1;
    background: ${(p) => p.$color};
    opacity: 0.85;
    border-radius: 2px 2px 0 0;
  }
`;
