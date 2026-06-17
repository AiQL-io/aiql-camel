"use client";

import React from "react";
import styled from "styled-components";
import { SEVS } from "./alertConstants.js";

export function AlertCountStrip({ counts, filters, setF }) {
  return (
    <Strip>
      <div className="big">
        <b>{counts.total.toLocaleString()}</b>
        <span>open alerts</span>
      </div>
      {SEVS.map((s) => (
        <button
          key={s}
          type="button"
          className={filters.severity === s ? "sev on" : "sev"}
          onClick={() => setF("severity", filters.severity === s ? "" : s)}
        >
          <i className={`dot ${s}`} />
          <b>{counts.bySev[s]}</b> {s}
        </button>
      ))}
    </Strip>
  );
}

const Strip = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;

  .big {
    display: flex;
    flex-direction: column;
    margin-inline-end: 8px;
  }
  .big b {
    font-size: var(--text-2xl);
    font-weight: var(--weight-medium);
  }
  .big span {
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
  .sev {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 32px;
    padding: 0 14px;
    border: 1px solid var(--border);
    border-radius: var(--radius-pill);
    background: transparent;
    color: var(--fg-secondary);
    font-size: var(--text-sm);
    text-transform: capitalize;
    cursor: pointer;
  }
  .sev.on {
    border-color: var(--accent);
    background: var(--accent-soft);
  }
  .sev b {
    font-family: var(--font-mono);
    color: var(--fg);
  }
  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }
  .dot.critical {
    background: var(--danger);
  }
  .dot.high {
    background: var(--status-warning);
  }
  .dot.medium {
    background: var(--fg-muted);
  }
  .dot.low {
    background: var(--separator-2);
  }
`;
