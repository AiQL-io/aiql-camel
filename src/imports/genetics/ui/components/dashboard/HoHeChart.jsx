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
    border-radius: 3px;
  }
  .sw.he {
    background: var(--fg-tertiary);
  }
  .sw.ho {
    background: var(--aiql-bar-gradient);
  }
  .rows {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: 360px;
    overflow-y: auto;
  }
  .row {
    display: grid;
    grid-template-columns: 64px 1fr 76px;
    align-items: center;
    gap: 10px;
    padding: 4px 6px;
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
    gap: 4px;
  }
  .track {
    height: 7px;
    background: var(--surface-2);
    border-radius: var(--radius-pill);
    overflow: hidden;
  }

  .bar {
    position: relative;
    display: block;
    height: 7px;
    min-width: 2px;
    border-radius: var(--radius-pill);
    overflow: hidden;
    transform-origin: left center;
    animation: aiql-grow-x 720ms cubic-bezier(0.2, 0.75, 0.25, 1);
  }
  .bar.he {
    background: var(--fg-tertiary);
  }
  .bar.ho {
    background: var(--aiql-bar-gradient);
  }
  .bar.ho::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      100deg,
      transparent 0%,
      rgba(255, 255, 255, 0.55) 50%,
      transparent 100%
    );
    transform: translateX(-130%);
    animation: aiql-bar-shine 1500ms ease-out 260ms;
  }
  @media (prefers-reduced-motion: reduce) {
    .bar {
      animation: none;
    }
    .bar.ho::after {
      display: none;
    }
  }
  .val {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--fg-subtle);
    text-align: end;
  }
`;
