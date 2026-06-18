"use client";

import React, { useState } from "react";
import styled from "styled-components";
import { inferRel } from "@/imports/genetics/engine/popgen.js";

const RMAX = 0.6;

function colorFor(r) {
  const t = Math.min(1, r / RMAX);
  const lerp = (a, b) => Math.round(a + (b - a) * t);
  const cr = lerp(241, 30);
  const cg = lerp(245, 64);
  const cb = lerp(249, 175);
  return `rgb(${cr},${cg},${cb})`;
}

export function Heatmap({
  labels,
  matrix,
  dendro,
  threshold,
  selected,
  onSelect,
  lociN,
  band,
  onSelectBlock,
}) {
  const n = labels.length;
  const [hover, setHover] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const showDendro = dendro && !collapsed;
  const cell = n > 0 ? Math.max(8, Math.min(16, Math.floor(560 / n))) : 12;
  const grid = n * cell;
  const dendH = showDendro ? 56 : 0;
  const W = grid;
  const H = grid + dendH;

  const flipX = hover ? hover.j >= n * 0.55 : false;
  const flipY = hover ? hover.i >= n * 0.6 : false;

  const inBand = (r) => !band || (r >= band[0] && r <= band[1]);
  const uncertainty = (r) =>
    +(0.015 + (1 - Math.min(1, r / 0.6)) * 0.05).toFixed(3);

  const brushBranch = (l) => {
    if (!onSelectBlock) return;
    const lo = Math.floor(Math.min(l.x1, l.x2));
    const hi = Math.ceil(Math.max(l.x1, l.x2));
    const idx = [];
    for (let i = Math.max(0, lo); i <= Math.min(n - 1, hi); i++) idx.push(i);
    if (idx.length >= 2) onSelectBlock(idx);
  };

  return (
    <Root>
      {dendro && (
        <Bar>
          <button type="button" onClick={() => setCollapsed((c) => !c)}>
            {collapsed ? "Show dendrogram" : "Collapse dendrogram"}
          </button>
          {onSelectBlock && !collapsed && (
            <span className="hint">Click a branch to select its block.</span>
          )}
        </Bar>
      )}
      <div className="plot">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="xMidYMid meet"
          style={{ width: "100%", height: "auto", display: "block" }}
        >
          {showDendro &&
            dendro.map((l, i) => {
              const yp = (v) => dendH - v * (dendH - 4);
              const cx = (x) => x * cell + cell / 2;
              return (
                <g key={i} fill="none">
                  <g stroke="var(--fg-muted)" strokeWidth={0.6}>
                    <line
                      x1={cx(l.x1)}
                      y1={yp(l.y1)}
                      x2={cx(l.x1)}
                      y2={yp(l.h)}
                    />
                    <line
                      x1={cx(l.x2)}
                      y1={yp(l.y2)}
                      x2={cx(l.x2)}
                      y2={yp(l.h)}
                    />
                    <line
                      x1={cx(l.x1)}
                      y1={yp(l.h)}
                      x2={cx(l.x2)}
                      y2={yp(l.h)}
                    />
                  </g>
                  {onSelectBlock && (
                    <line
                      x1={cx(l.x1)}
                      y1={yp(l.h)}
                      x2={cx(l.x2)}
                      y2={yp(l.h)}
                      stroke="transparent"
                      strokeWidth={8}
                      style={{ cursor: "pointer" }}
                      onClick={() => brushBranch(l)}
                    />
                  )}
                </g>
              );
            })}
          {matrix.map((row, i) =>
            row.map((r, j) => {
              const emph = r >= threshold;
              const isSel = selected && (selected.i === i || selected.j === j);
              const bandOut = !inBand(r);
              return (
                <rect
                  key={`${i}-${j}`}
                  x={j * cell}
                  y={dendH + i * cell}
                  width={cell - 0.5}
                  height={cell - 0.5}
                  fill={i === j ? "var(--fg-muted)" : colorFor(r)}
                  opacity={i === j ? 1 : bandOut ? 0.06 : emph ? 1 : 0.32}
                  stroke={isSel ? "var(--accent)" : "none"}
                  strokeWidth={isSel ? 1 : 0}
                  onMouseEnter={() =>
                    setHover({ i, j, x: j * cell, y: dendH + i * cell })
                  }
                  onMouseLeave={() => setHover(null)}
                  onClick={() => i !== j && onSelect({ i, j })}
                  style={{ cursor: i === j ? "default" : "pointer" }}
                />
              );
            }),
          )}
        </svg>
        {hover && hover.i !== hover.j && (
          <Tip
            style={{
              left: `${((hover.x + (flipX ? 0 : cell)) / W) * 100}%`,
              top: `${((hover.y + (flipY ? 0 : cell)) / H) * 100}%`,
              transform: `translate(${flipX ? "calc(-100% - 6px)" : "6px"}, ${
                flipY ? "calc(-100% - 6px)" : "6px"
              })`,
            }}
          >
            <b>
              {labels[hover.i].reg} × {labels[hover.j].reg}
            </b>
            <span>
              r = <b className="r">{matrix[hover.i][hover.j].toFixed(3)}</b>
            </span>
            <span>
              {inferRel(matrix[hover.i][hover.j])} · ±
              {uncertainty(matrix[hover.i][hover.j])}
            </span>
            <span className="loci">
              {lociN != null ? `${lociN} informative loci · ` : ""}
              {labels[hover.i].breed} · {labels[hover.j].breed}
            </span>
          </Tip>
        )}
      </div>
      <Legend>
        <span>r = 0</span>
        <i className="ramp" />
        <span>{RMAX}</span>
      </Legend>
    </Root>
  );
}

const Root = styled.div`
  .plot {
    position: relative;
    width: 100%;
  }
`;

const Bar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;

  button {
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--fg-secondary);
    font-size: var(--text-xs);
    padding: 4px 10px;
    border-radius: var(--radius-pill);
    cursor: pointer;
  }
  button:hover {
    background: var(--surface-2);
  }
  .hint {
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
`;

const Tip = styled.div`
  position: absolute;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  padding: 8px 10px;
  pointer-events: none;
  z-index: 5;
  display: flex;
  flex-direction: column;
  gap: 1px;
  white-space: nowrap;

  b {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
  }
  .r {
    color: var(--accent);
  }
  span {
    font-size: var(--text-xs);
    color: var(--fg-secondary);
  }
  .loci {
    color: var(--fg-subtle);
  }
`;

const Legend = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
  font-size: var(--text-xs);
  font-family: var(--font-mono);
  color: var(--fg-subtle);

  .ramp {
    height: 8px;
    width: 120px;
    border-radius: var(--radius-pill);
    background: linear-gradient(90deg, rgb(241, 245, 249), rgb(30, 64, 175));
  }
`;
