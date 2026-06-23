"use client";

import React from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";

export function EgoNetwork({ focal, relatives = [], onSelect }) {
  const router = useRouter();
  const nodes = relatives.slice(0, 9);
  const cx = 50;
  const cy = 50;
  const ring = 36;
  const placed = nodes.map((rel, i) => {
    const ang = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
    return {
      ...rel,
      x: cx + Math.cos(ang) * ring,
      y: cy + Math.sin(ang) * ring,
    };
  });
  const color = (r) =>
    r >= 0.45
      ? "var(--accent)"
      : r >= 0.2
        ? "var(--status-warning)"
        : "var(--separator-2)";

  const go = (rel) =>
    onSelect ? onSelect(rel) : router.push(`/registry/${rel.animal.id}`);

  return (
    <Wrap>
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        <g
          className="aiql-anim-fade"
          style={{ animation: "aiql-fade 600ms ease-out" }}
        >
          {placed.map((n) => (
            <line
              key={`e_${n.animal.id}`}
              x1={cx}
              y1={cy}
              x2={n.x}
              y2={n.y}
              stroke={color(n.r)}
              strokeWidth={0.4 + n.r * 2.4}
              opacity="0.6"
            />
          ))}
        </g>
        {placed.map((n, i) => (
          <g
            key={n.animal.id}
            className="node"
            onClick={() => go(n)}
            transform={`translate(${n.x} ${n.y})`}
          >
            <circle
              r="4.4"
              fill={color(n.r)}
              className="aiql-anim-pop"
              style={{
                transformBox: "fill-box",
                transformOrigin: "center",
                animation: `aiql-pop 520ms cubic-bezier(0.2, 0.85, 0.3, 1.2) ${
                  120 + i * 60
                }ms both`,
              }}
            />
            <text y="-6" className="nlabel">
              {n.animal.name}
            </text>
            <text y="9" className="nr">
              r={n.r.toFixed(2)}
            </text>
          </g>
        ))}
        <g transform={`translate(${cx} ${cy})`}>
          <circle
            r="6.5"
            className="focal aiql-anim-pop"
            style={{
              transformBox: "fill-box",
              transformOrigin: "center",
              animation: "aiql-pop 480ms cubic-bezier(0.2, 0.85, 0.3, 1.2)",
            }}
          />
          <text y="0.8" className="flabel">
            {focal?.name?.[0] || "•"}
          </text>
        </g>
      </svg>
    </Wrap>
  );
}

const Wrap = styled.div`
  svg {
    width: 100%;
    height: auto;
    display: block;
  }
  .focal {
    fill: var(--accent);
    stroke: var(--surface);
    stroke-width: 1;
  }
  .flabel {
    font-size: 5px;
    fill: var(--accent-fg);
    text-anchor: middle;
    font-weight: 600;
  }
  .node {
    cursor: pointer;
  }
  .node circle {
    stroke: var(--surface);
    stroke-width: 0.8;
  }
  .nlabel {
    font-size: 3px;
    fill: var(--fg-secondary);
    text-anchor: middle;
  }
  .nr {
    font-family: var(--font-mono);
    font-size: 2.6px;
    fill: var(--fg-subtle);
    text-anchor: middle;
  }
`;
