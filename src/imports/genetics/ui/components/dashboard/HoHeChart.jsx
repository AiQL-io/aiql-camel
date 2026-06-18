"use client";

import React from "react";
import Link from "next/link";
import styled from "styled-components";

export function HoHeChart({ data }) {
  return (
    <Root>
      <div className="legend">
        <span>
          <i className="sw he" /> He (expected)
        </span>
        <span>
          <i className="sw ho" /> Ho (observed)
        </span>
      </div>
      <div className="rows">
        {data.map((l) => (
          <Link
            className={`row${l.hetDeficit ? " deficit" : ""}`}
            key={l.locus}
            href={`/genetics/markers?locus=${l.locus}`}
          >
            <span className="lc">{l.locus}</span>
            <span className="bars">
              <span className="track">
                <span className="bar he" style={{ width: `${l.he * 100}%` }} />
              </span>
              <span className="track">
                <span className="bar ho" style={{ width: `${l.ho * 100}%` }} />
              </span>
            </span>
            <span className="val">
              {l.he.toFixed(2)}/{l.ho.toFixed(2)}
            </span>
          </Link>
        ))}
      </div>
    </Root>
  );
}

const Root = styled.div`
  .legend {
    display: flex;
    gap: 16px;
    margin-bottom: 12px;
  }
  .legend span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
  .sw {
    width: 10px;
    height: 10px;
    border-radius: 2px;
  }
  .sw.he {
    background: var(--separator-2);
  }
  .sw.ho {
    background: var(--accent);
  }
  .rows {
    display: flex;
    flex-direction: column;
    gap: 6px;
    max-height: 360px;
    overflow-y: auto;
  }
  .row {
    display: grid;
    grid-template-columns: 64px 1fr 76px;
    align-items: center;
    gap: 10px;
    padding: 3px 6px;
    border-radius: var(--radius-sm);
  }
  .row:hover {
    background: var(--surface-2);
  }
  .row.deficit .lc {
    color: var(--status-warning);
  }
  .lc {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--fg-secondary);
  }
  .bars {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .track {
    height: 6px;
    background: var(--surface-2);
    border-radius: var(--radius-pill);
    overflow: hidden;
  }
  .bar {
    display: block;
    height: 100%;
    border-radius: var(--radius-pill);
  }
  .bar.he {
    background: var(--separator-2);
  }
  .bar.ho {
    background: var(--accent);
  }
  .val {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--fg-subtle);
    text-align: end;
  }
`;
