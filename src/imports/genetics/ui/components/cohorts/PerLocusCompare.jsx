"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import styled from "styled-components";
import { Icon } from "@/imports/core/components/Icon.jsx";

export function PerLocusCompare({ drivers, nameA, nameB }) {
  const [metric, setMetric] = useState("ho");

  const rows = useMemo(() => {
    const dKey = metric === "ho" ? "dHo" : "dHe";
    const aKey = metric === "ho" ? "hoA" : "heA";
    const bKey = metric === "ho" ? "hoB" : "heB";
    return drivers
      .map((d) => ({
        locus: d.locus,
        a: d[aKey],
        b: d[bKey],
        delta: d[dKey],
      }))
      .sort((x, y) => y.delta - x.delta)
      .slice(0, 12);
  }, [drivers, metric]);

  if (!drivers.length) return null;
  const max = Math.max(...rows.map((d) => d.delta), 1e-9);
  const mlabel = metric === "ho" ? "Ho" : "He";

  return (
    <Root>
      <div className="bar">
        <span className="lab">Driver metric</span>
        <div className="seg">
          <button
            type="button"
            className={metric === "ho" ? "on" : ""}
            onClick={() => setMetric("ho")}
          >
            Observed (Ho)
          </button>
          <button
            type="button"
            className={metric === "he" ? "on" : ""}
            onClick={() => setMetric("he")}
          >
            Expected (He)
          </button>
        </div>
      </div>
      <div className="thead">
        <span>Locus</span>
        <span>
          {nameA} {mlabel}
        </span>
        <span>
          {nameB} {mlabel}
        </span>
        <span>|Δ| (driver)</span>
      </div>
      {rows.map((d) => (
        <Link
          className="trow"
          key={d.locus}
          href={`/genetics/markers?locus=${d.locus}`}
        >
          <span className="loc">
            {d.locus} <Icon name="arrow-up-right" size={11} />
          </span>
          <span className="mono">{d.a.toFixed(3)}</span>
          <span className="mono">{d.b.toFixed(3)}</span>
          <span className="delta">
            <span className="track">
              <span
                className="fill"
                style={{ width: `${(d.delta / max) * 100}%` }}
              />
            </span>
            <b>{d.delta.toFixed(3)}</b>
          </span>
        </Link>
      ))}
      <p className="hint">
        Loci with the largest {mlabel} gap drive differentiation. Click a locus
        to inspect its allele frequencies in Marker Panel Analytics.
      </p>
    </Root>
  );
}

const Root = styled.div`
  .bar {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
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
  .thead,
  .trow {
    display: grid;
    grid-template-columns: 1.4fr 1fr 1fr 1.6fr;
    align-items: center;
    gap: 10px;
    padding: 7px 10px;
  }
  .thead {
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--fg-subtle);
    border-bottom: 1px solid var(--border);
  }
  .trow {
    border-bottom: 1px solid var(--separator);
    font-size: var(--text-sm);
  }
  .trow:hover {
    background: var(--surface-2);
  }
  .loc {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--accent);
  }
  .mono {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--fg-secondary);
  }
  .delta {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .delta .track {
    flex: 1;
    height: 6px;
    background: var(--surface-2);
    border-radius: var(--radius-pill);
    overflow: hidden;
  }
  .delta .fill {
    display: block;
    height: 100%;
    background: var(--danger);
  }
  .delta b {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
  }
  .hint {
    margin-top: 10px;
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
`;
