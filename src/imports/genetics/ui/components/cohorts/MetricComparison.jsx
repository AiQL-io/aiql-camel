"use client";

import React, { useState } from "react";
import styled from "styled-components";
import { PALETTE } from "../palette.js";
import { COMPARE_METRICS } from "./cohortsHelpers.js";

const cohortColor = (i) => PALETTE[i % PALETTE.length];

export function MetricComparison({ metrics }) {
  const [mode, setMode] = useState("bars");

  const maxBy = {};
  for (const m of COMPARE_METRICS)
    maxBy[m.key] = Math.max(...metrics.map((c) => c[m.key]), 1e-9);

  return (
    <Root>
      <div className="head">
        <div className="legend">
          {metrics.map((c, i) => (
            <span key={c.id}>
              <i style={{ background: cohortColor(i) }} /> {c.name}
            </span>
          ))}
        </div>
        <div className="seg">
          <button
            type="button"
            className={mode === "bars" ? "on" : ""}
            onClick={() => setMode("bars")}
          >
            Grouped bars
          </button>
          <button
            type="button"
            className={mode === "parallel" ? "on" : ""}
            onClick={() => setMode("parallel")}
          >
            Parallel coords
          </button>
        </div>
      </div>

      {mode === "bars" ? (
        <GroupedBars metrics={metrics} maxBy={maxBy} />
      ) : (
        <Parallel metrics={metrics} maxBy={maxBy} />
      )}
    </Root>
  );
}

function GroupedBars({ metrics, maxBy }) {
  const W = 560;
  const labelW = 86;
  const valW = 96;
  const plotX = labelW;
  const plotW = W - labelW - valW;
  const barH = 13;
  const barGap = 4;
  const blockPad = 18;
  const blockH = metrics.length * (barH + barGap) + blockPad;
  const H = COMPARE_METRICS.length * blockH + 6;

  const xOf = (key, v) => plotX + (v / maxBy[key]) * plotW;

  const blocks = COMPARE_METRICS.map((metric, idx) => ({
    metric,
    top: idx * blockH,
  }));

  return (
    <BarsSvg>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
        {blocks.map(({ metric, top }) => (
          <g key={metric.key}>
            <text x={labelW - 8} y={top + 12} textAnchor="end" className="ml">
              {metric.label}
              {metric.rarefied ? " ↺" : ""}
            </text>
            {metrics.map((c, i) => {
              const yy = top + 4 + i * (barH + barGap);
              const v = c[metric.key];
              const ci = c.ci[metric.key] || 0;
              const x = xOf(metric.key, v);
              const xLo = xOf(metric.key, Math.max(0, v - ci));
              const xHi = xOf(metric.key, v + ci);
              return (
                <g key={c.id}>
                  <rect
                    x={plotX}
                    y={yy}
                    width={Math.max(0, x - plotX)}
                    height={barH}
                    rx={2}
                    fill={cohortColor(i)}
                    className="aiql-anim-grow"
                    style={{
                      transformBox: "fill-box",
                      transformOrigin: "left",
                      animation: `aiql-grow-x 640ms cubic-bezier(0.2, 0.75, 0.25, 1) ${
                        i * 70
                      }ms both`,
                    }}
                  >
                    <title>{`${c.name} · ${metric.label}: ${v} ± ${ci}`}</title>
                  </rect>
                  <line
                    x1={xLo}
                    x2={xHi}
                    y1={yy + barH / 2}
                    y2={yy + barH / 2}
                    stroke="var(--fg)"
                    strokeOpacity="0.5"
                    strokeWidth="1.5"
                  />
                  <line
                    x1={xLo}
                    x2={xLo}
                    y1={yy + 2}
                    y2={yy + barH - 2}
                    stroke="var(--fg)"
                    strokeOpacity="0.5"
                  />
                  <line
                    x1={xHi}
                    x2={xHi}
                    y1={yy + 2}
                    y2={yy + barH - 2}
                    stroke="var(--fg)"
                    strokeOpacity="0.5"
                  />
                  <text x={W - valW + 6} y={yy + barH - 2} className="vl">
                    {v.toFixed(metric.digits)} ±{ci}
                  </text>
                </g>
              );
            })}
          </g>
        ))}
      </svg>
    </BarsSvg>
  );
}

function Parallel({ metrics, maxBy }) {
  const W = 560;
  const H = 250;
  const padX = 22;
  const padY = 30;
  const axes = COMPARE_METRICS;
  const xOf = (i) => padX + (i / (axes.length - 1)) * (W - 2 * padX);
  const yOf = (key, v) => {
    const t = v / maxBy[key];
    return H - padY - t * (H - 2 * padY);
  };
  return (
    <ParallelSvg>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
        {axes.map((a, i) => (
          <g key={a.key}>
            <line
              x1={xOf(i)}
              y1={padY}
              x2={xOf(i)}
              y2={H - padY}
              stroke="var(--separator)"
            />
            <text x={xOf(i)} y={H - 8} textAnchor="middle" className="ax">
              {a.label}
            </text>
          </g>
        ))}
        {metrics.map((c, ci) => {
          const pts = axes.map((a, i) => [xOf(i), yOf(a.key, c[a.key])]);
          return (
            <g
              key={c.id}
              className="aiql-anim-fade"
              style={{
                animation: `aiql-fade 600ms ease-out ${ci * 90}ms both`,
              }}
            >
              {axes.map((a, i) => {
                const ci2 = c.ci[a.key] || 0;
                const yLo = yOf(a.key, c[a.key] + ci2);
                const yHi = yOf(a.key, Math.max(0, c[a.key] - ci2));
                return (
                  <line
                    key={a.key}
                    x1={xOf(i)}
                    x2={xOf(i)}
                    y1={yLo}
                    y2={yHi}
                    stroke={cohortColor(ci)}
                    strokeWidth={5}
                    strokeOpacity={0.22}
                    strokeLinecap="round"
                  />
                );
              })}
              <polyline
                points={pts.map((p) => p.join(",")).join(" ")}
                fill="none"
                stroke={cohortColor(ci)}
                strokeWidth={2}
                opacity={0.9}
              />
              {pts.map((p, i) => (
                <circle
                  key={i}
                  cx={p[0]}
                  cy={p[1]}
                  r={3}
                  fill={cohortColor(ci)}
                />
              ))}
            </g>
          );
        })}
      </svg>
      <p className="cinote">Shaded band = 95% interval.</p>
    </ParallelSvg>
  );
}

const Root = styled.div`
  .head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 14px;
  }
  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    font-size: var(--text-xs);
    color: var(--fg-secondary);
  }
  .legend span {
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }
  .legend i {
    width: 10px;
    height: 10px;
    border-radius: 3px;
  }
  .seg {
    display: flex;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    overflow: hidden;
  }
  .seg button {
    border: none;
    background: transparent;
    color: var(--fg-secondary);
    font-size: var(--text-xs);
    padding: 5px 10px;
    cursor: pointer;
  }
  .seg button.on {
    background: var(--accent-soft);
    color: var(--accent);
  }
`;

const BarsSvg = styled.div`
  svg {
    width: 100%;
    height: auto;
    display: block;
  }
  .ml {
    font-size: 11px;
    fill: var(--fg-secondary);
  }
  .vl {
    font-size: 10px;
    fill: var(--fg-subtle);
    font-family: var(--font-mono);
  }
`;

const ParallelSvg = styled.div`
  svg {
    width: 100%;
    height: auto;
    display: block;
  }
  .ax {
    font-size: 10px;
    fill: var(--fg-subtle);
    font-family: var(--font-mono);
  }
  .cinote {
    font-size: var(--text-xs);
    color: var(--fg-subtle);
    margin-top: 4px;
  }
`;
