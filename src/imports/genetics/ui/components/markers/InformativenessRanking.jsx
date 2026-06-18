"use client";

import React, { useState, useMemo } from "react";
import styled from "styled-components";

export function InformativenessRanking({ perLocus, selected, onSelect }) {
  const [metric, setMetric] = useState("pic");

  const ranked = useMemo(
    () => perLocus.slice().sort((a, b) => b[metric] - a[metric]),
    [perLocus, metric],
  );
  const max = Math.max(...ranked.map((l) => l[metric]), 1e-9);
  const weakest = ranked.slice(-2).map((l) => l.locus);

  return (
    <Root>
      <div className="bar">
        <span className="lab">Rank by</span>
        <div className="seg">
          <button
            type="button"
            className={metric === "pic" ? "on" : ""}
            onClick={() => setMetric("pic")}
          >
            PIC
          </button>
          <button
            type="button"
            className={metric === "pe" ? "on" : ""}
            onClick={() => setMetric("pe")}
          >
            Exclusion (PE)
          </button>
        </div>
      </div>

      <div className="list">
        <div className="scroll">
          {ranked.map((l, i) => {
            const weak = weakest.includes(l.locus);
            return (
              <button
                type="button"
                key={l.locus}
                className={`row${selected === l.locus ? " on" : ""}${weak ? " weak" : ""}`}
                onClick={() => onSelect(l.locus)}
              >
                <span className="rank">{i + 1}</span>
                <span className="loc">{l.locus}</span>
                <span className="track">
                  <span
                    className="fill"
                    style={{
                      width: `${(l[metric] / max) * 100}%`,
                      background: weak ? "var(--danger)" : "var(--accent)",
                    }}
                  />
                </span>
                <b>{l[metric].toFixed(3)}</b>
              </button>
            );
          })}
        </div>
      </div>

      <div className="advice">
        <span className="ic">!</span>
        Loci {weakest.join(" and ")} contribute least to{" "}
        {metric === "pic" ? "information content" : "exclusion power"}. The
        panel could be strengthened by replacing or supplementing them with
        higher-PIC markers.
      </div>
    </Root>
  );
}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;

  .bar {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
  }
  .bar .lab {
    font-size: var(--text-xs);
    color: var(--fg-subtle);
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
  .list {
    position: relative;
    flex: 1;
    min-height: 200px;
  }
  .list .scroll {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
    overflow-y: auto;
  }
  .row {
    display: grid;
    grid-template-columns: 22px 70px 1fr 48px;
    align-items: center;
    gap: 8px;
    border: none;
    background: transparent;
    padding: 5px 6px;
    border-radius: var(--radius-md);
    cursor: pointer;
    text-align: start;
  }
  .row:hover {
    background: var(--surface-2);
  }
  .row.on {
    background: var(--accent-soft);
  }
  .rank {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--fg-subtle);
    text-align: end;
  }
  .loc {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--accent);
  }
  .row.weak .loc {
    color: var(--danger);
  }
  .track {
    height: 7px;
    background: var(--surface-2);
    border-radius: var(--radius-pill);
    overflow: hidden;
  }
  .fill {
    display: block;
    height: 100%;
  }
  .row b {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    text-align: end;
  }
  .advice {
    display: flex;
    gap: 8px;
    margin-top: 14px;
    padding: 10px 12px;
    background: var(--surface-2);
    border-radius: var(--radius-md);
    font-size: var(--text-xs);
    color: var(--fg-secondary);
    line-height: 1.5;
  }
  .advice .ic {
    flex: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--accent-soft);
    color: var(--accent);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: var(--weight-medium);
  }
`;
