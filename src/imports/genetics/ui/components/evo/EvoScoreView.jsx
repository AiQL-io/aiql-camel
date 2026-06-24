"use client";

import React, { useState } from "react";
import styled from "styled-components";
import { BASE_COLORS } from "@/imports/genetics/data/evoMock.js";

const COL = 6;
const PLOT_H = 120;

export function EvoScoreView({ result }) {
  const [showEntropy, setShowEntropy] = useState(false);
  const { bases, entropy, nll, orfs } = result;
  const n = bases.length;
  const width = n * COL;

  const bits = entropy.map((e) => Math.max(0, Math.min(2, 2 * (1 - e))));

  return (
    <Root>
      <header className="sh">
        <span className="nll">
          Negative Log Likelihood: <b>{nll}</b>
        </span>
        <label className="toggle">
          <input
            type="checkbox"
            checked={showEntropy}
            onChange={(e) => setShowEntropy(e.target.checked)}
          />
          Show entropy
        </label>
        <span className="hint">Scroll to pan · {n} bp</span>
      </header>

      <div className="title">
        {showEntropy ? "Per-nucleotide entropy" : "Sequence Logo"}
      </div>

      <div className="scroll">
        <svg
          viewBox={`0 0 ${width} ${PLOT_H + 34}`}
          width={width}
          height={PLOT_H + 34}
          preserveAspectRatio="none"
        >
          {/* y gridlines */}
          {[0, 0.5, 1].map((g) => (
            <line
              key={g}
              x1={0}
              x2={width}
              y1={PLOT_H - g * PLOT_H}
              y2={PLOT_H - g * PLOT_H}
              stroke="var(--separator)"
              strokeWidth={0.5}
            />
          ))}

          {!showEntropy &&
            bases.split("").map((b, i) => {
              const h = (bits[i] / 2) * PLOT_H;
              if (h < 1) return null;
              return (
                <text
                  key={i}
                  x={i * COL + COL / 2}
                  y={PLOT_H}
                  fontSize={COL * 1.6}
                  textAnchor="middle"
                  fill={BASE_COLORS[b]}
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontWeight: 700,
                    transform: `translateY(0px) scaleY(${h / (COL * 1.3)})`,
                    transformOrigin: `${i * COL + COL / 2}px ${PLOT_H}px`,
                  }}
                >
                  {b}
                </text>
              );
            })}

          {showEntropy && (
            <polyline
              points={entropy
                .map((e, i) => `${i * COL + COL / 2},${PLOT_H - e * PLOT_H}`)
                .join(" ")}
              fill="none"
              stroke="var(--accent)"
              strokeWidth={1.2}
            />
          )}

          {/* per-base colour strip */}
          {bases.split("").map((b, i) => (
            <rect
              key={`s${i}`}
              x={i * COL}
              y={PLOT_H + 4}
              width={COL - 0.3}
              height={8}
              fill={BASE_COLORS[b]}
              opacity={0.85}
            />
          ))}

          {/* ORF track */}
          {orfs.map((o, idx) => (
            <g key={idx}>
              <rect
                x={o.start * COL}
                y={PLOT_H + 16}
                width={(o.end - o.start) * COL}
                height={12}
                rx={2}
                fill="color-mix(in srgb, var(--accent) 22%, transparent)"
                stroke="var(--accent)"
                strokeWidth={0.6}
              />
              <text
                x={o.start * COL + 6}
                y={PLOT_H + 25}
                fontSize={9}
                fill="var(--accent)"
              >
                ORF {idx}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="axis">
        <span>0</span>
        <span>Position</span>
        <span>{n}</span>
      </div>

      <div className="footer">
        <p>
          {showEntropy
            ? "Per-nucleotide entropy across the sequence — lower values indicate the model is more confident at that position."
            : "The sequence logo shows the probability of each nucleotide at each position. Taller stacks indicate more conserved, higher-information positions."}
        </p>
        <div className="legend">
          {Object.entries(BASE_COLORS).map(([b, c]) => (
            <span key={b} style={{ background: c }}>
              {b}
            </span>
          ))}
        </div>
      </div>
    </Root>
  );
}

const Root = styled.div`
  padding: 14px 18px;

  .sh {
    display: flex;
    align-items: center;
    gap: 18px;
    flex-wrap: wrap;
  }
  .nll {
    font-size: var(--text-sm);
    color: var(--fg-secondary);
  }
  .nll b {
    color: var(--fg);
    font-family: var(--font-mono);
  }
  .toggle {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: var(--text-xs);
    color: var(--fg-secondary);
    cursor: pointer;
  }
  .hint {
    margin-inline-start: auto;
    font-size: var(--text-xs);
    color: var(--fg-subtle);
    font-style: italic;
  }
  .title {
    text-align: center;
    margin: 10px 0 4px;
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
  .scroll {
    overflow-x: auto;
  }
  .scroll svg {
    display: block;
    min-width: 100%;
  }
  .axis {
    display: flex;
    justify-content: space-between;
    margin-top: 4px;
    font-size: 10px;
    font-family: var(--font-mono);
    color: var(--fg-subtle);
  }
  .axis span:nth-child(2) {
    color: var(--fg-secondary);
  }
  .footer {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-top: 10px;
  }
  .footer p {
    max-width: 760px;
    font-size: var(--text-xs);
    color: var(--fg-subtle);
    line-height: 1.5;
  }
  .legend {
    display: flex;
    gap: 4px;
    flex-shrink: 0;
  }
  .legend span {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: 4px;
    font-size: 11px;
    font-family: var(--font-mono);
    color: #1a1a1a;
  }
`;
