"use client";

import React from "react";
import styled from "styled-components";

const REGION_POS = {
  Riyadh: [56, 45],
  Makkah: [30, 52],
  "Makkah Region": [30, 52],
  Madinah: [30, 36],
  "Eastern Province": [73, 39],
  Asir: [39, 64],
  Tabuk: [22, 22],
  Hail: [43, 30],
  "Ha'il": [43, 30],
  Qassim: [49, 37],
  "Al-Qassim": [49, 37],
  Jazan: [40, 72],
  Najran: [51, 66],
  "Al-Bahah": [34, 60],
  "Al-Jawf": [30, 14],
  "Northern Borders": [47, 15],
};

const OUTLINE =
  "M16,20 L30,10 L48,9 L58,13 L70,22 L80,30 L83,40 L78,46 L74,52 " +
  "L60,60 L52,70 L44,74 L38,70 L34,62 L30,58 L24,52 L18,44 L14,34 Z";

export function RegionMap({ data = [], onSelect, selected }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  const placed = data
    .map((d) => ({ ...d, pos: REGION_POS[d.region] }))
    .filter((d) => d.pos);
  const unplaced = data.filter((d) => !REGION_POS[d.region]);

  return (
    <Wrap>
      <svg viewBox="0 0 100 80" preserveAspectRatio="xMidYMid meet">
        <path d={OUTLINE} className="land" />
        {placed.map((d) => {
          const r = 2.5 + (d.count / max) * 6.5;
          const on = selected === d.region;
          return (
            <g
              key={d.region}
              className={`node ${on ? "on" : ""}`}
              onClick={() => onSelect?.(on ? "" : d.region)}
            >
              <circle cx={d.pos[0]} cy={d.pos[1]} r={r + 2} className="halo" />
              <circle cx={d.pos[0]} cy={d.pos[1]} r={r} className="dot" />
              <text x={d.pos[0]} y={d.pos[1] - r - 1.5} className="lbl">
                {d.region}
              </text>
            </g>
          );
        })}
      </svg>
      {unplaced.length > 0 && (
        <div className="other">
          {unplaced.map((d) => (
            <button
              key={d.region}
              type="button"
              className={selected === d.region ? "on" : ""}
              onClick={() => onSelect?.(selected === d.region ? "" : d.region)}
            >
              {d.region} · {d.count}
            </button>
          ))}
        </div>
      )}
    </Wrap>
  );
}

const Wrap = styled.div`
  svg {
    width: 100%;
    height: auto;
    display: block;
  }
  .land {
    fill: var(--surface-2);
    stroke: var(--border);
    stroke-width: 0.5;
  }
  .node {
    cursor: pointer;
  }
  .node .halo {
    fill: var(--accent-soft);
    opacity: 0;
    transition: opacity 120ms ease;
  }
  .node:hover .halo,
  .node.on .halo {
    opacity: 1;
  }
  .node .dot {
    fill: var(--accent);
    opacity: 0.85;
  }
  .node.on .dot {
    fill: var(--accent);
    opacity: 1;
  }
  .node .lbl {
    font-family: var(--font-mono);
    font-size: 2.4px;
    fill: var(--fg-subtle);
    text-anchor: middle;
  }
  .other {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 10px;
  }
  .other button {
    height: 26px;
    padding: 0 10px;
    border: 1px solid var(--border);
    border-radius: var(--radius-pill);
    background: transparent;
    color: var(--fg-secondary);
    font-size: var(--text-xs);
    cursor: pointer;
  }
  .other button.on {
    border-color: var(--accent);
    color: var(--accent);
  }
`;
