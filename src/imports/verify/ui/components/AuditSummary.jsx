"use client";

import React from "react";
import styled from "styled-components";
import { AuditDonut } from "./AuditDonut.jsx";
import { SEG } from "./auditConstants.js";

export function AuditSummary({ ba }) {
  return (
    <SummaryWrap>
      <AuditDonut summary={ba.summary} total={ba.total} />
      <div className="counts">
        {ba.running && (
          <div className="prog">
            <div className="bar">
              <ProgFill $pct={Math.round(ba.progress * 100)} />
            </div>
            <span className="pct">
              Auditing… {Math.round(ba.progress * 100)}%
            </span>
          </div>
        )}
        <div className="headline">
          <b>{(ba.summary.excluded || 0).toLocaleString()}</b> of{" "}
          {ba.revealed.toLocaleString()} declared {ba.scope} link
          {ba.scope === "both" ? "s" : ""} genetically excluded
        </div>
        <div className="chips">
          {SEG.map((s) => (
            <button
              key={s.key}
              type="button"
              className={ba.verdictFilter === s.key ? "chip on" : "chip"}
              onClick={() =>
                ba.setVerdictFilter(ba.verdictFilter === s.key ? "" : s.key)
              }
            >
              <Swatch $color={s.color} />
              {s.label} · {(ba.summary[s.key] || 0).toLocaleString()}
            </button>
          ))}
        </div>
      </div>
    </SummaryWrap>
  );
}

const ProgFill = styled.span`
  display: block;
  height: 100%;
  width: ${(p) => p.$pct}%;
  background: var(--aiql-bar-gradient);
  transition: width 80ms linear;
  transform-origin: left center;
  animation: aiql-grow-x 720ms cubic-bezier(0.2, 0.75, 0.25, 1);
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const Swatch = styled.i`
  width: 9px;
  height: 9px;
  border-radius: 2px;
  background: ${(p) => p.$color};
`;

const SummaryWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 28px;
  flex-wrap: wrap;

  svg .dn {
    font-family: var(--font-mono);
    font-size: 16px;
    font-weight: 600;
    fill: var(--fg);
  }
  svg .dl {
    font-family: var(--font-mono);
    font-size: 8px;
    fill: var(--fg-subtle);
  }
  .counts {
    flex: 1;
    min-width: 260px;
  }
  .prog {
    margin-bottom: 12px;
  }
  .prog .bar {
    height: 6px;
    border-radius: 3px;
    background: var(--surface-2);
    overflow: hidden;
  }
  .prog .pct {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
  .headline {
    font-size: var(--text-lg);
    line-height: 24px;
  }
  .headline b {
    color: var(--danger);
  }
  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 12px;
  }
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 28px;
    padding: 0 12px;
    border: 1px solid var(--border);
    border-radius: var(--radius-pill);
    background: transparent;
    color: var(--fg-secondary);
    font-size: var(--text-xs);
    cursor: pointer;
  }
  .chip.on {
    border-color: var(--accent);
    color: var(--accent);
  }
`;
