"use client";

import React from "react";
import styled from "styled-components";
import { PALETTE } from "../palette.js";

export function AncestryBars({ points, k, breeds, maxCols = 260 }) {
  const sorted = points
    .slice()
    .sort(
      (a, b) =>
        a.declaredBreed.localeCompare(b.declaredBreed) ||
        b.ancestry.indexOf(Math.max(...b.ancestry)) -
          a.ancestry.indexOf(Math.max(...a.ancestry)),
    );
  const step = Math.max(1, Math.ceil(sorted.length / maxCols));
  const cols = sorted.filter((_, i) => i % step === 0);

  const W = 800;
  const H = 120;
  const cw = W / cols.length;

  const groups = [];
  let cur = null;
  cols.forEach((p, i) => {
    if (!cur || cur.breed !== p.declaredBreed) {
      cur = { breed: p.declaredBreed, start: i, end: i };
      groups.push(cur);
    } else cur.end = i;
  });

  return (
    <Root>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        {cols.map((p, i) => {
          let y = 0;
          return (
            <g key={p.id}>
              {p.ancestry.map((v, ci) => {
                const h = v * H;
                const rect = (
                  <rect
                    key={ci}
                    x={i * cw}
                    y={y}
                    width={cw + 0.5}
                    height={h}
                    fill={PALETTE[ci % PALETTE.length]}
                  />
                );
                y += h;
                return rect;
              })}
            </g>
          );
        })}
        {groups.map((g) => (
          <line
            key={g.breed + g.start}
            x1={g.start * cw}
            x2={g.start * cw}
            y1={0}
            y2={H}
            stroke="var(--surface)"
            strokeWidth={1}
          />
        ))}
      </svg>
      <div className="groups">
        {groups.map((g) => (
          <span
            key={g.breed + g.start}
            style={{ width: `${((g.end - g.start + 1) / cols.length) * 100}%` }}
          >
            {g.breed}
          </span>
        ))}
      </div>
      <div className="klegend">
        {Array.from({ length: k }).map((_, i) => (
          <span key={i}>
            <i style={{ background: PALETTE[i % PALETTE.length] }} /> K{i + 1}
          </span>
        ))}
      </div>
    </Root>
  );
}

const Root = styled.div`
  svg {
    width: 100%;
    height: 120px;
    display: block;
    border-radius: var(--radius-sm);
    overflow: hidden;
  }
  .groups {
    display: flex;
    margin-top: 6px;
  }
  .groups span {
    font-size: var(--text-xs);
    color: var(--fg-subtle);
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    border-inline-start: 1px solid var(--separator);
  }
  .klegend {
    display: flex;
    gap: 12px;
    margin-top: 10px;
  }
  .klegend span {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
  .klegend i {
    width: 9px;
    height: 9px;
    border-radius: 2px;
  }
`;
