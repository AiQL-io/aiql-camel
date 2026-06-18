"use client";

import React from "react";
import styled from "styled-components";

export function BrushHistogram({
  bins,
  rmax = 0.6,
  band,
  onBand,
  height = 110,
}) {
  const max = Math.max(...bins, 1);
  const nb = bins.length;
  const binW = rmax / nb;
  return (
    <Root $height={height}>
      <div className="bars">
        {bins.map((v, i) => {
          const lo = i * binW;
          const hi = (i + 1) * binW;
          const active = band && band[0] <= lo + 1e-9 && hi <= band[1] + 1e-9;
          return (
            <button
              key={i}
              type="button"
              className={`bar${active ? " on" : ""}`}
              title={`r ${lo.toFixed(2)}–${hi.toFixed(2)} · ${v} pairs`}
              onClick={() => onBand(active ? null : [round(lo), round(hi)])}
            >
              <span style={{ height: `${Math.max((v / max) * 100, 3)}%` }} />
            </button>
          );
        })}
      </div>
    </Root>
  );
}

function round(v) {
  return Math.round(v * 1000) / 1000;
}

const Root = styled.div`
  .bars {
    display: flex;
    align-items: flex-end;
    gap: 3px;
    height: ${(p) => p.$height}px;
  }
  .bar {
    flex: 1;
    display: flex;
    align-items: flex-end;
    height: 100%;
    border: none;
    background: transparent;
    padding: 0;
    cursor: pointer;
  }
  .bar span {
    width: 100%;
    background: var(--accent);
    opacity: 0.4;
    border-radius: 2px 2px 0 0;
    transition: opacity 120ms ease;
  }
  .bar:hover span {
    opacity: 0.7;
  }
  .bar.on span {
    opacity: 1;
  }
`;
