"use client";

import React from "react";
import styled from "styled-components";
import { FMAX, NBINS } from "./inbreedingHelpers.js";

export function FHistogram({ bins, active, mean, threshold, onPick }) {
  const max = Math.max(...bins, 1);
  return (
    <FHist>
      <div className="bars">
        {bins.map((v, i) => (
          <button
            key={i}
            type="button"
            className={`bar${active === i ? " on" : ""}`}
            style={{ height: `${Math.max((v / max) * 100, 2)}%` }}
            title={`${((i / NBINS) * FMAX).toFixed(2)}–${(((i + 1) / NBINS) * FMAX).toFixed(2)} · ${v}`}
            onClick={() => onPick(i)}
          />
        ))}
        <i className="mark mean" style={{ left: `${(mean / FMAX) * 100}%` }} />
        <i
          className="mark thr"
          style={{ left: `${(threshold / FMAX) * 100}%` }}
        />
      </div>
      <div className="axis">
        <span>F = 0</span>
        <span>{FMAX}</span>
      </div>
    </FHist>
  );
}

const FHist = styled.div`
  .bars {
    position: relative;
    display: flex;
    align-items: flex-end;
    gap: 3px;
    height: 110px;
  }
  .bar {
    flex: 1;
    border: none;
    background: var(--accent);
    border-radius: var(--radius-sm) var(--radius-sm) 0 0;
    cursor: pointer;
    opacity: 0.85;
  }
  .bar:hover {
    opacity: 1;
  }
  .bar.on {
    background: var(--danger);
    opacity: 1;
  }
  .mark {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 2px;
  }
  .mark.mean {
    background: var(--fg);
  }
  .mark.thr {
    background: var(--status-warning);
  }
  .axis {
    display: flex;
    justify-content: space-between;
    margin-top: 6px;
    font-size: var(--text-xs);
    font-family: var(--font-mono);
    color: var(--fg-subtle);
  }
`;
