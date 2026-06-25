"use client";

import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { BASE_COLORS } from "@/imports/genetics/data/evoMock.js";

const VBW = 1000;
const ML = 46;
const MR = 14;
const MT = 10;
const PLOT_H = 190;
const STRIP_GAP = 8;
const STRIP_H = 18;
const ORF_GAP = 4;
const ORF_H = 14;
const XAXIS_GAP = 6;
const PLOT_W = VBW - ML - MR;
const BASE_Y = MT + PLOT_H;
const STRIP_Y = BASE_Y + STRIP_GAP;
const ORF_Y = STRIP_Y + STRIP_H + ORF_GAP;
const XAXIS_Y = ORF_Y + ORF_H + XAXIS_GAP;
const VBH = XAXIS_Y + 32;

function niceStep(span) {
  const target = span / 14 || 1;
  const pow = Math.pow(10, Math.floor(Math.log10(target)));
  return [1, 2, 5, 10].map((m) => m * pow).find((c) => c >= target) || pow * 10;
}

export function EvoScoreView({ result }) {
  const [showEntropy, setShowEntropy] = useState(false);
  const [view, setView] = useState({ s: 0, e: 1 });
  const svgRef = useRef(null);
  const dragRef = useRef(null);
  const { bases, entropy, nll, orfs } = result;
  const n = bases.length;
  const info = entropy.map((e) => Math.max(0, Math.min(2, 2 * (1 - e))));

  const span = Math.max(0.02, view.e - view.s);
  const pStart = view.s * n;
  const xOf = (p) => ML + ((p - pStart) / (span * n)) * PLOT_W;
  const wOf = Math.max(0.7, PLOT_W / (span * n));
  const iFrom = Math.max(0, Math.floor(pStart) - 1);
  const iTo = Math.min(n, Math.ceil(view.e * n) + 1);
  const visIdx = [];
  for (let i = iFrom; i < iTo; i++) visIdx.push(i);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return undefined;
    const onWheel = (ev) => {
      ev.preventDefault();
      const rect = svg.getBoundingClientRect();
      const fx = (((ev.clientX - rect.left) / rect.width) * VBW - ML) / PLOT_W;
      const cf = Math.max(0, Math.min(1, fx));
      setView((v) => {
        const cur = v.e - v.s;
        const factor = ev.deltaY < 0 ? 0.82 : 1 / 0.82;
        const ns = Math.max(0.02, Math.min(1, cur * factor));
        let s = v.s + cf * cur - cf * ns;
        let e = s + ns;
        if (s < 0) {
          s = 0;
          e = ns;
        }
        if (e > 1) {
          e = 1;
          s = 1 - ns;
        }
        return { s, e };
      });
    };
    svg.addEventListener("wheel", onWheel, { passive: false });
    return () => svg.removeEventListener("wheel", onWheel);
  }, []);

  const onPointerDown = (ev) => {
    const rect = svgRef.current.getBoundingClientRect();
    dragRef.current = { x: ev.clientX, w: rect.width, s: view.s, e: view.e };
    svgRef.current.setPointerCapture(ev.pointerId);
  };
  const onPointerMove = (ev) => {
    const d = dragRef.current;
    if (!d) return;
    const cur = d.e - d.s;
    const dxFrac = ((ev.clientX - d.x) / d.w) * (VBW / PLOT_W) * cur;
    let s = d.s - dxFrac;
    if (s < 0) s = 0;
    if (s > 1 - cur) s = 1 - cur;
    setView({ s, e: s + cur });
  };
  const onPointerUp = () => {
    dragRef.current = null;
  };

  const visN = span * n;
  const step = niceStep(visN);
  const ticks = [];
  for (
    let p = Math.ceil((view.s * n) / step) * step;
    p <= view.e * n + 0.001;
    p += step
  )
    ticks.push(Math.round(p));

  const clipH = PLOT_H + STRIP_GAP + STRIP_H + ORF_GAP + ORF_H + 6;

  return (
    <Root>
      <header className="sh">
        <span className="nll">
          Negative Log Likelihood: <b>{nll}</b>
          <Icon name="info" size={13} />
        </span>
        <label className="toggle">
          <input
            type="checkbox"
            checked={showEntropy}
            onChange={(e) => setShowEntropy(e.target.checked)}
          />
          Show entropy
        </label>
        <span className="hint">Zoom and pan with mouse/trackpad</span>
      </header>

      <div className="logo-title">
        {showEntropy ? "Per-nucleotide entropy" : "Sequence Logo"}
      </div>

      <svg
        ref={svgRef}
        className="chart"
        viewBox={`0 0 ${VBW} ${VBH}`}
        preserveAspectRatio="xMidYMid meet"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <defs>
          <clipPath id="evo-plotclip">
            <rect x={ML} y={MT - 2} width={PLOT_W} height={clipH} />
          </clipPath>
        </defs>

        {[0, 0.5, 1, 1.5, 2].map((g) => {
          const y = BASE_Y - (g / 2) * PLOT_H;
          return (
            <g key={g}>
              <line
                x1={ML}
                x2={ML + PLOT_W}
                y1={y}
                y2={y}
                stroke="var(--separator)"
                strokeWidth={0.7}
              />
              <text
                x={ML - 6}
                y={y + 3}
                textAnchor="end"
                fontSize={9}
                fill="var(--fg-subtle)"
              >
                {g.toFixed(1)}
              </text>
            </g>
          );
        })}
        <text
          x={13}
          y={BASE_Y - PLOT_H / 2}
          fontSize={10}
          fill="var(--fg-secondary)"
          textAnchor="middle"
          transform={`rotate(-90 13 ${BASE_Y - PLOT_H / 2})`}
        >
          Conservation (bits)
        </text>

        <g clipPath="url(#evo-plotclip)">
          {!showEntropy &&
            visIdx.map((i) => {
              const h = (info[i] / 2) * PLOT_H;
              if (h < 0.5) return null;
              return (
                <rect
                  key={i}
                  x={xOf(i)}
                  y={BASE_Y - h}
                  width={wOf}
                  height={h}
                  fill={BASE_COLORS[bases[i]]}
                />
              );
            })}
          {showEntropy && (
            <path
              d={
                `M ${xOf(iFrom)} ${BASE_Y} ` +
                visIdx
                  .map((i) => `L ${xOf(i)} ${BASE_Y - entropy[i] * PLOT_H}`)
                  .join(" ") +
                ` L ${xOf(iTo - 1)} ${BASE_Y} Z`
              }
              fill="color-mix(in srgb, var(--accent) 20%, transparent)"
              stroke="var(--accent)"
              strokeWidth={1}
            />
          )}

          {visIdx.map((i) => (
            <rect
              key={`s${i}`}
              x={xOf(i)}
              y={STRIP_Y}
              width={wOf}
              height={STRIP_H}
              fill={BASE_COLORS[bases[i]]}
            />
          ))}

          {orfs.map((o, idx) => (
            <g key={idx}>
              <rect
                x={xOf(o.start)}
                y={ORF_Y}
                width={Math.max(0, xOf(o.end) - xOf(o.start))}
                height={ORF_H}
                fill="#ddd6fe"
              />
              <text
                x={(xOf(o.start) + xOf(o.end)) / 2}
                y={ORF_Y + 10}
                fontSize={8.5}
                fill="#2a2a2a"
                textAnchor="middle"
              >
                ORF {idx}
              </text>
            </g>
          ))}
        </g>

        <line
          x1={ML}
          x2={ML + PLOT_W}
          y1={XAXIS_Y}
          y2={XAXIS_Y}
          stroke="var(--separator-2)"
          strokeWidth={0.8}
        />
        {ticks.map((p) => {
          const x = xOf(p);
          if (x < ML - 0.5 || x > ML + PLOT_W + 0.5) return null;
          return (
            <g key={p}>
              <line
                x1={x}
                x2={x}
                y1={XAXIS_Y}
                y2={XAXIS_Y + 4}
                stroke="var(--separator-2)"
                strokeWidth={0.8}
              />
              <text
                x={x}
                y={XAXIS_Y + 15}
                fontSize={9}
                fill="var(--fg-subtle)"
                textAnchor="middle"
              >
                {p.toLocaleString()}
              </text>
            </g>
          );
        })}
        <text
          x={ML + PLOT_W / 2}
          y={XAXIS_Y + 28}
          fontSize={10}
          fill="var(--fg-secondary)"
          textAnchor="middle"
        >
          Position
        </text>
      </svg>

      <div className="footer">
        <p>
          {showEntropy
            ? "Per-nucleotide entropy across the sequence — lower values mean the model is more confident the called base belongs at that position."
            : "The sequence logo shows the probability of each nucleotide at each position in the sequence. The height of each letter indicates the probability of that nucleotide at that position. The total height of the stack of letters at each position indicates the total information content of that position, where higher stacks indicate more conserved."}
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
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: var(--text-sm);
    color: var(--fg-secondary);
  }
  .nll b {
    color: var(--fg);
    font-family: var(--font-mono);
  }
  .nll svg,
  .nll i {
    color: var(--fg-subtle);
  }
  .toggle {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: var(--text-xs);
    color: var(--fg-secondary);
    cursor: pointer;
  }
  .toggle input {
    accent-color: var(--accent);
    cursor: pointer;
  }
  .hint {
    margin-inline-start: auto;
    font-size: var(--text-xs);
    color: var(--fg-subtle);
    font-style: italic;
  }
  .logo-title {
    text-align: center;
    margin: 8px 0 2px;
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
  .chart {
    display: block;
    width: 100%;
    height: auto;
    touch-action: none;
    cursor: grab;
  }
  .chart:active {
    cursor: grabbing;
  }
  .footer {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-top: 10px;
  }
  .footer p {
    max-width: 780px;
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
    width: 22px;
    height: 22px;
    border-radius: 4px;
    font-size: 11px;
    font-family: var(--font-mono);
    color: #1a1a1a;
  }
`;
