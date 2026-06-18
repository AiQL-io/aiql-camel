"use client";

import React from "react";
import styled from "styled-components";
import { breedColors } from "../palette.js";

export function MiniPcoa({
  points,
  breeds,
  height = 240,
  showOutliers = false,
}) {
  const colors = breedColors(breeds);
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs, -1);
  const maxX = Math.max(...xs, 1);
  const minY = Math.min(...ys, -1);
  const maxY = Math.max(...ys, 1);
  const W = 400;
  const H = height;
  const pad = 10;
  const sx = (x) => pad + ((x - minX) / (maxX - minX || 1)) * (W - 2 * pad);
  const sy = (y) => H - pad - ((y - minY) / (maxY - minY || 1)) * (H - 2 * pad);

  return (
    <Root>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
        {points.map((p) => {
          const isOut = showOutliers && p.outlier;
          return (
            <circle
              key={p.id}
              cx={sx(p.x)}
              cy={sy(p.y)}
              r={isOut ? 3.2 : 2.2}
              fill={colors[p.declaredBreed] || "var(--fg-muted)"}
              fillOpacity={isOut ? 1 : 0.7}
              stroke={isOut ? "var(--fg)" : "none"}
              strokeWidth={isOut ? 1 : 0}
            />
          );
        })}
      </svg>
      <div className="legend">
        {breeds.map((b) => (
          <span key={b}>
            <i style={{ background: colors[b] }} /> {b}
          </span>
        ))}
      </div>
    </Root>
  );
}

const Root = styled.div`
  svg {
    width: 100%;
    height: auto;
    display: block;
  }
  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 10px;
  }
  .legend span {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
  .legend i {
    width: 9px;
    height: 9px;
    border-radius: 50%;
  }
`;
